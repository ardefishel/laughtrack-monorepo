import { useState, useCallback } from 'react';
import { useDatabase } from '@/context/DatabaseContext';
import { Joke, JOKES_TABLE, JokeStatus } from '@/models/Joke';
import { RawJoke } from '@/lib/types';
import { jokeToPlain } from './transformers';
import { hooksLogger } from '@/lib/loggers';

export function useCreateJoke(): {
  createJoke: (data: {
    content_html: string;
    status?: JokeStatus;
    tags?: string[];
  }) => Promise<RawJoke | null>;
  isLoading: boolean;
  error: Error | null;
} {
  const { database } = useDatabase();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createJoke = useCallback(
    async (data: {
      content_html: string;
      status?: JokeStatus;
      tags?: string[];
    }): Promise<RawJoke | null> => {
      setIsLoading(true);
      setError(null);

      try {
        hooksLogger.debug('[useCreateJoke] Creating joke:', data.content_html.substring(0, 50));

        const now = new Date();
        const joke = await database.write(async () => {
          return await database.get<Joke>(JOKES_TABLE).create((record) => {
            record.content_html = data.content_html;
            record.status = data.status ?? 'draft';
            record.tags = data.tags ?? [];
            record.created_at = now;
            record.updated_at = now;
          });
        });

        hooksLogger.info('[useCreateJoke] Joke created with ID:', joke.id);
        return await jokeToPlain(joke);
      } catch (err) {
        hooksLogger.error('[useCreateJoke] Error creating joke:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [database]
  );

  return { createJoke, isLoading, error };
}
