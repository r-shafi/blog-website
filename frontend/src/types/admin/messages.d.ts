export interface MessagesResponse {
  count: number;
  next: null;
  previous: null;
  results: Message[];
}

export interface Message {
  name: string;
  email: string;
  subject: string;
  message: string;
  newsletter: boolean;
  date: Date;
  status: string;
}
