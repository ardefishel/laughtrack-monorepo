/**
 * Joke model representing a joke in the app
 */
export type JokeStatus = 'draft' | 'published' | 'archived';

/**
 * Main Joke interface with string dates (for API/UI boundaries)
 */
export interface Joke {
  id: string;
  content_html: string;
  status: JokeStatus;
  created_at: string;
  updated_at: string;
  tags: string[];
  recordings_count: number;
}

/**
 * RawJoke with numeric timestamps (for internal/database use)
 */
export interface RawJoke {
  id: string;
  content_html: string;
  status: JokeStatus;
  created_at: number;
  updated_at: number;
  tags: string[];
  recordings_count: number;
}

/**
 * Joke with flexible date types (for component props that accept both formats)
 */
export interface JokeWithUnifiedDates {
  id: string;
  content_html: string;
  status: JokeStatus;
  created_at: string | number;
  updated_at: string | number;
  tags: string[];
  recordings_count: number;
}

/**
 * JokeSet status options for tracking performance
 */
export type JokeSetStatus = 'draft' | 'performed' | 'bombed' | 'killed';

/**
 * JokeSet model representing a collection of jokes/notes for a performance
 */
export interface JokeSet {
  id: string;
  title: string;
  description?: string;
  duration?: number;
  place?: string;
  status: JokeSetStatus;
  created_at: string;
  updated_at: string;
}

/**
 * RawJokeSet with numeric timestamps (for internal/database use)
 */
export interface RawJokeSet {
  id: string;
  title: string;
  description?: string;
  duration?: number;
  place?: string;
  status: JokeSetStatus;
  created_at: number;
  updated_at: number;
}

/**
 * Item type for items in a joke set
 */
export type JokeSetItemType = 'joke' | 'note';

/**
 * JokeSetItem representing a single item (joke or note) in a set
 */
export interface JokeSetItem {
  id: string;
  set_id: string;
  item_type: JokeSetItemType;
  joke_id?: string;
  content?: string;
  position: number;
  created_at: string;
  updated_at: string;
}

/**
 * RawJokeSetItem with numeric timestamps (for internal/database use)
 */
export interface RawJokeSetItem {
  id: string;
  set_id: string;
  item_type: JokeSetItemType;
  joke_id?: string;
  content?: string;
  position: number;
  created_at: number;
  updated_at: number;
}
