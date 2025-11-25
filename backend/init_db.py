#!/usr/bin/env python
"""
Script to create a clean database with initial admin user
This script is mainly for local development or if you need to reset the database.
For Render deployment, the startCommand in render.yaml handles initialization.
"""
import os
import sys
import django
from django.core.management import execute_from_command_line
from django.contrib.auth import get_user_model
import argparse

if __name__ == '__main__':
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'blog_backend.settings')
    django.setup()

    parser = argparse.ArgumentParser(description='Initialize database with clean data')
    parser.add_argument('--admin-email', required=True, help='Admin email')
    parser.add_argument('--admin-password', required=True, help='Admin password')
    parser.add_argument('--admin-name', default='Admin User', help='Admin name')

    args = parser.parse_args()

    # Remove existing database
    import pathlib
    from blog_backend.settings import BASE_DIR

    db_path = BASE_DIR / 'db.sqlite3'
    if db_path.exists():
        db_path.unlink()
        print("Removed existing database")

    # Run migrations
    print("Running migrations...")
    execute_from_command_line(['manage.py', 'migrate'])

    # Create admin user
    print("Creating admin user...")
    execute_from_command_line([
        'manage.py',
        'create_admin',  # Use the new management command
    ])

    print("Database initialized successfully with admin user!")
