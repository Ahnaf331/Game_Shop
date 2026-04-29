from apps.accounts.models import User
from apps.catalog.models import Platform
from apps.orders.models import Order, OrderItem
from .models import InventoryItem
from .repositories import InventoryRepository


class InventoryService:
    def __init__(self, inventory_repo: InventoryRepository = None):
        self._inventory = inventory_repo or InventoryRepository()

    def create_from_order(self, order: Order) -> list[InventoryItem]:
        """
        Expand a paid order into InventoryItem rows.
        Bundles expand into one row per game inside the bundle.
        Duplicates (already owned) are silently skipped.
        """
        created = []
        for item in order.items.select_related('game_platform', 'bundle').all():
            if item.item_type == OrderItem.ITEM_TYPE_GAME:
                inv = self._add_game_platform(order.user, item.game_platform)
                if inv:
                    created.append(inv)
            elif item.item_type == OrderItem.ITEM_TYPE_BUNDLE:
                for bundle_item in item.bundle.items.select_related('game_platform').all():
                    inv = self._add_game_platform(order.user, bundle_item.game_platform)
                    if inv:
                        created.append(inv)
        return created

    def _add_game_platform(self, user: User, game_platform) -> InventoryItem | None:
        if self._inventory.already_owns(user, game_platform.id):
            return None
        return self._inventory.create(user=user, game_platform=game_platform)

    def get_library(self, user: User, platform_family: str = None):
        if platform_family:
            return self._inventory.get_by_platform_family(user, platform_family)
        return self._inventory.get_user_library(user)
