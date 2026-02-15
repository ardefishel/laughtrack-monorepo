import { getArticleById, getCollectionById } from '@/lib/mocks/learn';
import type { ArticleSection } from '@/lib/types/learn';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { Card } from 'heroui-native';
import { useLayoutEffect, useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Icon } from '@/components/ui/Icon';

const difficultyConfig = {
  beginner: { label: 'Beginner', color: '#10B981', icon: 'leaf' },
  intermediate: { label: 'Intermediate', color: '#F59E0B', icon: 'flame' },
  advanced: { label: 'Advanced', color: '#8B5CF6', icon: 'trophy' },
};

function PremiumSectionOverlay() {
  return (
    <View className="py-8 px-4">
      <Card className="p-6 items-center border-2 border-warning/30" style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)' }}>
        <Icon name="lock-closed" size={48} className="text-warning mb-4" />
        <Text className="text-foreground text-lg font-bold text-center mb-2">
          Premium Content
        </Text>
        <Text className="text-muted text-sm text-center mb-4">
          Subscribe to unlock this section and access all premium learning materials
        </Text>
        <View className="flex-row items-center gap-2 px-4 py-2 rounded-lg bg-warning">
          <Icon name="sparkles" size={16} className="text-warning-foreground" />
          <Text className="text-warning-foreground font-semibold">Unlock Premium</Text>
        </View>
      </Card>
    </View>
  );
}

function SectionContent({ section }: { section: ArticleSection }) {
  const lines = section.content.split('\n\n');

  return (
    <View className="gap-4">
      {lines.map((line, index) => {
        if (line.startsWith('**') && line.endsWith('**')) {
          return (
            <Text key={index} className="text-foreground font-semibold text-base">
              {line.replace(/\*\*/g, '')}
            </Text>
          );
        }
        if (line.startsWith('- ')) {
          const items = line.split('\n').filter((l) => l.startsWith('- '));
          return (
            <View key={index} className="gap-2 ml-4">
              {items.map((item, itemIndex) => (
                <View key={itemIndex} className="flex-row gap-2">
                  <Text className="text-muted">•</Text>
                  <Text key={itemIndex} className="text-muted flex-1">
                    {item.substring(2)}
                  </Text>
                </View>
              ))}
            </View>
          );
        }
        return (
          <Text key={index} className="text-muted leading-relaxed">
            {line}
          </Text>
        );
      })}
    </View>
  );
}

export default function LearnArticleDetailScreen() {
  const { collectionId, articleId } = useLocalSearchParams<{ collectionId: string; articleId: string }>();
  const navigation = useNavigation();
  const article = useMemo(() => getArticleById(articleId), [articleId]);
  const collection = useMemo(() => getCollectionById(collectionId), [collectionId]);

  const difficulty = article ? difficultyConfig[article.difficulty] : null;

  const freeSections = article?.sections.filter((s) => !s.isPremium) || [];
  const premiumSections = article?.sections.filter((s) => s.isPremium) || [];

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Pressable onPress={() => { }} className="py-2">
          <Text className="text-xl font-semibold text-foreground" numberOfLines={1}>
            {article?.title || 'Article'}
          </Text>
        </Pressable>
      ),
    });
  }, [navigation, article?.title]);

  if (!article || !collection) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <Text className="text-muted">Article not found</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4 gap-6">
        <Card className="p-4" style={{ backgroundColor: `${collection.color}15` }}>
          <View className="flex-row items-center gap-2 mb-2">
            <View
              className="px-2 py-0.5 rounded-full flex-row items-center gap-1"
              style={{ backgroundColor: `${difficulty?.color}20` }}
            >
              <Icon name={difficulty?.icon as any} size={12} style={{ color: difficulty?.color }} />
              <Text className="text-xs font-medium" style={{ color: difficulty?.color }}>
                {difficulty?.label}
              </Text>
            </View>
            {article.isPremium && (
              <View className="flex-row items-center gap-1">
                <Icon name="lock-closed" size={12} className="text-warning" />
                <Text className="text-warning text-xs font-medium">Premium</Text>
              </View>
            )}
          </View>

          <Text className="text-muted leading-relaxed mb-4">{article.description}</Text>

          <View className="flex-row items-center gap-4 pt-3 border-t border-default/20">
            <View className="flex-row items-center gap-1">
              <Icon name="time-outline" size={14} className="text-muted/60" />
              <Text className="text-xs text-muted/70">{article.readingTime} min read</Text>
            </View>
            {article.author && (
              <View className="flex-row items-center gap-1">
                <Icon name="person-outline" size={14} className="text-muted/60" />
                <Text className="text-xs text-muted/70">{article.author}</Text>
              </View>
            )}
            <View className="flex-row items-center gap-1">
              <Icon name="layers-outline" size={14} className="text-muted/60" />
              <Text className="text-xs text-muted/70">{article.sections.length} sections</Text>
            </View>
          </View>
        </Card>

        {freeSections.length > 0 && (
          <View className="gap-4">
            {freeSections.map((section, index) => (
              <Card key={section.id} className="p-4">
                <View className="flex-row items-center gap-2 mb-3">
                  <View className="w-8 h-8 rounded-full bg-accent/10 items-center justify-center">
                    <Text className="text-accent font-bold">{index + 1}</Text>
                  </View>
                  <Text className="text-foreground font-semibold text-lg flex-1">
                    {section.title}
                  </Text>
                </View>
                <SectionContent section={section} />
              </Card>
            ))}
          </View>
        )}

        {premiumSections.length > 0 && (
          <View>
            <View className="flex-row items-center gap-2 px-1 mb-2">
              <Icon name="star" size={16} className="text-warning" />
              <Text className="text-warning font-semibold">Premium Sections</Text>
            </View>
            {premiumSections.map((section, index) => (
              <Card key={section.id} className="overflow-hidden">
                <View className="flex-row items-center gap-2 p-4 border-b border-warning/20">
                  <View className="w-8 h-8 rounded-full bg-warning/10 items-center justify-center">
                    <Text className="text-warning font-bold">{freeSections.length + index + 1}</Text>
                  </View>
                  <Text className="text-foreground font-semibold text-lg flex-1">
                    {section.title}
                  </Text>
                  <Icon name="lock-closed" size={16} className="text-warning" />
                </View>
                <PremiumSectionOverlay />
              </Card>
            ))}
          </View>
        )}

        <View className="h-20" />
      </View>
    </ScrollView>
  );
}
