import { Article } from '@/types/article';
import { ArticleCard } from './ArticleCard';

interface ArticlesListProps {
  articles: Article[];
  status?:
    | 'published'
    | 'pending'
    | 'draft'
    | 'liked'
    | 'disliked'
    | 'bookmarked';
  loading?: boolean;
}

export function ArticlesList({
  articles,
  status = 'published',
  loading = false,
}: ArticlesListProps) {
  if (loading) {
    return <div className="text-center text-muted-foreground">Loading...</div>;
  }

  let filteredArticles;

  // For liked, disliked, and bookmarked, we don't filter by status since these
  // are already filtered by the API endpoint
  if (['liked', 'disliked', 'bookmarked'].includes(status)) {
    filteredArticles = articles;
  } else {
    filteredArticles = articles.filter((article) => article.status === status);
  }

  if (filteredArticles.length === 0) {
    const displayStatus =
      status === 'liked'
        ? 'liked'
        : status === 'disliked'
        ? 'disliked'
        : status === 'bookmarked'
        ? 'bookmarked'
        : status;
    return (
      <div className="text-center text-muted-foreground">
        No {displayStatus} articles found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {filteredArticles.map((article) => (
        <ArticleCard key={article.id} article={article} showStatus={true} />
      ))}
    </div>
  );
}
