import { useState, useCallback } from 'react';
import { Pressable, Text, View, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { withUniwind } from 'uniwind';
import { useJokesQuery } from '@/hooks/jokes';
import { useJokeSetItems, useAddJokeSetItem } from '@/hooks/sets';
import { useSetEditing } from '@/context/SetEditingContext';
import { RawJoke, RawJokeSetItem } from '@/lib/types';
import { SetJokeItem } from '@/lib/mockData';
import { extractTitleAndDescription } from '@/lib/htmlParser';
import { uiLogger } from '@/lib/loggers';

const StyledIonicons = withUniwind(Ionicons);

const generateTempId = () => `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

interface SelectJokesScreenProps {
  mode: 'edit' | 'create';
  setId?: string;
  onItemsConfirmed?: (items: SetJokeItem[]) => void;
}

export function SelectJokesScreen({ mode, setId: propSetId, onItemsConfirmed }: SelectJokesScreenProps) {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const effectiveSetId = propSetId || (id as string);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJokes, setSelectedJokes] = useState<Map<string, { id: string; content_html: string; status: string }>>(new Map());

  const { jokes, isLoading, error } = useJokesQuery(searchQuery);
  const { items: rawItems } = useJokeSetItems(effectiveSetId);
  const { addJokeSetItem } = useAddJokeSetItem();
  const { pendingAddPosition, setPendingAddPosition, items: contextItems, setItems, setHasStarted } = useSetEditing();

  const existingJokeIds = mode === 'edit' && rawItems
    ? rawItems
        .filter((item: RawJokeSetItem) => item.item_type === 'joke' && item.joke_id)
        .map((item: RawJokeSetItem) => item.joke_id)
    : contextItems
        .filter((item) => item.type === 'joke')
        .map((item) => item.id.replace(/^temp_/, ''));

  const toggleJoke = useCallback((joke: RawJoke) => {
    setSelectedJokes((prev) => {
      const newMap = new Map(prev);
      if (newMap.has(joke.id)) {
        newMap.delete(joke.id);
      } else {
        newMap.set(joke.id, {
          id: joke.id,
          content_html: joke.content_html,
          status: joke.status,
        });
      }
      return newMap;
    });
  }, []);

  const handleConfirm = useCallback(async () => {
    const selectedArray = Array.from(selectedJokes.values());
    uiLogger.debug(`[SelectJokesScreen] Selected jokes:`, selectedArray.length);

    if (mode === 'edit') {
      let position = rawItems?.length || 0;

      if (pendingAddPosition === null) {
        position = 0;
      } else if (pendingAddPosition === 'add-bottom') {
        position = rawItems?.length || 0;
      } else if (pendingAddPosition) {
        const afterIndex = rawItems?.findIndex((item: RawJokeSetItem) => item.id === pendingAddPosition);
        if (afterIndex !== undefined && afterIndex >= 0) {
          position = afterIndex + 1;
        }
      }

      for (let i = 0; i < selectedArray.length; i++) {
        const joke = selectedArray[i];
        await addJokeSetItem({
          setId: effectiveSetId,
          itemType: 'joke',
          jokeId: joke.id,
          position: position + i,
        });
      }

      setPendingAddPosition(undefined);
      router.back();
    } else {
      const jokeItems: SetJokeItem[] = selectedArray.map((joke) => {
        const { title, description } = extractTitleAndDescription(joke.content_html);
        return {
          id: generateTempId(),
          type: 'joke' as const,
          jokeId: joke.id,
          title: title || 'Untitled Joke',
          description: description || '',
          status: joke.status as 'draft' | 'published' | 'archived' | undefined,
        };
      });

      const isAddingFromHeader = pendingAddPosition === null;
      const isAddingFromFooter = pendingAddPosition === 'add-bottom';
      const isInsertingAtPosition = typeof pendingAddPosition === 'string' && pendingAddPosition !== 'add-bottom' && pendingAddPosition !== null;

      if (isInsertingAtPosition) {
        const newItems = [...contextItems];
        const afterIdx = newItems.findIndex((i) => i.id === pendingAddPosition);
        const insertIndex = afterIdx >= 0 ? afterIdx + 1 : newItems.length;
        newItems.splice(insertIndex, 0, ...jokeItems);
        setItems(newItems);
      } else if (isAddingFromFooter) {
        setItems([...contextItems, ...jokeItems]);
      } else if (isAddingFromHeader) {
        setItems([...jokeItems, ...contextItems]);
      } else {
        setItems(jokeItems);
        setHasStarted(true);
      }

      if (onItemsConfirmed) {
        onItemsConfirmed(jokeItems);
      }

      setPendingAddPosition(undefined);
      router.dismiss();
    }
  }, [selectedJokes, mode, rawItems, pendingAddPosition, addJokeSetItem, effectiveSetId, setPendingAddPosition, router, contextItems, setItems, setHasStarted, onItemsConfirmed]);

  const renderJokeItem = useCallback(({ item }: { item: RawJoke }) => {
    const { title, description } = extractTitleAndDescription(item.content_html);
    const isSelected = selectedJokes.has(item.id);
    const isInSet = mode === 'edit'
      ? existingJokeIds.includes(item.id)
      : contextItems.some((i) => i.type === 'joke' && i.title === title);

    return (
      <Pressable
        onPress={() => {
          if (!isInSet) {
            toggleJoke(item);
          }
        }}
        className="mx-4 mb-3"
        disabled={isInSet}
      >
        <View className={`p-3 rounded-lg border ${isSelected ? 'bg-primary/10 border-primary' : isInSet ? 'bg-default/50 border-default opacity-50' : 'bg-surface border-default'}`}>
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-3">
              <Text className="text-foreground text-base font-medium" numberOfLines={1}>
                {title || 'Untitled Joke'}
              </Text>
              {description.length > 0 && (
                <Text className="text-muted text-sm mt-1" numberOfLines={2}>
                  {description}
                </Text>
              )}
              {isInSet && (
                <View className="flex-row items-center mt-2">
                  <StyledIonicons name="checkmark-circle" size={14} className="text-success mr-1" />
                  <Text className="text-success text-xs">In set</Text>
                </View>
              )}
            </View>
            {isInSet ? (
              <StyledIonicons name="checkmark-circle" size={24} className="text-success" />
            ) : (
              <StyledIonicons
                name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                size={24}
                className={isSelected ? 'text-primary' : 'text-muted'}
              />
            )}
          </View>
        </View>
      </Pressable>
    );
  }, [selectedJokes, toggleJoke, existingJokeIds, mode, contextItems]);

  const selectedCount = selectedJokes.size;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      className="flex-1 bg-background"
    >
      <View className="flex-1 bg-background">
        <View className="px-4 py-3 border-b border-default">
          <View className="flex-row items-center bg-field-background rounded-lg px-3 py-2">
            <StyledIonicons name="search" size={18} className="text-muted mr-2" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search jokes..."
              placeholderTextColor="var(--muted)"
              className="flex-1 text-foreground"
            />
            {searchQuery.length > 0 ? (
              <Pressable onPress={() => setSearchQuery('')}>
                <StyledIonicons name="close-circle" size={18} className="text-muted" />
              </Pressable>
            ) : selectedCount > 0 ? (
              <Pressable onPress={handleConfirm}>
                <Text className="text-primary font-medium">Add ({selectedCount})</Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        <FlashList
          data={jokes}
          renderItem={renderJokeItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 12, paddingBottom: 100 }}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center py-20">
              {isLoading ? (
                <Text className="text-muted">Loading...</Text>
              ) : error ? (
                <Text className="text-danger">Error loading jokes</Text>
              ) : (
                <>
                  <StyledIonicons name="chatbubble-ellipses-outline" size={48} className="text-muted mb-4" />
                  <Text className="text-foreground text-lg font-medium">
                    {searchQuery ? 'No jokes found' : 'No jokes yet'}
                  </Text>
                  <Text className="text-muted text-sm mt-1">
                    {searchQuery ? 'Try a different search' : 'Add jokes first to include in sets'}
                  </Text>
                </>
              )}
            </View>
          }
        />
      </View>
    </KeyboardAvoidingView>
  );
}
