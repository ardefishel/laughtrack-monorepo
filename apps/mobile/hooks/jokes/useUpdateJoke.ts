import { useState, useCallback } from 'react';
import { useDatabase } from '@/context/DatabaseContext';
import { Joke, JOKES_TABLE, JokeStatus } from '@/models/Joke';
import { hooksLogger } from '@/lib/loggers';

export function useUpdateJoke(): {
  updateJoke: (id: string, data: Partial<{
    content_html: string;
    content_text: string;
    draft_updated_at: number;
    status: JokeStatus;
    tags: string[];
  }>) => Promise<boolean>;
  isLoading: boolean;
  error: Error | null;
} {
  const { database } = useDatabase();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateJoke = useCallback(
    async (id: string, data: Partial<{
      content_html: string;
      content_text: string;
      draft_updated_at: number;
      status: JokeStatus;
      tags: string[];
    }>): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        hooksLogger.debug('[useUpdateJoke] Updating joke:', id, 'data:', Object.keys(data));

        const joke = await database.get<Joke>(JOKES_TABLE).find(id);

        await database.write(async () => {
          await joke.update((record) => {
            if (data.content_html !== undefined) {
              record.content_html = data.content_html;
            }
            if (data.content_text !== undefined) {
              record.contentText = data.content_text;
            }
            if (data.draft_updated_at !== undefined) {
              record.draftUpdatedAt = new Date(data.draft_updated_at);
            }
            if (data.status !== undefined) {
              record.status = data.status;
            }
            if (data.tags !== undefined) {
              record.tags = data.tags;
            }
            record.updated_at = new Date();
          });
        });

        hooksLogger.info('[useUpdateJoke] Joke updated successfully:', id);
        return true;
      } catch (err) {
        hooksLogger.error('[useUpdateJoke] Error updating joke:', id, err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [database]
  );

  return { updateJoke, isLoading, error };
}
