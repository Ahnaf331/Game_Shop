import uuid
from django.db import models
from django.utils import timezone
from django.utils.text import slugify


class Platform(models.Model):
    FAMILY_PC = 'pc'
    FAMILY_CONSOLE = 'console'
    FAMILY_CHOICES = [(FAMILY_PC, 'PC'), (FAMILY_CONSOLE, 'Console')]

    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(unique=True)
    family = models.CharField(max_length=10, choices=FAMILY_CHOICES)
    icon = models.ImageField(upload_to='platforms/', null=True, blank=True)

    class Meta:
        db_table = 'platforms'
        ordering = ['name']

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)

    class Meta:
        db_table = 'categories'
        verbose_name_plural = 'categories'
        ordering = ['name']

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Game(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, max_length=255)
    description = models.TextField()
    developer = models.CharField(max_length=255)
    publisher = models.CharField(max_length=255)
    release_date = models.DateField(null=True, blank=True)
    cover_image = models.ImageField(upload_to='games/covers/', null=True, blank=True)
    cover_image_url = models.URLField(blank=True, default='')
    categories = models.ManyToManyField(Category, related_name='games', blank=True)
    platforms = models.ManyToManyField(Platform, through='GamePlatform', related_name='games')
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'games'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['is_active', '-created_at']),
        ]

    def __str__(self) -> str:
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)


class GamePlatform(models.Model):
    """
    Junction table — a game on a specific platform has its own price.
    This is where the platform-specific SKU lives.
    """
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='game_platforms')
    platform = models.ForeignKey(Platform, on_delete=models.CASCADE)
    base_price = models.DecimalField(max_digits=8, decimal_places=2)
    is_available = models.BooleanField(default=True)

    class Meta:
        db_table = 'game_platforms'
        unique_together = [('game', 'platform')]

    def __str__(self) -> str:
        return f'{self.game.title} — {self.platform.name}'


class Sale(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    discount_pct = models.DecimalField(max_digits=5, decimal_places=2)
    starts_at = models.DateTimeField()
    ends_at = models.DateTimeField()
    games = models.ManyToManyField(GamePlatform, related_name='sales', blank=True)

    class Meta:
        db_table = 'sales'

    def __str__(self) -> str:
        return f'{self.name} ({self.discount_pct}%)'

    def is_active(self) -> bool:
        now = timezone.now()
        return self.starts_at <= now <= self.ends_at


class Bundle(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    cover_image = models.ImageField(upload_to='bundles/', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    starts_at = models.DateTimeField(null=True, blank=True)
    ends_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'bundles'
        ordering = ['-created_at']

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def is_available(self) -> bool:
        if not self.is_active:
            return False
        now = timezone.now()
        if self.starts_at and now < self.starts_at:
            return False
        if self.ends_at and now > self.ends_at:
            return False
        return True


class BundleItem(models.Model):
    bundle = models.ForeignKey(Bundle, on_delete=models.CASCADE, related_name='items')
    game_platform = models.ForeignKey(GamePlatform, on_delete=models.CASCADE)

    class Meta:
        db_table = 'bundle_items'
        unique_together = [('bundle', 'game_platform')]
