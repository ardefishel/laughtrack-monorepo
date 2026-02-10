import * as FileSystem from 'expo-file-system';
import { createNamespacedLogger } from '@/lib/loggers';

const audioLogger = createNamespacedLogger('audio');
const AUDIO_DIR_NAME = 'audio';

const getDocumentDirectory = (): string => {
  return FileSystem.documentDirectory || '';
};

export const getRecordingsDirectory = (): string => {
  const uri = `${getDocumentDirectory()}${AUDIO_DIR_NAME}`;
  audioLogger.debug(`[audioStorage] getRecordingsDirectory: ${uri}`);
  return uri;
};

export const ensureAudioDirectory = async (): Promise<void> => {
  const audioDirUri = getRecordingsDirectory();
  try {
    const dirInfo = await FileSystem.getInfoAsync(audioDirUri);
    if (!dirInfo.exists) {
      audioLogger.info('[audioStorage] Creating audio directory');
      await FileSystem.makeDirectoryAsync(audioDirUri, { intermediates: true });
      audioLogger.info('[audioStorage] Audio directory created successfully');
    } else {
      audioLogger.debug('[audioStorage] Audio directory already exists');
    }
  } catch (error) {
    audioLogger.error('[audioStorage] Failed to ensure audio directory:', error);
    throw error;
  }
};

export const getAudioPathForRecording = (recordingId: string): string => {
  const uri = `${getRecordingsDirectory()}/${recordingId}.m4a`;
  audioLogger.debug(`[audioStorage] getAudioPathForRecording: id=${recordingId}, path=${uri}`);
  return uri;
};

export const deleteAudioFile = async (recordingId: string): Promise<void> => {
  const fileUri = getAudioPathForRecording(recordingId);
  try {
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (fileInfo.exists) {
      audioLogger.debug(`[audioStorage] Deleting audio file: id=${recordingId}`);
      await FileSystem.deleteAsync(fileUri);
      audioLogger.info(`[audioStorage] Successfully deleted audio file: id=${recordingId}`);
    } else {
      audioLogger.warn(`[audioStorage] Audio file not found for deletion: id=${recordingId}`);
    }
  } catch (error) {
    audioLogger.error(`[audioStorage] Failed to delete audio file: id=${recordingId}`, error);
    throw error;
  }
};

export const getAudioFileInfo = async (
  filePath: string
): Promise<{ size: number } | null> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (fileInfo.exists && 'size' in fileInfo) {
      audioLogger.debug(`[audioStorage] getAudioFileInfo: path=${filePath}, size=${fileInfo.size} bytes`);
      return { size: fileInfo.size };
    }
    audioLogger.warn(`[audioStorage] Audio file not found or has no size: path=${filePath}`);
    return null;
  } catch (error) {
    audioLogger.error(`[audioStorage] Failed to get audio file info: path=${filePath}`, error);
    return null;
  }
};

export const formatDuration = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  audioLogger.debug(`[audioStorage] formatDuration: ${ms}ms => ${formatted}`);
  return formatted;
};

export const persistAudioFile = async (
  tempUri: string,
  recordingId: string
): Promise<string> => {
  try {
    audioLogger.debug(`[audioStorage] Persisting audio file: tempUri=${tempUri}, recordingId=${recordingId}`);

    await ensureAudioDirectory();

    const destinationUri = getAudioPathForRecording(recordingId);

    const sourceInfo = await FileSystem.getInfoAsync(tempUri);
    if (!sourceInfo.exists) {
      throw new Error(`Source audio file does not exist: ${tempUri}`);
    }

    const sourceSize = (sourceInfo as { size: number }).size ?? 0;
    audioLogger.debug(`[audioStorage] Source file exists, size=${sourceSize} bytes`);

    await FileSystem.copyAsync({
      from: tempUri,
      to: destinationUri,
    });

    audioLogger.info(`[audioStorage] Successfully persisted audio file to: ${destinationUri}`);

    try {
      await FileSystem.deleteAsync(tempUri, { idempotent: true });
      audioLogger.debug(`[audioStorage] Cleaned up temp file: ${tempUri}`);
    } catch (cleanupError) {
      audioLogger.warn(`[audioStorage] Failed to cleanup temp file: ${tempUri}`, cleanupError);
    }

    return destinationUri;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    audioLogger.error(`[audioStorage] Failed to persist audio file: tempUri=${tempUri}, error=${errorMessage}`);
    throw new Error(`Failed to persist audio file: ${errorMessage}`);
  }
};
