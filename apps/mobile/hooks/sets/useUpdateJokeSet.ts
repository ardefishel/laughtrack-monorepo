import { useState, useCallback } from 'react';
import { useDatabase } from '@/context/DatabaseContext';
import { JokeSet, JOKE_SETS_TABLE } from '@/models/JokeSet';
import type { RawJokeSet, JokeSetStatus } from '@laughtrack/shared-types';
import { jokeSetToPlain } from './transformers';
import { hooksLogger } from '@/lib/loggers';

export function useUpdateJokeSet(): {
  updateJokeSet: (
    id: string,
    data: {
      title?: string;
      description?: string;
      duration?: number;
      place?: string;
      status?: JokeSetStatus;
    }
  ) => Promise<RawJokeSet | null>;
  isLoading: boolean;
  error: Error | null;
} {
  const { database } = useDatabase();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateJokeSet = useCallback(
    async (
      id: string,
      data: {
        title?: string;
        description?: string;
        duration?: number;
        place?: string;
        status?: JokeSetStatus;
      }
    ): Promise<RawJokeSet | null> => {
      setIsLoading(true);
      setError(null);

      try {
        hooksLogger.debug(`[useUpdateJokeSet] Updating joke set ${id}:`, data);

        const record = await database.get<JokeSet>(JOKE_SETS_TABLE).find(id);
        await record.updateMetadata(data);

        hooksLogger.info('[useUpdateJokeSet] Joke set updated:', record.id);
        return jokeSetToPlain(record);
      } catch (err) {
        hooksLogger.error('[useUpdateJokeSet] Error updating joke set:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [database]
  );

  return { updateJokeSet, isLoading, error };
}
