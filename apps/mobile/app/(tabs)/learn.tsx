import { useCallback } from 'react';
import { ScrollView, View } from 'react-native';
import { CollectionCard } from '@/components/learn/CollectionCard';
import { learnCollections } from '@/lib/mockData/learn';
import type { LearnCollection } from '@/lib/types/learn';
import { useRouter } from 'expo-router';

export default function LearnScreen() {
  const router = useRouter();

  const handleCollectionPress = useCallback((collection: LearnCollection) => {
    router.push({ pathname: '/learn/[collectionId]', params: { collectionId: collection.id } });
  }, [router]);

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 16 }}>
      <View className="gap-4">
        <View className="flex-row flex-wrap gap-4 justify-between">
          {learnCollections.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              onPress={handleCollectionPress}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
