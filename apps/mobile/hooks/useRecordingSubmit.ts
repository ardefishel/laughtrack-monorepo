import { useState, useCallback } from 'react';
import { useCreateJoke } from './jokes/useCreateJoke';
import { useCreateAudioRecording } from './useCreateAudioRecording';
import { hooksLogger } from '@/lib/loggers';

export interface RecordingData {
  filePath: string;
  duration: number;
  size: number;
}

export interface UseRecordingSubmitReturn {
  isSubmitting: boolean;
  error: Error | null;
  submitRecording: (params: { recordingData: RecordingData; description: string }) => Promise<{ jokeId: string } | null>;
}

export function useRecordingSubmit(jokeId?: string): UseRecordingSubmitReturn {
  const { createJoke } = useCreateJoke();
  const { createAudioRecording } = useCreateAudioRecording();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const submitRecording = useCallback(
    async ({
      recordingData,
      description,
    }: {
      recordingData: RecordingData;
      description: string;
    }): Promise<{ jokeId: string } | null> => {
      if (!description.trim()) {
        setError(new Error('Please enter a description'));
        return null;
      }

      setIsSubmitting(true);
      setError(null);

      try {
        hooksLogger.info(`[useRecordingSubmit] Submitting: description="${description.substring(0, 30)}...", duration=${recordingData.duration}ms`);

        let targetJokeId: string;

        if (jokeId) {
          // Add to existing joke
          hooksLogger.debug(`[useRecordingSubmit] Adding to existing joke: ${jokeId}`);
          targetJokeId = jokeId;
        } else {
          // Create new joke
          hooksLogger.debug('[useRecordingSubmit] Creating new joke');
          const created = await createJoke({
            content_html: description.trim(),
          });
          if (!created) {
            throw new Error('Failed to create joke');
          }
          targetJokeId = created.id;
        }

        await createAudioRecording({
          joke_id: targetJokeId,
          file_path: recordingData.filePath,
          duration: recordingData.duration,
          size: recordingData.size,
          description: description.trim(),
        });

        hooksLogger.info(`[useRecordingSubmit] Successfully created recording for joke_id=${targetJokeId}`);
        return { jokeId: targetJokeId };
      } catch (err) {
        hooksLogger.error('[useRecordingSubmit] Failed to submit recording:', err);
        setError(err instanceof Error ? err : new Error('Failed to save recording'));
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [jokeId, createJoke, createAudioRecording]
  );

  return {
    isSubmitting,
    error,
    submitRecording,
  };
}
