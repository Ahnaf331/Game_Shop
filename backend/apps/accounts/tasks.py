from celery import shared_task
from django.conf import settings

from apps.notifications.services import EmailService


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_verification_email(self, user_id: str, raw_token: str):
    try:
        from apps.accounts.models import User
        user = User.objects.get(pk=user_id)
        verification_url = f"{settings.FRONTEND_URL}/verify-email?token={raw_token}"
        EmailService().send_verification_email(user, verification_url)
    except Exception as exc:
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_password_reset_email(self, user_id: str, raw_token: str):
    try:
        from apps.accounts.models import User
        user = User.objects.get(pk=user_id)
        reset_url = f"{settings.FRONTEND_URL}/password-reset?token={raw_token}"
        EmailService().send_password_reset_email(user, reset_url)
    except Exception as exc:
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_welcome_email(self, user_id: str):
    try:
        from apps.accounts.models import User
        user = User.objects.get(pk=user_id)
        EmailService().send_welcome_email(user)
    except Exception as exc:
        raise self.retry(exc=exc)
