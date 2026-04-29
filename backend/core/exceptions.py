from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


class GameShopException(Exception):
    """Base exception for all domain errors."""
    status_code = status.HTTP_400_BAD_REQUEST
    default_message = 'An error occurred.'

    def __init__(self, message: str = None):
        self.message = message or self.default_message
        super().__init__(self.message)


class ResourceNotFoundException(GameShopException):
    status_code = status.HTTP_404_NOT_FOUND
    default_message = 'Resource not found.'


class InsufficientPointsException(GameShopException):
    default_message = 'Insufficient points balance.'


class InvalidOperationException(GameShopException):
    default_message = 'This operation is not allowed.'


class PaymentFailedException(GameShopException):
    status_code = status.HTTP_402_PAYMENT_REQUIRED
    default_message = 'Payment processing failed.'


class DuplicateResourceException(GameShopException):
    status_code = status.HTTP_409_CONFLICT
    default_message = 'Resource already exists.'


def custom_exception_handler(exc, context):
    """
    Converts domain exceptions and DRF exceptions to a consistent
    JSON envelope: { "error": true, "message": "...", "details": {...} }
    """
    if isinstance(exc, GameShopException):
        return Response(
            {'error': True, 'message': exc.message},
            status=exc.status_code,
        )

    response = exception_handler(exc, context)
    if response is not None:
        error_data = {
            'error': True,
            'message': _extract_message(response.data),
            'details': response.data,
        }
        response.data = error_data
    return response


def _extract_message(data) -> str:
    if isinstance(data, list) and data:
        return str(data[0])
    if isinstance(data, dict):
        for key in ('detail', 'non_field_errors'):
            if key in data:
                val = data[key]
                return str(val[0]) if isinstance(val, list) else str(val)
        first = next(iter(data.values()), None)
        if first:
            return str(first[0]) if isinstance(first, list) else str(first)
    return str(data)
