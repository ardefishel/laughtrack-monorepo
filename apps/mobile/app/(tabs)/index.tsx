import { AudioRecorderButton } from '@/components/audio/AudioRecorderButton';
import { AnimatedSearchBar } from '@/components/jokes/AnimatedSearchBar';
import { JokeCard } from '@/components/jokes/JokeCard';
import { TagFilterBar } from '@/components/jokes/TagFilterBar';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { SwipeableRow } from '@/components/ui/SwipeableRow';
import { RawJoke, useCreateJoke, useDeleteJoke, useJokesQuery } from '@/hooks/jokes';
import { useAllTags } from '@/hooks/jokes/useAllTags';
import { logVerbose, uiLogger } from '@/lib/loggers';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { Button, Input } from 'heroui-native';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { withUniwind } from 'uniwind';
import { useHeaderTitleWidth } from './_layout';

const StyledIonicons = withUniwind(Ionicons);

export default function JokesScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const headerTitleWidth = useHeaderTitleWidth();
  const { scrollToTop } = useLocalSearchParams<{ scrollToTop?: string }>();
  const flashListRef = useRef<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newJokeText, setNewJokeText] = useState('');
  const [shouldScrollToTop, setShouldScrollToTop] = useState(false);
  const [isQuickCapture, setIsQuickCapture] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { tags: allTags } = useAllTags();
  const { jokes, isLoading, error, refetch } = useJokesQuery(searchQuery, selectedTags);
  const { createJoke, isLoading: isCreating } = useCreateJoke();
  const { deleteJoke } = useDeleteJoke();

  const hasActiveFilters = searchQuery.length > 0 || selectedTags.length > 0;

  const handleToggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const handleClearTags = useCallback(() => {
    setSelectedTags([]);
  }, []);


  useEffect(() => {
    logVerbose(uiLogger, '[JokesScreen] MOUNTED, jokes count:', jokes.length);
    return () => {
      logVerbose(uiLogger, '[JokesScreen] UNMOUNTED');
    };
  }, [jokes.length]);

  useEffect(() => {
    logVerbose(uiLogger, '[JokesScreen] JOKES DATA CHANGED, count:', jokes.length);
    if (shouldScrollToTop && jokes.length > 0) {
      flashListRef.current?.scrollToOffset({ offset: 0, animated: true });
      setShouldScrollToTop(false);
    }
  }, [jokes, shouldScrollToTop]);

  useEffect(() => {
    if (scrollToTop === 'true' && jokes.length > 0) {
      logVerbose(uiLogger, '[JokesScreen] Scroll to top triggered by navigation param');
      flashListRef.current?.scrollToOffset({ offset: 0, animated: true });
      router.setParams({ scrollToTop: undefined });
    }
  }, [scrollToTop, jokes.length, router]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleJokePress = useCallback((joke: RawJoke) => {
    logVerbose(uiLogger, '[JokesScreen] CLICKED joke:', joke.id, 'content:', joke.content_html.substring(0, 50), 'status:', joke.status);
    router.push({ pathname: '/jokes/[id]', params: { id: joke.id } });
  }, [router]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <AnimatedSearchBar
          searchQuery={searchQuery}
          onChangeText={handleSearch}
          headerTitleWidth={headerTitleWidth}
        />
      ),
    });
  }, [navigation, searchQuery, handleSearch, headerTitleWidth]);

  const handleCreateJoke = async () => {
    if (!newJokeText.trim() || isCreating) return;

    const trimmedContent = newJokeText.trim();
    const created = await createJoke({ content_html: trimmedContent });

    if (created) {
      if (isQuickCapture) {
        setNewJokeText('');
        setShouldScrollToTop(true);
      } else {
        router.push({ pathname: '/jokes/[id]', params: { id: created.id } });
      }
    }
  };

  const handleDeleteJoke = useCallback(
    async (joke: RawJoke) => {
      uiLogger.info('[JokesScreen] USER ACTION: Delete button pressed for joke', {
        id: joke.id,
        content: joke.content_html.substring(0, 50),
        status: joke.status,
        createdAt: joke.created_at,
      });

      uiLogger.debug('[JokesScreen] Initiating database delete operation for joke:', joke.id);
      const startTime = Date.now();

      try {
        const success = await deleteJoke(joke.id);
        const duration = Date.now() - startTime;

        if (success) {
          uiLogger.info('[JokesScreen] Joke deleted successfully:', {
            id: joke.id,
            content: joke.content_html.substring(0, 50),
            duration: `${duration}ms`,
          });
          uiLogger.debug('[JokesScreen] Triggering refetch after successful deletion');
          refetch();
        } else {
          uiLogger.error('[JokesScreen] Delete operation returned false for joke:', {
            id: joke.id,
            content: joke.content_html.substring(0, 50),
            duration: `${duration}ms`,
          });
        }
      } catch (err) {
        const duration = Date.now() - startTime;
        uiLogger.error('[JokesScreen] Exception during joke deletion:', {
          id: joke.id,
          content: joke.content_html.substring(0, 50),
          error: err instanceof Error ? err.message : 'Unknown error',
          stack: err instanceof Error ? err.stack : undefined,
          duration: `${duration}ms`,
        });
      }
    },
    [deleteJoke, refetch]
  );

  const renderJokeCard = useCallback(({ item }: { item: RawJoke }) => {
    logVerbose(uiLogger, '[JokesScreen] RENDERING joke:', item.id, 'updated_at:', item.updated_at, 'content:', item.content_html.substring(0, 30));
    const jokeWithStringDates = {
      ...item,
      created_at: new Date(item.created_at).toISOString(),
      updated_at: new Date(item.updated_at).toISOString(),
    };
    return (
      <SwipeableRow
        onDelete={() => handleDeleteJoke(item)}
        onSwipeStart={() => logVerbose(uiLogger, '[JokesScreen] Swipe gesture started for joke:', item.id)}
        onSwipeOpen={() => logVerbose(uiLogger, '[JokesScreen] Swipe gesture opened for joke:', item.id)}
      >
        <JokeCard joke={jokeWithStringDates} onPress={handleJokePress as any} />
      </SwipeableRow>
    );
  }, [handleJokePress, handleDeleteJoke]);

  if (error) {
    return <ErrorState title="Error loading jokes" message={error.message} icon="alert" />;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.select({ ios: 120, android: 20 })}
      className="flex-1 bg-background"
    >
      <View className="flex-1 bg-background">
        <FlashList
          ref={flashListRef as any}
          data={jokes}
          renderItem={renderJokeCard}
          keyExtractor={(item) => item.id}
          extraData={jokes}
          contentContainerStyle={{ paddingVertical: 12, paddingBottom: 100 }}
          ListHeaderComponent={
            allTags.length > 0 ? (
              <TagFilterBar
                tags={allTags}
                selectedTags={selectedTags}
                onToggleTag={handleToggleTag}
                onClearAll={handleClearTags}
              />
            ) : null
          }
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center py-20">
              {isLoading ? (
                <LoadingState />
              ) : (
                <>
                  <StyledIonicons name="chatbubble-ellipses-outline" size={48} className="text-muted mb-4" />
                  <Text className="text-foreground text-lg font-medium">
                    {hasActiveFilters ? 'No jokes found' : 'No jokes yet'}
                  </Text>
                  <Text className="text-muted text-sm mt-1">
                    {hasActiveFilters ? 'Try a different search or filter' : 'Add your first joke to get started'}
                  </Text>
                </>
              )}
            </View>
          }
        />

        <View className="absolute bottom-0 left-0 right-0 bg-background px-4 py-3">
          <View className="flex-row items-center relative">
            <Button isIconOnly variant='ghost' className='absolute z-20' onPress={() => setIsQuickCapture(!isQuickCapture)}>
              <StyledIonicons name={isQuickCapture ? 'flash' : 'flash-outline'} size={18} className={isQuickCapture ? 'text-warning/80' : 'text-muted/40'} />
            </Button>
            <Input
              placeholder="Add a new joke..."
              placeholderTextColor="var(--muted)"
              value={newJokeText}
              onChangeText={setNewJokeText}
              className='flex-1 pl-10'
              multiline
              maxLength={500}
              onSubmitEditing={handleCreateJoke}
            />
            <AudioRecorderButton />
            <Button
              isIconOnly
              variant='ghost'
              onPress={handleCreateJoke}
              isDisabled={!newJokeText.trim() || isCreating}
            >
              {isCreating ? (
                <StyledIonicons name="refresh-outline" size={18} className="text-accent animate-spin" />
              ) : (
                <StyledIonicons
                  name="send-outline"
                  size={18}
                  className={newJokeText.trim() ? 'text-accent' : 'text-muted'}
                />
              )}
            </Button>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView >
  );
}
