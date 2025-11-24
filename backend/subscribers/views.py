from django.shortcuts import render
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Subscriber
from django.core.mail import send_mail
from django.conf import settings
from django.http import HttpResponse
import csv
from django.utils import timezone


class SubscribeView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        name = request.data.get('name', '')

        if Subscriber.objects.filter(email=email).exists():
            return Response(
                {'error': 'Email already subscribed'},
                status=status.HTTP_400_BAD_REQUEST
            )

        subscriber = Subscriber.objects.create(
            email=email,
            name=name
        )

        # Send confirmation email
        if hasattr(settings, 'DEFAULT_FROM_EMAIL'):
            confirmation_url = f"{settings.SITE_URL}/confirm/{subscriber.confirmation_token}"
            send_mail(
                'Confirm your subscription',
                f'Click the following link to confirm your subscription: {confirmation_url}',
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=True,
            )

        return Response({'status': 'success'}, status=status.HTTP_201_CREATED)


class ConfirmSubscriptionView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, token):
        subscriber = get_object_or_404(Subscriber, confirmation_token=token)
        if subscriber.status == 'unsubscribed':
            return Response(
                {'error': 'Subscription was cancelled'},
                status=status.HTTP_400_BAD_REQUEST
            )

        subscriber.status = 'active'
        subscriber.save()

        return Response({'status': 'success'})


class UnsubscribeView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, token):
        subscriber = get_object_or_404(Subscriber, confirmation_token=token)
        subscriber.status = 'unsubscribed'
        subscriber.save()

        return Response({'status': 'success'})


class SubscriberListView(generics.ListAPIView):
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        status_filter = self.request.query_params.get('status')
        queryset = Subscriber.objects.all()
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        return queryset.order_by('-subscription_date')


class ExportSubscribersView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="subscribers.csv"'

        writer = csv.writer(response)
        writer.writerow(['Email', 'Name', 'Status',
                        'Subscription Date', 'Last Email'])

        subscribers = Subscriber.objects.all()
        for subscriber in subscribers:
            writer.writerow([
                subscriber.email,
                subscriber.name,
                subscriber.status,
                subscriber.subscription_date,
                subscriber.last_email_sent or 'Never'
            ])

        return response
