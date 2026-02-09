import { useState, useCallback } from 'react';
import { useDatabase } from '@/context/DatabaseContext';
import { AudioRecording, AUDIO_RECORDINGS_TABLE } from '@/models/AudioRecording';
import { createNamespacedLogger } from '@/lib/loggers';

const hooksLogger = createNamespacedLogger('hooks');

interface CreateAudioRecordingData {
  joke_id: string;
  file_path: string;
  duration: number;
  size: number;
  description: string;
}

interface UseCreateAudioRecordingReturn {
  createAudioRecording: (data: CreateAudioRecordingData) => Promise<AudioRecording | null>;
  isLoading: boolean;
  error: Error | null;
}

export function useCreateAudioRecording(): UseCreateAudioRecordingReturn {
  const { database } = useDatabase();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createAudioRecording = useCallback(
    async (data: CreateAudioRecordingData): Promise<AudioRecording | null> => {
      setIsLoading(true);
      setError(null);
      hooksLogger.debug(`[useCreateAudioRecording] Starting creation for joke_id=${data.joke_id}, duration=${data.duration}ms, size=${data.size} bytes`);

      try {
        const audioRecordingsCollection = database.get<AudioRecording>(AUDIO_RECORDINGS_TABLE);
        hooksLogger.debug(`[useCreateAudioRecording] Database collection obtained: ${AUDIO_RECORDINGS_TABLE}`);

        const newRecording = await database.write(async () => {
          hooksLogger.debug('[useCreateAudioRecording] Beginning database write transaction');
          return await audioRecordingsCollection.create((recording) => {
            recording.jokeId = data.joke_id;
            recording.filePath = data.file_path;
            recording.duration = data.duration;
            recording.size = data.size;
            recording.description = data.description;
            hooksLogger.debug(`[useCreateAudioRecording] Created record - joke_id=${data.joke_id}, description="${data.description.substring(0, 50)}..."`);
          });
        });

        hooksLogger.info(`[useCreateAudioRecording] Successfully created recording id=${newRecording.id} for joke_id=${data.joke_id}`);
        return newRecording;
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error('Failed to create audio recording');
        hooksLogger.error(`[useCreateAudioRecording] Failed to create recording for joke_id=${data.joke_id}:`, err);
        setError(errorObj);
        return null;
      } finally {
        setIsLoading(false);
        hooksLogger.debug(`[useCreateAudioRecording] Operation complete, isLoading=false`);
      }
    },
    [database]
  );

  return { createAudioRecording, isLoading, error };
}
