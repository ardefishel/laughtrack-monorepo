export type JokeStatus = 'draft' | 'published' | 'archived';

export interface Joke {
  id: string;
  content_html: string;
  status: JokeStatus;
  created_at: string;
  updated_at: string;
  tags: string[];
  recordings_count: number;
}

export interface RawJoke {
  id: string;
  content_html: string;
  status: JokeStatus;
  created_at: number;
  updated_at: number;
  tags: string[];
  recordings_count: number;
}

export interface JokeWithUnifiedDates {
  id: string;
  content_html: string;
  status: JokeStatus;
  created_at: string | number;
  updated_at: string | number;
  tags: string[];
  recordings_count: number;
}
