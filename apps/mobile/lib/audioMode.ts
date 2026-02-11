import { setAudioModeAsync, AudioMode } from 'expo-audio';
import { Platform } from 'react-native';
import { createNamespacedLogger } from '@/lib/logger';

const audioModeLogger = createNamespacedLogger('audio');

/**
 * Configures audio mode for playback with loudspeaker routing.
 * On Android: uses shouldRouteThroughEarpiece: false
 * On iOS: uses allowsRecording: false (routes to speaker by default)
 */
export async function configurePlaybackAudioMode(): Promise<void> {
  try {
    const audioMode: Partial<AudioMode> = {
      playsInSilentMode: true,
      interruptionMode: 'doNotMix',
      allowsRecording: false,
    };

    // Android-specific: explicitly route to speaker instead of earpiece
    if (Platform.OS === 'android') {
      audioMode.shouldRouteThroughEarpiece = false;
    }

    await setAudioModeAsync(audioMode);
    audioModeLogger.debug('[configurePlaybackAudioMode] Audio mode configured for playback with loudspeaker');
  } catch (error) {
    audioModeLogger.error('[configurePlaybackAudioMode] Failed to configure audio mode:', error);
    throw error;
  }
}

/**
 * Configures audio mode for recording.
 * This routes audio to earpiece on iOS when allowsRecording is true.
 */
export async function configureRecordingAudioMode(): Promise<void> {
  try {
    await setAudioModeAsync({
      allowsRecording: true,
      playsInSilentMode: true,
      interruptionMode: 'doNotMix',
    });
    audioModeLogger.debug('[configureRecordingAudioMode] Audio mode configured for recording');
  } catch (error) {
    audioModeLogger.error('[configureRecordingAudioMode] Failed to configure audio mode:', error);
    throw error;
  }
}

/**
 * Resets audio route to loudspeaker after recording on iOS.
 * iOS has a known issue where recording (allowsRecording: true) changes the audio
 * route to earpiece, and it persists for subsequent playback.
 * 
 * Workaround: Reconfigure audio mode for playback to reset the route.
 * 
 * @see https://github.com/expo/expo/issues/20943
 */
export async function resetAudioRouteToSpeaker(): Promise<void> {
  if (Platform.OS !== 'ios') {
    // Android handles this automatically with shouldRouteThroughEarpiece
    return;
  }

  try {
    // Reconfigure audio mode for playback to reset the route to speaker
    await configurePlaybackAudioMode();
    audioModeLogger.debug('[resetAudioRouteToSpeaker] Audio route reset to speaker on iOS');
  } catch (error) {
    audioModeLogger.error('[resetAudioRouteToSpeaker] Failed to reset audio route:', error);
    // Don't throw - this is a best-effort workaround
  }
}
