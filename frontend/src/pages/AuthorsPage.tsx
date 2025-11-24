import SearchBar from '@/components/blog/SearchBar';
import AuthorCard from '@/components/common/AuthorCard';
import Layout from '@/components/layout/Layout';
import { Label } from '@/components/ui/label';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthors } from '@/hooks/use-authors';
import { useState } from 'react';

const AuthorsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { authors, totalPages, isLoading } = useAuthors(currentPage);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const filteredAuthors = authors.filter(
    (author) =>
      author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      author.bio.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="container-newspaper py-12">
        <h1 className="text-4xl font-serif font-bold mb-4 text-center">
          Our Authors
        </h1>
        <p className="text-center text-newspaper-muted max-w-2xl mx-auto mb-12">
          Meet the talented writers, journalists, and experts behind Blank
          Page's thoughtful reporting and analysis.
        </p>

        <div className="mb-8 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-2">
              <Label htmlFor="search" className="mb-2 block">
                Search Authors
              </Label>
              <SearchBar
                onSearch={handleSearch}
                placeholder="Search by name or bio..."
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(8)
              .fill(null)
              .map((_, index) => (
                <div key={index} className="space-y-4">
                  <Skeleton className="w-full h-48" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
          </div>
        ) : filteredAuthors.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAuthors.map((author) => (
                <AuthorCard
                  key={author.id}
                  id={author.id.toString()}
                  name={author.name}
                  role={author.role}
                  bio={author.bio}
                  avatar={author.avatar}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    {currentPage > 1 && (
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage(currentPage - 1)}
                          className="cursor-pointer"
                        />
                      </PaginationItem>
                    )}

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (number) => (
                        <PaginationItem key={number}>
                          <PaginationLink
                            onClick={() => setCurrentPage(number)}
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
                          onClick={() => setCurrentPage(currentPage + 1)}
                          className="cursor-pointer"
                        />
                      </PaginationItem>
                    )}
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-newspaper-muted text-lg">
              No authors found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AuthorsPage;
