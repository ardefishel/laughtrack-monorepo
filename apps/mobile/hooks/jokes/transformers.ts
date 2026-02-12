import { Database, Q } from '@nozbe/watermelondb';
import { Joke } from '@/models/Joke';
import { AudioRecording, AUDIO_RECORDINGS_TABLE } from '@/models/AudioRecording';
import { Tag, TAGS_TABLE } from '@/models/Tag';
import { JokeTag, JOKE_TAGS_TABLE } from '@/models/JokeTag';
import { RawJoke } from '@/lib/types';

export function jokeToPlain(joke: Joke, recordingsCount: number = 0, tags?: string[]): RawJoke {
  return {
    id: joke.id,
    content_html: joke.content_html,
    status: joke.status,
    created_at: joke.created_at.getTime(),
    updated_at: joke.updated_at.getTime(),
    tags: tags ?? (Array.isArray(joke.tags) ? joke.tags : []),
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

export async function fetchTagsForJokes(database: Database, jokeIds: string[]): Promise<Map<string, string[]>> {
  const result = new Map<string, string[]>();
  if (jokeIds.length === 0) return result;

  const jokeTags = await database
    .get<JokeTag>(JOKE_TAGS_TABLE)
    .query(Q.where('joke_id', Q.oneOf(jokeIds)))
    .fetch();

  const tagIdSet = new Set<string>();
  for (const jt of jokeTags) {
    tagIdSet.add(jt.tagId);
  }

  if (tagIdSet.size === 0) return result;

  const tags = await database
    .get<Tag>(TAGS_TABLE)
    .query(Q.where('id', Q.oneOf([...tagIdSet])))
    .fetch();

  const tagNameById = new Map<string, string>();
  for (const tag of tags) {
    tagNameById.set(tag.id, tag.name);
  }

  for (const jt of jokeTags) {
    const name = tagNameById.get(jt.tagId);
    if (!name) continue;
    const existing = result.get(jt.jokeId) || [];
    existing.push(name);
    result.set(jt.jokeId, existing);
  }

  return result;
}
