import { SortableJokeList } from '@/components/sets';
import { useDatabase } from '@/context/DatabaseContext';
import { RawJokeSetItem, RawJoke } from '@/lib/types';
import { useJokeSet, useJokeSetItems, useAddJokeSetItem, useRemoveJokeSetItem } from '@/hooks/sets';
import { SetJokeItem } from '@/lib/mockData';
import { useSetEditing } from '@/context/SetEditingContext';
import { useSetItemsHandlers } from '@/hooks/useSetItemsHandlers';
import { extractTitleAndDescription } from '@/lib/htmlParser';
import { hooksLogger } from '@/lib/loggers';
import { Joke, JOKES_TABLE } from '@/models/Joke';
import { JokeSetItem, JOKE_SET_ITEMS_TABLE } from '@/models/JokeSetItem';
import { Ionicons } from '@expo/vector-icons';
import { Q } from '@nozbe/watermelondb';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { withUniwind } from 'uniwind';

const StyledIonicons = withUniwind(Ionicons);

export default function SetDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  const setId = id as string;

  const { database } = useDatabase();
  const { setEditingSetId } = useSetEditing();
  const { jokeSet, isLoading: setLoading } = useJokeSet(setId);
  const { items: rawItems, isLoading: itemsLoading } = useJokeSetItems(setId);
  const { addJokeSetItem } = useAddJokeSetItem();
  const { removeJokeSetItem } = useRemoveJokeSetItem();

  const [jokes, setJokes] = useState<RawJoke[]>([]);

  useEffect(() => {
    const jokeIds = (rawItems || [])
      .filter((item: RawJokeSetItem) => item.item_type === 'joke' && item.joke_id)
      .map((item: RawJokeSetItem) => item.joke_id);

    if (jokeIds.length === 0) {
      setJokes([]);
      return;
    }

    const subscription = database
      .get<Joke>(JOKES_TABLE)
      .query(Q.where('id', Q.oneOf(jokeIds)))
      .observe()
      .subscribe((records) => {
        setJokes(records.map((r) => ({
          id: r.id,
          content_html: r.content_html,
          status: r.status,
          created_at: r.created_at.getTime(),
          updated_at: r.updated_at.getTime(),
          tags: Array.isArray(r.tags) ? r.tags : [],
          recordings_count: 0,
        })));
      });

    return () => subscription.unsubscribe();
  }, [rawItems, database]);

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
    try {
      await database.write(async () => {
        const updates = await Promise.all(
          data.map(async (item, i) => {
            const record = await database.get<JokeSetItem>(JOKE_SET_ITEMS_TABLE).find(item.id);
            return record.prepareUpdate((r) => {
              r.position = i;
              r.updated_at = new Date();
            });
          })
        );
        await database.batch(...updates);
      });
    } catch (err) {
      hooksLogger.error('[SetDetailScreen] Failed to reorder items:', err);
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
