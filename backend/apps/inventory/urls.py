from django.urls import path
from . import views

urlpatterns = [
    path('me/', views.InventoryView.as_view(), name='inventory'),
]
