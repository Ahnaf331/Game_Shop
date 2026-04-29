from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import (
    RegisterSerializer,
    UserProfileSerializer,
    UpdateProfileSerializer,
    ChangePasswordSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    NewsletterPreferenceSerializer,
)
from .services import AccountService
from .tasks import send_verification_email, send_password_reset_email


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = AccountService()
        user = service.register(**serializer.validated_data)

        raw_token = service.request_email_verification(user)
        send_verification_email.delay(str(user.id), raw_token)

        return Response(
            {
                'message': 'Account created. Check your email to verify your account.',
                'user': UserProfileSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(TokenObtainPairView):
    permission_classes = [AllowAny]


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Logged out successfully.'})
        except Exception:
            return Response(
                {'error': True, 'message': 'Invalid token.'},
                status=status.HTTP_400_BAD_REQUEST,
            )


class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get('token', '').strip()
        if not token:
            return Response(
                {'error': True, 'message': 'Token is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        service = AccountService()
        user = service.verify_email(token)
        return Response({'message': 'Email verified successfully.'})


class ResendVerificationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.email_verified:
            return Response({'message': 'Email is already verified.'})

        service = AccountService()
        raw_token = service.request_email_verification(request.user)
        send_verification_email.delay(str(request.user.id), raw_token)
        return Response({'message': 'Verification email sent.'})


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserProfileSerializer(request.user).data)

    def patch(self, request):
        serializer = UpdateProfileSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = AccountService()
        user = service.update_profile(request.user, **serializer.validated_data)
        return Response(UserProfileSerializer(user).data)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = AccountService()
        service.change_password(
            request.user,
            serializer.validated_data['current_password'],
            serializer.validated_data['new_password'],
        )
        return Response({'message': 'Password changed successfully.'})


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = AccountService()
        user, raw_token = service.request_password_reset(
            serializer.validated_data['email']
        )

        if user and raw_token:
            send_password_reset_email.delay(str(user.id), raw_token)

        # Always return 200 to prevent user enumeration
        return Response(
            {'message': 'If an account exists, a reset link has been sent.'}
        )


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = AccountService()
        service.confirm_password_reset(
            serializer.validated_data['token'],
            serializer.validated_data['new_password'],
        )
        return Response({'message': 'Password reset successfully.'})


class NewsletterPreferenceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        service = AccountService()
        pref = service.get_newsletter_preferences(request.user)
        return Response(NewsletterPreferenceSerializer(pref).data)

    def patch(self, request):
        serializer = NewsletterPreferenceSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        service = AccountService()
        pref = service.update_newsletter_preferences(
            request.user, **serializer.validated_data
        )
        return Response(NewsletterPreferenceSerializer(pref).data)
