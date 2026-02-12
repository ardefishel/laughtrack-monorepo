import { Model } from '@nozbe/watermelondb';
import { field, date } from '@nozbe/watermelondb/decorators';

export const JOKE_TAGS_TABLE = 'joke_tags';

export class JokeTag extends Model {
  static table = JOKE_TAGS_TABLE;

  static associations = {
    jokes: { type: 'belongs_to' as const, key: 'joke_id' },
    tags: { type: 'belongs_to' as const, key: 'tag_id' },
  };

  @field('joke_id') jokeId!: string;
  @field('tag_id') tagId!: string;
  @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;
}
