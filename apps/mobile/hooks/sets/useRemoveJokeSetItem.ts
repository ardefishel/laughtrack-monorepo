import { useState, useCallback } from 'react';
import { useDatabase } from '@/context/DatabaseContext';
import { JokeSetItem, JOKE_SET_ITEMS_TABLE } from '@/models/JokeSetItem';
import { hooksLogger } from '@/lib/loggers';

export function useRemoveJokeSetItem(): {
  removeJokeSetItem: (id: string) => Promise<boolean>;
  isLoading: boolean;
  error: Error | null;
} {
  const { database } = useDatabase();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const removeJokeSetItem = useCallback(
    async (id: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        hooksLogger.debug(`[useRemoveJokeSetItem] Removing item ${id}`);

        await database.write(async () => {
          const record = await database.get<JokeSetItem>(JOKE_SET_ITEMS_TABLE).find(id);
          await record.destroyPermanently();
        });

        hooksLogger.info('[useRemoveJokeSetItem] Item removed:', id);
        return true;
      } catch (err) {
        hooksLogger.error('[useRemoveJokeSetItem] Error removing item:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [database]
  );

  return { removeJokeSetItem, isLoading, error };
}
