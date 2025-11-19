import { Button } from '@/components/ui/button';
import {
  useArticleBookmark,
  useArticleReaction,
} from '@/hooks/use-article-actions';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Bookmark, BookmarkCheck, ThumbsDown, ThumbsUp } from 'lucide-react';

interface ArticleActionsProps {
  article: {
    slug: string;
    like_count: number;
    dislike_count: number;
    user_reaction: 'like' | 'dislike' | null;
    is_bookmarked: boolean;
  };
}

export function ArticleActions({ article }: ArticleActionsProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const reactionMutation = useArticleReaction();
  const bookmarkMutation = useArticleBookmark();

  const handleReaction = async (reaction: 'like' | 'dislike') => {
    if (!isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'Please login to react to articles',
        variant: 'destructive',
      });
      return;
    }

    try {
      await reactionMutation.mutateAsync({ slug: article.slug, reaction });
      toast({
        title: 'Success',
        description: `Article ${reaction}d successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update reaction',
        variant: 'destructive',
      });
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'Please login to bookmark articles',
        variant: 'destructive',
      });
      return;
    }

    try {
      await bookmarkMutation.mutateAsync(article.slug);
      const message = article.is_bookmarked
        ? 'Bookmark removed'
        : 'Article bookmarked';
      toast({
        title: 'Success',
        description: message,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update bookmark',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex items-center gap-4 py-4 border-t border-b">
      {/* Like Button */}
      <Button
        variant={article.user_reaction === 'like' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleReaction('like')}
        disabled={reactionMutation.isPending}
        className="flex items-center gap-2"
      >
        <ThumbsUp
          className={`h-4 w-4 ${
            article.user_reaction === 'like' ? 'fill-current' : ''
          }`}
        />
        <span>{article.like_count}</span>
      </Button>

      {/* Dislike Button */}
      <Button
        variant={article.user_reaction === 'dislike' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleReaction('dislike')}
        disabled={reactionMutation.isPending}
        className="flex items-center gap-2"
      >
        <ThumbsDown
          className={`h-4 w-4 ${
            article.user_reaction === 'dislike' ? 'fill-current' : ''
          }`}
        />
        <span>{article.dislike_count}</span>
      </Button>

      {/* Bookmark Button */}
      <Button
        variant={article.is_bookmarked ? 'default' : 'outline'}
        size="sm"
        onClick={handleBookmark}
        disabled={bookmarkMutation.isPending}
        className="flex items-center gap-2"
      >
        {article.is_bookmarked ? (
          <BookmarkCheck className="h-4 w-4 fill-current" />
        ) : (
          <Bookmark className="h-4 w-4" />
        )}
        <span>{article.is_bookmarked ? 'Bookmarked' : 'Bookmark'}</span>
      </Button>
    </div>
  );
}
