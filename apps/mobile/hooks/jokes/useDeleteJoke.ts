import { useState, useCallback } from 'react';
import { useDatabase } from '@/context/DatabaseContext';
import { Joke, JOKES_TABLE } from '@/models/Joke';
import { hooksLogger } from '@/lib/loggers';

export function useDeleteJoke(): {
  deleteJoke: (id: string) => Promise<boolean>;
  isLoading: boolean;
  error: Error | null;
} {
  const { database } = useDatabase();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteJoke = useCallback(
    async (id: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        hooksLogger.debug('[useDeleteJoke] Deleting joke:', id);

        const joke = await database.get<Joke>(JOKES_TABLE).find(id);

        await database.write(async () => {
          await joke.markAsDeleted();
        });

        hooksLogger.info('[useDeleteJoke] Joke deleted successfully:', id);
        return true;
      } catch (err) {
        hooksLogger.error('[useDeleteJoke] Error deleting joke:', id, err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [database]
  );

  return { deleteJoke, isLoading, error };
}
