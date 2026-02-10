import { useState, useEffect, useCallback, useRef } from 'react';
import { useAudioPlayer as useExpoAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { AudioRecording } from '@/models/AudioRecording';
import { hooksLogger, logVerbose } from '@/lib/loggers';

interface UseRecordingPlayerReturn {
    isPlaying: boolean;
    isLoading: boolean;
    loadError: string | null;
    activeRecordingId: string | null;
    play: (recording: AudioRecording) => void;
    pause: () => void;
    toggle: (recording: AudioRecording) => void;
    clearError: () => void;
}

const LOADING_TIMEOUT_MS = 10000;

export function useRecordingPlayer(): UseRecordingPlayerReturn {
    const player = useExpoAudioPlayer(null);
    const playerStatus = useAudioPlayerStatus(player);

    logVerbose(hooksLogger, `[useRecordingPlayer] Status: isLoaded=${playerStatus?.isLoaded}, playing=${playerStatus?.playing}`);

    const [activeRecordingId, setActiveRecordingId] = useState<string | null>(null);
    const [pendingPlay, setPendingPlay] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearLoadingTimeout = useCallback(() => {
        if (loadingTimeoutRef.current) {
            clearTimeout(loadingTimeoutRef.current);
            loadingTimeoutRef.current = null;
        }
    }, []);

    const clearError = useCallback(() => {
        setLoadError(null);
    }, []);

    useEffect(() => {
        return () => {
            clearLoadingTimeout();
        };
    }, [clearLoadingTimeout]);

    useEffect(() => {
        if (pendingPlay && playerStatus?.isLoaded) {
            hooksLogger.debug('[useRecordingPlayer] Audio loaded, playing...');
            player.play();
            setPendingPlay(false);
            setIsLoading(false);
            clearLoadingTimeout();
        }
    }, [playerStatus?.isLoaded, pendingPlay, player, clearLoadingTimeout]);

    useEffect(() => {
        if (playerStatus?.playing !== undefined) {
            setIsPlaying(playerStatus.playing);
        }
    }, [playerStatus?.playing]);

    const play = useCallback((recording: AudioRecording) => {
        hooksLogger.debug(`[useRecordingPlayer] Playing recording: ${recording.id}, uri: ${recording.filePath}`);
        setLoadError(null);
        player.replace({ uri: recording.filePath });
        setActiveRecordingId(recording.id);
        setPendingPlay(true);
        setIsLoading(true);

        clearLoadingTimeout();
        loadingTimeoutRef.current = setTimeout(() => {
            hooksLogger.error('[useRecordingPlayer] Audio loading timeout - file may not exist');
            setLoadError('Audio file not found or inaccessible');
            setIsLoading(false);
            setPendingPlay(false);
        }, LOADING_TIMEOUT_MS);
    }, [player, clearLoadingTimeout]);

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
        loadError,
        activeRecordingId,
        play,
        pause,
        toggle,
        clearError,
    };
}
