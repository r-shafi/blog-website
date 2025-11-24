export interface CategoriesResponse {
  count: number;
  next: null;
  previous: null;
  results: Result[];
}

export interface Result {
  id: number;
  name: string;
  slug: string;
  description: string;
  featured_image: null;
  parent: null;
  article_count: number;
  children: null;
}
