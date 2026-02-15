import React, { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { withUniwind } from 'uniwind';
import { TagChip } from './TagChip';
import { Icon } from '@/components/ui/Icon';
import { normalizeTag } from '@/lib/tagUtils';

const StyledTextInput = withUniwind(TextInput);
const StyledPressable = withUniwind(Pressable);

interface TagEditorProps {
  tags: string[];
  onAddTag: (name: string) => void;
  onRemoveTag: (name: string) => void;
}

export function TagEditor({ tags, onAddTag, onRemoveTag }: TagEditorProps) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = () => {
    const normalized = normalizeTag(inputValue);
    if (normalized && !tags.includes(normalized)) {
      onAddTag(normalized);
    }
    setInputValue('');
  };

  return (
    <View className="px-4 py-2 border-t border-default bg-surface">
      <View className="flex-row flex-wrap">
        {tags.map((tag) => (
          <TagChip key={tag} name={tag} onRemove={() => onRemoveTag(tag)} />
        ))}
      </View>
      <View className="flex-row items-center mt-1">
        <StyledTextInput
          value={inputValue}
          onChangeText={setInputValue}
          onSubmitEditing={handleSubmit}
          placeholder="Add tag..."
          placeholderTextColor="#9ca3af"
          returnKeyType="done"
          autoCapitalize="none"
          autoCorrect={false}
          className="flex-1 text-sm text-foreground py-1.5 px-2 bg-field-background rounded-md"
        />
        {inputValue.trim().length > 0 && (
          <StyledPressable
            onPress={handleSubmit}
            className="ml-2 p-1.5"
            accessibilityRole="button"
            accessibilityLabel="Add tag"
          >
            <Icon name="add-circle" size={22} className="text-accent" />
          </StyledPressable>
        )}
      </View>
    </View>
  );
}
