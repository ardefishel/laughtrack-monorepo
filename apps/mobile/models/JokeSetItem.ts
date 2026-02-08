import { Model } from '@nozbe/watermelondb';
import { field, date, writer, relation } from '@nozbe/watermelondb/decorators';
import { JokeSet } from './JokeSet';
import type { JokeSetItemType } from '@/lib/types';

export const JOKE_SET_ITEMS_TABLE = 'joke_set_items';

export class JokeSetItem extends Model {
  static table = JOKE_SET_ITEMS_TABLE;

  static associations = {
    joke_sets: { type: 'belongs_to' as const, key: 'set_id' },
    jokes: { type: 'belongs_to' as const, key: 'joke_id' },
  };

  @field('set_id') setId!: string;
  @field('item_type') itemType!: JokeSetItemType;
  @field('joke_id') jokeId!: string;
  @field('content') content!: string;
  @field('position') position!: number;
  @date('created_at') created_at!: Date;
  @date('updated_at') updated_at!: Date;

  @relation('joke_sets', 'set_id') set!: JokeSet;

  @writer async updateContent(newContent: string): Promise<void> {
    const now = new Date();
    await this.update((record) => {
      record.content = newContent;
      record.updated_at = now;
    });
  }

  @writer async updatePosition(newPosition: number): Promise<void> {
    const now = new Date();
    await this.update((record) => {
      record.position = newPosition;
      record.updated_at = now;
    });
  }
}
