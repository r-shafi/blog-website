"""
Management command to initialize the database with clean data and an admin user
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.conf import settings

User = get_user_model()

class Command(BaseCommand):
    help = 'Initialize database with clean data and create admin user'

    def add_arguments(self, parser):
        parser.add_argument(
            '--admin-email',
            type=str,
            required=True,
            help='Admin user email',
        )
        parser.add_argument(
            '--admin-password',
            type=str,
            required=True,
            help='Admin user password',
        )
        parser.add_argument(
            '--admin-name',
            type=str,
            default='Admin User',
            help='Admin user name (default: Admin User)',
        )

    def handle(self, *args, **options):
        # Check if admin already exists
        if User.objects.filter(email=options['admin_email']).exists():
            self.stdout.write(
                self.style.WARNING(f'Admin user with email {options["admin_email"]} already exists')
            )
            return

        # Create admin user
        admin_user = User.objects.create_superuser(
            email=options['admin_email'],
            password=options['admin_password'],
            name=options['admin_name'],
        )

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created admin user: {options["admin_email"]}'
            )
        )