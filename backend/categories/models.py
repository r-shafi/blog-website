from django.db import models
from django.core.exceptions import ValidationError
from core.utils import generate_unique_slug, validate_image_url


class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    featured_image = models.URLField(max_length=500, blank=True, null=True)
    parent = models.ForeignKey(
        'self', on_delete=models.SET_NULL, null=True, blank=True, related_name='children')

    def clean(self):
        if self.featured_image and not validate_image_url(self.featured_image):
            raise ValidationError({
                'featured_image': 'Invalid image URL. Must end with .jpg, .jpeg, .png, or .gif'
            })
        if self.parent and self.parent.id == self.id:
            raise ValidationError({
                'parent': 'A category cannot be its own parent'
            })

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = generate_unique_slug(self, 'name')
        self.clean()
        super().save(*args, **kwargs)

    class Meta:
        db_table = 'categories'
        verbose_name_plural = 'categories'
        ordering = ['name']

    def __str__(self):
        return self.name
