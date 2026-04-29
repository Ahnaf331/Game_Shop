from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.pagination import StandardResultsPagination
from .serializers import (
    OrderSerializer,
    CreateOrderSerializer,
    PointsBalanceSerializer,
)
from .services import OrderService, PointsService


class CreateOrderView(APIView):
    """Creates a pending order and returns it + a Stripe checkout URL."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CreateOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        order_service = OrderService()
        order = order_service.create_pending_order(
            user=request.user,
            items=serializer.validated_data['items'],
            points_to_redeem=serializer.validated_data['points_to_redeem'],
        )

        from apps.payments.services import PaymentService
        payment_service = PaymentService()
        checkout_url = payment_service.create_checkout_session(order, request)

        return Response(
            {
                'order': OrderSerializer(order).data,
                'checkout_url': checkout_url,
            },
            status=status.HTTP_201_CREATED,
        )


class OrderListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        service = OrderService()
        qs = service.get_user_orders(request.user)

        paginator = StandardResultsPagination()
        page = paginator.paginate_queryset(qs, request)
        return paginator.get_paginated_response(OrderSerializer(page, many=True).data)


class OrderDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, order_id):
        service = OrderService()
        order = service.get_order(order_id, request.user)
        return Response(OrderSerializer(order).data)


class PointsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        service = PointsService()
        balance = service.get_balance(request.user)
        transactions = service.get_recent_transactions(request.user)
        from .serializers import PointsLedgerSerializer
        return Response({
            'balance': balance,
            'transactions': PointsLedgerSerializer(transactions, many=True).data,
        })
