from django.db import models
from django.utils.text import slugify
from users.models import User
from categories.models import Category
from tags.models import Tag
from core.utils import compress_image, generate_unique_slug


class Article(models.Model):
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('pending', 'Pending'),
        ('published', 'Published'),
        ('archived', 'Archived'),
    )

    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    excerpt = models.TextField()
    content = models.TextField()
    featured_image = models.ImageField(
        upload_to='articles/', blank=True, null=True)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='draft')
    publish_date = models.DateTimeField(null=True, blank=True)
    last_modified = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='articles')
    categories = models.ManyToManyField(Category, related_name='articles')
    tags = models.ManyToManyField(Tag, related_name='articles')
    featured = models.BooleanField(default=False)
    views = models.PositiveIntegerField(default=0)
    reading_time = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['-publish_date', '-created_at']
        db_table = 'articles'

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = generate_unique_slug(self, 'title')

        if self.content:
            words_per_minute = 200
            word_count = len(self.content.split())
            self.reading_time = max(1, round(word_count / words_per_minute))

        if self.featured_image:
            try:
                self.featured_image = compress_image(self.featured_image)
            except Exception:
                pass

        super().save(*args, **kwargs)

    @property
    def like_count(self):
        return self.article_likes.filter(is_like=True).count()

    @property
    def dislike_count(self):
        return self.article_likes.filter(is_like=False).count()

    def get_user_reaction(self, user):
        """Get user's like/dislike reaction for this article"""
        if not user.is_authenticated:
            return None
        try:
            reaction = self.article_likes.get(user=user)
            return 'like' if reaction.is_like else 'dislike'
        except ArticleLike.DoesNotExist:
            return None


class ArticleLike(models.Model):
    """Model to track likes and dislikes for articles"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='article_likes')
    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name='article_likes')
    is_like = models.BooleanField()  # True for like, False for dislike
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'article')  # One reaction per user per article
        db_table = 'article_likes'

    def __str__(self):
        reaction = 'liked' if self.is_like else 'disliked'
        return f'{self.user.name} {reaction} {self.article.title}'


class BookmarkedArticle(models.Model):
    """Model to track bookmarked articles for users"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookmarked_articles')
    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name='bookmarked_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'article')  # One bookmark per user per article
        db_table = 'bookmarked_articles'

    def __str__(self):
        return f'{self.user.name} bookmarked {self.article.title}'
