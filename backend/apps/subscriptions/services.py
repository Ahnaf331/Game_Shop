import stripe
from django.conf import settings
from django.utils import timezone

from core.exceptions import (
    ResourceNotFoundException,
    InvalidOperationException,
    PaymentFailedException,
)
from apps.accounts.models import User
from .models import SubscriptionPlan, Subscription
from .repositories import SubscriptionPlanRepository, SubscriptionRepository

stripe.api_key = settings.STRIPE_SECRET_KEY

_STRIPE_NOT_CONFIGURED_MSG = (
    'Stripe is not configured. Set STRIPE_SECRET_KEY in .env to enable subscriptions. '
    'This is a portfolio project — the integration code is complete and ready to activate.'
)


class SubscriptionService:
    def __init__(
        self,
        plan_repo: SubscriptionPlanRepository = None,
        sub_repo: SubscriptionRepository = None,
    ):
        self._plans = plan_repo or SubscriptionPlanRepository()
        self._subs = sub_repo or SubscriptionRepository()

    def list_plans(self):
        return self._plans.get_active_plans()

    def get_plan(self, plan_id) -> SubscriptionPlan:
        plan = self._plans.get_by_id(plan_id)
        if not plan or not plan.is_active:
            raise ResourceNotFoundException('Subscription plan not found.')
        return plan

    def create_checkout_session(self, user: User, plan_id) -> str:
        if not settings.STRIPE_SECRET_KEY:
            raise PaymentFailedException(_STRIPE_NOT_CONFIGURED_MSG)

        plan = self.get_plan(plan_id)

        if not plan.stripe_price_id:
            raise InvalidOperationException(
                'This plan is not configured for payment yet.'
            )

        existing = self._subs.get_active_for_user(user)
        if existing:
            raise InvalidOperationException(
                'You already have an active subscription. Cancel it first.'
            )

        try:
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                mode='subscription',
                line_items=[{'price': plan.stripe_price_id, 'quantity': 1}],
                success_url=f"{settings.FRONTEND_URL}/subscriptions/success?session_id={{CHECKOUT_SESSION_ID}}",
                cancel_url=f"{settings.FRONTEND_URL}/subscriptions",
                metadata={
                    'user_id': str(user.id),
                    'plan_id': str(plan.id),
                },
                customer_email=user.email,
            )
            return session.url
        except stripe.error.StripeError as exc:
            raise PaymentFailedException(f'Stripe error: {str(exc)}')

    def cancel_subscription(self, user: User, subscription_id) -> Subscription:
        sub = self._subs.get_by_id(subscription_id)
        if not sub or sub.user != user:
            raise ResourceNotFoundException('Subscription not found.')

        if sub.status != Subscription.STATUS_ACTIVE:
            raise InvalidOperationException('Subscription is not active.')

        if sub.stripe_subscription_id and settings.STRIPE_SECRET_KEY:
            try:
                stripe.Subscription.modify(
                    sub.stripe_subscription_id,
                    cancel_at_period_end=True,
                )
            except stripe.error.StripeError as exc:
                raise PaymentFailedException(f'Stripe error: {str(exc)}')

        return self._subs.update(
            sub,
            status=Subscription.STATUS_CANCELLED,
            cancelled_at=timezone.now(),
        )

    def handle_subscription_created(self, stripe_subscription: dict) -> None:
        user_id = stripe_subscription.get('metadata', {}).get('user_id')
        plan_id = stripe_subscription.get('metadata', {}).get('plan_id')

        if not user_id or not plan_id:
            return

        from apps.accounts.models import User as UserModel
        try:
            user = UserModel.objects.get(pk=user_id)
            plan = SubscriptionPlan.objects.get(pk=plan_id)
        except (UserModel.DoesNotExist, SubscriptionPlan.DoesNotExist):
            return

        import datetime
        period_start = datetime.datetime.fromtimestamp(
            stripe_subscription['current_period_start'], tz=timezone.utc
        )
        period_end = datetime.datetime.fromtimestamp(
            stripe_subscription['current_period_end'], tz=timezone.utc
        )

        self._subs.create(
            user=user,
            plan=plan,
            stripe_subscription_id=stripe_subscription['id'],
            stripe_customer_id=stripe_subscription.get('customer', ''),
            status=Subscription.STATUS_ACTIVE,
            current_period_start=period_start,
            current_period_end=period_end,
        )

    def get_user_subscriptions(self, user: User):
        return self._subs.get_user_subscriptions(user)
