from rest_framework import serializers
from .models import Category


class CategorySerializer(serializers.ModelSerializer):
    article_count = serializers.SerializerMethodField()
    children = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'description',
                  'featured_image', 'parent', 'article_count', 'children')
        read_only_fields = ('id', 'slug')

    def get_article_count(self, obj):
        return obj.articles.count()

    def get_children(self, obj):
        return CategorySerializer(obj.children.all(), many=True).data if obj.children.exists() else None
