import { useState, useRef, useCallback, useEffect } from 'react';
import { useAudioRecorder as useExpoAudioRecorder, setAudioModeAsync, RecordingOptions } from 'expo-audio';
import { useAudio } from '@/context/AudioContext';
import { hooksLogger } from '@/lib/loggers';
import { resetAudioRouteToSpeaker } from '@/lib/audioMode';

const MAX_DURATION_MS = 120000;

export interface RecordingData {
  filePath: string;
  duration: number;
  size: number;
}

export interface UseAudioRecorderReturn {
  elapsedTime: number;
  isRecording: boolean;
  recordedUri: string | null;
  recordingData: RecordingData | null;
  error: Error | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  cancelRecording: () => void;
  reset: () => void;
}

export function useAudioRecorder(recordingOptions: RecordingOptions): UseAudioRecorderReturn {
  const { isPermissionGranted, requestPermission } = useAudio();
  const recorder = useExpoAudioRecorder(recordingOptions);

  const [elapsedTime, setElapsedTime] = useState(0);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [recordingData, setRecordingData] = useState<RecordingData | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const reset = useCallback(() => {
    setElapsedTime(0);
    setRecordedUri(null);
    setIsRecording(false);
    setError(null);
    setRecordingData(null);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (elapsedTime >= MAX_DURATION_MS && isRecording && timerRef.current) {
      hooksLogger.info(`[useAudioRecorder] Max duration reached: ${elapsedTime}ms`);
      clearInterval(timerRef.current);
      timerRef.current = null;
      setIsRecording(false);

      try {
        recorder.stop();
        const uri = recorder.uri;
        if (uri) {
          setRecordedUri(uri);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to stop recording on max duration'));
      }
    }
  }, [elapsedTime, isRecording, recorder]);

  const startRecording = useCallback(async () => {
    hooksLogger.debug('[useAudioRecorder] Starting recording');

    if (!isPermissionGranted) {
      hooksLogger.debug('[useAudioRecorder] Permission not granted, requesting...');
      const granted = await requestPermission();
      if (!granted) {
        hooksLogger.warn('[useAudioRecorder] Permission denied by user');
        setError(new Error('Permission denied'));
        return;
      }
    }

    try {
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
      hooksLogger.debug('[useAudioRecorder] Audio mode configured for recording');

      await recorder.prepareToRecordAsync();
      recorder.record();
      setIsRecording(true);
      hooksLogger.info('[useAudioRecorder] Recording started');

      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 100);
      }, 100);
      setError(null);
    } catch (err) {
      hooksLogger.error('[useAudioRecorder] Failed to start recording:', err);
      setError(err instanceof Error ? err : new Error('Failed to start recording'));
    }
  }, [isPermissionGranted, requestPermission, recorder]);

  const stopRecording = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      hooksLogger.debug('[useAudioRecorder] Timer stopped');
    }

    setIsRecording(false);

    try {
      await recorder.stop();
      const uri = recorder.uri;
      if (uri) {
        setRecordedUri(uri);
        hooksLogger.info(`[useAudioRecorder] Recording stopped: duration=${elapsedTime}ms`);
      }

      await resetAudioRouteToSpeaker();
    } catch (err) {
      hooksLogger.error('[useAudioRecorder] Failed to stop recording:', err);
      setError(err instanceof Error ? err : new Error('Failed to stop recording'));
    }
  }, [recorder, elapsedTime]);

  const cancelRecording = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
    setRecordedUri(null);
    setElapsedTime(0);
    setError(null);
    setRecordingData(null);
    hooksLogger.debug('[useAudioRecorder] Recording cancelled');

    try {
      await resetAudioRouteToSpeaker();
    } catch (err) {
      hooksLogger.error('[useAudioRecorder] Failed to reset audio route:', err);
    }
  }, []);

  return {
    elapsedTime,
    isRecording,
    recordedUri,
    recordingData,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
    reset,
  };
}
