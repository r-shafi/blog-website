import BlogCard from '@/components/blog/BlogCard';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { articlesApi } from '@/lib/api/articles';
import { getAvatarUrl } from '@/lib/utils/avatar';
import { useQuery } from '@tanstack/react-query';
import { Eye } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Index = () => {
  const { data: featuredArticles, isLoading: loadingFeatured } = useQuery({
    queryKey: ['featured-articles'],
    queryFn: () => articlesApi.getFeatured(),
  });

  const { data: latestArticles, isLoading: loadingLatest } = useQuery({
    queryKey: ['latest-articles'],
    queryFn: () => articlesApi.getLatest(),
  });

  const slides = [
    {
      title: 'The Blog Website Awaits You',
      description:
        'Fill it with your stories, ideas, and everything in between.',
      cta: 'Start Writing',
      image: '/assets/slide_1.jpg',
      link: '/register',
    },
    {
      title: 'Discover Stories that Inspire',
      description: 'Read thousands of unique articles from writers like you.',
      cta: 'Start Reading',
      image: '/assets/slide_2.jpg',
      link: '/blogs',
    },
    {
      title: 'Grow Your Voice, Find Your Audience	',
      description:
        'Share your thoughts and build your own community of readers.',
      cta: 'Join Now',
      image: '/assets/slide_3.jpg',
      link: '/register',
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [slides.length, isPaused]);

  const renderArticleSkeleton = () => (
    <div className="flex flex-col h-full shadow-sm border border-gray-100 rounded-md overflow-hidden animate-pulse">
      <Skeleton className="w-full h-48" />
      <div className="p-6 flex flex-col flex-grow space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-20 w-full" />
      </div>
    </div>
  );

  return (
    <Layout>
      <section
        className="relative py-32 bg-gray-900 text-white min-h-[600px] flex items-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${slides[currentSlide].image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="relative container mx-auto px-4 flex flex-col items-center text-center w-full">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight mb-4 animate-fadeIn text-white">
            {slides[currentSlide].title}
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl animate-fadeIn">
            {slides[currentSlide].description}
          </p>
          <Link to={slides[currentSlide].link}>
            <Button className="btn-primary text-lg px-8 py-3 animate-fadeIn">
              {slides[currentSlide].cta}
            </Button>
          </Link>

          <div className="flex space-x-3 mt-8">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-3 w-3 rounded-full transition-all duration-300 ${
                  currentSlide === idx
                    ? 'bg-white scale-125'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              ></button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-newspaper">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-serif font-bold mb-4">
              Featured Articles
            </h2>
            <p className="text-newspaper-muted max-w-2xl mx-auto">
              Our editors' selections for the most thought-provoking and
              relevant pieces
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {loadingFeatured
              ? Array(3)
                  .fill(null)
                  .map((_, i) => <div key={i}>{renderArticleSkeleton()}</div>)
              : featuredArticles?.results?.slice(0, 3).map((article) => (
                  <article
                    key={article.id}
                    className="flex flex-col h-full shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 rounded-md overflow-hidden"
                  >
                    {article.featured_image && (
                      <img
                        src={article.featured_image}
                        alt={article.title}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-6 flex flex-col flex-grow">
                      <Link
                        to={`/blog/${article.slug}`}
                        className="article-title mb-2 block"
                      >
                        {article.title}
                      </Link>
                      <p className="article-meta flex items-center">
                        {article.author_detail && (
                          <>
                            <img
                              src={getAvatarUrl(
                                article.author_detail.avatar,
                                article.author_detail.name
                              )}
                              alt={article.author_detail.name}
                              className="w-6 h-6 rounded-full mr-2"
                            />
                            <Link
                              to={`/author/${article.author_detail.id}`}
                              className="hover:text-newspaper-accent"
                            >
                              {article.author_detail.name}
                            </Link>
                            <span className="mx-2">•</span>
                          </>
                        )}
                        <span>
                          {new Date(article.publish_date).toLocaleDateString(
                            'en-US',
                            {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            }
                          )}
                        </span>
                        {article.views && article.views > 0 && (
                          <>
                            <span className="mx-2">•</span>
                            <span className="inline-flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {article.views} views
                            </span>
                          </>
                        )}
                      </p>
                      <p className="article-excerpt">{article.excerpt}</p>
                    </div>
                  </article>
                ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-newspaper">
          <div className="mb-8">
            <h2 className="text-3xl font-serif font-bold mb-4">
              Latest Articles
            </h2>
            <div className="w-20 h-1 bg-newspaper-accent"></div>
          </div>

          <div className="space-y-8">
            {loadingLatest
              ? Array(4)
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
                  ))
              : latestArticles?.results?.map((article) => (
                  <BlogCard
                    key={article.id}
                    id={article.id}
                    slug={article.slug}
                    title={article.title}
                    excerpt={article.excerpt}
                    author={{
                      id: article.author_detail?.id || '',
                      name: article.author_detail?.name || '',
                      avatar: article.author_detail?.avatar,
                    }}
                    date={article.publish_date}
                    thumbnail={article.featured_image}
                    category={article.categories_detail?.[0] || null}
                    views={article.views}
                  />
                ))}
          </div>

          <div className="mt-10 text-center">
            <Link to="/blogs">
              <Button variant="outline" className="btn-secondary">
                View All Articles
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
