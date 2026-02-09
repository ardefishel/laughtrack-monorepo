import { Paths, File, Directory } from 'expo-file-system';
import { createNamespacedLogger } from '@/lib/loggers';

const audioLogger = createNamespacedLogger('audio');
const AUDIO_DIR_NAME = 'audio';

export const getRecordingsDirectory = (): string => {
  const audioDir = new Directory(Paths.document, AUDIO_DIR_NAME);
  const uri = audioDir.uri;
  audioLogger.debug(`[audioStorage] getRecordingsDirectory: ${uri}`);
  return uri;
};

export const ensureAudioDirectory = async (): Promise<void> => {
  const audioDir = new Directory(Paths.document, AUDIO_DIR_NAME);
  if (!audioDir.exists) {
    audioLogger.info('[audioStorage] Creating audio directory');
    audioDir.create();
    audioLogger.info('[audioStorage] Audio directory created successfully');
  } else {
    audioLogger.debug('[audioStorage] Audio directory already exists');
  }
};

export const getAudioPathForRecording = (recordingId: string): string => {
  const audioFile = new File(Paths.document, AUDIO_DIR_NAME, `${recordingId}.m4a`);
  const uri = audioFile.uri;
  audioLogger.debug(`[audioStorage] getAudioPathForRecording: id=${recordingId}, path=${uri}`);
  return uri;
};

export const deleteAudioFile = async (recordingId: string): Promise<void> => {
  const audioFile = new File(Paths.document, AUDIO_DIR_NAME, `${recordingId}.m4a`);
  try {
    if (audioFile.exists) {
      audioLogger.debug(`[audioStorage] Deleting audio file: id=${recordingId}`);
      await audioFile.delete();
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
    const file = new File(filePath);
    if (file.exists && file.size !== undefined) {
      audioLogger.debug(`[audioStorage] getAudioFileInfo: path=${filePath}, size=${file.size} bytes`);
      return { size: file.size };
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
