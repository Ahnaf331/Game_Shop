from django.contrib import admin
from .models import Order, OrderItem, PointsLedger


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    readonly_fields = ['unit_price', 'line_total']
    extra = 0


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'status', 'total', 'created_at']
    list_filter = ['status']
    search_fields = ['user__email']
    readonly_fields = ['subtotal', 'points_discount', 'total', 'points_earned']
    inlines = [OrderItemInline]


@admin.register(PointsLedger)
class PointsLedgerAdmin(admin.ModelAdmin):
    list_display = ['user', 'delta', 'reason', 'created_at']
    list_filter = ['reason']
    search_fields = ['user__email']
    readonly_fields = ['user', 'delta', 'reason', 'order', 'created_at']
