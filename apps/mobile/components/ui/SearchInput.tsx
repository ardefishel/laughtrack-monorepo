import { Input, TextField } from 'heroui-native';
import { Pressable, View } from 'react-native';

import { Icon } from './Icon';

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
}

export function SearchInput({ value, onChangeText, placeholder = 'Search...', onClear }: SearchInputProps) {
  return (
    <View accessibilityRole="search" className="flex-row items-center gap-3 bg-field-background rounded-xl px-3 py-2.5">
      <Icon name="search-outline" size={20} className="text-muted" />
      <TextField className="flex-1">
        <Input
          accessibilityLabel="Search"
          placeholder={placeholder}
          placeholderTextColor="var(--field-placeholder)"
          value={value}
          onChangeText={onChangeText}
          variant="primary"
          className="text-foreground"
        />
      </TextField>
      {value.length > 0 && onClear && (
        <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={onClear} className="p-1">
          <Icon name="close-circle-outline" size={20} className="text-muted" />
        </Pressable>
      )}
    </View>
  );
}
