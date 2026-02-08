import { useState, useEffect, useCallback } from 'react';
import { useAudioPlayer as useExpoAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { AudioRecording } from '@/models/AudioRecording';
import { hooksLogger, logVerbose } from '@/lib/loggers';

interface UseRecordingPlayerReturn {
    isPlaying: boolean;
    isLoading: boolean;
    activeRecordingId: string | null;
    play: (recording: AudioRecording) => void;
    pause: () => void;
    toggle: (recording: AudioRecording) => void;
}

export function useRecordingPlayer(): UseRecordingPlayerReturn {
    const player = useExpoAudioPlayer(null);
    const playerStatus = useAudioPlayerStatus(player);

    logVerbose(hooksLogger, `[useRecordingPlayer] Status: isLoaded=${playerStatus?.isLoaded}, playing=${playerStatus?.playing}`);

    const [activeRecordingId, setActiveRecordingId] = useState<string | null>(null);
    const [pendingPlay, setPendingPlay] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Auto-play when audio finishes loading
    useEffect(() => {
        if (pendingPlay && playerStatus?.isLoaded) {
            hooksLogger.debug('[useRecordingPlayer] Audio loaded, playing...');
            player.play();
            setPendingPlay(false);
            setIsLoading(false);
        }
    }, [playerStatus?.isLoaded, pendingPlay, player]);

    // Sync playing state with player status
    useEffect(() => {
        if (playerStatus?.playing !== undefined) {
            setIsPlaying(playerStatus.playing);
        }
    }, [playerStatus?.playing]);

    const play = useCallback((recording: AudioRecording) => {
        hooksLogger.debug(`[useRecordingPlayer] Playing recording: ${recording.id}, uri: ${recording.filePath}`);
        player.replace({ uri: recording.filePath });
        setActiveRecordingId(recording.id);
        setPendingPlay(true);
        setIsLoading(true);
    }, [player]);

    const pause = useCallback(() => {
        hooksLogger.debug('[useRecordingPlayer] Pausing playback');
        player.pause();
    }, [player]);

    const toggle = useCallback((recording: AudioRecording) => {
        hooksLogger.debug(`[useRecordingPlayer] Toggle recording: ${recording.id}, activeId: ${activeRecordingId}`);
        if (activeRecordingId === recording.id) {
            if (playerStatus?.playing) {
                pause();
            } else {
                player.play();
            }
        } else {
            play(recording);
        }
    }, [activeRecordingId, playerStatus?.playing, play, pause, player]);

    return {
        isPlaying,
        isLoading,
        activeRecordingId,
        play,
        pause,
        toggle,
    };
}
