import { Model } from '@nozbe/watermelondb';
import { field, date } from '@nozbe/watermelondb/decorators';

export const AUDIO_RECORDINGS_TABLE = 'audio_recordings';

export class AudioRecording extends Model {
  static table = AUDIO_RECORDINGS_TABLE;

  @field('joke_id') jokeId!: string;
  @field('file_path') filePath!: string;
  @field('duration') duration!: number;
  @field('size') size!: number;
  @field('description') description!: string;
  @date('created_at') createdAt!: Date;
  @field('remote_url') remoteUrl!: string | null;
  @date('updated_at') updatedAt!: Date;
}
