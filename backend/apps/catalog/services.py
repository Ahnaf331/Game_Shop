from decimal import Decimal
from typing import Optional

from core.exceptions import ResourceNotFoundException
from .models import Game, GamePlatform, Bundle
from .repositories import (
    GameRepository,
    GamePlatformRepository,
    PlatformRepository,
    CategoryRepository,
    BundleRepository,
)
from .strategies import PricingStrategyFactory, PriceCalculator


class CatalogService:
    """
    Encapsulates all catalog read logic.
    Price enrichment happens here — views never compute prices.
    """

    def __init__(
        self,
        game_repo: GameRepository = None,
        game_platform_repo: GamePlatformRepository = None,
        platform_repo: PlatformRepository = None,
        category_repo: CategoryRepository = None,
        bundle_repo: BundleRepository = None,
    ):
        self._games = game_repo or GameRepository()
        self._game_platforms = game_platform_repo or GamePlatformRepository()
        self._platforms = platform_repo or PlatformRepository()
        self._categories = category_repo or CategoryRepository()
        self._bundles = bundle_repo or BundleRepository()

    def list_games(self, filters: dict = None):
        filters = filters or {}
        qs = self._games.get_active_games()

        if q := filters.get('q'):
            qs = self._games.search(q)
        if category := filters.get('category'):
            qs = qs.filter(categories__slug=category)
        if platform := filters.get('platform'):
            qs = qs.filter(
                game_platforms__platform__slug=platform,
                game_platforms__is_available=True,
            )
        if filters.get('on_sale'):
            from django.utils import timezone
            now = timezone.now()
            qs = qs.filter(
                game_platforms__sales__starts_at__lte=now,
                game_platforms__sales__ends_at__gte=now,
            ).distinct()
        if filters.get('is_featured'):
            qs = qs.filter(is_featured=True)

        allowed_orderings = {
            'title': 'title',
            '-title': '-title',
            'current_price': 'game_platforms__base_price',
            '-current_price': '-game_platforms__base_price',
            '-created_at': '-created_at',
            'created_at': 'created_at',
        }
        if ordering := allowed_orderings.get(filters.get('ordering', '')):
            qs = qs.order_by(ordering)

        return qs.distinct()

    def get_game_detail(self, slug: str) -> Game:
        game = self._games.get_by_slug(slug)
        if not game:
            raise ResourceNotFoundException(f'Game "{slug}" not found.')
        return game

    def get_effective_price(self, game_platform: GamePlatform) -> dict:
        """Returns base price, effective price, discount info."""
        strategy = PricingStrategyFactory.for_game_platform(game_platform)
        calculator = PriceCalculator(strategy)
        effective = calculator.calculate(game_platform.base_price)
        return {
            'base_price': game_platform.base_price,
            'effective_price': effective,
            'pricing_label': calculator.pricing_label,
            'discount_amount': game_platform.base_price - effective,
        }

    def list_bundles(self):
        return self._bundles.get_available_bundles()

    def get_bundle_detail(self, slug: str) -> Bundle:
        bundle = self._bundles.get_by_slug(slug)
        if not bundle:
            raise ResourceNotFoundException(f'Bundle "{slug}" not found.')
        return bundle

    def list_platforms(self):
        return self._platforms.get_all()

    def list_categories(self):
        return self._categories.get_all()


class AdminCatalogService:
    """
    Handles create/update/delete operations for catalog items.
    Separated from CatalogService (Single Responsibility Principle).
    """

    def __init__(
        self,
        game_repo: GameRepository = None,
        game_platform_repo: GamePlatformRepository = None,
        bundle_repo: BundleRepository = None,
    ):
        self._games = game_repo or GameRepository()
        self._game_platforms = game_platform_repo or GamePlatformRepository()
        self._bundles = bundle_repo or BundleRepository()

    def create_game(self, data: dict) -> Game:
        platforms_data = data.pop('platforms', [])
        categories = data.pop('categories', [])

        game = Game(**data)
        game.save()

        if categories:
            game.categories.set(categories)

        for platform_entry in platforms_data:
            GamePlatform.objects.create(
                game=game,
                platform_id=platform_entry['platform_id'],
                base_price=platform_entry['base_price'],
            )

        return game

    def update_game(self, slug: str, data: dict) -> Game:
        from django.utils.text import slugify
        game = self._games.get_by_slug(slug)
        if not game:
            raise ResourceNotFoundException(f'Game "{slug}" not found.')

        platforms_data = data.pop('platforms', None)
        categories = data.pop('categories', None)

        for attr, val in data.items():
            setattr(game, attr, val)
        game.save()

        if categories is not None:
            game.categories.set(categories)

        if platforms_data is not None:
            for pd in platforms_data:
                GamePlatform.objects.update_or_create(
                    game=game,
                    platform_id=pd['platform_id'],
                    defaults={'base_price': pd['base_price']},
                )

        return game

    def delete_game(self, slug: str) -> None:
        game = self._games.get_by_slug(slug)
        if not game:
            raise ResourceNotFoundException(f'Game "{slug}" not found.')
        self._games.update(game, is_active=False)  # soft delete

    def create_bundle(self, data: dict) -> 'Bundle':
        from .models import BundleItem
        game_platform_ids = data.pop('game_platform_ids', [])

        bundle = Bundle(**data)
        bundle.save()

        for gp_id in game_platform_ids:
            BundleItem.objects.create(bundle=bundle, game_platform_id=gp_id)

        return bundle
