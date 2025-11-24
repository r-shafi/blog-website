from django.db import models
import uuid


class Subscriber(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('unsubscribed', 'Unsubscribed'),
    ]

    email = models.EmailField(unique=True)
    name = models.CharField(max_length=100, blank=True)
    subscription_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='active')
    confirmation_token = models.UUIDField(default=uuid.uuid4, editable=False)
    last_email_sent = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'subscribers'
        ordering = ['-subscription_date']

    def __str__(self):
        return f'{self.email} - {self.status}'
