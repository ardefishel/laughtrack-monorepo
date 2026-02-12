export type JokeSetStatus = 'draft' | 'performed' | 'bombed' | 'killed';

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

export type JokeSetItemType = 'joke' | 'note';

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
