import { ArticleCard } from '@/components/learn/ArticleCard';
import { getArticlesByCollection, getCollectionById } from '@/lib/mocks/learn';
import type { LearnArticle } from '@/lib/types/learn';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { Card } from 'heroui-native';
import { useCallback, useLayoutEffect } from 'react';
import { FlashList } from '@shopify/flash-list';
import { Pressable, Text, View } from 'react-native';
import { withUniwind } from 'uniwind';

const StyledIonicons = withUniwind(Ionicons);

export default function LearnArticleListScreen() {
  const { collectionId } = useLocalSearchParams<{ collectionId: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const collection = getCollectionById(collectionId);
  const articles = getArticlesByCollection(collectionId);

  const handleArticlePress = useCallback((article: LearnArticle) => {
    router.push({
      pathname: '/learn/[collectionId]/[articleId]',
      params: { collectionId, articleId: article.id },
    });
  }, [collectionId, router]);

  const renderArticleCard = useCallback(({ item }: { item: LearnArticle }) => (
    <ArticleCard article={item} onPress={handleArticlePress} />
  ), [handleArticlePress]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Pressable onPress={() => { }} className="py-2">
          <Text className="text-xl font-semibold text-foreground" numberOfLines={1}>
            {collection?.title || 'Articles'}
          </Text>
        </Pressable>
      ),
    });
  }, [navigation, collection?.title]);

  if (!collection) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <Text className="text-muted">Collection not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <FlashList
        data={articles}
        renderItem={renderArticleCard}
        keyExtractor={(item) => item.id}
        estimatedItemSize={120}
        contentContainerStyle={{ paddingVertical: 12 }}
        ListHeaderComponent={
          <View className="px-4 pb-4">
            <Card className="p-4" style={{ backgroundColor: `${collection.color}15` }}>
              <View className="flex-row items-center gap-3 mb-2">
                <View
                  className="w-10 h-10 rounded-lg items-center justify-center"
                  style={{ backgroundColor: `${collection.color}25` }}
                >
                  <StyledIonicons name={collection.icon as any} size={20} style={{ color: collection.color }} />
                </View>
                <Text className="text-foreground text-lg flex-1">
                  {collection.title}
                </Text>
                {collection.isPremium && (
                  <View className="flex-row items-center gap-1 px-2 py-1 rounded-full bg-warning/20">
                    <StyledIonicons name="lock-closed" size={12} className="text-warning" />
                    <Text className="text-warning text-xs font-medium">Premium</Text>
                  </View>
                )}
              </View>
              <Text className="text-muted text-sm leading-relaxed">
                {collection.description}
              </Text>
              <View className="flex-row items-center gap-3 mt-3 pt-3 border-t border-default/20">
                <View className="flex-row items-center gap-1">
                  <StyledIonicons name="document-text-outline" size={14} className="text-muted/60" />
                  <Text className="text-xs text-muted/70">
                    {articles.length} {articles.length === 1 ? 'article' : 'articles'}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <StyledIonicons name="time-outline" size={14} className="text-muted/60" />
                  <Text className="text-xs text-muted/70">
                    {collection.totalReadingTime} min total
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        }
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-20">
            <StyledIonicons name="book-outline" size={48} className="text-muted/40 mb-4" />
            <Text className="text-foreground text-lg font-medium">No articles yet</Text>
            <Text className="text-muted text-sm mt-1">Check back soon for new content</Text>
          </View>
        }
      />
    </View>
  );
}

