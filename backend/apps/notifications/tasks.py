from celery import shared_task
from .services import EmailService


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_order_receipt_email(self, order_id: str):
    try:
        from apps.orders.models import Order
        order = Order.objects.select_related('user').prefetch_related(
            'items__game_platform__game', 'items__bundle'
        ).get(pk=order_id)
        EmailService().send_order_receipt_email(order)
    except Exception as exc:
        raise self.retry(exc=exc)
