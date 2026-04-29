from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import User


@receiver(post_save, sender=User)
def on_user_created(sender, instance, created, **kwargs):
    """Send welcome email when a new user registers."""
    if created:
        import logging
        logger = logging.getLogger(__name__)
        try:
            from .tasks import send_welcome_email
            send_welcome_email.delay(str(instance.id))
        except Exception as exc:
            # Celery broker may not be running in local/dev environments.
            # Log the failure but do NOT let it prevent user creation.
            logger.warning(
                "Could not queue welcome email for user %s: %s",
                instance.email, exc
            )


@receiver(post_save, sender=User)
def on_email_verified(sender, instance, created, update_fields, **kwargs):
    """Hook for post-verification side effects."""
    if not created and update_fields and 'email_verified' in update_fields:
        pass  # extend: unlock purchase capability, grant first-time bonus points, etc.
