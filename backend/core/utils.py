from django.db.models import Q
from functools import reduce
import operator
from rest_framework.pagination import PageNumberPagination
from django.core.exceptions import ValidationError
from django.utils.text import slugify
from unidecode import unidecode
import logging
import traceback
from django.core.cache import cache
from functools import wraps
from rest_framework.response import Response
from rest_framework import status
import time
from django.utils.crypto import get_random_string
from PIL import Image
from io import BytesIO
from django.core.files import File

logger = logging.getLogger(__name__)


def get_search_filter(search_fields, search_term):
    if not search_term:
        return Q()

    terms = search_term.split()
    combined_q = Q()

    for field in search_fields:
        field_q = Q()
        for term in terms:
            field_q &= Q(**{f"{field}__icontains": term})
        combined_q |= field_q

    return combined_q


def log_exception(e, context=None):
    """
    Log an exception with optional context.
    """
    error_message = f"Exception: {str(e)}\nTraceback:\n{traceback.format_exc()}"
    if context:
        error_message = f"Context: {context}\n{error_message}"
    logger.error(error_message)


def log_action(action, user=None, details=None):
    """
    Log a user action with optional details.
    """
    message = f"Action: {action}"
    if user:
        message = f"{message} | User: {user.username}"
    if details:
        message = f"{message} | Details: {details}"
    logger.info(message)


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


def generate_unique_slug(model_instance, slugify_field_name, slug=None):
    """
    Generate a unique slug for a model instance, supporting non-Latin scripts.
    
    Args:
        model_instance: The model instance
        slugify_field_name: The field name to generate slug from
        slug: Optional custom slug to use instead of generating from field
    
    Returns:
        str: A unique slug for the model instance
    """
    if slug is None:
        original_text = getattr(model_instance, slugify_field_name)
        # Transliterate non-Latin scripts to Latin characters
        transliterated_text = unidecode(original_text)
        slug = slugify(transliterated_text)
        
        # If slug is still empty after transliteration, use a fallback
        if not slug:
            slug = f"item-{get_random_string(8).lower()}"
    
    unique_slug = slug
    extension = 1

    ModelClass = model_instance.__class__
    while ModelClass._default_manager.filter(slug=unique_slug).exists():
        unique_slug = f"{slug}-{extension}"
        extension += 1

    return unique_slug


def validate_image_url(url):
    if not url:
        return False

    valid_extensions = ['.jpg', '.jpeg', '.png', '.gif']
    return any(url.lower().endswith(ext) for ext in valid_extensions)


def compress_image(image, quality=85, max_size=(800, 800)):
    """
    Compress and resize an uploaded image.
    Args:
        image: ImageField instance
        quality: Int (1-100) - JPEG compression quality
        max_size: Tuple (width, height) - Maximum dimensions
    Returns:
        Django File object with compressed image
    """
    if not image:
        return None

    try:
        # Open the uploaded image
        img = Image.open(image)

        # Convert to RGB if necessary
        if img.mode != 'RGB':
            img = img.convert('RGB')

        # Calculate new dimensions maintaining aspect ratio
        ratio = min(max_size[0]/img.size[0], max_size[1]/img.size[1])
        if ratio < 1:
            new_size = (int(img.size[0]*ratio), int(img.size[1]*ratio))
            img = img.resize(new_size, Image.Resampling.LANCZOS)

        # Save compressed image
        output = BytesIO()
        img.save(output, format='JPEG', quality=quality, optimize=True)
        output.seek(0)

        return File(output, name=image.name)
    except Exception as e:
        log_exception(e, 'Error compressing image')
        return None


def rate_limit_decorator(key='ip', rate='100/h', method=['POST']):
    """
    Custom rate limit decorator using Django's cache framework
    """
    def decorator(func):
        @wraps(func)
        def _wrapped(view, request, *args, **kwargs):
            if request.method not in method:
                return func(view, request, *args, **kwargs)

            # Parse rate limit
            count, period = rate.split('/')
            count = int(count)
            multiplier = {'s': 1, 'm': 60, 'h': 3600, 'd': 86400}
            period_seconds = int(multiplier.get(period[-1], 3600))

            # Generate cache key
            if key == 'ip':
                key_value = request.META.get('REMOTE_ADDR', '')
            else:
                key_value = str(getattr(request.user, key, ''))

            cache_key = f'ratelimit_{view.__class__.__name__}_{key_value}'

            # Get current hits from cache
            hits = cache.get(
                cache_key, {'count': 0, 'reset_time': time.time()})

            # Reset counter if period has expired
            if time.time() - hits['reset_time'] > period_seconds:
                hits = {'count': 0, 'reset_time': time.time()}

            # Check rate limit
            if hits['count'] >= count:
                log_action('rate_limit_exceeded',
                           getattr(request.user, 'is_authenticated',
                                   False) and request.user or None,
                           f'IP: {request.META.get("REMOTE_ADDR")}')
                return Response(
                    {'error': 'Rate limit exceeded. Please try again later.'},
                    status=status.HTTP_429_TOO_MANY_REQUESTS
                )

            # Increment counter
            hits['count'] += 1
            cache.set(cache_key, hits, period_seconds)

            return func(view, request, *args, **kwargs)
        return _wrapped
    return decorator
