from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings


class EmailService:
    """
    Wraps Django's email backend.
    All email rendering and dispatch is here — nothing else calls send_mail.
    (Single Responsibility Principle)
    """

    def _send(self, subject: str, to: str, template: str, context: dict) -> None:
        html_content = render_to_string(f'email/{template}.html', context)
        text_content = render_to_string(f'email/{template}.txt', context)

        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[to],
        )
        msg.attach_alternative(html_content, 'text/html')
        msg.send(fail_silently=False)

    def send_welcome_email(self, user) -> None:
        self._send(
            subject='Welcome to Game Shop!',
            to=user.email,
            template='welcome',
            context={'user': user, 'site_name': 'Game Shop'},
        )

    def send_verification_email(self, user, verification_url: str) -> None:
        self._send(
            subject='Verify your Game Shop email address',
            to=user.email,
            template='email_verification',
            context={'user': user, 'verification_url': verification_url},
        )

    def send_password_reset_email(self, user, reset_url: str) -> None:
        self._send(
            subject='Reset your Game Shop password',
            to=user.email,
            template='password_reset',
            context={'user': user, 'reset_url': reset_url},
        )

    def send_order_receipt_email(self, order) -> None:
        self._send(
            subject=f'Your Game Shop receipt — Order #{str(order.id)[:8].upper()}',
            to=order.user.email,
            template='order_receipt',
            context={'order': order, 'user': order.user},
        )
