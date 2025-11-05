import { Article } from '@/types/article';
import { Calendar, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader } from './ui/card';

interface ArticleCardProps {
  article: Article & { status?: 'published' | 'pending' | 'draft' };
  showStatus?: boolean;
}

export function ArticleCard({ article, showStatus = false }: ArticleCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <div className="flex flex-col md:flex-row gap-4">
          {article.featuredImage && (
            <div className="md:w-1/4">
              <Link to={`/blog/${article.slug}`}>
                <img
                  src={article.featuredImage}
                  alt={article.title}
                  className="w-full h-32 object-cover rounded"
                />
              </Link>
            </div>
          )}
          <div className={article.featuredImage ? 'md:w-3/4' : 'w-full'}>
            <div className="flex items-center justify-between mb-2">
              <Link
                to={`/blog/${article.slug}`}
                className="article-title text-xl font-serif hover:text-newspaper-accent"
              >
                {article.title}
              </Link>
              {showStatus && article.status && (
                <Badge
                  variant={
                    article.status === 'published'
                      ? 'default'
                      : article.status === 'pending'
                      ? 'destructive'
                      : 'secondary'
                  }
                >
                  {article.status.charAt(0).toUpperCase() +
                    article.status.slice(1)}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-newspaper-muted mb-2 text-sm">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(article.publish_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{article.views || 0} views</span>
              </div>
              <span>{article.reading_time || 0} min read</span>
            </div>
            <p className="text-newspaper-muted mb-4">{article.excerpt}</p>
            <div className="flex flex-wrap gap-2">
              {article.tags_detail?.slice(0, 3).map((tag) => (
                <Badge key={tag.id} variant="secondary" className="text-xs">
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Link
          to={`/blog/${article.slug}`}
          className="text-newspaper-accent hover:underline text-sm font-medium"
        >
          Continue Reading →
        </Link>
      </CardContent>
    </Card>
  );
}
