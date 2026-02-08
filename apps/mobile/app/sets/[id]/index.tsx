import { SortableJokeList } from '@/components/sets';
import { RawJokeSetItem, RawJoke } from '@/lib/types';
import { useJokeSet, useJokeSetItems, useAddJokeSetItem, useUpdateJokeSetItem, useRemoveJokeSetItem } from '@/hooks/sets';
import { useJokesQuery } from '@/hooks/jokes';
import { SetJokeItem } from '@/lib/mockData';
import { useSetEditing } from '@/context/SetEditingContext';
import { useSetItemsHandlers } from '@/hooks/useSetItemsHandlers';
import { extractTitleAndDescription } from '@/lib/htmlParser';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useLayoutEffect, useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { withUniwind } from 'uniwind';

const StyledIonicons = withUniwind(Ionicons);

export default function SetDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  const setId = id as string;

  const { setEditingSetId } = useSetEditing();
  const { jokeSet, isLoading: setLoading } = useJokeSet(setId);
  const { items: rawItems, isLoading: itemsLoading } = useJokeSetItems(setId);
  const { jokes } = useJokesQuery();
  const { addJokeSetItem } = useAddJokeSetItem();
  const { updateJokeSetItem } = useUpdateJokeSetItem();
  const { removeJokeSetItem } = useRemoveJokeSetItem();

  const items: SetJokeItem[] = useMemo(() => {
    if (!rawItems || !jokes) return [];

    return rawItems.map((rawItem: RawJokeSetItem) => {
      if (rawItem.item_type === 'joke' && rawItem.joke_id) {
        const joke = jokes.find((j: RawJoke) => j.id === rawItem.joke_id);
        const { title, description } = extractTitleAndDescription(joke?.content_html || '');
        return {
          id: rawItem.id,
          type: 'joke' as const,
          title: title || 'Untitled Joke',
          description: description || '',
          status: joke?.status || 'draft',
        };
      } else {
        return {
          id: rawItem.id,
          type: 'note' as const,
          title: 'Note',
          content: rawItem.content || '',
        };
      }
    });
  }, [rawItems, jokes]);

  const handleAddNote = async (afterId?: string | null) => {
    const afterIndex = rawItems?.findIndex((item: RawJokeSetItem) => item.id === afterId);
    const position = afterIndex >= 0 ? afterIndex + 1 : (rawItems?.length || 0);
    await addJokeSetItem({
      setId,
      itemType: 'note',
      content: 'New note',
      position,
    });
  };

  const handleDragEnd = async ({ data }: { data: SetJokeItem[] }) => {
    for (let i = 0; i < data.length; i++) {
      await updateJokeSetItem(data[i].id, { position: i });
    }
  };

  const handleDeleteItem = (itemId: string) => {
    removeJokeSetItem(itemId);
  };

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
    setId,
    onAddNote: handleAddNote,
    onDragEnd: handleDragEnd,
    onDeleteItem: handleDeleteItem,
  });

  useLayoutEffect(() => {
    setEditingSetId(setId);
  }, [setEditingSetId, setId]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Pressable onPress={() => router.push(`/sets/${id}/edit` as const)} className="py-2">
          <Text className="text-xl font-semibold text-foreground">
            {jokeSet?.title || 'Untitled Set'}
          </Text>
        </Pressable>
      ),
      headerRight: () => (
        <Pressable
          onPress={() => router.push({ pathname: '/sets/[id]/reader', params: { id: setId } })}
          className="p-2 -m-2"
        >
          <StyledIonicons name="book-outline" size={22} className="text-foreground" />
        </Pressable>
      ),
    });
  }, [jokeSet?.title, navigation, router, id, setId]);

  if (setLoading || itemsLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-muted">Loading...</Text>
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
