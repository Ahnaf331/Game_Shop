from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import (
    SubscriptionPlanSerializer,
    SubscriptionSerializer,
    CreateSubscriptionSerializer,
)
from .services import SubscriptionService


class SubscriptionPlanListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        service = SubscriptionService()
        plans = service.list_plans()
        return Response(SubscriptionPlanSerializer(plans, many=True).data)


class SubscriptionCheckoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CreateSubscriptionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = SubscriptionService()
        checkout_url = service.create_checkout_session(
            request.user, serializer.validated_data['plan_id']
        )
        return Response({'checkout_url': checkout_url}, status=status.HTTP_201_CREATED)


class UserSubscriptionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        service = SubscriptionService()
        subs = service.get_user_subscriptions(request.user)
        return Response(SubscriptionSerializer(subs, many=True).data)


class SubscriptionCancelView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, subscription_id):
        service = SubscriptionService()
        sub = service.cancel_subscription(request.user, subscription_id)
        return Response(SubscriptionSerializer(sub).data)
