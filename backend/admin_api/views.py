from django.shortcuts import render
from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Count, Q, F
from django.utils import timezone
from django.http import HttpResponse
from datetime import timedelta
import csv
from articles.models import Article
from users.models import User
from contact.models import Contact
from categories.models import Category
from tags.models import Tag
from articles.serializers import ArticleSerializer
from users.serializers import UserSerializer
from contact.serializers import ContactSerializer
from categories.serializers import CategorySerializer
from tags.serializers import TagSerializer
from core.permissions import IsAdminUser
from core.utils import log_action


class DashboardStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        # Get current date and week start
        now = timezone.now()
        week_start = now - timedelta(days=7)
        
        # Basic stats
        total_users = User.objects.count()
        total_articles = Article.objects.count()
        
        # Contact stats - differentiate between messages and newsletter subscriptions
        total_messages = Contact.objects.filter(
            message__isnull=False,
            message__gt=''
        ).count()
        unread_messages = Contact.objects.filter(
            status='new',
            message__isnull=False,
            message__gt=''
        ).count()
        
        # Article status counts
        pending_articles = Article.objects.filter(status='pending').count()
        published_articles = Article.objects.filter(status='published').count()
        rejected_articles = Article.objects.filter(status='rejected').count()
        draft_articles = Article.objects.filter(status='draft').count()
        
        # Weekly stats
        new_users_this_week = User.objects.filter(join_date__gte=week_start).count()
        new_articles_this_week = Article.objects.filter(created_at__gte=week_start).count()
        
        # Spam reports (placeholder - you can implement based on your comment/report system)
        spam_reports = 0
        
        # Recent articles
        recent_articles = (
            Article.objects.select_related('author')
            .prefetch_related('categories', 'tags')
            .order_by('-created_at')[:5]
        )

        # Recent messages - only actual contact messages, not newsletter-only subscriptions
        recent_messages = Contact.objects.filter(
            message__isnull=False,
            message__gt=''
        ).order_by('-date')[:5]
        
        # Pending articles for approval queue
        pending_articles_list = (
            Article.objects.filter(status='pending')
            .select_related('author')
            .prefetch_related('categories')
            .order_by('-created_at')[:10]
        )
        
        # Top authors by article count
        top_authors = (
            User.objects.filter(role='author')
            .annotate(article_count=Count('articles', filter=Q(articles__status='published')))
            .order_by('-article_count')[:5]
        )
        
        # Weekly statistics
        weekly_stats = {
            'posts_published': Article.objects.filter(
                status='published', 
                publish_date__gte=week_start
            ).count(),
            'posts_rejected': Article.objects.filter(
                status='rejected', 
                last_modified__gte=week_start
            ).count(),
            'comments_flagged': 0,  # Implement based on your comment system
            'users_registered': new_users_this_week,
        }
        
        # User activity insights
        user_activity = (
            User.objects.annotate(
                article_count=Count('articles')
            ).filter(
                last_login__gte=week_start
            ).order_by('-last_login')[:10]
        )

        return Response({
            'total_users': total_users,
            'total_articles': total_articles,
            'total_messages': total_messages,
            'unread_messages': unread_messages,
            'pending_articles': pending_articles,
            'published_articles': published_articles,
            'rejected_articles': rejected_articles,
            'draft_articles': draft_articles,
            'new_users_this_week': new_users_this_week,
            'new_articles_this_week': new_articles_this_week,
            'spam_reports': spam_reports,
            'recent_articles': ArticleSerializer(recent_articles, many=True).data,
            'recent_messages': ContactSerializer(recent_messages, many=True).data,
            'pending_articles_list': ArticleSerializer(pending_articles_list, many=True).data,
            'top_authors': UserSerializer(top_authors, many=True).data,
            'weekly_stats': weekly_stats,
            'user_activity': UserSerializer(user_activity, many=True).data,
        })


class QuickArticleActionView(APIView):
    permission_classes = [IsAdminUser]
    
    def post(self, request, article_id):
        try:
            article = Article.objects.get(id=article_id)
            action = request.data.get('action')
            
            if action == 'approve':
                article.status = 'published'
                if not article.publish_date:
                    article.publish_date = timezone.now()
                article.save()
                log_action('article_approved', request.user, f'Article ID: {article.id}')
                return Response({'message': 'Article approved successfully'}, status=status.HTTP_200_OK)
                
            elif action == 'reject':
                article.status = 'rejected'
                article.save()
                log_action('article_rejected', request.user, f'Article ID: {article.id}')
                return Response({'message': 'Article rejected successfully'}, status=status.HTTP_200_OK)
                
            else:
                return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)
                
        except Article.DoesNotExist:
            return Response({'error': 'Article not found'}, status=status.HTTP_404_NOT_FOUND)


