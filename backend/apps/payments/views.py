from rest_framework import status
from rest_framework.permissions import AllowAny
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
