from typing import Optional
from django.db.models import QuerySet

from core.repositories.base import DjangoRepository
from apps.accounts.models import User
from .models import SubscriptionPlan, Subscription


class SubscriptionPlanRepository(DjangoRepository[SubscriptionPlan]):
    model = SubscriptionPlan

    def get_active_plans(self) -> QuerySet:
        return self.model.objects.filter(is_active=True)


class SubscriptionRepository(DjangoRepository[Subscription]):
    model = Subscription

    def get_active_for_user(self, user: User) -> Optional[Subscription]:
        return self.get_or_none(user=user, status=Subscription.STATUS_ACTIVE)

    def get_user_subscriptions(self, user: User) -> QuerySet:
        return self.model.objects.filter(user=user).select_related('plan')

    def get_by_stripe_id(self, stripe_id: str) -> Optional[Subscription]:
        return self.get_or_none(stripe_subscription_id=stripe_id)
