from rest_framework import serializers
from .models import Order, OrderItem, PointsLedger


class OrderItemSerializer(serializers.ModelSerializer):
    game_title = serializers.SerializerMethodField()
    platform_name = serializers.SerializerMethodField()
    bundle_name = serializers.SerializerMethodField()
    line_total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = [
            'id', 'item_type', 'game_title', 'platform_name',
            'bundle_name', 'unit_price', 'quantity', 'line_total',
        ]

    def get_game_title(self, obj):
        if obj.game_platform:
            return obj.game_platform.game.title
        return None

    def get_platform_name(self, obj):
        if obj.game_platform:
            return obj.game_platform.platform.name
        return None

    def get_bundle_name(self, obj):
        if obj.bundle:
            return obj.bundle.name
        return None


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'status', 'subtotal', 'points_discount', 'total',
            'points_redeemed', 'points_earned', 'items', 'created_at',
        ]


class CartItemSerializer(serializers.Serializer):
    item_type = serializers.ChoiceField(choices=['game', 'bundle'])
    product_id = serializers.CharField()
    quantity = serializers.IntegerField(min_value=1, max_value=10, default=1)


class CreateOrderSerializer(serializers.Serializer):
    items = CartItemSerializer(many=True, min_length=1)
    points_to_redeem = serializers.IntegerField(min_value=0, default=0)


class PointsLedgerSerializer(serializers.ModelSerializer):
    class Meta:
        model = PointsLedger
        fields = ['id', 'delta', 'reason', 'note', 'created_at']


class PointsBalanceSerializer(serializers.Serializer):
    balance = serializers.IntegerField()
    transactions = PointsLedgerSerializer(many=True)
