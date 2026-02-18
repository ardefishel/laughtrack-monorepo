import * as Haptics from 'expo-haptics';
import React, { useRef } from 'react';
import { Animated, Pressable, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

import { Icon } from './Icon';

interface SwipeableRowProps {
  children: React.ReactNode;
  onDelete: () => void;
  enabled?: boolean;
  onSwipeStart?: () => void;
  onSwipeOpen?: () => void;
}

export function SwipeableRow({ children, onDelete, enabled = true, onSwipeStart, onSwipeOpen }: SwipeableRowProps) {
  const swipeableRef = useRef<Swipeable>(null);

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-64, -32, 0],
      outputRange: [1, 0.8, 0],
      extrapolate: 'clamp',
    });

    const opacity = dragX.interpolate({
      inputRange: [-64, -32, 0],
      outputRange: [1, 0.5, 0],
      extrapolate: 'clamp',
    });

    const translateX = dragX.interpolate({
      inputRange: [-64, 0],
      outputRange: [0, 20],
      extrapolate: 'clamp',
    });

    return (
      <View className="w-16 justify-center items-center pb-3">
        <Animated.View
          style={{
            opacity,
            transform: [{ scale }, { translateX }],
          }}
        >
          <Pressable
            onPress={() => {
              // Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); // Optional: success haptic on delete
              swipeableRef.current?.close();
              onDelete();
            }}
            accessibilityRole="button"
            accessibilityLabel="Delete"
            className="bg-danger w-12 h-12 rounded-full justify-center items-center shadow-sm"
          >
            <Icon name="trash-outline" size={24} className="text-danger-foreground" />
          </Pressable>
        </Animated.View>
      </View>
    );
  };

  const handleSwipeOpen = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSwipeOpen?.();
  };


  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      rightThreshold={32}
      overshootRight={false}
      onSwipeableWillOpen={onSwipeStart}
      onSwipeableOpen={handleSwipeOpen}
    >
      {children}
    </Swipeable>
  );
}
