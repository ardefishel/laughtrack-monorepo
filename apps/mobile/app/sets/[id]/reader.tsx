import { useJokeSet } from '@/hooks/sets';
import { useJokeSetItemsWithHtml } from '@/hooks/useJokeSetItemsWithHtml';
import { RENDER_HTML_TAGS_STYLES } from '@/constants/htmlStyles';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import RenderHtml, { MixedStyleDeclaration } from 'react-native-render-html';
import { useResolveClassNames, withUniwind } from 'uniwind';

const StyledIonicons = withUniwind(Ionicons);

export default function ReaderScreen() {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const setId = id as string;

  const { jokeSet, isLoading: setLoading } = useJokeSet(setId);
  const { combinedHtml, isLoading: contentLoading, error } = useJokeSetItemsWithHtml(setId);
  const baseStyle = useResolveClassNames('text-foreground') as MixedStyleDeclaration;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Text className="text-lg font-semibold text-foreground">
          {jokeSet?.title || 'Untitled Set'}
        </Text>
      ),
      headerLeft: () => (
        <Pressable onPress={() => navigation.goBack()} className="p-2 -m-2">
          <StyledIonicons name="chevron-back" size={24} className="text-foreground" />
        </Pressable>
      ),
    });
  }, [navigation, jokeSet?.title]);

  if (setLoading || contentLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-muted">Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-danger">Error loading content</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4">
        <RenderHtml
          source={{ html: combinedHtml }}
          contentWidth={340}
          baseStyle={baseStyle}
          tagsStyles={RENDER_HTML_TAGS_STYLES}
        />
      </View>
    </ScrollView>
  );
}
