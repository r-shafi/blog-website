from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods


@csrf_exempt
@require_http_methods(["GET"])
def health_check(request):
    """
    Health check endpoint for Render
    """
    return JsonResponse({
        'status': 'healthy',
        'service': 'blog-backend',
        'timestamp': 'now'
    })