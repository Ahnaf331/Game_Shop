from abc import ABC, abstractmethod
from decimal import Decimal
from django.utils import timezone


class PricingStrategy(ABC):
    """
    Strategy interface for price calculation.
    Context (CatalogService) selects the concrete strategy at runtime.
    (Strategy Pattern — Open/Closed Principle)
    """

    @abstractmethod
    def calculate(self, base_price: Decimal, **context) -> Decimal:
        raise NotImplementedError

    @abstractmethod
    def label(self) -> str:
        raise NotImplementedError


class RegularPricingStrategy(PricingStrategy):
    def calculate(self, base_price: Decimal, **context) -> Decimal:
        return base_price

    def label(self) -> str:
        return 'regular'


class SalePricingStrategy(PricingStrategy):
    def __init__(self, discount_pct: Decimal):
        self._discount_pct = discount_pct

    def calculate(self, base_price: Decimal, **context) -> Decimal:
        multiplier = Decimal('1') - (self._discount_pct / Decimal('100'))
        return (base_price * multiplier).quantize(Decimal('0.01'))

    def label(self) -> str:
        return f'sale_{self._discount_pct}%'


class BundlePricingStrategy(PricingStrategy):
    """Bundle has its own fixed price — no per-item calculation."""

    def __init__(self, bundle_price: Decimal):
        self._bundle_price = bundle_price

    def calculate(self, base_price: Decimal, **context) -> Decimal:
        return self._bundle_price

    def label(self) -> str:
        return 'bundle'


class PricingStrategyFactory:
    """
    Factory that picks the right strategy given a GamePlatform's current state.
    Callers ask the factory; they never inspect sale state themselves.
    (Factory Pattern + Single Responsibility)
    """

    @staticmethod
    def for_game_platform(game_platform) -> PricingStrategy:
        now = timezone.now()
        active_sale = game_platform.sales.filter(
            starts_at__lte=now,
            ends_at__gte=now,
        ).order_by('-discount_pct').first()

        if active_sale:
            return SalePricingStrategy(active_sale.discount_pct)
        return RegularPricingStrategy()

    @staticmethod
    def for_bundle() -> PricingStrategy:
        return BundlePricingStrategy(Decimal('0'))  # price comes from Bundle.price


class PriceCalculator:
    """
    Context object that holds a strategy and delegates calculation to it.
    Services use this, not the strategies directly.
    """

    def __init__(self, strategy: PricingStrategy):
        self._strategy = strategy

    def calculate(self, base_price: Decimal, **context) -> Decimal:
        return self._strategy.calculate(base_price, **context)

    @property
    def pricing_label(self) -> str:
        return self._strategy.label()
