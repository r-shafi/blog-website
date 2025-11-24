import BlogCard from '@/components/blog/BlogCard';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthorDetail } from '@/hooks/use-authors';
import { getAvatarUrl } from '@/lib/utils/avatar';
import { Facebook, Globe, Linkedin, Mail, Twitter } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const AuthorProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sortOption, setSortOption] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 5;

  const { author, isLoading, error } = useAuthorDetail(id);

  if (error) {
    navigate('/not-found');
    return null;
  }

  const socialLinks = author
    ? {
        twitter: `https://twitter.com/${author.name
          .toLowerCase()
          .replace(/\s/g, '')}`,
        facebook: `https://facebook.com/${author.name
          .toLowerCase()
          .replace(/\s/g, '')}`,
        linkedin: `https://linkedin.com/in/${author.name
          .toLowerCase()
          .replace(/\s/g, '')}`,
        website: `https://${author.name.toLowerCase().replace(/\s/g, '')}.com`,
        email: `${author.name.toLowerCase().replace(/\s/g, '')}@blankpage.com`,
      }
    : null;

  const sortedArticles = author?.articles
    ? [...author.articles].sort((a, b) => {
        if (sortOption === 'newest') {
          const dateA = a.publish_date ? new Date(a.publish_date).getTime() : 0;
          const dateB = b.publish_date ? new Date(b.publish_date).getTime() : 0;
          return dateB - dateA;
        } else if (sortOption === 'oldest') {
          const dateA = a.publish_date
            ? new Date(a.publish_date).getTime()
            : Number.MAX_SAFE_INTEGER;
          const dateB = b.publish_date
            ? new Date(b.publish_date).getTime()
            : Number.MAX_SAFE_INTEGER;
          return dateA - dateB;
        } else if (sortOption === 'popularity') {
          return (b.views || 0) - (a.views || 0);
        }
        return 0;
      })
    : [];

  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = sortedArticles.slice(
    indexOfFirstArticle,
    indexOfLastArticle
  );
  const totalPages = Math.ceil((sortedArticles?.length || 0) / articlesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (isLoading) {
    return (
      <Layout>
        <div className="container-newspaper py-12">
          <div className="animate-pulse">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="w-32 h-32 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-4">
                <div className="h-8 bg-gray-200 w-1/3 rounded"></div>
                <div className="h-4 bg-gray-200 w-1/4 rounded"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!author) {
    return (
      <Layout>
        <div className="container-newspaper py-12">
          <h1 className="text-4xl font-serif font-bold mb-4 text-center">
            Author Not Found
          </h1>
          <p className="text-center">
            The author you're looking for doesn't exist.
          </p>
        </div>
      </Layout>
    );
  }

  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:8000${imagePath}`;
  };

  return (
    <Layout>
      <div className="container-newspaper py-12">
        <div className="mb-12">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <img
              src={getAvatarUrl(author.avatar, author.name)}
              alt={author.name}
              className="w-32 h-32 rounded-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/default-avatar.jpg';
              }}
            />
            <div className="flex-1">
              <h1 className="text-4xl font-serif font-bold mb-2">
                {author.name}
              </h1>
              <p className="text-newspaper-accent font-medium mb-4">
                {author.role}
              </p>
              <p className="mb-6">{author.bio}</p>
              <div className="flex gap-4 mb-6">
                <a
                  href={socialLinks?.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-newspaper-accent"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a
                  href={socialLinks?.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-newspaper-accent"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href={socialLinks?.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-newspaper-accent"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a
                  href={`mailto:${socialLinks?.email}`}
                  className="text-gray-600 hover:text-newspaper-accent"
                >
                  <Mail className="h-5 w-5" />
                </a>
                <a
                  href={socialLinks?.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-newspaper-accent"
                >
                  <Globe className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8">
            <h2 className="text-2xl font-serif font-bold">
              Articles by {author.name} ({author.article_count})
            </h2>
            <div className="w-48 mt-4 md:mt-0">
              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="popularity">Most Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {currentArticles.length > 0 ? (
            <div className="space-y-8">
              {currentArticles.map((article) => (
                <BlogCard
                  key={article.id}
                  id={article.id}
                  slug={article.slug}
                  title={article.title}
                  excerpt={article.excerpt}
                  author={{
                    id: author.id,
                    name: author.name,
                    avatar: getAvatarUrl(author.avatar, author.name),
                  }}
                  date={article.publish_date}
                  thumbnail={getFullImageUrl(article.featured_image)}
                  category={
                    article.categories_detail &&
                    article.categories_detail.length > 0
                      ? article.categories_detail[0]
                      : null
                  }
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p>No articles found by this author.</p>
              </CardContent>
            </Card>
          )}

          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination>
                <PaginationContent>
                  {currentPage > 1 && (
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => paginate(currentPage - 1)}
                        className="cursor-pointer"
                      />
                    </PaginationItem>
                  )}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (number) => (
                      <PaginationItem key={number}>
                        <PaginationLink
                          onClick={() => paginate(number)}
                          isActive={currentPage === number}
                          className="cursor-pointer"
                        >
                          {number}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}
                  {currentPage < totalPages && (
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => paginate(currentPage + 1)}
                        className="cursor-pointer"
                      />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AuthorProfilePage;
