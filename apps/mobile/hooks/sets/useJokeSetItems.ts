import { useState, useEffect, useCallback } from 'react';
import { Q } from '@nozbe/watermelondb';
import { Observable } from 'rxjs';
import { useDatabase } from '@/context/DatabaseContext';
import { JokeSetItem, JOKE_SET_ITEMS_TABLE } from '@/models/JokeSetItem';
import type { RawJokeSetItem } from '@laughtrack/shared-types';
import { jokeSetItemToPlain } from './transformers';
import { hooksLogger, logVerbose } from '@/lib/loggers';

export function useJokeSetItems(setId: string): {
  items: RawJokeSetItem[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} {
  const { database } = useDatabase();
  const [items, setItems] = useState<RawJokeSetItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchItems = useCallback(async () => {
    if (!setId) {
      setItems([]);
      setIsLoading(false);
      return;
    }

    logVerbose(hooksLogger, `[useJokeSetItems] MANUAL FETCH triggered for set ${setId}`);

    try {
      const query = database.get<JokeSetItem>(JOKE_SET_ITEMS_TABLE).query(
        Q.where('set_id', setId),
        Q.sortBy('position', Q.asc)
      );

      const records = await query.fetch();
      logVerbose(hooksLogger, `[useJokeSetItems] MANUAL FETCH got ${records.length} records`);

      const plainItems = records.map(jokeSetItemToPlain);
      setItems(plainItems);
      setIsLoading(false);
      setError(null);
    } catch (err) {
      hooksLogger.error('[useJokeSetItems] MANUAL FETCH error:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch joke set items'));
      setIsLoading(false);
    }
  }, [database, setId]);

  useEffect(() => {
    if (!setId) {
      setItems([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const query = database.get<JokeSetItem>(JOKE_SET_ITEMS_TABLE).query(
      Q.where('set_id', setId),
      Q.sortBy('position', Q.asc)
    );

    const observableQuery = query.observeWithColumns(['position']);
    const observable: Observable<JokeSetItem[]> = observableQuery;

    const subscription = observable.subscribe({
      next: (records: JokeSetItem[]) => {
        logVerbose(hooksLogger, `[useJokeSetItems] OBSERVABLE EMITTED, count: ${records.length}`);
        const plainItems = records.map(jokeSetItemToPlain);
        setItems(plainItems);
        setIsLoading(false);
        setError(null);
      },
      error: (err: unknown) => {
        hooksLogger.error('[useJokeSetItems] Observable error:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch joke set items'));
        setIsLoading(false);
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [database, setId]);

  return { items, isLoading, error, refetch: fetchItems };
}
