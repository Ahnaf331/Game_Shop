import re
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import User, NewsletterPreference


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=254)
    password = serializers.CharField(write_only=True, min_length=12, max_length=128)
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)

    def validate_email(self, value: str) -> str:
        return value.strip().lower()

    def validate_password(self, value: str) -> str:
        if re.search(r'(.)\1{3,}', value):
            raise serializers.ValidationError(
                'Password must not contain 4 or more repeated characters.'
            )
        try:
            validate_password(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(list(exc.messages))
        return value

    def validate_first_name(self, value: str) -> str:
        return value.strip()

    def validate_last_name(self, value: str) -> str:
        return value.strip()


class UserProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'email_verified', 'created_at',
        ]
        read_only_fields = ['id', 'email', 'role', 'email_verified', 'created_at']


class UpdateProfileSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)

    def validate_first_name(self, value: str) -> str:
        return value.strip()

    def validate_last_name(self, value: str) -> str:
        return value.strip()


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=12, max_length=128)

    def validate_new_password(self, value: str) -> str:
        if re.search(r'(.)\1{3,}', value):
            raise serializers.ValidationError(
                'Password must not contain 4 or more repeated characters.'
            )
        return value


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=254)

    def validate_email(self, value: str) -> str:
        return value.strip().lower()


class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=12, max_length=128)

    def validate_new_password(self, value: str) -> str:
        if re.search(r'(.)\1{3,}', value):
            raise serializers.ValidationError(
                'Password must not contain 4 or more repeated characters.'
            )
        return value


class NewsletterPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsletterPreference
        fields = ['subscribed', 'new_releases', 'sales_alerts', 'weekly_digest']


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Injects role and email_verified into the JWT payload."""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['email'] = user.email
        token['email_verified'] = user.email_verified
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['role'] = self.user.role
        data['email_verified'] = self.user.email_verified
        return data
