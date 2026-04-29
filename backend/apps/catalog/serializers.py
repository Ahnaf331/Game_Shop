from rest_framework import serializers
from .models import Platform, Category, Game, GamePlatform, Sale, Bundle, BundleItem


class PlatformSerializer(serializers.ModelSerializer):
    class Meta:
        model = Platform
        fields = ['id', 'name', 'slug', 'family']


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description']


class GamePlatformSerializer(serializers.ModelSerializer):
    platform = PlatformSerializer(read_only=True)
    effective_price = serializers.SerializerMethodField()
    discount_pct = serializers.SerializerMethodField()

    class Meta:
        model = GamePlatform
        fields = ['id', 'platform', 'base_price', 'effective_price', 'discount_pct', 'is_available']

    def get_effective_price(self, obj):
        from .strategies import PricingStrategyFactory, PriceCalculator
        strategy = PricingStrategyFactory.for_game_platform(obj)
        return str(PriceCalculator(strategy).calculate(obj.base_price))

    def get_discount_pct(self, obj):
        from django.utils import timezone
        now = timezone.now()
        sale = obj.sales.filter(starts_at__lte=now, ends_at__gte=now).first()
        return str(sale.discount_pct) if sale else '0'


class GameListSerializer(serializers.ModelSerializer):
    categories = CategorySerializer(many=True, read_only=True)
    platforms = GamePlatformSerializer(source='game_platforms', many=True, read_only=True)
    cover_image = serializers.SerializerMethodField()

    class Meta:
        model = Game
        fields = [
            'id', 'title', 'slug', 'developer', 'publisher',
            'release_date', 'cover_image', 'categories', 'platforms', 'is_featured',
        ]

    def get_cover_image(self, obj):
        request = self.context.get('request')
        if obj.cover_image:
            return request.build_absolute_uri(obj.cover_image.url) if request else obj.cover_image.url
        return obj.cover_image_url or None


class GameDetailSerializer(GameListSerializer):
    class Meta(GameListSerializer.Meta):
        fields = GameListSerializer.Meta.fields + ['description', 'created_at']


class BundleItemSerializer(serializers.ModelSerializer):
    game_title = serializers.CharField(source='game_platform.game.title', read_only=True)
    platform_name = serializers.CharField(source='game_platform.platform.name', read_only=True)

    class Meta:
        model = BundleItem
        fields = ['game_title', 'platform_name']


class BundleSerializer(serializers.ModelSerializer):
    items = BundleItemSerializer(many=True, read_only=True)

    class Meta:
        model = Bundle
        fields = ['id', 'name', 'slug', 'description', 'price', 'cover_image', 'items', 'ends_at']


# --- Admin write serializers ---

class AdminGamePlatformInputSerializer(serializers.Serializer):
    platform_id = serializers.IntegerField()
    base_price = serializers.DecimalField(max_digits=8, decimal_places=2, min_value=0)


class AdminGameCreateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255)
    description = serializers.CharField()
    developer = serializers.CharField(max_length=255)
    publisher = serializers.CharField(max_length=255)
    release_date = serializers.DateField(required=False, allow_null=True)
    categories = serializers.ListField(child=serializers.IntegerField(), required=False)
    platforms = AdminGamePlatformInputSerializer(many=True, required=False)


class AdminGameUpdateSerializer(AdminGameCreateSerializer):
    title = serializers.CharField(max_length=255, required=False)
    description = serializers.CharField(required=False)
    developer = serializers.CharField(max_length=255, required=False)
    publisher = serializers.CharField(max_length=255, required=False)


class AdminBundleCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    description = serializers.CharField(required=False, default='')
    price = serializers.DecimalField(max_digits=8, decimal_places=2, min_value=0)
    game_platform_ids = serializers.ListField(child=serializers.IntegerField())
    starts_at = serializers.DateTimeField(required=False, allow_null=True)
    ends_at = serializers.DateTimeField(required=False, allow_null=True)
