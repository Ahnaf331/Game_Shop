from abc import abstractmethod
from decimal import Decimal
from typing import Optional
from django.db.models import Sum, QuerySet

from core.repositories.base import IRepository, DjangoRepository
from apps.accounts.models import User
from .models import Order, OrderItem, PointsLedger


class IOrderRepository(IRepository[Order]):
    @abstractmethod
    def get_user_orders(self, user: User) -> QuerySet:
        raise NotImplementedError


class OrderRepository(DjangoRepository[Order], IOrderRepository):
    model = Order

    def get_user_orders(self, user: User) -> QuerySet:
        return self.model.objects.filter(user=user).prefetch_related(
            'items__game_platform__game',
            'items__game_platform__platform',
            'items__bundle',
        )

    def get_paid_orders(self, user: User) -> QuerySet:
        return self.get_user_orders(user).filter(status=Order.STATUS_PAID)


class IPointsLedgerRepository(IRepository[PointsLedger]):
    @abstractmethod
    def get_balance(self, user: User) -> int:
        raise NotImplementedError


class PointsLedgerRepository(DjangoRepository[PointsLedger], IPointsLedgerRepository):
    model = PointsLedger

    def get_balance(self, user: User) -> int:
        result = self.model.objects.filter(user=user).aggregate(balance=Sum('delta'))
        return result['balance'] or 0

    def credit(self, user: User, delta: int, reason: str, order: Order = None, note: str = '') -> PointsLedger:
        return self.create(user=user, delta=abs(delta), reason=reason, order=order, note=note)

    def debit(self, user: User, delta: int, reason: str, order: Order = None, note: str = '') -> PointsLedger:
        return self.create(user=user, delta=-abs(delta), reason=reason, order=order, note=note)

    def get_recent(self, user: User, limit: int = 20) -> QuerySet:
        return self.model.objects.filter(user=user).order_by('-created_at')[:limit]
