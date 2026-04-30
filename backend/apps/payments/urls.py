from django.urls import path
from . import views

urlpatterns = [
    path('webhook/stripe/', views.StripeWebhookView.as_view(), name='stripe-webhook'),
    path('dev/simulate-payment/<uuid:order_id>/', views.DevSimulatePaymentView.as_view(), name='dev-simulate-payment'),
]
