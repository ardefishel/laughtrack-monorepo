import { useState, useEffect, useCallback } from 'react';
import { Q } from '@nozbe/watermelondb';
import { Database } from '@nozbe/watermelondb';
import { useDatabase } from '@/context/DatabaseContext';
import { Joke, JOKES_TABLE } from '@/models/Joke';
import { Tag, TAGS_TABLE } from '@/models/Tag';
import { JokeTag, JOKE_TAGS_TABLE } from '@/models/JokeTag';
import { RawJoke } from '@laughtrack/shared-types';
import { jokeToPlain, fetchRecordingCounts, fetchTagsForJokes } from './transformers';
import { normalizeTag } from '@/lib/tagUtils';
import { hooksLogger, logVerbose } from '@/lib/loggers';

export function parseSearchInput(query: string): { textQuery: string; tagFilters: string[] } {
  const words = query.trim().split(/\s+/).filter(Boolean);
  const tagFilters: string[] = [];
  const textParts: string[] = [];

  for (const word of words) {
    if (word.startsWith('#') && word.length > 1) {
      const normalized = normalizeTag(word);
      if (normalized) tagFilters.push(normalized);
    } else {
      textParts.push(word);
    }
  }

  return { textQuery: textParts.join(' '), tagFilters: [...new Set(tagFilters)] };
}

async function resolveTagFilteredJokeIds(database: Database, tagFilters: string[]): Promise<string[] | null> {
  if (tagFilters.length === 0) return null;

  const matchingTags = await database
    .get<Tag>(TAGS_TABLE)
    .query(Q.where('name', Q.oneOf(tagFilters)))
    .fetch();

  if (matchingTags.length < tagFilters.length) return [];

  const tagIds = matchingTags.map(t => t.id);
  const jokeTags = await database
    .get<JokeTag>(JOKE_TAGS_TABLE)
    .query(Q.where('tag_id', Q.oneOf(tagIds)))
    .fetch();

  const jokeIdsByTag = new Map<string, Set<string>>();
  for (const jt of jokeTags) {
    if (!jokeIdsByTag.has(jt.tagId)) jokeIdsByTag.set(jt.tagId, new Set());
    jokeIdsByTag.get(jt.tagId)!.add(jt.jokeId);
  }

  let intersection: Set<string> | null = null;
  for (const tagId of tagIds) {
    const jokeIds = jokeIdsByTag.get(tagId) || new Set<string>();
    if (intersection === null) {
      intersection = new Set(jokeIds);
    } else {
      const next = new Set<string>();
      for (const id of intersection) {
        if (jokeIds.has(id)) next.add(id);
      }
      intersection = next;
    }
  }

  return intersection ? [...intersection] : [];
}

async function fetchFilteredJokes(
  database: Database,
  textQuery: string,
  tagFilters: string[]
): Promise<RawJoke[]> {
  const filteredJokeIds = await resolveTagFilteredJokeIds(database, tagFilters);
  if (filteredJokeIds !== null && filteredJokeIds.length === 0) return [];

  const conditions = [
    Q.sortBy('created_at', Q.desc),
    ...(filteredJokeIds !== null ? [Q.where('id', Q.oneOf(filteredJokeIds))] : []),
    ...(textQuery ? [Q.where('content_text', Q.like(`%${Q.sanitizeLikeString(textQuery.toLowerCase())}%`))] : [])
  ];

  const records = await database.get<Joke>(JOKES_TABLE).query(...conditions).fetch();
  const jokeIds = records.map(r => r.id);
  const [recordingCounts, tagsMap] = await Promise.all([
    fetchRecordingCounts(database, jokeIds),
    fetchTagsForJokes(database, jokeIds)
  ]);
  return records.map(joke => jokeToPlain(joke, recordingCounts.get(joke.id) || 0, tagsMap.get(joke.id) || []));
}

export function useJokesQuery(searchQuery?: string, chipTagFilters?: string[]): {
  jokes: RawJoke[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} {
  const { database } = useDatabase();
  const [jokes, setJokes] = useState<RawJoke[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchJokes = useCallback(async () => {
    logVerbose(hooksLogger, '[useJokesQuery] MANUAL FETCH triggered');
    try {
      const { textQuery, tagFilters: searchTagFilters } = parseSearchInput(searchQuery ?? '');
      const tagFilters = [...new Set([...searchTagFilters, ...(chipTagFilters ?? [])])];
      const plainJokes = await fetchFilteredJokes(database, textQuery, tagFilters);
      logVerbose(hooksLogger, `[useJokesQuery] MANUAL FETCH got ${plainJokes.length} records`);
      setJokes(plainJokes);
      setIsLoading(false);
      setError(null);
    } catch (err) {
      hooksLogger.error('[useJokesQuery] MANUAL FETCH error:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch jokes'));
      setIsLoading(false);
    }
  }, [database, searchQuery, chipTagFilters]);

  useEffect(() => {
    setIsLoading(true);

    const { textQuery, tagFilters: searchTagFilters } = parseSearchInput(searchQuery ?? '');
    const tagFilters = [...new Set([...searchTagFilters, ...(chipTagFilters ?? [])])];
    const hasTagFilters = tagFilters.length > 0;

    const resolve = async () => {
      try {
        const plainJokes = await fetchFilteredJokes(database, textQuery, tagFilters);
        setJokes(plainJokes);
        setIsLoading(false);
        setError(null);
      } catch (err) {
        hooksLogger.error('[useJokesQuery] Error resolving jokes:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch jokes'));
        setIsLoading(false);
      }
    };

    const jokeObservable = database.get<Joke>(JOKES_TABLE).query(
      Q.sortBy('created_at', Q.desc),
      ...(textQuery
        ? [Q.where('content_text', Q.like(`%${Q.sanitizeLikeString(textQuery.toLowerCase())}%`))]
        : [])
    ).observeWithColumns(['created_at', 'updated_at', 'draft_updated_at']);

    const jokeSub = jokeObservable.subscribe({
      next: () => {
        logVerbose(hooksLogger, '[useJokesQuery] JOKES OBSERVABLE EMITTED');
        resolve();
      },
      error: (err: unknown) => {
        hooksLogger.error('[useJokesQuery] Observable error:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch jokes'));
        setIsLoading(false);
      }
    });

    let jokeTagSub: { unsubscribe: () => void } | undefined;
    if (hasTagFilters) {
      jokeTagSub = database.get<JokeTag>(JOKE_TAGS_TABLE).query().observe().subscribe({
        next: () => {
          logVerbose(hooksLogger, '[useJokesQuery] JOKE_TAGS OBSERVABLE EMITTED');
          resolve();
        }
      });
    }

    return () => {
      jokeSub.unsubscribe();
      jokeTagSub?.unsubscribe();
    };
  }, [database, searchQuery, chipTagFilters]);

  return { jokes, isLoading, error, refetch: fetchJokes };
}
