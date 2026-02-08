import { useState, useEffect, useCallback } from 'react';
import { useDatabase } from '@/context/DatabaseContext';
import { AudioRecording, AUDIO_RECORDINGS_TABLE } from '@/models/AudioRecording';
import { createNamespacedLogger } from '@/lib/logger';

const hooksLogger = createNamespacedLogger('hooks');

interface UseAudioRecordingsReturn {
  recordings: AudioRecording[];
  isLoading: boolean;
  error: Error | null;
}

export function useAudioRecordingsQuery(jokeId: string | null | undefined): UseAudioRecordingsReturn {
  const { database } = useDatabase();
  const [recordings, setRecordings] = useState<AudioRecording[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRecordings = useCallback(async () => {
    if (!jokeId) {
      hooksLogger.debug('[useAudioRecordings] No jokeId provided, skipping fetch');
      setRecordings([]);
      setIsLoading(false);
      return;
    }

    hooksLogger.debug(`[useAudioRecordings] Manual fetch triggered for joke_id=${jokeId}`);

    try {
      const collection = database.get<AudioRecording>(AUDIO_RECORDINGS_TABLE);
      const allRecordings = await collection.query().fetch();
      const jokeRecordings = allRecordings.filter((r) => r.jokeId === jokeId);
      hooksLogger.debug(`[useAudioRecordings] Manual fetch got ${jokeRecordings.length} recordings for joke_id=${jokeId}`);
      setRecordings(jokeRecordings);
      setError(null);
    } catch (err) {
      hooksLogger.error(`[useAudioRecordings] Failed to fetch recordings for joke_id=${jokeId}:`, err);
      setError(err instanceof Error ? err : new Error('Failed to fetch recordings'));
    } finally {
      setIsLoading(false);
    }
  }, [database, jokeId]);

  useEffect(() => {
    if (!jokeId) {
      hooksLogger.debug('[useAudioRecordings] No jokeId provided, skipping observation');
      setRecordings([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    hooksLogger.debug(`[useAudioRecordings] Setting up observation for joke_id=${jokeId}`);

    const collection = database.get<AudioRecording>(AUDIO_RECORDINGS_TABLE);
    const subscription = collection
      .query()
      .observe()
      .subscribe({
        next: (allRecordings: AudioRecording[]) => {
          const jokeRecordings = allRecordings.filter((r) => r.jokeId === jokeId);
          hooksLogger.info(`[useAudioRecordings] Loaded ${jokeRecordings.length} recordings for joke_id=${jokeId}`);
          setRecordings(jokeRecordings);
          setIsLoading(false);
          setError(null);
        },
        error: (err: unknown) => {
          hooksLogger.error(`[useAudioRecordings] Observable error for joke_id=${jokeId}:`, err);
          setError(err instanceof Error ? err : new Error('Failed to observe recordings'));
          setIsLoading(false);
        },
      });

    return () => {
      hooksLogger.debug(`[useAudioRecordings] Unsubscribing from recordings for joke_id=${jokeId}`);
      subscription.unsubscribe();
    };
  }, [database, jokeId]);

  return { recordings, isLoading, error };
}
