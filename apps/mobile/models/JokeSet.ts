import { Model, Query } from '@nozbe/watermelondb';
import { field, date, writer, children } from '@nozbe/watermelondb/decorators';
import { JokeSetItem } from './JokeSetItem';
import type { JokeSetStatus } from '@laughtrack/shared-types';

export const JOKE_SETS_TABLE = 'joke_sets';

export class JokeSet extends Model {
  static table = JOKE_SETS_TABLE;

  static associations = {
    joke_set_items: { type: 'has_many' as const, foreignKey: 'set_id' },
  };

  @field('title') title!: string;
  @field('description') description!: string;
  @field('duration') duration!: number;
  @field('place') place!: string;
  @field('status') status!: JokeSetStatus;
  @date('created_at') created_at!: Date;
  @date('updated_at') updated_at!: Date;

  @children('joke_set_items') items!: Query<JokeSetItem>;

  @writer async updateMetadata(fields: {
    title?: string;
    description?: string;
    duration?: number;
    place?: string;
    status?: JokeSetStatus;
  }): Promise<void> {
    const now = new Date();
    await this.update((record) => {
      if (fields.title !== undefined) record.title = fields.title;
      if (fields.description !== undefined) record.description = fields.description;
      if (fields.duration !== undefined) record.duration = fields.duration;
      if (fields.place !== undefined) record.place = fields.place;
      if (fields.status !== undefined) record.status = fields.status;
      record.updated_at = now;
    });
  }
}
