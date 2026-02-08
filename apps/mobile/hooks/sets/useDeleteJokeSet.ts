import { useState, useCallback } from 'react';
import { useDatabase } from '@/context/DatabaseContext';
import { JokeSet, JOKE_SETS_TABLE } from '@/models/JokeSet';
import { hooksLogger } from '@/lib/loggers';

export function useDeleteJokeSet(): {
  deleteJokeSet: (id: string) => Promise<boolean>;
  isLoading: boolean;
  error: Error | null;
} {
  const { database } = useDatabase();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteJokeSet = useCallback(
    async (id: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        hooksLogger.debug(`[useDeleteJokeSet] Deleting joke set ${id}`);

        await database.write(async () => {
          const record = await database.get<JokeSet>(JOKE_SETS_TABLE).find(id);
          await record.destroyPermanently();
        });

        hooksLogger.info('[useDeleteJokeSet] Joke set deleted:', id);
        return true;
      } catch (err) {
        hooksLogger.error('[useDeleteJokeSet] Error deleting joke set:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [database]
  );

  return { deleteJokeSet, isLoading, error };
}
