from decimal import Decimal
from django.conf import settings
from django.db import transaction

from core.exceptions import (
    InsufficientPointsException,
    InvalidOperationException,
    ResourceNotFoundException,
)
from apps.accounts.models import User
from .models import Order, OrderItem, PointsLedger
from .repositories import OrderRepository, PointsLedgerRepository
from .factories import OrderItemFactoryRegistry


class OrderService:
    """
    Orchestrates order creation and state transitions.
    All DB writes happen inside transactions.
    """

    POINTS_PER_DOLLAR = getattr(settings, 'POINTS_PER_DOLLAR', 1)
    POINTS_TO_DOLLAR = getattr(settings, 'POINTS_TO_DOLLAR_RATIO', 100)
    MAX_POINTS_DISCOUNT_PCT = Decimal('0.20')  # max 20% of total via points

    def __init__(
        self,
        order_repo: OrderRepository = None,
        points_repo: PointsLedgerRepository = None,
    ):
        self._orders = order_repo or OrderRepository()
        self._points = points_repo or PointsLedgerRepository()

    @transaction.atomic
    def create_pending_order(
        self,
        user: User,
        items: list[dict],
        points_to_redeem: int = 0,
    ) -> Order:
        """
        items: [{'item_type': 'game'|'bundle', 'product_id': ..., 'quantity': 1}]
        """
        order = self._orders.create(user=user)
        subtotal = Decimal('0')

        for item_data in items:
            factory = OrderItemFactoryRegistry.get(item_data['item_type'])
            order_item = factory.create(
                order=order,
                product_id=item_data['product_id'],
                quantity=item_data.get('quantity', 1),
            )
            subtotal += order_item.line_total

        points_discount = self._calculate_points_discount(
            user, points_to_redeem, subtotal
        )
        total = max(subtotal - points_discount, Decimal('0'))
        points_earned = int(total * self.POINTS_PER_DOLLAR)

        self._orders.update(
            order,
            subtotal=subtotal,
            points_discount=points_discount,
            total=total,
            points_redeemed=points_to_redeem if points_discount > 0 else 0,
            points_earned=points_earned,
        )

        return order

    def _calculate_points_discount(
        self, user: User, points: int, subtotal: Decimal
    ) -> Decimal:
        if points <= 0:
            return Decimal('0')

        balance = self._points.get_balance(user)
        if points > balance:
            raise InsufficientPointsException(
                f'You have {balance} points but tried to redeem {points}.'
            )

        dollar_value = Decimal(points) / self.POINTS_TO_DOLLAR
        max_discount = subtotal * self.MAX_POINTS_DISCOUNT_PCT
        return min(dollar_value, max_discount).quantize(Decimal('0.01'))

    @transaction.atomic
    def mark_paid(self, order: Order) -> Order:
        if order.status != Order.STATUS_PENDING:
            raise InvalidOperationException(
                f'Cannot mark order as paid — current status: {order.status}'
            )

        self._orders.update(order, status=Order.STATUS_PAID)

        if order.points_redeemed > 0:
            self._points.debit(
                user=order.user,
                delta=order.points_redeemed,
                reason=PointsLedger.REASON_REDEMPTION,
                order=order,
                note=f'Redeemed for order {order.id}',
            )

        if order.points_earned > 0:
            self._points.credit(
                user=order.user,
                delta=order.points_earned,
                reason=PointsLedger.REASON_PURCHASE,
                order=order,
                note=f'Earned from order {order.id}',
            )

        # Fire domain event — signals handle inventory and email
        from apps.orders.signals import order_paid
        order_paid.send(sender=Order, order=order)

        return order

    def get_user_orders(self, user: User):
        return self._orders.get_user_orders(user)

    def get_order(self, order_id, user: User) -> Order:
        order = self._orders.get_by_id(order_id)
        if not order or order.user != user:
            raise ResourceNotFoundException('Order not found.')
        return order


class PointsService:
    def __init__(self, points_repo: PointsLedgerRepository = None):
        self._points = points_repo or PointsLedgerRepository()

    def get_balance(self, user: User) -> int:
        return self._points.get_balance(user)

    def get_recent_transactions(self, user: User, limit: int = 20):
        return self._points.get_recent(user, limit)
