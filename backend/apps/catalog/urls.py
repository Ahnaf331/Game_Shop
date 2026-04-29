from django.urls import path
from . import views

urlpatterns = [
    path('games/', views.GameListView.as_view(), name='game-list'),
    path('games/<slug:slug>/', views.GameDetailView.as_view(), name='game-detail'),
    path('bundles/', views.BundleListView.as_view(), name='bundle-list'),
    path('bundles/<slug:slug>/', views.BundleDetailView.as_view(), name='bundle-detail'),
    path('platforms/', views.PlatformListView.as_view(), name='platform-list'),
    path('categories/', views.CategoryListView.as_view(), name='category-list'),

    # Admin
    path('admin/games/', views.AdminGameView.as_view(), name='admin-game-create'),
    path('admin/games/<slug:slug>/', views.AdminGameDetailView.as_view(), name='admin-game-detail'),
    path('admin/bundles/', views.AdminBundleView.as_view(), name='admin-bundle-create'),
]
