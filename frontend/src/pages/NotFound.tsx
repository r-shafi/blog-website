import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
}

const NotFound = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    console.error(
      '404 Error: User attempted to access non-existent route:',
      location.pathname
    );
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (searchQuery.trim() === '') {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const filtered = [];

    setSearchResults(filtered);
    setShowResults(true);

    console.log(
      'Searched for:',
      searchQuery,
      'Found:',
      filtered.length,
      'results'
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-xl">
        <h1 className="text-8xl font-serif font-bold text-newspaper-accent mb-4">
          404
        </h1>
        <h2 className="text-3xl font-serif font-bold mb-4">Page Not Found</h2>
        <p className="text-xl text-gray-600 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex w-full max-w-md mx-auto">
            <Input
              type="text"
              placeholder="Search for content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-r-none border-r-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Button type="submit" className="rounded-l-none">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
        </form>

        {showResults && (
          <div className="mb-8 w-full max-w-md mx-auto text-left">
            <h3 className="text-lg font-medium mb-2">
              {searchResults.length > 0
                ? `Found ${searchResults.length} results`
                : 'No results found'}
            </h3>
            <ul className="space-y-4">
              {searchResults.map((result) => (
                <li key={result.id} className="border-b pb-2">
                  <Link
                    to={`/blog/${result.id}`}
                    className="font-medium hover:text-newspaper-accent"
                  >
                    {result.title}
                  </Link>
                  <p className="text-sm text-gray-600 truncate">
                    {result.excerpt}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Link to="/">
          <Button className="px-6" size="lg">
            Return to Home
          </Button>
        </Link>
      </div>

      <div className="mt-12 text-center text-gray-500">
        <p>Looking for something else?</p>
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          <Link to="/blogs" className="text-newspaper-accent hover:underline">
            Browse All Articles
          </Link>
          <Link to="/contact" className="text-newspaper-accent hover:underline">
            Contact Us
          </Link>
          <Link to="/about" className="text-newspaper-accent hover:underline">
            About Blog Website
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