class BulkArticleActionView(APIView):
    permission_classes = [IsAdminUser]
    
    def post(self, request):
        article_ids = request.data.get('article_ids', [])
        action = request.data.get('action')
        
        if not article_ids or not action:
            return Response({'error': 'Article IDs and action are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        articles = Article.objects.filter(id__in=article_ids)
        
        if action == 'approve':
            articles.update(
                status='published',
                publish_date=timezone.now()
            )
            log_action('bulk_articles_approved', request.user, f'Count: {len(article_ids)}')
            return Response({'message': f'{len(article_ids)} articles approved successfully'}, status=status.HTTP_200_OK)
            
        elif action == 'reject':
            articles.update(status='rejected')
            log_action('bulk_articles_rejected', request.user, f'Count: {len(article_ids)}')
            return Response({'message': f'{len(article_ids)} articles rejected successfully'}, status=status.HTTP_200_OK)
            
        else:
            return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)


class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        return User.objects.all().order_by('-join_date')

    def perform_create(self, serializer):
        user = serializer.save()
        user.set_password(self.request.data.get('password'))
        user.save()
        log_action('user_created_by_admin',
                   self.request.user, f'User ID: {user.id}')

    def perform_update(self, serializer):
        password = self.request.data.get('password')
        user = serializer.save()
        if password:
            user.set_password(password)
            user.save()
        log_action('user_updated_by_admin',
                   self.request.user, f'User ID: {user.id}')

    def perform_destroy(self, instance):
        user_id = instance.id
        instance.is_active = False
        instance.save()
        log_action('user_deactivated_by_admin',
                   self.request.user, f'User ID: {user_id}')

    def ban_user(self, request, pk=None):
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()
        action = 'unbanned' if user.is_active else 'banned'
        log_action(f'user_{action}_by_admin',
                   self.request.user, f'User ID: {user.id}')
        return Response({
            'status': 'success',
            'is_active': user.is_active,
            'message': f'User successfully {action}'
        })

    def promote_user(self, request, pk=None):
        user = self.get_object()
        if user.role == 'admin':
            user.role = 'user'
            message = 'User demoted to regular user'
            action = 'demoted'
        else:
            user.role = 'admin'
            message = 'User promoted to admin'
            action = 'promoted'
        user.save()
        log_action(f'user_{action}_by_admin',
                   self.request.user, f'User ID: {user.id}')
        return Response({
            'status': 'success',
            'role': user.role,
            'message': message
        })


class AdminArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        queryset = Article.objects.select_related(
            'author').prefetch_related('categories', 'tags')

        # Filter by status if provided
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status)

        # Filter by author if provided
        author_id = self.request.query_params.get('author', None)
        if author_id:
            queryset = queryset.filter(author_id=author_id)

        # Filter by category if provided
        category_id = self.request.query_params.get('category', None)
        if category_id:
            queryset = queryset.filter(categories__id=category_id)

        # Filter by tag if provided
        tag_id = self.request.query_params.get('tag', None)
        if tag_id:
            queryset = queryset.filter(tags__id=tag_id)

        # Order by specified field
        ordering = self.request.query_params.get('ordering', '-created_at')
        return queryset.order_by(ordering)

    def perform_create(self, serializer):
        article = serializer.save()
        log_action('article_created_by_admin', self.request.user,
                   f'Article ID: {article.id}')

    def perform_update(self, serializer):
        article = serializer.save()
        log_action('article_updated_by_admin', self.request.user,
                   f'Article ID: {article.id}')

    def perform_destroy(self, instance):
        article_id = instance.id
        instance.delete()
        log_action('article_deleted_by_admin', self.request.user,
                   f'Article ID: {article_id}')

    def publish(self, request, pk=None):
        article = self.get_object()
        article.status = 'published'
        article.publish_date = timezone.now()
        article.save()
        log_action('article_published_by_admin',
                   request.user, f'Article ID: {article.id}')
        return Response({'status': 'success', 'message': 'Article published successfully'})

    def unpublish(self, request, pk=None):
        article = self.get_object()
        article.status = 'draft'
        article.save()
        log_action('article_unpublished_by_admin',
                   request.user, f'Article ID: {article.id}')
        return Response({'status': 'success', 'message': 'Article unpublished successfully'})

    def feature(self, request, pk=None):
        article = self.get_object()
        article.featured = not article.featured
        article.save()
        action = 'featured' if article.featured else 'unfeatured'
        log_action(f'article_{action}_by_admin',
                   request.user, f'Article ID: {article.id}')
        return Response({
            'status': 'success',
            'featured': article.featured,
            'message': f'Article {action} successfully'
        })

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class AdminMessageViewSet(viewsets.ModelViewSet):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        # Show all contact messages that have actual message content
        # This includes both newsletter subscribers who also sent a message
        # and people who just sent a message without subscribing
        queryset = Contact.objects.filter(
            message__isnull=False,
            message__gt=''  # Ensure message is not empty
        )

        # Filter by status if provided
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status)

        # Filter by date range
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)

        # Search by name or email
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(email__icontains=search)
            )

        return queryset.order_by('-date')

    def perform_create(self, serializer):
        message = serializer.save()
        log_action('message_created_by_admin', self.request.user,
                   f'Message ID: {message.id}')

    def perform_update(self, serializer):
        message = serializer.save()
        log_action('message_updated_by_admin', self.request.user,
                   f'Message ID: {message.id}')

    def perform_destroy(self, instance):
        message_id = instance.id
        instance.delete()
        log_action('message_deleted_by_admin', self.request.user,
                   f'Message ID: {message_id}')

    def mark_as_read(self, request, pk=None):
        message = self.get_object()
        message.status = 'read'
        message.save()
        log_action('message_marked_read_by_admin',
                   request.user, f'Message ID: {message.id}')
        return Response({'status': 'success', 'message': 'Message marked as read'})

    def mark_as_replied(self, request, pk=None):
        message = self.get_object()
        message.status = 'replied'
        message.save()
        log_action('message_marked_replied_by_admin',
                   request.user, f'Message ID: {message.id}')
        return Response({'status': 'success', 'message': 'Message marked as replied'})

    def add_note(self, request, pk=None):
        message = self.get_object()
        note = request.data.get('note')
        if note:
            message.notes = note
            message.save()
            log_action('message_note_added_by_admin',
                       request.user, f'Message ID: {message.id}')
            return Response({'status': 'success', 'message': 'Note added successfully'})
        return Response(
            {'error': 'Note is required'},
            status=status.HTTP_400_BAD_REQUEST
        )


