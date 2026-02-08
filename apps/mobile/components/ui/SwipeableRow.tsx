import React, { useRef } from 'react';
import { Text, Pressable, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { withUniwind } from 'uniwind';

const StyledIonicons = withUniwind(Ionicons);

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
      inputRange: [-80, 0],
      outputRange: [1, 0.5],
      extrapolate: 'clamp',
    });

    const opacity = dragX.interpolate({
      inputRange: [-80, -40, 0],
      outputRange: [1, 0.5, 0],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={{
          opacity,
          transform: [{ scale }],
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Pressable
          onPress={() => {
            swipeableRef.current?.close();
            onDelete();
          }}
          className="bg-danger h-full justify-center items-center px-6"
        >
          <StyledIonicons name="trash-outline" size={24} className="text-danger-foreground" />
          <Text className="text-danger-foreground text-xs mt-1">Delete</Text>
        </Pressable>
      </Animated.View>
    );
  };

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      rightThreshold={40}
      overshootRight={false}
      onSwipeableWillOpen={onSwipeStart}
      onSwipeableOpen={onSwipeOpen}
    >
      {children}
    </Swipeable>
  );
}
