#!/bin/bash
set -e

echo "=================================================="
echo "Blog Website - Docker Entrypoint Script"
echo "=================================================="

cd /app/backend

# Wait for a moment to ensure everything is ready
sleep 2

# Run database migrations
echo "[1/4] Running database migrations..."
python manage.py makemigrations --noinput
python manage.py migrate --noinput
echo "✓ Migrations completed"

# Collect static files
echo "[2/4] Collecting static files..."
python manage.py collectstatic --noinput --clear
echo "✓ Static files collected"

# Create admin user if it doesn't exist
echo "[3/4] Setting up admin user..."
python manage.py shell << PYTHON_SCRIPT
from django.contrib.auth import get_user_model
from django.db import IntegrityError

User = get_user_model()

# Create admin user if it doesn't exist
admin_email = 'admin@example.com'
admin_password = 'admin1234'
admin_name = 'Admin User'

try:
    if not User.objects.filter(email=admin_email).exists():
        admin = User.objects.create_user(
            email=admin_email,
            password=admin_password,
            name=admin_name,
            role='admin',
            bio='System administrator',
            is_staff=True,
            is_superuser=True,
            is_active=True
        )
        print(f"✓ Created admin user: {admin_email}")
    else:
        # Update existing admin to ensure correct settings
        admin = User.objects.get(email=admin_email)
        admin.set_password(admin_password)
        admin.is_staff = True
        admin.is_superuser = True
        admin.is_active = True
        admin.role = 'admin'
        admin.save()
        print(f"✓ Updated admin user: {admin_email}")
except Exception as e:
    print(f"Note: Admin user setup: {e}")
PYTHON_SCRIPT

echo "✓ Admin user ready"

# Seed database with initial categories and tags if needed
echo "[4/4] Seeding initial data..."
python -c "
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'blog_backend.settings')
django.setup()

from categories.models import Category
from tags.models import Tag

# Create categories if they don't exist
categories_data = [
    {'name': 'Politics', 'description': 'Political news, analysis, and current affairs'},
    {'name': 'Entertainment', 'description': 'Movies, music, TV shows, and celebrity news'},
    {'name': 'Sports', 'description': 'Sports news, scores, and athlete updates'},
    {'name': 'Business', 'description': 'Business news, finance, and economics'},
    {'name': 'Lifestyle', 'description': 'Health, wellness, travel, and lifestyle trends'},
    {'name': 'Opinion', 'description': 'Editorial content and opinion pieces'},
]

for cat_data in categories_data:
    Category.objects.get_or_create(
        name=cat_data['name'],
        defaults={'description': cat_data['description']}
    )

# Create tags if they don't exist
tag_names = [
    'Breaking News', 'World News', 'Local News', 'Election', 'Government',
    'Movies', 'Music', 'TV Shows', 'Celebrity', 'Culture',
    'Football', 'Basketball', 'Baseball', 'Soccer', 'Olympics',
    'Finance', 'Economy', 'Stock Market', 'Cryptocurrency',
    'Health', 'Travel', 'Food', 'Fashion', 'Wellness',
    'Editorial', 'Analysis', 'Commentary', 'Interview',
]

for tag_name in tag_names:
    Tag.objects.get_or_create(
        name=tag_name,
        defaults={'description': f'Articles related to {tag_name}'}
    )

print('✓ Initial categories and tags ready')
"
echo "✓ Database seeding completed"

echo "=================================================="
echo "Setup Complete!"
echo "=================================================="
echo "Admin Credentials:"
echo "  Email:    admin@example.com"
echo "  Password: admin1234"
echo "=================================================="
echo "Frontend: http://localhost"
echo "Backend API: http://localhost/api"
echo "Admin Panel: http://localhost/api/admin"
echo "=================================================="

# Execute the main command
exec "$@"
