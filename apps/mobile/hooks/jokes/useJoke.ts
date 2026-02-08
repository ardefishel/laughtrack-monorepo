import { useState, useEffect } from 'react';
import { Observable } from 'rxjs';
import { useDatabase } from '@/context/DatabaseContext';
import { Joke, JOKES_TABLE } from '@/models/Joke';
import { RawJoke } from '@/lib/types';
import { jokeToPlain, fetchRecordingCounts } from './transformers';
import { hooksLogger } from '@/lib/loggers';

export function useJoke(id: string): {
  joke: RawJoke | null;
  isLoading: boolean;
  error: Error | null;
} {
  const { database } = useDatabase();
  const [joke, setJoke] = useState<RawJoke | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    hooksLogger.debug('[useJoke] Setting up observable for joke:', id);

    const collection = database.get<Joke>(JOKES_TABLE);
    
    const observable: Observable<Joke | null> = collection.findAndObserve(id);
    const subscription = observable.subscribe({
      next: async (record: Joke | null) => {
        hooksLogger.debug('[useJoke] Observable emitted for:', id, record ? 'found' : 'not found');
        let plainRecord: RawJoke | null = null;
        if (record) {
          const counts = await fetchRecordingCounts(database, [record.id]);
          plainRecord = jokeToPlain(record, counts.get(record.id) || 0);
        }
        setJoke(plainRecord);
        setIsLoading(false);
        setError(null);
      },
      error: (err: unknown) => {
        hooksLogger.error('[useJoke] Observable error for:', id, err);
        setError(err instanceof Error ? err : new Error('Observable error'));
        setIsLoading(false);
      },
    });

    return () => {
      hooksLogger.debug('[useJoke] Unsubscribing from:', id);
      subscription.unsubscribe();
    };
  }, [database, id]);

  return { joke, isLoading, error };
}
