from django.contrib import admin
from .models import Subscriber


@admin.register(Subscriber)
class SubscriberAdmin(admin.ModelAdmin):
    list_display = ('email', 'name', 'status',
                    'subscription_date', 'last_email_sent')
    list_filter = ('status', 'subscription_date')
    search_fields = ('email', 'name')
    date_hierarchy = 'subscription_date'
    ordering = ('-subscription_date',)
    readonly_fields = ('confirmation_token',)
