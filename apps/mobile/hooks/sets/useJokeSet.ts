import { useState, useEffect, useCallback } from 'react';
import { Observable } from 'rxjs';
import { useDatabase } from '@/context/DatabaseContext';
import { JokeSet, JOKE_SETS_TABLE } from '@/models/JokeSet';
import type { RawJokeSet } from '@laughtrack/shared-types';
import { jokeSetToPlain } from './transformers';
import { hooksLogger } from '@/lib/loggers';

export function useJokeSet(id: string): {
  jokeSet: RawJokeSet | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} {
  const { database } = useDatabase();
  const [jokeSet, setJokeSet] = useState<RawJokeSet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchJokeSet = useCallback(async () => {
    hooksLogger.debug(`[useJokeSet] MANUAL FETCH triggered for id: ${id}`);

    try {
      const record = await database.get<JokeSet>(JOKE_SETS_TABLE).find(id);
      hooksLogger.debug(`[useJokeSet] MANUAL FETCH found record: ${record.id}`);

      setJokeSet(jokeSetToPlain(record));
      setIsLoading(false);
      setError(null);
    } catch (err) {
      hooksLogger.error('[useJokeSet] MANUAL FETCH error:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch joke set'));
      setIsLoading(false);
    }
  }, [database, id]);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    let subscription: { unsubscribe: () => void } | null = null;

    const setupObserver = async () => {
      try {
        const record = await database.get<JokeSet>(JOKE_SETS_TABLE).find(id);
        const observable: Observable<JokeSet> = record.observe();

        subscription = observable.subscribe({
          next: (updatedRecord: JokeSet) => {
            hooksLogger.debug(`[useJokeSet] OBSERVABLE EMITTED for id: ${id}`);
            setJokeSet(jokeSetToPlain(updatedRecord));
            setIsLoading(false);
            setError(null);
          },
          error: (err: unknown) => {
            hooksLogger.error('[useJokeSet] Observable error:', err);
            setError(err instanceof Error ? err : new Error('Failed to fetch joke set'));
            setIsLoading(false);
          },
        });
      } catch (err) {
        hooksLogger.error('[useJokeSet] Setup error:', err);
        setError(err instanceof Error ? err : new Error('Failed to find joke set'));
        setIsLoading(false);
      }
    };

    setupObserver();

    return () => {
      subscription?.unsubscribe();
    };
  }, [database, id]);

  return { jokeSet, isLoading, error, refetch: fetchJokeSet };
}
