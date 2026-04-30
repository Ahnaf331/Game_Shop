from django.conf import settings
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.exceptions import PaymentFailedException
from .services import PaymentService


class StripeWebhookView(APIView):
    """
    Receives Stripe webhooks. No JWT auth — verified by Stripe signature.
    Must be excluded from CSRF protection (handled by AllowAny + no session).
    """
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE', '')
        payload = request.body

        try:
            service = PaymentService()
            service.handle_webhook(payload, sig_header)
            return Response({'received': True})
        except PaymentFailedException as exc:
            return Response(
                {'error': exc.message},
                status=status.HTTP_400_BAD_REQUEST,
            )


class DevSimulatePaymentView(APIView):
    """Dev-only: mark a pending order as paid without Stripe webhook."""
    permission_classes = [IsAuthenticated]

    def post(self, request, order_id):
        if not settings.DEBUG:
            return Response(status=status.HTTP_404_NOT_FOUND)

        from apps.orders.models import Order
        from apps.orders.services import OrderService

        try:
            order = Order.objects.get(id=order_id, user=request.user)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        if order.status != Order.STATUS_PENDING:
            return Response({'error': f'Order is already {order.status}.'}, status=status.HTTP_400_BAD_REQUEST)

        OrderService().mark_paid(order)
        return Response({'message': 'Order marked as paid.', 'status': 'paid'})
