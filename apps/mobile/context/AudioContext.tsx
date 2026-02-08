import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  getRecordingPermissionsAsync,
  requestRecordingPermissionsAsync,
  RecordingPresets,
  type RecordingOptions,
} from 'expo-audio';
import { createNamespacedLogger } from '@/lib/logger';

const audioLogger = createNamespacedLogger('audio');

interface AudioContextType {
  isPermissionGranted: boolean;
  requestPermission: () => Promise<boolean>;
  recordingOptions: RecordingOptions;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

const RECORDING_OPTIONS: RecordingOptions = {
  ...RecordingPresets.HIGH_QUALITY,
  sampleRate: 44100,
  numberOfChannels: 1,
  bitRate: 128000,
};

export function AudioProvider({ children }: { children: ReactNode }) {
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);

  useEffect(() => {
    audioLogger.debug('[AudioContext] Initializing AudioProvider');
    checkPermission();
  }, []);

  const checkPermission = async () => {
    try {
      audioLogger.debug('[AudioContext] Checking recording permissions');
      const status = await getRecordingPermissionsAsync();
      const wasGranted = isPermissionGranted;
      setIsPermissionGranted(status.granted);
      audioLogger.info(`[AudioContext] Permission check: granted=${status.granted}, previous=${wasGranted}`);
    } catch (error) {
      audioLogger.error('[AudioContext] Failed to check audio permission:', error);
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    try {
      audioLogger.debug('[AudioContext] Requesting recording permissions');
      const status = await requestRecordingPermissionsAsync();
      setIsPermissionGranted(status.granted);
      audioLogger.info(`[AudioContext] Permission request result: granted=${status.granted}`);
      return status.granted;
    } catch (error) {
      audioLogger.error('[AudioContext] Failed to request audio permission:', error);
      return false;
    }
  };

  return (
    <AudioContext.Provider
      value={{
        isPermissionGranted,
        requestPermission,
        recordingOptions: RECORDING_OPTIONS,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio(): AudioContextType {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
