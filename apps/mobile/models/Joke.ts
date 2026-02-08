import { Model, Query } from '@nozbe/watermelondb';
import { field, date, writer, children } from '@nozbe/watermelondb/decorators';
import { AudioRecording } from './AudioRecording';

export type JokeStatus = 'draft' | 'published' | 'archived';

export const JOKES_TABLE = 'jokes';

export class Joke extends Model {
  static table = JOKES_TABLE;

  static associations = {
    audio_recordings: { type: 'has_many' as const, foreignKey: 'joke_id' },
  };

  @field('content_html') content_html!: string;
  @field('content_text') contentText!: string;
  @field('status') status!: JokeStatus;
  @date('created_at') created_at!: Date;
  @date('updated_at') updated_at!: Date;
  @date('draft_updated_at') draftUpdatedAt!: Date;
  @field('tags') tags!: string[];

  @children('audio_recordings') audioRecordings!: Query<AudioRecording>;

  @writer async saveDraft(bodyText: string): Promise<void> {
    const now = new Date();
    await this.update((record) => {
      record.contentText = bodyText;
      record.draftUpdatedAt = now;
    });
  }

  @writer async commit(bodyText: string, bodyHtml: string): Promise<void> {
    const now = new Date();
    await this.update((record) => {
      record.contentText = bodyText;
      record.content_html = bodyHtml;
      record.updated_at = now;
      record.status = 'draft';
    });
  }
}
