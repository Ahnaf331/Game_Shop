from abc import abstractmethod
from typing import Optional
from django.db.models import Q, QuerySet

from core.repositories.base import IRepository, DjangoRepository
from .models import Game, GamePlatform, Platform, Category, Sale, Bundle


class IGameRepository(IRepository[Game]):
    @abstractmethod
    def get_by_slug(self, slug: str) -> Optional[Game]:
        raise NotImplementedError

    @abstractmethod
    def get_active_games(self) -> QuerySet:
        raise NotImplementedError


class GameRepository(DjangoRepository[Game], IGameRepository):
    model = Game

    def get_by_slug(self, slug: str) -> Optional[Game]:
        return self.get_or_none(slug=slug, is_active=True)

    def get_active_games(self) -> QuerySet:
        return self.model.objects.filter(is_active=True).prefetch_related(
            'categories', 'game_platforms__platform', 'game_platforms__sales'
        )

    def search(self, query: str) -> QuerySet:
        return self.get_active_games().filter(
            Q(title__icontains=query)
            | Q(developer__icontains=query)
            | Q(description__icontains=query)
        )

    def filter_by_category(self, category_slug: str) -> QuerySet:
        return self.get_active_games().filter(categories__slug=category_slug)

    def filter_by_platform(self, platform_slug: str) -> QuerySet:
        return self.get_active_games().filter(
            game_platforms__platform__slug=platform_slug,
            game_platforms__is_available=True,
        )

    def filter_on_sale(self) -> QuerySet:
        from django.utils import timezone
        now = timezone.now()
        return self.get_active_games().filter(
            game_platforms__sales__starts_at__lte=now,
            game_platforms__sales__ends_at__gte=now,
        ).distinct()


class GamePlatformRepository(DjangoRepository[GamePlatform]):
    model = GamePlatform

    def get_for_game_and_platform(self, game_id, platform_id) -> Optional[GamePlatform]:
        return self.get_or_none(game_id=game_id, platform_id=platform_id, is_available=True)


class PlatformRepository(DjangoRepository[Platform]):
    model = Platform

    def get_by_slug(self, slug: str) -> Optional[Platform]:
        return self.get_or_none(slug=slug)

    def get_by_family(self, family: str) -> QuerySet:
        return self.model.objects.filter(family=family)


class CategoryRepository(DjangoRepository[Category]):
    model = Category

    def get_by_slug(self, slug: str) -> Optional[Category]:
        return self.get_or_none(slug=slug)


class SaleRepository(DjangoRepository[Sale]):
    model = Sale

    def get_active_sales(self) -> QuerySet:
        from django.utils import timezone
        now = timezone.now()
        return self.model.objects.filter(starts_at__lte=now, ends_at__gte=now)


class BundleRepository(DjangoRepository[Bundle]):
    model = Bundle

    def get_by_slug(self, slug: str) -> Optional[Bundle]:
        return self.get_or_none(slug=slug, is_active=True)

    def get_available_bundles(self) -> QuerySet:
        return self.model.objects.filter(is_active=True).prefetch_related(
            'items__game_platform__game', 'items__game_platform__platform'
        )
