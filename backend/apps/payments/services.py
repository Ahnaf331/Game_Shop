import stripe
from decimal import Decimal
from django.conf import settings
from django.db import transaction

from core.exceptions import PaymentFailedException, ResourceNotFoundException
from apps.orders.models import Order
from .models import Payment


stripe.api_key = settings.STRIPE_SECRET_KEY

_STRIPE_NOT_CONFIGURED_MSG = (
    'Stripe is not configured. Set STRIPE_SECRET_KEY in .env to enable payments. '
    'This is a portfolio project — the integration code is complete and ready to activate.'
)


class PaymentService:
    """
    Thin adapter over Stripe Checkout.
    All Stripe API calls are isolated here — nothing else imports stripe.
    (Single Responsibility + Dependency Inversion)
    """

    def _require_stripe(self) -> None:
        if not settings.STRIPE_SECRET_KEY:
            raise PaymentFailedException(_STRIPE_NOT_CONFIGURED_MSG)

    def create_checkout_session(self, order: Order, request) -> str:
        """
        Creates a Stripe Checkout session for the order.
        Returns the Stripe-hosted checkout URL.
        """
        self._require_stripe()
        try:
            amount_cents = int(order.total * 100)

            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                mode='payment',
                line_items=self._build_line_items(order),
                success_url=f"{settings.FRONTEND_URL}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}",
                cancel_url=f"{settings.FRONTEND_URL}/checkout/cancel",
                metadata={
                    'order_id': str(order.id),
                    'user_id': str(order.user.id),
                },
                customer_email=order.user.email,
            )

            Payment.objects.create(
                order=order,
                stripe_session_id=session.id,
                amount=order.total,
                status=Payment.STATUS_PENDING,
            )

            return session.url

        except stripe.error.StripeError as exc:
            raise PaymentFailedException(f'Stripe error: {str(exc)}')

    def _build_line_items(self, order: Order) -> list:
        line_items = []
        for item in order.items.select_related(
            'game_platform__game', 'bundle'
        ).all():
            name = (
                item.game_platform.game.title
                if item.game_platform
                else item.bundle.name
            )
            line_items.append({
                'price_data': {
                    'currency': 'usd',
                    'unit_amount': int(item.unit_price * 100),
                    'product_data': {'name': name},
                },
                'quantity': item.quantity,
            })

        if order.points_discount > 0:
            line_items.append({
                'price_data': {
                    'currency': 'usd',
                    'unit_amount': -int(order.points_discount * 100),
                    'product_data': {'name': f'Points discount ({order.points_redeemed} pts)'},
                },
                'quantity': 1,
            })

        return line_items

    @transaction.atomic
    def handle_webhook(self, payload: bytes, sig_header: str) -> None:
        """
        Verifies Stripe signature and dispatches to the appropriate handler.
        This is the only entry point for Stripe events.
        """
        self._require_stripe()
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except stripe.error.SignatureVerificationError:
            raise PaymentFailedException('Invalid webhook signature.')

        handlers = {
            'checkout.session.completed': self._on_checkout_completed,
            'payment_intent.payment_failed': self._on_payment_failed,
        }

        handler = handlers.get(event['type'])
        if handler:
            handler(event['data']['object'])

    def _on_checkout_completed(self, session: dict) -> None:
        order_id = session.get('metadata', {}).get('order_id')
        if not order_id:
            return

        try:
            payment = Payment.objects.select_related('order').get(
                stripe_session_id=session['id']
            )
        except Payment.DoesNotExist:
            return

        payment.stripe_payment_intent_id = session.get('payment_intent', '')
        payment.status = Payment.STATUS_SUCCEEDED
        payment.save(update_fields=['stripe_payment_intent_id', 'status', 'updated_at'])

        from apps.orders.services import OrderService
        OrderService().mark_paid(payment.order)

    def _on_payment_failed(self, payment_intent: dict) -> None:
        try:
            payment = Payment.objects.get(
                stripe_payment_intent_id=payment_intent['id']
            )
            payment.status = Payment.STATUS_FAILED
            payment.save(update_fields=['status', 'updated_at'])

            from apps.orders.repositories import OrderRepository
            OrderRepository().update(payment.order, status=Order.STATUS_FAILED)
        except Payment.DoesNotExist:
            pass
