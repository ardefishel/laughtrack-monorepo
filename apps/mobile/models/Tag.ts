import { Model } from '@nozbe/watermelondb';
import { field, date } from '@nozbe/watermelondb/decorators';

export const TAGS_TABLE = 'tags';

export class Tag extends Model {
  static table = TAGS_TABLE;

  static associations = {
    joke_tags: { type: 'has_many' as const, foreignKey: 'tag_id' },
  };

  @field('name') name!: string;
  @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;
}
