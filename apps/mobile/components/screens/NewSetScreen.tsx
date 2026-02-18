import { SortableJokeList } from '@/components/sets';
import { useDatabase } from '@/context/DatabaseContext';
import { useSetEditing } from '@/context/SetEditingContext';
import { useCreateJokeSet } from '@/hooks/sets';
import { useSetItemsHandlers } from '@/hooks/useSetItemsHandlers';
import { uiLogger } from '@/lib/loggers';
import { SetJokeItem } from '@/lib/mocks';
import { JOKE_SET_ITEMS_TABLE, JokeSetItem } from '@/models/JokeSetItem';
import { useNavigation, useRouter } from 'expo-router';
import { Button } from 'heroui-native';
import { useCallback, useLayoutEffect } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Icon } from '@/components/ui/Icon';

const TEMP_ID_PREFIX = 'temp_';

const generateTempId = () => `${TEMP_ID_PREFIX}${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

export default function NewSetScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const { database } = useDatabase();
    const { createJokeSet, isLoading: isCreatingSet } = useCreateJokeSet();
    const {
        hasStarted,
        items,
        setItems,
        setDetails,
        resetNewSet,
    } = useSetEditing();
    const isSaveDisabled = isCreatingSet || items.length === 0;

    const handleNavigateToEditDetail = useCallback(() => {
        router.push('/sets/new/edit-detail' as const);
    }, [router]);

    const handleAddFirstItem = useCallback(() => {
        router.push('/sets/new/select-jokes' as const);
    }, [router]);

    const handleAddNote = useCallback(async (afterId?: string | null) => {
        const newItem = {
            id: generateTempId(),
            type: 'note' as const,
            title: 'Note',
            content: '',
        };

        setItems((prev) => {
            const newItems = [...prev];
            if (afterId) {
                const afterIdx = newItems.findIndex((i) => i.id === afterId);
                newItems.splice(afterIdx + 1, 0, newItem);
            } else {
                newItems.push(newItem);
            }
            return newItems;
        });
    }, [setItems]);

    const handleDragEnd = useCallback(({ data }: { data: SetJokeItem[] }) => {
        setItems(data);
    }, [setItems]);

    const handleDeleteItem = useCallback((itemId: string) => {
        setItems((prev) => prev.filter((item) => item.id !== itemId));
    }, [setItems]);

    const {
        expandedSeparatorId,
        handleAddJoke,
        handleAddNote: handleAddNoteFromHook,
        handleSeparatorPress,
        handleDismiss,
        handleJokePress,
        handleDragEnd: handleDragEndFromHook,
        handleDeleteItem: handleDeleteItemFromHook,
    } = useSetItemsHandlers({
        onAddNote: handleAddNote,
        onDragEnd: handleDragEnd,
        onDeleteItem: handleDeleteItem,
    });

    const handleSave = useCallback(async () => {
        uiLogger.debug('[NewSetScreen] handleSave START - items count:', items.length);
        if (items.length === 0) {
            uiLogger.debug('[NewSetScreen] handleSave ABORT - no items');
            return;
        }

        uiLogger.debug('[NewSetScreen] handleSave calling createJokeSet...');
        const newSet = await createJokeSet({
            title: setDetails.title,
            description: setDetails.description || undefined,
            duration: setDetails.duration ? parseInt(setDetails.duration) : undefined,
            place: setDetails.place || undefined,
            status: setDetails.status,
        });
        uiLogger.debug('[NewSetScreen] handleSave createJokeSet returned:', newSet);

        if (!newSet) {
            uiLogger.error('[NewSetScreen] handleSave FAILED - createJokeSet returned null');
            return;
        }

        uiLogger.debug('[NewSetScreen] handleSave adding items, count:', items.length);
        try {
            await database.write(async () => {
                const now = new Date();
                const records = items.map((item, i) =>
                    database.get<JokeSetItem>(JOKE_SET_ITEMS_TABLE).prepareCreate((record) => {
                        record.setId = newSet.id;
                        record.itemType = item.type === 'joke' ? 'joke' : 'note';
                        record.jokeId = item.type === 'joke' ? (item.jokeId || '') : '';
                        record.content = item.type === 'note' ? (item.content || '') : '';
                        record.position = i;
                        record.created_at = now;
                        record.updated_at = now;
                    })
                );
                await database.batch(...records);
            });
        } catch (err) {
            uiLogger.error('[NewSetScreen] Failed to batch-add items:', err);
            return;
        }

        uiLogger.debug('[NewSetScreen] handleSave resetting new set');
        resetNewSet();
        uiLogger.debug('[NewSetScreen] handleSave navigating to set:', newSet.id);
        router.replace(`/sets/${newSet.id}` as const);
        uiLogger.debug('[NewSetScreen] handleSave COMPLETE');
    }, [items, setDetails, createJokeSet, database, resetNewSet, router]);

    useLayoutEffect(() => {
        navigation.getParent()?.setOptions({
            headerTitle: () => (
                <Pressable
                    onPress={handleNavigateToEditDetail}
                    accessibilityRole="button"
                    accessibilityLabel="Edit set details"
                    className="py-1"
                >
                    <View className="flex-row items-center">
                        <Text className="text-lg font-semibold text-foreground" numberOfLines={1}>
                            {setDetails.title || 'Untitled Set'}
                        </Text>
                        <Icon name="chevron-down" size={16} className="ml-1 text-muted" />
                    </View>
                </Pressable>
            ),
            headerRight: () => (
                <Button
                    onPress={handleSave}
                    variant='ghost'
                    isDisabled={isSaveDisabled}
                    accessibilityRole="button"
                    accessibilityLabel="Save set"
                >
                    {isCreatingSet ? (
                        <View className="text-muted">
                            <Icon name="sync-outline" size={18} className="animate-spin text-muted" />
                        </View>
                    ) : (
                        <Button.Label>Save</Button.Label>
                    )}
                </Button>
            ),
        });
    }, [navigation, handleNavigateToEditDetail, handleSave, isCreatingSet, isSaveDisabled, setDetails.title]);

    if (!hasStarted) {
        return (
            <View className="flex-1 bg-background items-center justify-center px-6">
                <View className="items-center max-w-sm w-full">
                    <View className="w-16 h-16 rounded-2xl bg-default items-center justify-center mb-4">
                        <Icon name="albums-outline" size={32} className="text-muted" />
                    </View>
                    <Text className="text-xl font-semibold text-foreground">Create Your First Set</Text>
                    <Text className="text-muted text-center mt-2">
                        Add jokes and quick notes so your set stays tight and easy to run.
                    </Text>
                    <Button
                        variant="primary"
                        onPress={handleAddFirstItem}
                        accessibilityRole="button"
                        accessibilityLabel="Add your first set item"
                        className="mt-6 w-full"
                    >
                        <Button.Label>+ Add Set Item</Button.Label>
                    </Button>
                </View>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-background">
            <SortableJokeList
                items={items}
                onJokePress={handleJokePress}
                onAddJoke={handleAddJoke}
                onAddNote={handleAddNoteFromHook}
                onDeleteItem={handleDeleteItemFromHook}
                onDragEnd={handleDragEndFromHook}
                expandedSeparatorId={expandedSeparatorId}
                onSeparatorPress={handleSeparatorPress}
                onDismiss={handleDismiss}
            />
        </View>
    );
}
