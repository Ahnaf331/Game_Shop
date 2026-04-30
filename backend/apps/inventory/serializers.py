from rest_framework import serializers
from .models import InventoryItem


class InventoryItemSerializer(serializers.ModelSerializer):
    game_title = serializers.CharField(source='game_platform.game.title', read_only=True)
    game_slug = serializers.CharField(source='game_platform.game.slug', read_only=True)
    platform_name = serializers.CharField(source='game_platform.platform.name', read_only=True)
    platform_family = serializers.CharField(source='game_platform.platform.family', read_only=True)
    cover_image = serializers.SerializerMethodField()

    def get_cover_image(self, obj):
        game = obj.game_platform.game
        request = self.context.get('request')
        if game.cover_image:
            return request.build_absolute_uri(game.cover_image.url) if request else game.cover_image.url
        return game.cover_image_url or None

    class Meta:
        model = InventoryItem
        fields = [
            'id', 'game_title', 'game_slug', 'platform_name',
            'platform_family', 'cover_image', 'acquired_at',
        ]
