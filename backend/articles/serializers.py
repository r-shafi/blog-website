from rest_framework import serializers
from .models import Article
from users.serializers import UserSerializer
from categories.serializers import CategorySerializer
from tags.serializers import TagSerializer
from django.utils import timezone
from categories.models import Category
from tags.models import Tag


class ArticleListSerializer(serializers.ModelSerializer):
    author_detail = UserSerializer(source='author', read_only=True)
    categories_detail = CategorySerializer(
        source='categories', many=True, read_only=True)

    class Meta:
        model = Article
        fields = [
            'id', 'title', 'slug', 'excerpt', 'featured_image',
            'publish_date', 'author', 'author_detail', 'categories_detail',
            'featured', 'views', 'reading_time'
        ]
        read_only_fields = ['id', 'slug', 'views', 'reading_time']


class ArticleSerializer(serializers.ModelSerializer):
    author_detail = UserSerializer(source='author', read_only=True)
    categories_detail = CategorySerializer(
        source='categories', many=True, read_only=True)
    tags_detail = TagSerializer(source='tags', many=True, read_only=True)
    category_ids = serializers.PrimaryKeyRelatedField(
        source='categories',
        queryset=Category.objects.all(),
        many=True,
        write_only=True,
        required=False
    )
    tag_ids = serializers.PrimaryKeyRelatedField(
        source='tags',
        queryset=Tag.objects.all(),
        many=True,
        write_only=True,
        required=False
    )
    like_count = serializers.ReadOnlyField()
    dislike_count = serializers.ReadOnlyField()
    user_reaction = serializers.SerializerMethodField()
    is_bookmarked = serializers.SerializerMethodField()

    class Meta:
        model = Article
        fields = [
            'id', 'title', 'slug', 'excerpt', 'content', 'featured_image',
            'status', 'publish_date', 'last_modified', 'created_at',
            'author', 'author_detail', 'categories_detail', 'tags_detail',
            'category_ids', 'tag_ids', 'featured', 'views', 'reading_time',
            'like_count', 'dislike_count', 'user_reaction', 'is_bookmarked'
        ]
        read_only_fields = ['id', 'slug', 'last_modified', 'created_at',
                            'views', 'reading_time', 'author']

    def get_user_reaction(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.get_user_reaction(request.user)
        return None

    def get_is_bookmarked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.bookmarked_by.filter(user=request.user).exists()
        return False

    def validate_title(self, value):
        if len(value.strip()) < 5:
            raise serializers.ValidationError(
                "Title must be at least 5 characters long.")
        return value.strip()

    def validate_excerpt(self, value):
        if len(value.strip()) < 10:
            raise serializers.ValidationError(
                "Excerpt must be at least 10 characters long.")
        return value.strip()

    def validate_content(self, value):
        if len(value.strip()) < 100:
            raise serializers.ValidationError(
                "Content must be at least 100 characters long.")
        return value.strip()

    def create(self, validated_data):
        category_ids = validated_data.pop('categories', [])
        tag_ids = validated_data.pop('tags', [])

        if validated_data.get('status') == 'published' and not validated_data.get('publish_date'):
            validated_data['publish_date'] = timezone.now()

        article = Article.objects.create(**validated_data)

        if category_ids:
            article.categories.set(category_ids)
        if tag_ids:
            article.tags.set(tag_ids)

        return article

    def update(self, instance, validated_data):
        if 'categories' in validated_data:
            instance.categories.set(validated_data.pop('categories'))
        if 'tags' in validated_data:
            instance.tags.set(validated_data.pop('tags'))

        if validated_data.get('status') == 'published' and not instance.publish_date:
            validated_data['publish_date'] = timezone.now()

        return super().update(instance, validated_data)
