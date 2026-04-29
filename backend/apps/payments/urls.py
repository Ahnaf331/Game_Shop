from django.urls import path
from . import views

urlpatterns = [
    path('webhook/stripe/', views.StripeWebhookView.as_view(), name='stripe-webhook'),
]
