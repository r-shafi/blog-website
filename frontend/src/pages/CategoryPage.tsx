import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import BlogCard from '@/components/blog/BlogCard';
import Layout from '@/components/layout/Layout';
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
import { Skeleton } from '@/components/ui/skeleton';

import { articlesApi } from '@/lib/api/articles';
import { categoriesApi } from '@/lib/api/categories';

const ITEMS_PER_PAGE = 10;
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First', ordering: '-publish_date' },
  { value: 'oldest', label: 'Oldest First', ordering: 'publish_date' },
  { value: 'popularity', label: 'Most Popular', ordering: '-views' },
];

const CategoryPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState('newest');

  const { data: category, isLoading: loadingCategory } = useQuery({
    queryKey: ['category', slug],
    queryFn: () => categoriesApi.getBySlug(slug || ''),
  });

  const getCurrentOrdering = () => {
    const option = SORT_OPTIONS.find((opt) => opt.value === sortOption);
    return option ? option.ordering : '-publish_date';
  };

  const { data: articlesData, isLoading: loadingArticles } = useQuery({
    queryKey: ['category-articles', category?.id, currentPage, sortOption],
    queryFn: () =>
      articlesApi.getAll({
        category: category?.id,
        page: currentPage,
        ordering: getCurrentOrdering(),
      }),
    enabled: !!category?.id,
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!category && !loadingCategory) {
    return null;
  }

  return (
    <Layout>
      <div className="container-newspaper py-12">
        {/* Header section */}
        <header className="mb-12">
          {renderCategoryHeader(category, loadingCategory)}
          <div className="flex justify-end mt-8">
            <div className="w-48">
              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main>
          {loadingArticles ? (
            <ArticleSkeletons count={5} />
          ) : articlesData?.results?.length > 0 ? (
            <>
              <div className="space-y-8">
                {articlesData.results.map((article) => (
                  <BlogCard
                    key={article.id}
                    id={article.id}
                    slug={article.slug}
                    title={article.title}
                    excerpt={article.excerpt}
                    author={{
                      id: article.author_detail.id,
                      name: article.author_detail.name,
                    }}
                    date={article.publish_date}
                    thumbnail={article.featured_image}
                    category={category?.name || 'Uncategorized'}
                  />
                ))}
              </div>
              {renderPagination(
                articlesData.count,
                currentPage,
                handlePageChange
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-newspaper-muted text-lg">
                No articles found in this category.
              </p>
            </div>
          )}
        </main>
      </div>
    </Layout>
  );
};

const ArticleSkeletons = ({ count }: { count: number }) => (
  <div className="space-y-8">
    {Array(count)
      .fill(null)
      .map((_, i) => (
        <div key={i} className="flex flex-col md:flex-row gap-6">
          <Skeleton className="md:w-1/4 h-48" />
          <div className="md:w-3/4 space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      ))}
  </div>
);

const renderCategoryHeader = (category, isLoading: boolean) => {
  if (isLoading) {
    return (
      <>
        <Skeleton className="h-12 w-1/2 mb-4" />
        <Skeleton className="h-6 w-3/4" />
      </>
    );
  }

  return (
    <>
      <h1 className="text-4xl font-serif font-bold mb-4">{category?.name}</h1>
      {category?.description && (
        <p className="text-newspaper-muted text-lg">{category.description}</p>
      )}
    </>
  );
};

const renderPagination = (
  totalCount: number,
  currentPage: number,
  onPageChange: (page: number) => void
) => {
  if (!totalCount) return null;

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="mt-8">
      <Pagination>
        <PaginationContent>
          {currentPage > 1 && (
            <PaginationItem>
              <PaginationPrevious
                onClick={() => onPageChange(currentPage - 1)}
                className="cursor-pointer"
              />
            </PaginationItem>
          )}

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
            <PaginationItem key={number}>
              <PaginationLink
                onClick={() => onPageChange(number)}
                isActive={currentPage === number}
                className="cursor-pointer"
              >
                {number}
              </PaginationLink>
            </PaginationItem>
          ))}

          {currentPage < totalPages && (
            <PaginationItem>
              <PaginationNext
                onClick={() => onPageChange(currentPage + 1)}
                className="cursor-pointer"
              />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default CategoryPage;
