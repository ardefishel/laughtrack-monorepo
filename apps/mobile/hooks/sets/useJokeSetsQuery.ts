import { useState, useEffect, useCallback } from 'react';
import { Q } from '@nozbe/watermelondb';
import { Observable } from 'rxjs';
import { useDatabase } from '@/context/DatabaseContext';
import { JokeSet, JOKE_SETS_TABLE } from '@/models/JokeSet';
import type { RawJokeSet } from '@laughtrack/shared-types';
import { jokeSetToPlain } from './transformers';
import { hooksLogger, logVerbose } from '@/lib/loggers';

export function useJokeSetsQuery(searchQuery?: string): {
  jokeSets: RawJokeSet[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} {
  const { database } = useDatabase();
  const [jokeSets, setJokeSets] = useState<RawJokeSet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  logVerbose(hooksLogger, '[useJokeSetsQuery] HOOK RENDER, searchQuery:', searchQuery);

  const fetchJokeSets = useCallback(async () => {
    logVerbose(hooksLogger, '[useJokeSetsQuery] MANUAL FETCH triggered');

    try {
      const query = database.get<JokeSet>(JOKE_SETS_TABLE).query(
        Q.sortBy('created_at', Q.desc),
        ...(searchQuery && searchQuery.trim()
          ? [Q.where('title', Q.like(`%${Q.sanitizeLikeString(searchQuery.toLowerCase().trim())}%`))]
          : [])
      );

      const records = await query.fetch();
      logVerbose(hooksLogger, `[useJokeSetsQuery] MANUAL FETCH got ${records.length} records`);

      const plainSets = records.map(jokeSetToPlain);
      setJokeSets(plainSets);
      setIsLoading(false);
      setError(null);
    } catch (err) {
      hooksLogger.error('[useJokeSetsQuery] MANUAL FETCH error:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch joke sets'));
      setIsLoading(false);
    }
  }, [database, searchQuery]);

  useEffect(() => {
    logVerbose(hooksLogger, '[useJokeSetsQuery] useEffect triggered - setting up observable');
    setIsLoading(true);

    const baseQuery = database.get<JokeSet>(JOKE_SETS_TABLE).query(
      Q.sortBy('created_at', Q.desc),
      ...(searchQuery && searchQuery.trim()
        ? [Q.where('title', Q.like(`%${Q.sanitizeLikeString(searchQuery.toLowerCase().trim())}%`))]
        : [])
    );

    logVerbose(hooksLogger, '[useJokeSetsQuery] Creating observable...');
    const query = baseQuery.observe();

    const observable: Observable<JokeSet[]> = query;
    const subscription = observable.subscribe({
      next: (records: JokeSet[]) => {
        logVerbose(hooksLogger, `[useJokeSetsQuery] OBSERVABLE EMITTED, count: ${records.length}`);
        logVerbose(hooksLogger, `[useJokeSetsQuery] Set IDs:`, records.map(r => r.id));
        const plainSets = records.map(jokeSetToPlain);
        logVerbose(hooksLogger, `[useJokeSetsQuery] Setting jokeSets state with ${plainSets.length} items`);
        setJokeSets(plainSets);
        setIsLoading(false);
        setError(null);
      },
      error: (err: unknown) => {
        hooksLogger.error('[useJokeSetsQuery] Observable error:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch joke sets'));
        setIsLoading(false);
      },
    });

    logVerbose(hooksLogger, '[useJokeSetsQuery] Observable subscribed');

    return () => {
      logVerbose(hooksLogger, '[useJokeSetsQuery] CLEANUP - unsubscribing');
      subscription.unsubscribe();
    };
  }, [database, searchQuery]);

  return { jokeSets, isLoading, error, refetch: fetchJokeSets };
}
