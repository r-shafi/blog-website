export interface UsersResponse {
  count: number;
  next: null;
  previous: null;
  results: User[];
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  avatar: null | string;
  bio: string;
  join_date: Date;
  last_login: Date | null;
  is_active: boolean;
}
