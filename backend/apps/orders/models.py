import uuid
from decimal import Decimal
from django.db import models
from django.utils import timezone

from apps.accounts.models import User
from apps.catalog.models import GamePlatform, Bundle


class Order(models.Model):
    STATUS_PENDING = 'pending'
    STATUS_PAID = 'paid'
    STATUS_FAILED = 'failed'
    STATUS_REFUNDED = 'refunded'
    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_PAID, 'Paid'),
        (STATUS_FAILED, 'Failed'),
        (STATUS_REFUNDED, 'Refunded'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.PROTECT, related_name='orders')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0'))
    points_discount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0'))
    total = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0'))
    points_redeemed = models.IntegerField(default=0)
    points_earned = models.IntegerField(default=0)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'orders'
        ordering = ['-created_at']
        indexes = [models.Index(fields=['user', 'status'])]

    def __str__(self) -> str:
        return f'Order {self.id} — {self.status}'


class OrderItem(models.Model):
    ITEM_TYPE_GAME = 'game'
    ITEM_TYPE_BUNDLE = 'bundle'
    ITEM_TYPE_CHOICES = [
        (ITEM_TYPE_GAME, 'Game'),
        (ITEM_TYPE_BUNDLE, 'Bundle'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    item_type = models.CharField(max_length=10, choices=ITEM_TYPE_CHOICES)
    game_platform = models.ForeignKey(
        GamePlatform, on_delete=models.PROTECT, null=True, blank=True
    )
    bundle = models.ForeignKey(
        Bundle, on_delete=models.PROTECT, null=True, blank=True
    )
    unit_price = models.DecimalField(max_digits=8, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)

    class Meta:
        db_table = 'order_items'

    @property
    def line_total(self) -> Decimal:
        return self.unit_price * self.quantity


class PointsLedger(models.Model):
    """
    Append-only ledger for points. Never update rows — always append.
    Balance = SUM(delta) for a user.
    """
    REASON_PURCHASE = 'purchase'
    REASON_REDEMPTION = 'redemption'
    REASON_REFUND = 'refund'
    REASON_BONUS = 'bonus'
    REASON_CHOICES = [
        (REASON_PURCHASE, 'Purchase'),
        (REASON_REDEMPTION, 'Redemption'),
        (REASON_REFUND, 'Refund'),
        (REASON_BONUS, 'Bonus'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.PROTECT, related_name='points_ledger')
    delta = models.IntegerField()  # positive = credit, negative = debit
    reason = models.CharField(max_length=20, choices=REASON_CHOICES)
    order = models.ForeignKey(
        Order, on_delete=models.SET_NULL, null=True, blank=True, related_name='points_entries'
    )
    note = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'points_ledger'
        ordering = ['-created_at']
        indexes = [models.Index(fields=['user', '-created_at'])]

    def __str__(self) -> str:
        sign = '+' if self.delta >= 0 else ''
        return f'{self.user.email}: {sign}{self.delta} ({self.reason})'
