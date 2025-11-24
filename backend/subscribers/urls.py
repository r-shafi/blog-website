from django.urls import path
from . import views

urlpatterns = [
    path('', views.SubscriberListView.as_view(), name='subscriber_root'),
    path('subscribe/', views.SubscribeView.as_view(), name='subscribe'),
    path('confirm/<uuid:token>/', views.ConfirmSubscriptionView.as_view(),
         name='confirm_subscription'),
    path('unsubscribe/<uuid:token>/',
         views.UnsubscribeView.as_view(), name='unsubscribe'),
    path('list/', views.SubscriberListView.as_view(), name='subscriber_list'),
    path('export/', views.ExportSubscribersView.as_view(),
         name='export_subscribers'),
]
