import { Database, Q } from '@nozbe/watermelondb';
import { Joke } from '@/models/Joke';
import { AudioRecording, AUDIO_RECORDINGS_TABLE } from '@/models/AudioRecording';
import { RawJoke } from '@/lib/types';

export function jokeToPlain(joke: Joke, recordingsCount: number = 0): RawJoke {
  return {
    id: joke.id,
    content_html: joke.content_html,
    status: joke.status,
    created_at: joke.created_at.getTime(),
    updated_at: joke.updated_at.getTime(),
    tags: Array.isArray(joke.tags) ? joke.tags : [],
    recordings_count: recordingsCount,
  };
}

export async function fetchRecordingCounts(database: Database, jokeIds: string[]): Promise<Map<string, number>> {
  if (jokeIds.length === 0) return new Map();

  const recordings = await database
    .get<AudioRecording>(AUDIO_RECORDINGS_TABLE)
    .query(Q.where('joke_id', Q.oneOf(jokeIds)))
    .fetch();

  const counts = new Map<string, number>();
  for (const recording of recordings) {
    const current = counts.get(recording.jokeId) || 0;
    counts.set(recording.jokeId, current + 1);
  }
  return counts;
}
