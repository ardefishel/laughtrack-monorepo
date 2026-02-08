import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { withUniwind } from 'uniwind';
import { SetCard } from '@/components/sets';
import { AnimatedSearchBar } from '@/components/jokes/AnimatedSearchBar';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { SwipeableRow } from '@/components/ui/SwipeableRow';
import { useJokeSetsQuery } from '@/hooks/sets/useJokeSetsQuery';
import { useDeleteJokeSet } from '@/hooks/sets/useDeleteJokeSet';
import type { RawJokeSet } from '@/lib/types';
import { logVerbose, uiLogger } from '@/lib/loggers';

const StyledIonicons = withUniwind(Ionicons);

export default function SetsScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const { jokeSets, isLoading, error, refetch } = useJokeSetsQuery(searchQuery);
  const { deleteJokeSet } = useDeleteJokeSet();
  const listRef = useRef<any>(null);
  const prevSetCountRef = useRef(jokeSets.length);
  const renderCount = useRef(0);
  const focusCount = useRef(0);
  renderCount.current++;
  logVerbose(uiLogger, `[SetsScreen] RENDER #${renderCount.current}, jokeSets count: ${jokeSets.length}, isLoading: ${isLoading}`);

  useFocusEffect(
    useCallback(() => {
      focusCount.current++;
      logVerbose(uiLogger, `[SetsScreen] FOCUS EFFECT #${focusCount.current} - calling refetch`);
      refetch();
      
      const currentCount = jokeSets.length;
      const prevCount = prevSetCountRef.current;
      logVerbose(uiLogger, `[SetsScreen] FOCUS - prev count: ${prevCount}, current count: ${currentCount}`);
      
      if (currentCount > prevCount) {
        logVerbose(uiLogger, '[SetsScreen] New set detected, scrolling to top');
        listRef.current?.scrollToOffset({ offset: 0, animated: true });
      }
      
      prevSetCountRef.current = currentCount;
      
      return () => {
        logVerbose(uiLogger, `[SetsScreen] FOCUS EFFECT #${focusCount.current} - cleanup (unfocused)`);
      };
    }, [refetch, jokeSets.length])
  );

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <AnimatedSearchBar
          searchQuery={searchQuery}
          onChangeText={handleSearch}
        />
      ),
    });
  }, [navigation, searchQuery, handleSearch]);

  const handleSetPress = (jokeSet: RawJokeSet) => {
    router.push({ pathname: '/sets/[id]', params: { id: jokeSet.id } });
  };

  const handleAddPress = () => {
    router.push('/sets/new');
  };

  const handleDeleteSet = useCallback(
    async (jokeSet: RawJokeSet) => {
      uiLogger.info('[SetsScreen] USER ACTION: Delete button pressed for joke set', {
        id: jokeSet.id,
        title: jokeSet.title,
        status: jokeSet.status,
        createdAt: jokeSet.created_at,
      });

      uiLogger.debug('[SetsScreen] Initiating database delete operation for joke set:', jokeSet.id);
      const startTime = Date.now();
      
      try {
        const success = await deleteJokeSet(jokeSet.id);
        const duration = Date.now() - startTime;

        if (success) {
          uiLogger.info('[SetsScreen] Joke set deleted successfully:', {
            id: jokeSet.id,
            title: jokeSet.title,
            duration: `${duration}ms`,
          });
          uiLogger.debug('[SetsScreen] Triggering refetch after successful deletion');
          refetch();
        } else {
          uiLogger.error('[SetsScreen] Delete operation returned false for joke set:', {
            id: jokeSet.id,
            title: jokeSet.title,
            duration: `${duration}ms`,
          });
        }
      } catch (err) {
        const duration = Date.now() - startTime;
        uiLogger.error('[SetsScreen] Exception during joke set deletion:', {
          id: jokeSet.id,
          title: jokeSet.title,
          error: err instanceof Error ? err.message : 'Unknown error',
          stack: err instanceof Error ? err.stack : undefined,
          duration: `${duration}ms`,
        });
      }
    },
    [deleteJokeSet, refetch]
  );

  const renderSetCard = ({ item }: { item: RawJokeSet }) => {
    logVerbose(uiLogger, `[SetsScreen] Rendering SetCard for:`, item.id, item.title);
    return (
      <SwipeableRow
        onDelete={() => handleDeleteSet(item)}
        onSwipeStart={() => logVerbose(uiLogger, '[SetsScreen] Swipe gesture started for joke set:', item.id)}
        onSwipeOpen={() => logVerbose(uiLogger, '[SetsScreen] Swipe gesture opened for joke set:', item.id)}
      >
        <SetCard jokeSet={item} onPress={handleSetPress} />
      </SwipeableRow>
    );
  };

  if (error) {
    return <ErrorState title="Error loading sets" message={error.message} icon="alert" />;
  }

  return (
    <View className="flex-1 bg-background">
      <FlashList
        ref={listRef}
        data={jokeSets}
        renderItem={renderSetCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 12, paddingBottom: 100 }}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-20">
            {isLoading ? (
              <LoadingState />
            ) : (
              <>
                  {(() => {
                    logVerbose(uiLogger, '[SetsScreen] ListEmptyComponent rendered - jokeSets empty');
                    return null;
                  })()}
                <StyledIonicons name="albums-outline" size={48} className="text-muted mb-4" />
                <Text className="text-foreground text-lg font-medium">
                  {searchQuery ? 'No sets found' : 'No sets yet'}
                </Text>
                <Text className="text-muted text-sm mt-1">
                  {searchQuery ? 'Try a different search' : 'Create your first set to get started'}
                </Text>
              </>
            )}
          </View>
        }
      />

      <Pressable
        onPress={handleAddPress}
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-primary items-center justify-center"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 5
        }}
      >
        <StyledIonicons name="add" size={28} className="text-accent" />
      </Pressable>
    </View>
  );
}
