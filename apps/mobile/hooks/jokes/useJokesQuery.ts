import { useState, useEffect, useCallback } from 'react';
import { Q } from '@nozbe/watermelondb';
import { Observable } from 'rxjs';
import { useDatabase } from '@/context/DatabaseContext';
import { Joke, JOKES_TABLE } from '@/models/Joke';
import { RawJoke } from '@/lib/types';
import { jokeToPlain, fetchRecordingCounts } from './transformers';
import { hooksLogger, logVerbose } from '@/lib/loggers';

export function useJokesQuery(searchQuery?: string): {
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
      const query = database.get<Joke>(JOKES_TABLE).query(
        Q.sortBy('created_at', Q.desc),
        ...(searchQuery && searchQuery.trim()
          ? [Q.where('content_text', Q.like(`%${Q.sanitizeLikeString(searchQuery.toLowerCase().trim())}%`))]
          : [])
      );

      const records = await query.fetch();
      logVerbose(hooksLogger, `[useJokesQuery] MANUAL FETCH got ${records.length} records`);
      records.forEach((r, i) => {
        logVerbose(hooksLogger, `[useJokesQuery] Record ${i}: id=${r.id}, updated_at=${r.updated_at?.getTime?.() || r.updated_at}`);
      });

      const jokeIds = records.map(r => r.id);
      const recordingCounts = await fetchRecordingCounts(database, jokeIds);
      const plainJokes = records.map(joke => jokeToPlain(joke, recordingCounts.get(joke.id) || 0));
      setJokes(plainJokes);
      setIsLoading(false);
      setError(null);
    } catch (err) {
      hooksLogger.error('[useJokesQuery] MANUAL FETCH error:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch jokes'));
      setIsLoading(false);
    }
  }, [database, searchQuery]);

  useEffect(() => {
    setIsLoading(true);

    const baseQuery = database.get<Joke>(JOKES_TABLE).query(
      Q.sortBy('created_at', Q.desc),
      ...(searchQuery && searchQuery.trim()
        ? [Q.where('content_text', Q.like(`%${Q.sanitizeLikeString(searchQuery.toLowerCase().trim())}%`))]
        : [])
    );

    const query = baseQuery.observeWithColumns(['created_at', 'updated_at', 'draft_updated_at']);

    const observable: Observable<Joke[]> = query;
    const subscription = observable.subscribe({
      next: async (records: Joke[]) => {
        logVerbose(hooksLogger, `[useJokesQuery] OBSERVABLE EMITTED, count: ${records.length}`);
        records.forEach((r, i) => {
          logVerbose(hooksLogger, `[useJokesQuery] Record ${i}: id=${r.id}, updated_at=${r.updated_at?.getTime?.() || r.updated_at}`);
        });
        const jokeIds = records.map(r => r.id);
        const recordingCounts = await fetchRecordingCounts(database, jokeIds);
        const plainJokes = records.map(joke => jokeToPlain(joke, recordingCounts.get(joke.id) || 0));
        setJokes(plainJokes);
        setIsLoading(false);
        setError(null);
      },
      error: (err: unknown) => {
        hooksLogger.error('[useJokesQuery] Observable error:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch jokes'));
        setIsLoading(false);
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [database, searchQuery]);

  return { jokes, isLoading, error, refetch: fetchJokes };
}
