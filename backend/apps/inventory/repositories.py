from typing import Optional
from django.db.models import QuerySet

from core.repositories.base import DjangoRepository
from apps.accounts.models import User
from apps.catalog.models import Platform
from .models import InventoryItem


class InventoryRepository(DjangoRepository[InventoryItem]):
    model = InventoryItem

    def get_user_library(self, user: User) -> QuerySet:
        return self.model.objects.filter(user=user).select_related(
            'game_platform__game', 'game_platform__platform'
        )

    def get_by_platform_family(self, user: User, family: str) -> QuerySet:
        return self.get_user_library(user).filter(
            game_platform__platform__family=family
        )

    def already_owns(self, user: User, game_platform_id) -> bool:
        return self.exists(user=user, game_platform_id=game_platform_id)
