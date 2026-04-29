from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.pagination import StandardResultsPagination
from core.permissions import IsAdmin
from .serializers import (
    GameListSerializer,
    GameDetailSerializer,
    BundleSerializer,
    PlatformSerializer,
    CategorySerializer,
    AdminGameCreateSerializer,
    AdminGameUpdateSerializer,
    AdminBundleCreateSerializer,
)
from .services import CatalogService, AdminCatalogService


class GameListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        q = request.query_params.get('q') or request.query_params.get('search') or ''
        filters = {
            'q': q.strip() or None,
            'category': request.query_params.get('category') or None,
            'platform': request.query_params.get('platform') or None,
            'on_sale': request.query_params.get('on_sale') == 'true',
            'is_featured': request.query_params.get('is_featured') == 'true',
            'ordering': request.query_params.get('ordering') or None,
        }
        filters = {k: v for k, v in filters.items() if v}

        service = CatalogService()
        qs = service.list_games(filters)

        paginator = StandardResultsPagination()
        page = paginator.paginate_queryset(qs, request)
        serializer = GameListSerializer(page, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)


class GameDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, slug):
        service = CatalogService()
        game = service.get_game_detail(slug)
        return Response(GameDetailSerializer(game, context={'request': request}).data)


class BundleListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        service = CatalogService()
        bundles = service.list_bundles()
        serializer = BundleSerializer(bundles, many=True, context={'request': request})
        return Response(serializer.data)


class BundleDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, slug):
        service = CatalogService()
        bundle = service.get_bundle_detail(slug)
        return Response(BundleSerializer(bundle, context={'request': request}).data)


class PlatformListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        service = CatalogService()
        platforms = service.list_platforms()
        return Response(PlatformSerializer(platforms, many=True).data)


class CategoryListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        service = CatalogService()
        categories = service.list_categories()
        return Response(CategorySerializer(categories, many=True).data)


# --- Admin views ---

class AdminGameView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        serializer = AdminGameCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = AdminCatalogService()
        game = service.create_game(dict(serializer.validated_data))
        return Response(GameDetailSerializer(game).data, status=status.HTTP_201_CREATED)


class AdminGameDetailView(APIView):
    permission_classes = [IsAdmin]

    def patch(self, request, slug):
        serializer = AdminGameUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        service = AdminCatalogService()
        game = service.update_game(slug, dict(serializer.validated_data))
        return Response(GameDetailSerializer(game).data)

    def delete(self, request, slug):
        service = AdminCatalogService()
        service.delete_game(slug)
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminBundleView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        serializer = AdminBundleCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = AdminCatalogService()
        bundle = service.create_bundle(dict(serializer.validated_data))
        return Response(BundleSerializer(bundle).data, status=status.HTTP_201_CREATED)
