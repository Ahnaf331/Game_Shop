import uuid
from django.db import models
from django.utils import timezone

from apps.accounts.models import User
from apps.catalog.models import GamePlatform


class InventoryItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.PROTECT, related_name='inventory')
    game_platform = models.ForeignKey(GamePlatform, on_delete=models.PROTECT)
    acquired_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'inventory_items'
        unique_together = [('user', 'game_platform')]
        indexes = [
            models.Index(fields=['user', 'game_platform']),
        ]

    def __str__(self) -> str:
        return f'{self.user.email} — {self.game_platform}'
