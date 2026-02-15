import { Pressable } from 'react-native';

import { Icon } from '@/components/ui/Icon';

interface JokeDeleteButtonProps {
  onDelete: () => void;
}

export function JokeDeleteButton({ onDelete }: JokeDeleteButtonProps) {
  return (
    <Pressable
      onPress={onDelete}
      className="p-2 rounded-full active:bg-danger/10"
      accessibilityLabel="Delete joke"
      accessibilityRole="button"
    >
      <Icon name="trash-outline" size={22} className="text-danger" />
    </Pressable>
  );
}
