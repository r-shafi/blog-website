from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError, PermissionDenied
from django.http import Http404
from .utils import log_exception


def custom_exception_handler(exc, context):
    if isinstance(exc, ValidationError):
        log_exception(exc, {'view': context['view'].__class__.__name__})
        return Response(
            {'error': 'Validation error', 'details': exc.messages},
            status=status.HTTP_400_BAD_REQUEST
        )

    if isinstance(exc, PermissionDenied):
        log_exception(exc, {'view': context['view'].__class__.__name__})
        return Response(
            {'error': 'Permission denied', 'details': str(exc)},
            status=status.HTTP_403_FORBIDDEN
        )

    if isinstance(exc, Http404):
        log_exception(exc, {'view': context['view'].__class__.__name__})
        return Response(
            {'error': 'Not found', 'details': str(exc)},
            status=status.HTTP_404_NOT_FOUND
        )

    response = exception_handler(exc, context)

    if response is None:
        log_exception(exc, {'view': context['view'].__class__.__name__})
        response = Response(
            {'error': 'Internal server error',
                'details': 'An unexpected error occurred'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    return response
