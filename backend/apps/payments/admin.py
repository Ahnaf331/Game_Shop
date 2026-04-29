from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'order', 'amount', 'status', 'created_at']
    list_filter = ['status']
    search_fields = ['order__user__email', 'stripe_session_id']
    readonly_fields = ['stripe_session_id', 'stripe_payment_intent_id', 'amount']
