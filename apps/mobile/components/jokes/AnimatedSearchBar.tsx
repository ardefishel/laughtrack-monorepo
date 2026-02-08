import { Input, TextField } from 'heroui-native';
import { useEffect, useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { withUniwind } from 'uniwind';
import { Ionicons } from '@expo/vector-icons';

const StyledIonicons = withUniwind(Ionicons);

interface AnimatedSearchBarProps {
  searchQuery: string;
  onChangeText: (text: string) => void;
}

function AnimatedSearchBarComponent({
  searchQuery,
  onChangeText,
}: AnimatedSearchBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const searchWidth = useSharedValue(44);
  const searchMarginTop = useSharedValue(4);
  const inputRef = useRef<TextInput>(null);

  const toggleSearch = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    searchWidth.value = withTiming(newExpanded ? 280 : 44, { duration: 250 });
    searchMarginTop.value = withTiming(newExpanded ? 8 : 4, { duration: 250 });

    if (newExpanded) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  };

  useEffect(() => {
    if (searchQuery.length > 0 && !isExpanded) {
      setIsExpanded(true);
      searchWidth.value = withTiming(280, { duration: 250 });
      searchMarginTop.value = withTiming(8, { duration: 250 });
    }
  }, [searchQuery.length, isExpanded, searchMarginTop, searchWidth]);

  const handleBlur = () => {
    if (searchQuery.length === 0 && isExpanded) {
      setIsExpanded(false);
      searchWidth.value = withTiming(44, { duration: 250 });
      searchMarginTop.value = withTiming(4, { duration: 250 });
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    width: searchWidth.value,
    marginTop: searchMarginTop.value,
  }));

  return (
    <Animated.View
      style={animatedStyle}
      className="flex-row h-full items-center bg-field-background rounded-full overflow-hidden mb-2"
    >
      {isExpanded ? (
        <View className="flex-1 pr-4 pl-3">
          <TextField className="w-full">
            <Input
              ref={inputRef}
              placeholder="Search jokes..."
              placeholderTextColor="var(--field-placeholder)"
              value={searchQuery}
              onChangeText={onChangeText}
              variant="primary"
              className="text-foreground py-2.5 pl-8"
              onBlur={handleBlur}
            />
            <View className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
              <Pressable onPress={toggleSearch}>
                <StyledIonicons name="search" size={20} className="text-muted" />
              </Pressable>
            </View>
          </TextField>
        </View>
      ) : (
        <Pressable onPress={toggleSearch} className="h-full flex-1 justify-center items-center">
          <StyledIonicons name="search" size={20} className="text-muted" />
        </Pressable>
      )}
    </Animated.View>
  );
}

export function AnimatedSearchBar(props: AnimatedSearchBarProps) {
  return <AnimatedSearchBarComponent {...props} />;
}
