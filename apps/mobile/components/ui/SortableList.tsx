import React, { ReactNode } from 'react';
import DraggableFlatList, {
  RenderItemParams,
  DragEndParams,
} from 'react-native-draggable-flatlist';
import * as Haptics from 'expo-haptics';

export interface SortableListProps<T extends { id: string }> {
  data: T[];
  renderItem: (params: RenderItemParams<T>) => ReactNode;
  onDragBegin?: () => void;
  onDragEnd: (params: DragEndParams<T>) => void;
  keyExtractor: (item: T) => string;
  ListHeaderComponent?: React.ComponentType | React.ReactElement | null;
  ListFooterComponent?: React.ComponentType | React.ReactElement | null;
  renderPlaceholder?: () => ReactNode;
  activationDistance?: number;
  autoscrollSpeed?: number;
}

export function SortableList<T extends { id: string }>({
  data,
  renderItem,
  onDragBegin,
  onDragEnd,
  keyExtractor,
  ListHeaderComponent,
  ListFooterComponent,
  renderPlaceholder,
  activationDistance = 8,
  autoscrollSpeed = 150,
}: SortableListProps<T>) {
  const handleDragBegin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onDragBegin?.();
  };

  const handleDragEnd = (params: DragEndParams<T>) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDragEnd(params);
  };

  return (
    <DraggableFlatList
      data={data}
      onDragBegin={handleDragBegin}
      onDragEnd={handleDragEnd}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      renderPlaceholder={renderPlaceholder}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      activationDistance={activationDistance}
      dragItemOverflow={false}
      autoscrollSpeed={autoscrollSpeed}
      animationConfig={{
        damping: 15,
        mass: 0.4,
        stiffness: 200,
        overshootClamping: true,
      }}
    />
  );
}
