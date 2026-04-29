from django.urls import path
from . import views

urlpatterns = [
    path('plans/', views.SubscriptionPlanListView.as_view(), name='subscription-plans'),
    path('checkout/', views.SubscriptionCheckoutView.as_view(), name='subscription-checkout'),
    path('me/', views.UserSubscriptionListView.as_view(), name='my-subscriptions'),
    path('<uuid:subscription_id>/cancel/', views.SubscriptionCancelView.as_view(), name='subscription-cancel'),
]
