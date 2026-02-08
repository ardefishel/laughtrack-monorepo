import { useState, useCallback } from 'react';
import { Q } from '@nozbe/watermelondb';
import { useDatabase } from '@/context/DatabaseContext';
import { JokeSetItem, JOKE_SET_ITEMS_TABLE } from '@/models/JokeSetItem';
import type { RawJokeSetItem, JokeSetItemType } from '@/lib/types';
import { jokeSetItemToPlain } from './transformers';
import { hooksLogger } from '@/lib/loggers';

export function useAddJokeSetItem(): {
  addJokeSetItem: (data: {
    setId: string;
    itemType: JokeSetItemType;
    jokeId?: string;
    content?: string;
    position?: number;
  }) => Promise<RawJokeSetItem | null>;
  isLoading: boolean;
  error: Error | null;
} {
  const { database } = useDatabase();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const addJokeSetItem = useCallback(
    async (data: {
      setId: string;
      itemType: JokeSetItemType;
      jokeId?: string;
      content?: string;
      position?: number;
    }): Promise<RawJokeSetItem | null> => {
      setIsLoading(true);
      setError(null);

      try {
        hooksLogger.debug('[useAddJokeSetItem] Adding item to set:', data.setId);

        // If position not provided, calculate next position
        let position = data.position;
        if (position === undefined) {
          const existingItems = await database
            .get<JokeSetItem>(JOKE_SET_ITEMS_TABLE)
            .query(Q.where('set_id', data.setId))
            .fetch();
          position = existingItems.length;
        }

        const now = new Date();
        const item = await database.write(async () => {
          return await database.get<JokeSetItem>(JOKE_SET_ITEMS_TABLE).create((record) => {
            record.setId = data.setId;
            record.itemType = data.itemType;
            record.jokeId = data.jokeId ?? '';
            record.content = data.content ?? '';
            record.position = position!;
            record.created_at = now;
            record.updated_at = now;
          });
        });

        hooksLogger.info('[useAddJokeSetItem] Item added with ID:', item.id);
        return jokeSetItemToPlain(item);
      } catch (err) {
        hooksLogger.error('[useAddJokeSetItem] Error adding item:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [database]
  );

  return { addJokeSetItem, isLoading, error };
}
