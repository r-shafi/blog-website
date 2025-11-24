from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'users', views.AdminUserViewSet, basename='admin-users')
router.register(r'articles', views.AdminArticleViewSet,
                basename='admin-articles')
router.register(r'messages', views.AdminMessageViewSet,
                basename='admin-messages')
router.register(r'subscribers', views.AdminSubscriberViewSet,
                basename='admin-subscribers')
router.register(r'categories', views.AdminCategoryViewSet,
                basename='admin-categories')
router.register(r'tags', views.AdminTagViewSet, basename='admin-tags')

urlpatterns = [
    path('dashboard/', views.DashboardStatsView.as_view(), name='admin-dashboard'),
    path('articles/<int:article_id>/quick-action/', views.QuickArticleActionView.as_view(), name='quick-article-action'),
    path('articles/bulk-action/', views.BulkArticleActionView.as_view(), name='bulk-article-action'),


    path('users/<int:pk>/ban/',
         views.AdminUserViewSet.as_view({'post': 'ban_user'}),
         name='admin-ban-user'),
    path('users/<int:pk>/promote/',
         views.AdminUserViewSet.as_view({'post': 'promote_user'}),
         name='admin-promote-user'),


    path('articles/<int:pk>/publish/',
         views.AdminArticleViewSet.as_view({'post': 'publish'}),
         name='admin-publish-article'),
    path('articles/<int:pk>/unpublish/',
         views.AdminArticleViewSet.as_view({'post': 'unpublish'}),
         name='admin-unpublish-article'),
    path('articles/<int:pk>/feature/',
         views.AdminArticleViewSet.as_view({'post': 'feature'}),
         name='admin-feature-article'),
    path('articles/',
         views.AdminArticleViewSet.as_view({'get': 'list'}),
         name='admin-list-articles'),


    path('messages/<int:pk>/read/',
         views.AdminMessageViewSet.as_view({'post': 'mark_as_read'}),
         name='admin-mark-message-read'),
    path('messages/<int:pk>/replied/',
         views.AdminMessageViewSet.as_view({'post': 'mark_as_replied'}),
         name='admin-mark-message-replied'),
    path('messages/<int:pk>/note/',
         views.AdminMessageViewSet.as_view({'post': 'add_note'}),
         name='admin-add-message-note'),

    path('subscribers/export/',
         views.AdminSubscriberViewSet.as_view({'get': 'export_csv'}),
         name='admin-export-subscribers'),
    path('subscribers/<int:pk>/verify/',
         views.AdminSubscriberViewSet.as_view({'post': 'verify'}),
         name='admin-verify-subscriber'),
    path('subscribers/',
         views.AdminSubscriberViewSet.as_view({'get': 'list'}),
         name='admin-list-subscribers'),
] + router.urls
