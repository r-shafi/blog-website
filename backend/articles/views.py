from django.shortcuts import render
from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.db.models import F, Q
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import NotFound
from django.http import Http404
from .models import Article
from .serializers import ArticleSerializer
from comments.serializers import CommentSerializer
from core.utils import get_search_filter, log_action, log_exception, compress_image
from core.permissions import IsAuthorOrReadOnly
import os
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from pathlib import Path


class ArticleListCreateView(generics.ListCreateAPIView):
    serializer_class = ArticleSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'content', 'excerpt',
                     'author__name', 'categories__name', 'tags__name']
    ordering_fields = ['publish_date', 'views', 'created_at']
    ordering = ['-publish_date']

    def get_queryset(self):

        queryset = Article.objects.select_related(
            'author').prefetch_related('categories', 'tags')

        if self.request.user.is_authenticated and self.request.query_params.get('include_drafts'):

            queryset = queryset.filter(
                Q(status='published') |
                Q(status='draft', author=self.request.user)
            )
        else:
            queryset = queryset.filter(status='published')

        category = self.request.query_params.get('category')
        if category:
            # Support both ID and slug for category filtering
            if category.isdigit():
                queryset = queryset.filter(categories__id=category)
            else:
                queryset = queryset.filter(categories__slug=category)

        tag = self.request.query_params.get('tag')
        if tag:
            # Support both ID and slug for tag filtering
            if tag.isdigit():
                queryset = queryset.filter(tags__id=tag)
            else:
                queryset = queryset.filter(tags__slug=tag)

        featured = self.request.query_params.get('featured')
        if featured:
            queryset = queryset.filter(featured=True)

        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        if date_from:
            queryset = queryset.filter(publish_date__gte=date_from)
        if date_to:
            queryset = queryset.filter(publish_date__lte=date_to)

        return queryset

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        requested_status = self.request.data.get('status', 'pending')
        
        if self.request.user.role == 'admin':
            # Admins can set any status they want
            status = requested_status
        else:
            # Regular users can save as draft or submit for review (pending)
            if requested_status == 'draft':
                status = 'draft'
            else:
                status = 'pending'
        
        serializer.save(author=self.request.user, status=status)


