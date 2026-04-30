from django.dispatch import receiver, Signal

order_paid = Signal()


@receiver(order_paid)
def create_inventory_items(sender, order, **kwargs):
    """Expand paid order into InventoryItem rows."""
    from apps.inventory.services import InventoryService
    InventoryService().create_from_order(order)


@receiver(order_paid)
def queue_receipt_email(sender, order, **kwargs):
    """Queue receipt email via Celery."""
    from apps.notifications.tasks import send_order_receipt_email
    try:
        send_order_receipt_email.delay(str(order.id))
    except Exception:
        pass
