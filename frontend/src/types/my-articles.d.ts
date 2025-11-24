export interface ArticlesResponse {
  results: Result[];
}

export interface Result {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: null | string;
  status: string;
  publish_date: Date | null;
  last_modified: Date;
  created_at: Date;
  author: number;
  author_detail: AuthorDetail;
  categories_detail: CategoriesDetail[];
  tags_detail: string[];
  featured: boolean;
  views: number;
  reading_time: number;
}

export interface AuthorDetail {
  id: number;
  email: string;
  name: string;
  role: string;
  avatar: string;
  bio: string;
  join_date: Date;
  last_login: Date;
  is_active: boolean;
}

export interface CategoriesDetail {
  id: number;
  name: string;
  slug: string;
  description: string;
  featured_image: null;
  parent: null;
  article_count: number;
  children: null;
}
