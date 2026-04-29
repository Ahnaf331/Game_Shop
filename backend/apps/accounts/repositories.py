from abc import abstractmethod
from typing import Optional
from django.utils import timezone
from datetime import timedelta

from core.repositories.base import IRepository, DjangoRepository
from .models import User, EmailVerificationToken, PasswordResetToken, NewsletterPreference


class IUserRepository(IRepository[User]):
    @abstractmethod
    def get_by_email(self, email: str) -> Optional[User]:
        raise NotImplementedError

    @abstractmethod
    def email_exists(self, email: str) -> bool:
        raise NotImplementedError


class UserRepository(DjangoRepository[User], IUserRepository):
    model = User

    def get_by_email(self, email: str) -> Optional[User]:
        return self.get_or_none(email=email.lower())

    def email_exists(self, email: str) -> bool:
        return self.exists(email=email.lower())


class IEmailVerificationRepository(IRepository[EmailVerificationToken]):
    @abstractmethod
    def get_valid_token(self, token_hash: str) -> Optional[EmailVerificationToken]:
        raise NotImplementedError

    @abstractmethod
    def invalidate_existing(self, user: User) -> None:
        raise NotImplementedError


class EmailVerificationRepository(
    DjangoRepository[EmailVerificationToken], IEmailVerificationRepository
):
    model = EmailVerificationToken

    def get_valid_token(self, token_hash: str) -> Optional[EmailVerificationToken]:
        return self.get_or_none(
            token_hash=token_hash,
            used=False,
            expires_at__gt=timezone.now(),
        )

    def invalidate_existing(self, user: User) -> None:
        self.model.objects.filter(user=user, used=False).update(used=True)

    def create_for_user(self, user: User, raw_token: str) -> EmailVerificationToken:
        self.invalidate_existing(user)
        return self.create(
            user=user,
            token_hash=EmailVerificationToken.hash_token(raw_token),
            expires_at=timezone.now() + timedelta(hours=24),
        )


class IPasswordResetRepository(IRepository[PasswordResetToken]):
    @abstractmethod
    def get_valid_token(self, token_hash: str) -> Optional[PasswordResetToken]:
        raise NotImplementedError


class PasswordResetRepository(
    DjangoRepository[PasswordResetToken], IPasswordResetRepository
):
    model = PasswordResetToken

    def get_valid_token(self, token_hash: str) -> Optional[PasswordResetToken]:
        return self.get_or_none(
            token_hash=token_hash,
            used=False,
            expires_at__gt=timezone.now(),
        )

    def create_for_user(self, user: User, raw_token: str) -> PasswordResetToken:
        self.model.objects.filter(user=user, used=False).update(used=True)
        return self.create(
            user=user,
            token_hash=PasswordResetToken.hash_token(raw_token),
            expires_at=timezone.now() + timedelta(hours=1),
        )


class NewsletterPreferenceRepository(DjangoRepository[NewsletterPreference]):
    model = NewsletterPreference

    def get_for_user(self, user: User) -> Optional[NewsletterPreference]:
        return self.get_or_none(user=user)

    def get_or_create_for_user(self, user: User) -> NewsletterPreference:
        pref, _ = self.model.objects.get_or_create(user=user)
        return pref
