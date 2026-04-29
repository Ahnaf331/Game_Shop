from abc import ABC, abstractmethod
from decimal import Decimal

from apps.catalog.models import GamePlatform, Bundle
from apps.catalog.strategies import PricingStrategyFactory, PriceCalculator
from .models import Order, OrderItem


class OrderItemFactory(ABC):
    """
    Abstract factory for creating order items.
    Each product type (game, bundle) has its own factory.
    (Factory Pattern — Open/Closed Principle)
    """

    @abstractmethod
    def create(self, order: Order, product_id, quantity: int = 1) -> OrderItem:
        raise NotImplementedError

    @abstractmethod
    def get_unit_price(self, product_id) -> Decimal:
        raise NotImplementedError


class GameOrderItemFactory(OrderItemFactory):
    def get_unit_price(self, product_id) -> Decimal:
        try:
            gp = GamePlatform.objects.get(pk=product_id, is_available=True)
        except GamePlatform.DoesNotExist:
            raise ValueError(f'GamePlatform {product_id} is not available.')

        strategy = PricingStrategyFactory.for_game_platform(gp)
        calculator = PriceCalculator(strategy)
        return calculator.calculate(gp.base_price)

    def create(self, order: Order, product_id, quantity: int = 1) -> OrderItem:
        gp = GamePlatform.objects.get(pk=product_id, is_available=True)
        unit_price = self.get_unit_price(product_id)

        return OrderItem.objects.create(
            order=order,
            item_type=OrderItem.ITEM_TYPE_GAME,
            game_platform=gp,
            unit_price=unit_price,
            quantity=quantity,
        )


class BundleOrderItemFactory(OrderItemFactory):
    def get_unit_price(self, product_id) -> Decimal:
        try:
            bundle = Bundle.objects.get(pk=product_id, is_active=True)
        except Bundle.DoesNotExist:
            raise ValueError(f'Bundle {product_id} is not available.')
        return bundle.price

    def create(self, order: Order, product_id, quantity: int = 1) -> OrderItem:
        bundle = Bundle.objects.get(pk=product_id, is_active=True)

        return OrderItem.objects.create(
            order=order,
            item_type=OrderItem.ITEM_TYPE_BUNDLE,
            bundle=bundle,
            unit_price=bundle.price,
            quantity=quantity,
        )


class OrderItemFactoryRegistry:
    """
    Registry that maps item_type strings to factory instances.
    Callers use this to get the right factory without a switch statement.
    """

    _factories = {
        OrderItem.ITEM_TYPE_GAME: GameOrderItemFactory(),
        OrderItem.ITEM_TYPE_BUNDLE: BundleOrderItemFactory(),
    }

    @classmethod
    def get(cls, item_type: str) -> OrderItemFactory:
        factory = cls._factories.get(item_type)
        if not factory:
            raise ValueError(f'Unknown item type: {item_type}')
        return factory
