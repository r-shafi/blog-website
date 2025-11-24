export interface ProfileResponse {
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
