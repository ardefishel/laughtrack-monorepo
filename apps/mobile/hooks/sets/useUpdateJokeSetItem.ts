import { useState, useCallback } from 'react';
import { useDatabase } from '@/context/DatabaseContext';
import { JokeSetItem, JOKE_SET_ITEMS_TABLE } from '@/models/JokeSetItem';
import type { RawJokeSetItem } from '@/lib/types';
import { jokeSetItemToPlain } from './transformers';
import { hooksLogger } from '@/lib/loggers';

export function useUpdateJokeSetItem(): {
  updateJokeSetItem: (
    id: string,
    data: {
      content?: string;
      position?: number;
    }
  ) => Promise<RawJokeSetItem | null>;
  isLoading: boolean;
  error: Error | null;
} {
  const { database } = useDatabase();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateJokeSetItem = useCallback(
    async (
      id: string,
      data: {
        content?: string;
        position?: number;
      }
    ): Promise<RawJokeSetItem | null> => {
      setIsLoading(true);
      setError(null);

      try {
        hooksLogger.debug(`[useUpdateJokeSetItem] Updating item ${id}:`, data);

        const record = await database.get<JokeSetItem>(JOKE_SET_ITEMS_TABLE).find(id);
        
        if (data.content !== undefined) {
          await record.updateContent(data.content);
        }
        
        if (data.position !== undefined) {
          await record.updatePosition(data.position);
        }

        hooksLogger.info('[useUpdateJokeSetItem] Item updated:', record.id);
        return jokeSetItemToPlain(record);
      } catch (err) {
        hooksLogger.error('[useUpdateJokeSetItem] Error updating item:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [database]
  );

  return { updateJokeSetItem, isLoading, error };
}
