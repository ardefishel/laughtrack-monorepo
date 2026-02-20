import { Q } from '@nozbe/watermelondb';
import { useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import debounce from 'lodash.debounce';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import {
    EnrichedTextInput,
    type EnrichedTextInputInstance,
    type OnChangeStateEvent,
} from 'react-native-enriched';
import { withUniwind } from 'uniwind';

import { JokeEditorToolbar } from '@/components/editor/JokeEditorToolbar';
import { JokeDeleteButton } from '@/components/jokes/JokeDeleteButton';
import { JokeStatusSelect } from '@/components/jokes/JokeStatusSelect';
import { TagEditor } from '@/components/jokes/TagEditor';
import { ErrorState } from '@/components/ui/ErrorState';
import { Icon } from '@/components/ui/Icon';
import { LoadingState } from '@/components/ui/LoadingState';
import { ENRICHED_HTML_STYLE, HTML_FONT_SIZE } from '@/constants/htmlStyles';
import { useDatabase } from '@/context/DatabaseContext';
import { useDeleteJoke, useJoke, useJokeTags, useUpdateJoke } from '@/hooks/jokes';
import { extractTextFromHtml } from '@/lib/htmlParser';
import { logVerbose, uiLogger } from '@/lib/loggers';
import { AUDIO_RECORDINGS_TABLE, AudioRecording } from '@/models/AudioRecording';
import { JokeStatus } from '@laughtrack/shared-types';

const DRAFT_DELAY = 400;
const COMMIT_DELAY = 1200;

const StyledEnrichedTextInput = withUniwind(EnrichedTextInput);

export default function JokeDetailScreen() {
    const { id } = useLocalSearchParams();
    const navigation = useNavigation();
    const router = useRouter();
    const { database } = useDatabase();
    const { joke, isLoading, error } = useJoke(id as string);
    const { updateJoke } = useUpdateJoke();
    const { deleteJoke } = useDeleteJoke();
    const { tags, addTag, removeTag } = useJokeTags(id as string);
    const [status, setStatus] = useState<JokeStatus>('draft');
    const [audioCount, setAudioCount] = useState(0);

    logVerbose(uiLogger, '[JokeDetail] COMPONENT RENDER, id:', id, 'joke loaded:', !!joke);

    useEffect(() => {
        if (!id) return;

        const collection = database.get<AudioRecording>(AUDIO_RECORDINGS_TABLE);
        const subscription = collection
            .query(Q.where('joke_id', id as string))
            .observe()
            .subscribe((jokeRecordings) => {
                setAudioCount(jokeRecordings.length);
            });

        return () => subscription.unsubscribe();
    }, [id, database]);

    const editorRef = useRef<EnrichedTextInputInstance>(null);
    const [stylesState, setStylesState] = useState<OnChangeStateEvent | null>(null);
    const [saveState, setSaveState] = useState<'saved' | 'saving' | 'unsaved'>('saved');

    const lastSavedHtmlRef = useRef<string>('');
    const initialContentRef = useRef<string>('');
    const currentContentRef = useRef<string>('');
    const isInitializedRef = useRef(false);

    // Debounced save functions (created lazily)
    type DebouncedFn<T extends (...args: Parameters<T>) => void> = T & { flush: () => void; cancel: () => void };
    const saveDraftDebouncedRef = useRef<DebouncedFn<(text: string) => void> | null>(null);
    const commitDebouncedRef = useRef<DebouncedFn<(text: string, html: string) => void> | null>(null);

    // Initialize debounced functions once
    const getSaveDraftDebounced = useCallback(() => {
        if (!saveDraftDebouncedRef.current) {
            saveDraftDebouncedRef.current = debounce(async (text: string) => {
                if (!id) return;
                setSaveState('saving');
                logVerbose(uiLogger, '[JokeDetail] DRAFT SAVE TRIGGERED...');
                try {
                    const success = await updateJoke(id as string, {
                        content_text: text,
                    });
                    if (success) {
                        logVerbose(uiLogger, '[JokeDetail] DRAFT SAVED successfully');
                    } else {
                        setSaveState('unsaved');
                    }
                } catch (err) {
                    uiLogger.error('[JokeDetail] DRAFT SAVE FAILED:', err);
                    setSaveState('unsaved');
                }
            }, DRAFT_DELAY);
        }
        return saveDraftDebouncedRef.current;
    }, [id, updateJoke]);

    const getCommitDebounced = useCallback(() => {
        if (!commitDebouncedRef.current) {
            commitDebouncedRef.current = debounce(async (text: string, html: string) => {
                if (!id) return;
                setSaveState('saving');
                logVerbose(uiLogger, '[JokeDetail] COMMIT SAVE TRIGGERED...');
                try {
                    const success = await updateJoke(id as string, {
                        content_text: text,
                        content_html: html,
                    });
                    if (success) {
                        lastSavedHtmlRef.current = html;
                        setSaveState('saved');
                        logVerbose(uiLogger, '[JokeDetail] COMMIT SAVED successfully');
                    } else {
                        setSaveState('unsaved');
                    }
                } catch (err) {
                    uiLogger.error('[JokeDetail] COMMIT SAVE FAILED:', err);
                    setSaveState('unsaved');
                }
            }, COMMIT_DELAY);
        }
        return commitDebouncedRef.current;
    }, [id, updateJoke]);

    // Flush all pending saves
    const flushAll = useCallback(async () => {
        logVerbose(uiLogger, '[JokeDetail] FLUSHING pending saves...');
        saveDraftDebouncedRef.current?.flush();
        commitDebouncedRef.current?.flush();
    }, []);

    // Initialize content refs
    if (joke && !initialContentRef.current) {
        initialContentRef.current = joke.content_html || '';
        currentContentRef.current = joke.content_html || '';
        lastSavedHtmlRef.current = joke.content_html || '';
    }

    const handleStatusChange = useCallback(async (newStatus: JokeStatus) => {
        logVerbose(uiLogger, `[JokeDetail] STATUS CHANGING from ${status} to ${newStatus}`);
        setStatus(newStatus);
        if (id) {
            await updateJoke(id as string, { status: newStatus });
            logVerbose(uiLogger, `[JokeDetail] STATUS SAVED to ${newStatus}`);
        }
    }, [id, updateJoke, status]);

    const handleDelete = useCallback(async () => {
        if (id) {
            const success = await deleteJoke(id as string);
            if (success) {
                router.back();
            }
        }
    }, [id, deleteJoke, router]);

    const handleEditorChange = useCallback((event: { nativeEvent: { value: string } }) => {
        const html = event.nativeEvent.value;
        currentContentRef.current = html;
        setSaveState('unsaved');
        logVerbose(uiLogger, '[JokeDetail] EDITOR CHANGED, content length:', html.length);

        const text = extractTextFromHtml(html);

        // Trigger draft save (400ms)
        getSaveDraftDebounced()(text);

        // Trigger commit save (1200ms)
        getCommitDebounced()(text, html);
    }, [getSaveDraftDebounced, getCommitDebounced]);

    const activeStyles = useMemo(() => ({
        h1: stylesState?.h1.isActive ?? false,
        h2: stylesState?.h2.isActive ?? false,
        bold: stylesState?.bold.isActive ?? false,
        italic: stylesState?.italic.isActive ?? false,
        underline: stylesState?.underline.isActive ?? false,
    }), [stylesState]);

    const isParagraph = !activeStyles.h1 && !activeStyles.h2;

    // Initialize editor state once
    useLayoutEffect(() => {
        if (joke?.id && !isInitializedRef.current) {
            isInitializedRef.current = true;
            logVerbose(uiLogger, '[JokeDetail] INITIALIZED with joke:', joke.id, 'content length:', joke.content_html?.length, 'status:', joke.status);
        }
    }, [joke?.id, joke?.content_html, joke?.status]);

    useFocusEffect(
        useCallback(() => {
            return () => {
                flushAll();
            };
        }, [flushAll])
    );

    // Update navigation options
    useLayoutEffect(() => {
        if (joke) {
            setStatus(joke.status);
            navigation.setOptions({
                headerTitle: () => <JokeStatusSelect status={status} onStatusChange={handleStatusChange} />,
                headerTitleAlign: 'center',
                headerRight: () => (
                    <View className="flex-row items-center gap-2">
                        {saveState === 'saving' && (
                            <View className="p-2">
                                <Icon name="sync-outline" size={18} className="text-muted animate-spin" />
                            </View>
                        )}
                        {saveState === 'saved' && (
                            <View className="p-2">
                                <Icon name="checkmark" size={18} className="text-success" />
                            </View>
                        )}
                        <JokeDeleteButton onDelete={handleDelete} />
                    </View>
                )
            });
        }
    }, [navigation, joke, status, handleStatusChange, handleDelete, saveState]);

    const toolbarProps = useMemo(() => ({
        onH1: () => editorRef.current?.toggleH1(),
        onH2: () => editorRef.current?.toggleH2(),
        onParagraph: () => {
            if (activeStyles.h1) {
                editorRef.current?.toggleH1();
            } else if (activeStyles.h2) {
                editorRef.current?.toggleH2();
            }
        },
        onBold: () => editorRef.current?.toggleBold(),
        onItalic: () => editorRef.current?.toggleItalic(),
        onUnderline: () => editorRef.current?.toggleUnderline(),
        activeStyles: { ...activeStyles, isParagraph },
        audioCount,
        onOpenAudioList: () => {
            logVerbose(uiLogger, '[JokeDetail] onOpenAudioList PRESSED');
            router.push({
                pathname: '/recording-list-bottom-sheet',
                params: {
                    jokeId: id as string,
                }
            });
        },
    }), [activeStyles, isParagraph, audioCount, id, router]);

    logVerbose(uiLogger, '[JokeDetail] RENDER: audioCount:', audioCount);

    if (isLoading) {
        return <LoadingState message="Loading joke..." />;
    }

    if (error) {
        return <ErrorState title="Error loading joke" message={error.message} icon="alert" />;
    }

    if (!joke) {
        return <ErrorState title="Joke not found" icon="help" />;
    }

    return (
        <View className="flex-1 bg-background">
            <View className="flex-1 p-4">
                <StyledEnrichedTextInput
                    ref={editorRef}
                    className="text-foreground"
                    style={{
                        flex: 1,
                        fontSize: HTML_FONT_SIZE,
                        padding: 16,
                        backgroundColor: 'transparent',
                        textAlignVertical: 'top',
                    }}
                    htmlStyle={ENRICHED_HTML_STYLE}
                    placeholder="Write your joke here..."
                    placeholderTextColor="var(--muted)"
                    selectionColor="var(--accent)"
                    cursorColor="var(--accent)"
                    defaultValue={initialContentRef.current}
                    onChangeState={(e) => setStylesState(e.nativeEvent)}
                    onChangeHtml={handleEditorChange}
                />
            </View>

            <TagEditor tags={tags} onAddTag={addTag} onRemoveTag={removeTag} />
            <JokeEditorToolbar {...toolbarProps} />
        </View>
    );
}
