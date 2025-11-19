// Base article interface
export interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image?: string;
  featuredImage?: string; // legacy support
  status: 'draft' | 'pending' | 'published';
  publish_date?: string;
  last_modified: string;
  created_at: string;
  author: number;
  author_detail: {
    id: number;
    email: string;
    name: string;
    role: string;
    avatar?: string;
    bio: string;
    join_date: string;
    last_login?: string;
    is_active: boolean;
  };
  categories_detail: Array<{
    id: number;
    name: string;
    slug: string;
    description: string;
    featured_image?: string;
    parent?: number;
    article_count: number;
    children?: unknown;
  }>;
  tags_detail: Array<{
    id: number;
    name: string;
    slug: string;
    description: string;
    article_count: number;
  }>;
  featured: boolean;
  views: number;
  reading_time: number;
  like_count?: number;
  dislike_count?: number;
  user_reaction?: 'like' | 'dislike' | null;
  is_bookmarked?: boolean;
}
