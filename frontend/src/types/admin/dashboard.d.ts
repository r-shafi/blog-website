export interface DashboardResponse {
  total_users: number;
  total_articles: number;
  total_messages: number;
  unread_messages: number;
  pending_articles: number;
  published_articles: number;
  rejected_articles: number;
  draft_articles: number;
  new_users_this_week: number;
  new_articles_this_week: number;
  spam_reports: number;
  recent_articles: RecentArticle[];
  recent_messages: RecentMessage[];
  pending_articles_list: PendingArticle[];
  top_authors: TopAuthor[];
  weekly_stats: WeeklyStats;
  user_activity: UserActivity[];
}

export interface RecentArticle {
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

export interface RecentMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
  newsletter: boolean;
  date: Date;
  status: string;
}

export interface PendingArticle {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  status: string;
  created_at: Date;
  author_detail: AuthorDetail;
  categories_detail: CategoriesDetail[];
}

export interface TopAuthor {
  id: number;
  name: string;
  email: string;
  article_count: number;
  avatar: string;
  role: string;
}

export interface WeeklyStats {
  posts_published: number;
  posts_rejected: number;
  comments_flagged: number;
  users_registered: number;
}

export interface UserActivity {
  id: number;
  name: string;
  email: string;
  last_login: Date;
  article_count: number;
  is_suspicious: boolean;
  role: string;
}
