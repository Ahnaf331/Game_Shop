from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework.exceptions import ValidationError

from core.exceptions import (
    ResourceNotFoundException,
    InvalidOperationException,
    DuplicateResourceException,
)
from .models import User, EmailVerificationToken, PasswordResetToken
from .repositories import (
    UserRepository,
    EmailVerificationRepository,
    PasswordResetRepository,
    NewsletterPreferenceRepository,
)


class AccountService:
    """
    All account business logic lives here.
    Views call services; services call repositories.
    Services never import Django ORM models directly — only repositories.
    (Single Responsibility + Dependency Inversion)
    """

    def __init__(
        self,
        user_repo: UserRepository = None,
        email_verification_repo: EmailVerificationRepository = None,
        password_reset_repo: PasswordResetRepository = None,
        newsletter_repo: NewsletterPreferenceRepository = None,
    ):
        self._users = user_repo or UserRepository()
        self._email_verifications = email_verification_repo or EmailVerificationRepository()
        self._password_resets = password_reset_repo or PasswordResetRepository()
        self._newsletters = newsletter_repo or NewsletterPreferenceRepository()

    def register(self, email: str, password: str, first_name: str, last_name: str) -> User:
        email = email.strip().lower()

        if self._users.email_exists(email):
            raise DuplicateResourceException('An account with this email already exists.')

        try:
            validate_password(password)
        except DjangoValidationError as exc:
            raise ValidationError({'password': list(exc.messages)})

        user = self._users.create(
            email=email,
            first_name=first_name.strip(),
            last_name=last_name.strip(),
        )
        user.set_password(password)
        user.save(update_fields=['password'])

        self._newsletters.get_or_create_for_user(user)

        return user

    def request_email_verification(self, user: User) -> str:
        """Returns the raw token that should be emailed to the user."""
        raw_token = EmailVerificationToken.generate()
        self._email_verifications.create_for_user(user, raw_token)
        return raw_token

    def verify_email(self, raw_token: str) -> User:
        token_hash = EmailVerificationToken.hash_token(raw_token)
        token = self._email_verifications.get_valid_token(token_hash)

        if not token:
            raise InvalidOperationException(
                'Verification link is invalid or has expired.'
            )

        token.used = True
        token.save(update_fields=['used'])

        user = token.user
        self._users.update(user, email_verified=True)
        return user

    def request_password_reset(self, email: str) -> tuple[User, str]:
        """
        Returns (user, raw_token). Caller is responsible for emailing.
        Always returns success to prevent user enumeration.
        """
        user = self._users.get_by_email(email)
        if not user:
            return None, None

        raw_token = PasswordResetToken.generate()
        self._password_resets.create_for_user(user, raw_token)
        return user, raw_token

    def confirm_password_reset(self, raw_token: str, new_password: str) -> User:
        token_hash = PasswordResetToken.hash_token(raw_token)
        token = self._password_resets.get_valid_token(token_hash)

        if not token:
            raise InvalidOperationException('Reset link is invalid or has expired.')

        user = token.user

        try:
            validate_password(new_password, user=user)
        except DjangoValidationError as exc:
            raise ValidationError({'password': list(exc.messages)})

        user.set_password(new_password)
        user.save(update_fields=['password'])

        token.used = True
        token.save(update_fields=['used'])

        return user

    def update_profile(self, user: User, first_name: str, last_name: str) -> User:
        return self._users.update(
            user,
            first_name=first_name.strip(),
            last_name=last_name.strip(),
        )

    def change_password(self, user: User, current_password: str, new_password: str) -> None:
        if not user.check_password(current_password):
            raise ValidationError({'current_password': 'Incorrect password.'})

        try:
            validate_password(new_password, user=user)
        except DjangoValidationError as exc:
            raise ValidationError({'new_password': list(exc.messages)})

        user.set_password(new_password)
        user.save(update_fields=['password'])

    def update_newsletter_preferences(self, user: User, **prefs) -> object:
        pref = self._newsletters.get_or_create_for_user(user)
        allowed = {'subscribed', 'new_releases', 'sales_alerts', 'weekly_digest'}
        filtered = {k: v for k, v in prefs.items() if k in allowed}
        return self._newsletters.update(pref, **filtered)

    def get_profile(self, user: User) -> User:
        return user

    def get_newsletter_preferences(self, user: User):
        return self._newsletters.get_or_create_for_user(user)
