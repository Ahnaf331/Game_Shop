from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.pagination import StandardResultsPagination
from .serializers import InventoryItemSerializer
from .services import InventoryService


class InventoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        platform_family = request.query_params.get('platform_family')
        if platform_family and platform_family not in ('pc', 'console'):
            from rest_framework.exceptions import ValidationError
            raise ValidationError({'platform_family': 'Must be "pc" or "console".'})

        service = InventoryService()
        qs = service.get_library(request.user, platform_family)

        paginator = StandardResultsPagination()
        page = paginator.paginate_queryset(qs, request)
        return paginator.get_paginated_response(
            InventoryItemSerializer(page, many=True, context={'request': request}).data
        )
