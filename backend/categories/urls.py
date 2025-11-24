from django.urls import path
from . import views

urlpatterns = [
    path('', views.CategoryListView.as_view(), name='category_list'),
    path('<int:pk>/', views.CategoryDetailView.as_view(), name='category_detail'),
    path('slug/<slug:slug>/', views.CategoryBySlugView.as_view(),
         name='category_by_slug'),
    path('<int:pk>/articles/', views.CategoryArticlesView.as_view(),
         name='category_articles'),
]
