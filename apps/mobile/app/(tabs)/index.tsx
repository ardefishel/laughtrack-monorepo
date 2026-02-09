import { AudioRecorderButton } from '@/components/audio/AudioRecorderButton';
import { AnimatedSearchBar } from '@/components/jokes/AnimatedSearchBar';
import { useHeaderTitleWidth } from './_layout';
import { JokeCard } from '@/components/jokes/JokeCard';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { RawJoke, useCreateJoke, useJokesQuery } from '@/hooks/jokes';
import { logVerbose, uiLogger } from '@/lib/loggers';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { Button, Input } from 'heroui-native';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { withUniwind } from 'uniwind';

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
  const { jokes, isLoading, error } = useJokesQuery(searchQuery);
  const { createJoke, isLoading: isCreating } = useCreateJoke();

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

  const renderJokeCard = useCallback(({ item }: { item: RawJoke }) => {
    logVerbose(uiLogger, '[JokesScreen] RENDERING joke:', item.id, 'updated_at:', item.updated_at, 'content:', item.content_html.substring(0, 30));
    const jokeWithStringDates = {
      ...item,
      created_at: new Date(item.created_at).toISOString(),
      updated_at: new Date(item.updated_at).toISOString(),
    };
    return <JokeCard joke={jokeWithStringDates} onPress={handleJokePress as any} />;
  }, [handleJokePress]);

  if (error) {
    return <ErrorState title="Error loading jokes" message={error.message} icon="alert" />;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
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
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center py-20">
              {isLoading ? (
                <LoadingState />
              ) : (
                <>
                  <StyledIonicons name="chatbubble-ellipses-outline" size={48} className="text-muted mb-4" />
                  <Text className="text-foreground text-lg font-medium">
                    {searchQuery ? 'No jokes found' : 'No jokes yet'}
                  </Text>
                  <Text className="text-muted text-sm mt-1">
                    {searchQuery ? 'Try a different search' : 'Add your first joke to get started'}
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