class AdminSubscriberViewSet(viewsets.ModelViewSet):
    serializer_class = ContactSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        # Only show newsletter subscribers
        # This includes people who subscribed via contact form or dedicated newsletter signup
        queryset = Contact.objects.filter(newsletter=True)
        return queryset.order_by('-date')

    def perform_create(self, serializer):
        # Check if email already exists for newsletter subscribers
        email = serializer.validated_data.get('email')
        if Contact.objects.filter(email=email, newsletter=True).exists():
            from rest_framework.exceptions import ValidationError
            raise ValidationError({'email': 'This email is already subscribed to the newsletter.'})
        
        subscriber = serializer.save(newsletter=True)
        log_action('subscriber_added_by_admin', self.request.user,
                   f'Subscriber ID: {subscriber.id}')

    def perform_update(self, serializer):
        subscriber = serializer.save()
        log_action('subscriber_updated_by_admin', self.request.user,
                   f'Subscriber ID: {subscriber.id}')

    def perform_destroy(self, instance):
        subscriber_id = instance.id
        instance.delete()
        log_action('subscriber_removed_by_admin', self.request.user,
                   f'Subscriber ID: {subscriber_id}')

    def export_csv(self, request):
        subscribers = self.get_queryset()
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="subscribers.csv"'

        writer = csv.writer(response)
        writer.writerow(['Email', 'Subscribed Date'])

        for subscriber in subscribers:
            writer.writerow([
                subscriber.email,
                subscriber.date.strftime('%Y-%m-%d')
            ])

        log_action('subscribers_exported_by_admin',
                   request.user, 'Exported subscriber list')
        return response


class AdminCategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminUser]

    def perform_create(self, serializer):
        instance = serializer.save()
        log_action('category_created_by_admin', self.request.user,
                   f'Category ID: {instance.id}')

    def perform_update(self, serializer):
        instance = serializer.save()
        log_action('category_updated_by_admin', self.request.user,
                   f'Category ID: {instance.id}')

    def perform_destroy(self, instance):
        category_id = instance.id
        instance.delete()
        log_action('category_deleted_by_admin', self.request.user,
                   f'Category ID: {category_id}')


class AdminTagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [IsAdminUser]

    def perform_create(self, serializer):
        instance = serializer.save()
        log_action('tag_created_by_admin', self.request.user,
                   f'Tag ID: {instance.id}')

    def perform_update(self, serializer):
        instance = serializer.save()
        log_action('tag_updated_by_admin', self.request.user,
                   f'Tag ID: {instance.id}')

    def perform_destroy(self, instance):
        tag_id = instance.id
        instance.delete()
        log_action('tag_deleted_by_admin',
                   self.request.user, f'Tag ID: {tag_id}')
