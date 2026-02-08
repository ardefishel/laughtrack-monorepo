import { useState, useCallback } from 'react';
import { useDatabase } from '@/context/DatabaseContext';
import { JokeSet, JOKE_SETS_TABLE } from '@/models/JokeSet';
import type { RawJokeSet, JokeSetStatus } from '@/lib/types';
import { jokeSetToPlain } from './transformers';
import { hooksLogger } from '@/lib/loggers';

export function useCreateJokeSet(): {
  createJokeSet: (data: {
    title: string;
    description?: string;
    duration?: number;
    place?: string;
    status?: JokeSetStatus;
  }) => Promise<RawJokeSet | null>;
  isLoading: boolean;
  error: Error | null;
} {
  const { database } = useDatabase();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createJokeSet = useCallback(
    async (data: {
      title: string;
      description?: string;
      duration?: number;
      place?: string;
      status?: JokeSetStatus;
    }): Promise<RawJokeSet | null> => {
      hooksLogger.debug('[useCreateJokeSet] START creating joke set:', data.title);
      setIsLoading(true);
      setError(null);

      try {
        hooksLogger.debug('[useCreateJokeSet] Calling database.write...');
        const now = new Date();
        const jokeSet = await database.write(async () => {
          hooksLogger.debug('[useCreateJokeSet] Inside database.write, creating record...');
          return await database.get<JokeSet>(JOKE_SETS_TABLE).create((record) => {
            record.title = data.title;
            record.description = data.description ?? '';
            record.duration = data.duration ?? 0;
            record.place = data.place ?? '';
            record.status = data.status ?? 'draft';
            record.created_at = now;
            record.updated_at = now;
            hooksLogger.debug('[useCreateJokeSet] Record fields set, ID will be:', record.id);
          });
        });

        hooksLogger.info('[useCreateJokeSet] SUCCESS - Joke set created with ID:', jokeSet.id);
        const plain = jokeSetToPlain(jokeSet);
        hooksLogger.debug('[useCreateJokeSet] Returning plain object:', plain);
        return plain;
      } catch (err) {
        hooksLogger.error('[useCreateJokeSet] ERROR creating joke set:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        return null;
      } finally {
        hooksLogger.debug('[useCreateJokeSet] FINALLY - setting isLoading to false');
        setIsLoading(false);
      }
    },
    [database]
  );

  return { createJokeSet, isLoading, error };
}
