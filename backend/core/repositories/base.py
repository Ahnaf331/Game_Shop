from abc import ABC, abstractmethod
from typing import Generic, TypeVar, Optional, List, Any

T = TypeVar('T')


class IRepository(ABC, Generic[T]):
    """
    Abstract base repository. Depends on abstraction, not concretions.
    Concrete Django ORM repos implement this interface — the service layer
    never imports Django models directly, only this contract.
    (Dependency Inversion Principle)
    """

    @abstractmethod
    def get_by_id(self, id: Any) -> Optional[T]:
        raise NotImplementedError

    @abstractmethod
    def get_all(self) -> List[T]:
        raise NotImplementedError

    @abstractmethod
    def create(self, **kwargs) -> T:
        raise NotImplementedError

    @abstractmethod
    def update(self, instance: T, **kwargs) -> T:
        raise NotImplementedError

    @abstractmethod
    def delete(self, instance: T) -> None:
        raise NotImplementedError

    @abstractmethod
    def exists(self, **kwargs) -> bool:
        raise NotImplementedError


class DjangoRepository(IRepository[T], Generic[T]):
    """
    Base Django ORM implementation. Subclasses set `model` and get
    standard CRUD for free. Override methods for custom queries.
    (Open/Closed Principle — extend without modifying)
    """

    model = None  # subclasses assign their Django model

    def get_by_id(self, id: Any) -> Optional[T]:
        try:
            return self.model.objects.get(pk=id)
        except self.model.DoesNotExist:
            return None

    def get_all(self) -> List[T]:
        return list(self.model.objects.all())

    def create(self, **kwargs) -> T:
        return self.model.objects.create(**kwargs)

    def update(self, instance: T, **kwargs) -> T:
        for attr, value in kwargs.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

    def delete(self, instance: T) -> None:
        instance.delete()

    def exists(self, **kwargs) -> bool:
        return self.model.objects.filter(**kwargs).exists()

    def filter(self, **kwargs):
        return self.model.objects.filter(**kwargs)

    def get_or_none(self, **kwargs) -> Optional[T]:
        try:
            return self.model.objects.get(**kwargs)
        except self.model.DoesNotExist:
            return None
