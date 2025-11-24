import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Eye } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface RelatedArticle {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  featured_image?: string;
  publish_date: string;
  views?: number;
  author_detail: {
    name: string;
  };
}

interface RelatedArticlesProps {
  articles: RelatedArticle[];
}

const RelatedArticles: React.FC<RelatedArticlesProps> = ({ articles }) => {
  const navigate = useNavigate();

  const handleArticleClick = (slug: string) => {
    navigate(`/blog/${slug}`);
  };

  if (!articles || articles.length === 0) {
    return (
      <div className="mb-12">
        <h2 className="text-2xl font-serif font-bold mb-6">Related Articles</h2>
        <div className="text-center py-8 text-newspaper-muted">
          <p>No related articles found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-serif font-bold mb-6">Related Articles</h2>

      <Carousel className="w-full">
        <CarouselContent>
          {articles.map((article) => (
            <CarouselItem
              key={article.id}
              className="md:basis-1/2 lg:basis-1/3 cursor-pointer"
              onClick={() => handleArticleClick(article.slug)}
            >
              <Card className="h-full transition-all duration-200 hover:shadow-md">
                {article.featured_image && (
                  <div className="w-full h-32 overflow-hidden">
                    <img
                      src={article.featured_image}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardContent className="p-4 flex flex-col h-[calc(100%-8rem)]">
                  <h3 className="font-serif font-bold line-clamp-2 mb-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-newspaper-muted mb-2">
                    {article.author_detail?.name} •{' '}
                    {new Date(article.publish_date).toLocaleDateString()}
                    {article.views && article.views > 0 && (
                      <>
                        {' • '}
                        <span className="inline-flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {article.views}
                        </span>
                      </>
                    )}
                  </p>
                  <p className="text-sm line-clamp-3">{article.excerpt}</p>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-0" />
        <CarouselNext className="right-0" />
      </Carousel>
    </div>
  );
};

export default RelatedArticles;
