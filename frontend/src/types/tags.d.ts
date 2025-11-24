export interface TagsResponse {
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
  article_count: number;
}