class AdminArticleListAPIView(generics.ListAPIView):
    serializer_class = ArticleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if not self.request.user.is_authenticated or self.request.user.role != 'admin':
            return Response(
                {"error": "Admin access required"},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().get_permissions()

    def get_queryset(self):
        return Article.objects.select_related('author').prefetch_related('categories', 'tags').all()


class ArticleRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Article.objects.select_related(
        'author').prefetch_related('categories', 'tags')
    serializer_class = ArticleSerializer
    permission_classes = [IsAuthorOrReadOnly]
    lookup_field = 'slug'

    def get_object(self):
        try:
            return super().get_object()
        except Http404:
            raise NotFound(detail="Article not found",
                           code=status.HTTP_404_NOT_FOUND)

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            if instance.status == 'published' or instance.author == request.user:
                if instance.status == 'published' and request.user != instance.author:
                    instance.views += 1
                    instance.save(update_fields=['views'])
                serializer = self.get_serializer(instance)
                return Response(serializer.data)
            return Response(
                {'error': 'You do not have permission to view this article.'},
                status=status.HTTP_403_FORBIDDEN
            )
        except Http404:
            return Response(
                {'error': 'Article not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    def perform_update(self, serializer):
        try:
            article = serializer.save()
            log_action('article_updated', self.request.user,
                       f'Article ID: {article.id}')
        except Exception as e:
            log_exception(
                e, f'Error updating article ID: {self.get_object().id}')
            raise

    def perform_destroy(self, instance):
        try:
            article_id = instance.id
            instance.delete()
            log_action('article_deleted', self.request.user,
                       f'Article ID: {article_id}')
        except Exception as e:
            log_exception(e, f'Error deleting article ID: {instance.id}')
            raise


class ArticlePublishView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, slug):
        try:
            article = Article.objects.get(slug=slug, author=request.user)
            article.status = 'published'
            article.publish_date = timezone.now()
            article.save()
            log_action('article_published', request.user,
                       f'Article ID: {article.id}')
            return Response({'status': 'Article published successfully'})
        except Article.DoesNotExist:
            return Response(
                {'error': 'Article not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            log_exception(e, f'Error publishing article: {slug}')
            raise


class ArticleUnpublishView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, slug):
        try:
            article = Article.objects.get(slug=slug, author=request.user)
            article.status = 'draft'
            article.save()
            log_action('article_unpublished', request.user,
                       f'Article ID: {article.id}')
            return Response({'status': 'Article unpublished successfully'})
        except Article.DoesNotExist:
            return Response(
                {'error': 'Article not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            log_exception(e, f'Error unpublishing article: {slug}')
            raise


class ArticleBySlugView(generics.RetrieveAPIView):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.status != 'published':

            if not request.user.is_authenticated or (
                request.user != instance.author and
                request.user.role != 'admin'
            ):
                return Response(
                    {'error': 'You do not have permission to view this article.'},
                    status=status.HTTP_403_FORBIDDEN
                )

        # Get comments for this article
        comments = instance.comments.filter(
            status='approved',
            parent=None  # Only top-level comments
        ).order_by('-created_at')
        
        # Serialize article and comments
        article_serializer = self.get_serializer(instance)
        comments_serializer = CommentSerializer(
            comments, 
            many=True, 
            context={'request': request}
        )
        
        # Combine data
        data = article_serializer.data
        data['comments'] = comments_serializer.data
        
        return Response(data)


class PopularArticlesView(generics.ListAPIView):
    serializer_class = ArticleSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Article.objects.filter(status='published').order_by('-views')[:10]


class RecentArticlesView(generics.ListAPIView):
    serializer_class = ArticleSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Article.objects.filter(status='published').order_by('-publish_date')[:10]


class RelatedArticlesView(generics.ListAPIView):
    serializer_class = ArticleSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        article = get_object_or_404(Article, pk=self.kwargs['pk'])
        return Article.objects.filter(
            categories__in=article.categories.all()
        ).exclude(
            id=article.id
        ).distinct()[:5]


class IncrementViewsView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, pk):
        try:
            article = get_object_or_404(Article, pk=pk)
            article.views = F('views') + 1
            article.save()
            log_action('article_viewed', getattr(request.user, 'is_authenticated', False) and request.user or None,
                       f'Article ID: {article.id}')
            return Response({'status': 'success'})
        except Exception as e:
            log_exception(e, f'Error incrementing views for article ID: {pk}')
            raise


class ImageUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            if 'image' not in request.FILES:
                return Response(
                    {'error': 'No image file provided'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            image = request.FILES['image']

            if not image.content_type.startswith('image/'):
                return Response(
                    {'error': 'Invalid file type. Please upload an image.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if image.size > 5 * 1024 * 1024:
                return Response(
                    {'error': 'Image file too large. Maximum size is 5MB.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            ext = Path(image.name).suffix
            filename = f"article_images/{request.user.id}/{timezone.now().strftime('%Y%m%d_%H%M%S')}{ext}"

            compressed_image = compress_image(image)
            if not compressed_image:
                return Response(
                    {'error': 'Failed to process image'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            path = default_storage.save(filename, compressed_image)
            image_url = default_storage.url(path)

            log_action('image_uploaded', request.user,
                       f'Image uploaded: {filename}')

            return Response({
                'url': image_url,
                'success': True
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            log_exception(e, 'Error uploading image')
            return Response(
                {'error': 'Failed to upload image'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UserArticlesView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ArticleSerializer

    def get(self, request):
        articles = Article.objects.filter(author=request.user)
        serializer = self.serializer_class(articles, many=True)
        return Response({"results": serializer.data})


class ArticleLikeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, slug):
        try:
            from .models import ArticleLike
            article = Article.objects.get(slug=slug, status='published')
            reaction_type = request.data.get('reaction')  # 'like' or 'dislike'
            
            if reaction_type not in ['like', 'dislike']:
                return Response({'error': 'Invalid reaction type'}, status=status.HTTP_400_BAD_REQUEST)
            
            is_like = reaction_type == 'like'
            
            # Get or create the like/dislike record
            like_obj, created = ArticleLike.objects.get_or_create(
                user=request.user,
                article=article,
                defaults={'is_like': is_like}
            )
            
            if not created:
                if like_obj.is_like == is_like:
                    # Same reaction - remove it (toggle off)
                    like_obj.delete()
                    return Response({
                        'message': f'{reaction_type.title()} removed',
                        'user_reaction': None,
                        'like_count': article.like_count,
                        'dislike_count': article.dislike_count
                    })
                else:
                    # Different reaction - update it
                    like_obj.is_like = is_like
                    like_obj.save()
                    return Response({
                        'message': f'Changed to {reaction_type}',
                        'user_reaction': reaction_type,
                        'like_count': article.like_count,
                        'dislike_count': article.dislike_count
                    })
            else:
                # New reaction
                return Response({
                    'message': f'Article {reaction_type}d',
                    'user_reaction': reaction_type,
                    'like_count': article.like_count,
                    'dislike_count': article.dislike_count
                })
                
        except Article.DoesNotExist:
            return Response({'error': 'Article not found'}, status=status.HTTP_404_NOT_FOUND)


class ArticleBookmarkView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, slug):
        try:
            from .models import BookmarkedArticle
            article = Article.objects.get(slug=slug, status='published')
            
            bookmark, created = BookmarkedArticle.objects.get_or_create(
                user=request.user,
                article=article
            )
            
            if not created:
                # Already bookmarked - remove bookmark
                bookmark.delete()
                return Response({
                    'message': 'Bookmark removed',
                    'is_bookmarked': False
                })
            else:
                # New bookmark
                return Response({
                    'message': 'Article bookmarked',
                    'is_bookmarked': True
                })
                
        except Article.DoesNotExist:
            return Response({'error': 'Article not found'}, status=status.HTTP_404_NOT_FOUND)


class UserBookmarksView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from .models import BookmarkedArticle
        bookmarks = BookmarkedArticle.objects.filter(user=request.user).select_related('article')
        articles = [bookmark.article for bookmark in bookmarks]
        serializer = ArticleSerializer(articles, many=True, context={'request': request})
        return Response({'results': serializer.data})


class UserLikedArticlesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from .models import ArticleLike
        liked_articles = ArticleLike.objects.filter(
            user=request.user, 
            is_like=True
        ).select_related('article')
        articles = [like.article for like in liked_articles]
        serializer = ArticleSerializer(articles, many=True, context={'request': request})
        return Response({'results': serializer.data})


class UserDislikedArticlesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from .models import ArticleLike
        disliked_articles = ArticleLike.objects.filter(
            user=request.user, 
            is_like=False
        ).select_related('article')
        articles = [dislike.article for dislike in disliked_articles]
        serializer = ArticleSerializer(articles, many=True, context={'request': request})
        return Response({'results': serializer.data})
