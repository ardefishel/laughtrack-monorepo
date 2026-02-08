import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Card } from 'heroui-native';
import { Ionicons } from '@expo/vector-icons';
import { withUniwind } from 'uniwind';
import type { LearnCollection } from '@/lib/types/learn';

const StyledIonicons = withUniwind(Ionicons);

interface CollectionCardProps {
  collection: LearnCollection;
  onPress: (collection: LearnCollection) => void;
}

function CollectionCardComponent({ collection, onPress }: CollectionCardProps) {
  const handlePress = () => {
    onPress(collection);
  };

  return (
    <Pressable onPress={handlePress} className="flex-1 min-w-[45%]">
      <Card className="p-4 h-44 justify-between" style={{ backgroundColor: `${collection.color}15` }}>
        <View
          className="w-12 h-12 rounded-xl items-center justify-center"
          style={{ backgroundColor: `${collection.color}25` }}
        >
          <StyledIonicons name={collection.icon as any} size={24} style={{ color: collection.color }} />
        </View>

        <View className="gap-1">
          <Text className="text-foreground text-base font-semibold leading-snug" numberOfLines={2}>
            {collection.title}
          </Text>

          <View className="flex-row items-center gap-2">
            <Text className="text-muted text-xs">
              {collection.articleCount} {collection.articleCount === 1 ? 'article' : 'articles'}
            </Text>
            <Text className="text-muted text-xs">·</Text>
            <Text className="text-muted text-xs">{collection.totalReadingTime} min</Text>
          </View>

          {collection.isPremium && (
            <View className="flex-row items-center gap-1 mt-1">
              <StyledIonicons name="lock-closed" size={12} className="text-warning" />
              <Text className="text-warning text-xs font-medium">Premium</Text>
            </View>
          )}
        </View>
      </Card>
    </Pressable>
  );
}

export const CollectionCard = memo(CollectionCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.collection.id === nextProps.collection.id &&
    prevProps.collection.title === nextProps.collection.title &&
    prevProps.collection.description === nextProps.collection.description &&
    prevProps.collection.icon === nextProps.collection.icon &&
    prevProps.collection.color === nextProps.collection.color &&
    prevProps.collection.articleCount === nextProps.collection.articleCount &&
    prevProps.collection.totalReadingTime === nextProps.collection.totalReadingTime &&
    prevProps.collection.isPremium === nextProps.collection.isPremium
  );
});
