"""
Management command to create admin user during startup if environment variables are provided
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.conf import settings
import os

User = get_user_model()

class Command(BaseCommand):
    help = 'Create admin user if environment variables are provided'

    def handle(self, *args, **options):
        admin_email = os.environ.get('ADMIN_EMAIL')
        admin_password = os.environ.get('ADMIN_PASSWORD')
        admin_name = os.environ.get('ADMIN_NAME', 'Admin User')
        
        if admin_email and admin_password:
            if not User.objects.filter(email=admin_email).exists():
                admin_user = User.objects.create_superuser(
                    email=admin_email,
                    password=admin_password,
                    name=admin_name,
                )
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Successfully created admin user: {admin_email}'
                    )
                )
            else:
                self.stdout.write(
                    self.style.WARNING(
                        f'Admin user with email {admin_email} already exists'
                    )
                )
        else:
            self.stdout.write(
                self.style.WARNING(
                    'Admin credentials not provided, skipping admin creation'
                )
            )