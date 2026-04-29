from rest_framework import serializers
from .models import InventoryItem


class InventoryItemSerializer(serializers.ModelSerializer):
    game_title = serializers.CharField(source='game_platform.game.title', read_only=True)
    game_slug = serializers.CharField(source='game_platform.game.slug', read_only=True)
    platform_name = serializers.CharField(source='game_platform.platform.name', read_only=True)
    platform_family = serializers.CharField(source='game_platform.platform.family', read_only=True)
    cover_image = serializers.ImageField(source='game_platform.game.cover_image', read_only=True)

    class Meta:
        model = InventoryItem
        fields = [
            'id', 'game_title', 'game_slug', 'platform_name',
            'platform_family', 'cover_image', 'acquired_at',
        ]
