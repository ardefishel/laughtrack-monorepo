import { Joke, JOKES_TABLE } from '@/models/Joke';
import { RawJoke } from '@/lib/types';

/**
 * Transforms a WatermelonDB Joke model to a plain RawJoke object
 * @param joke - WatermelonDB Joke model instance
 * @returns Plain RawJoke object with numeric timestamps
 */
export async function jokeToPlain(joke: Joke): Promise<RawJoke> {
  const recordingsCount = await joke.audioRecordings.fetchCount();

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
