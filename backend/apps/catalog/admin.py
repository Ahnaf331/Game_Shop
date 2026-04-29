from django.contrib import admin
from .models import Game, GamePlatform, Platform, Category, Sale, Bundle, BundleItem


class GamePlatformInline(admin.TabularInline):
    model = GamePlatform
    extra = 1


@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    list_display = ['title', 'developer', 'publisher', 'is_active', 'created_at']
    list_filter = ['is_active', 'categories']
    search_fields = ['title', 'developer']
    prepopulated_fields = {'slug': ('title',)}
    inlines = [GamePlatformInline]


@admin.register(Platform)
class PlatformAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'family']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}


class BundleItemInline(admin.TabularInline):
    model = BundleItem
    extra = 1


@admin.register(Bundle)
class BundleAdmin(admin.ModelAdmin):
    list_display = ['name', 'price', 'is_active', 'ends_at']
    inlines = [BundleItemInline]
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ['name', 'discount_pct', 'starts_at', 'ends_at']
    filter_horizontal = ['games']
