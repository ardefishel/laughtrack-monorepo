import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Card, useThemeColor } from 'heroui-native';
import { Ionicons } from '@expo/vector-icons';
import { withUniwind } from 'uniwind';
import type { LearnArticle, ArticleDifficulty } from '@/lib/types/learn';

const StyledIonicons = withUniwind(Ionicons);

interface ArticleCardProps {
  article: LearnArticle;
  onPress: (article: LearnArticle) => void;
}

const difficultyConfig: Record<
  ArticleDifficulty,
  { label: string; colorToken: 'success' | 'warning' | 'accent'; icon: string }
> = {
  beginner: { label: 'Beginner', colorToken: 'success', icon: 'leaf' },
  intermediate: { label: 'Intermediate', colorToken: 'warning', icon: 'flame' },
  advanced: { label: 'Advanced', colorToken: 'accent', icon: 'trophy' }
};

function ArticleCardComponent({ article, onPress }: ArticleCardProps) {
  const successColor = useThemeColor('success');
  const warningColor = useThemeColor('warning');
  const accentColor = useThemeColor('accent');
  const colorMap = { success: successColor, warning: warningColor, accent: accentColor } as const;

  const handlePress = () => {
    onPress(article);
  };

  const difficulty = difficultyConfig[article.difficulty];
  const difficultyColor = colorMap[difficulty.colorToken];
  const premiumSectionsCount = article.sections.filter((s) => s.isPremium).length;

  return (
    <Pressable onPress={handlePress} className="mx-4 mb-3">
      <Card className="p-4 bg-surface">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1 gap-2">
            <View className="flex-row items-center gap-2">
              <View
                className="px-2 py-0.5 rounded-full flex-row items-center gap-1"
                style={{ backgroundColor: `${difficultyColor}20` }}
              >
                <StyledIonicons name={difficulty.icon as any} size={12} style={{ color: difficultyColor }} />
                <Text className="text-xs font-medium" style={{ color: difficultyColor }}>
                  {difficulty.label}
                </Text>
              </View>

              {article.isPremium && (
                <View className="flex-row items-center gap-1">
                  <StyledIonicons name="lock-closed" size={12} className="text-warning" />
                  <Text className="text-warning text-xs font-medium">Premium</Text>
                </View>
              )}
            </View>

            <Text className="text-foreground text-lg font-semibold leading-snug" numberOfLines={2}>
              {article.title}
            </Text>

            <Text className="text-muted text-sm leading-relaxed" numberOfLines={2}>
              {article.description}
            </Text>

            <View className="flex-row items-center gap-3 mt-2">
              <View className="flex-row items-center gap-1">
                <StyledIonicons name="time-outline" size={14} className="text-muted/60" />
                <Text className="text-xs text-muted/70">{article.readingTime} min read</Text>
              </View>

              {article.author && (
                <View className="flex-row items-center gap-1">
                  <StyledIonicons name="person-outline" size={14} className="text-muted/60" />
                  <Text className="text-xs text-muted/70" numberOfLines={1}>
                    {article.author}
                  </Text>
                </View>
              )}

              {premiumSectionsCount > 0 && article.isPremium && (
                <View className="flex-row items-center gap-1">
                  <StyledIonicons name="star-outline" size={14} className="text-warning/60" />
                  <Text className="text-xs text-warning/70">{premiumSectionsCount} premium sections</Text>
                </View>
              )}
            </View>
          </View>

          <View className="items-end">
            <StyledIonicons name="chevron-forward" size={20} className="text-muted/40" />
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

export const ArticleCard = memo(ArticleCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.article.id === nextProps.article.id &&
    prevProps.article.title === nextProps.article.title &&
    prevProps.article.description === nextProps.article.description &&
    prevProps.article.difficulty === nextProps.article.difficulty &&
    prevProps.article.isPremium === nextProps.article.isPremium &&
    prevProps.article.readingTime === nextProps.article.readingTime &&
    prevProps.article.author === nextProps.article.author &&
    prevProps.article.sections.length === nextProps.article.sections.length
  );
});
