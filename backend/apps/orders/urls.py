from django.urls import path
from . import views

urlpatterns = [
    path('', views.OrderListView.as_view(), name='order-list'),
    path('checkout/', views.CreateOrderView.as_view(), name='order-checkout'),
    path('<uuid:order_id>/', views.OrderDetailView.as_view(), name='order-detail'),
    path('points/', views.PointsView.as_view(), name='points'),
]
