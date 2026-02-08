import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { withUniwind } from 'uniwind';

const StyledIonicons = withUniwind(Ionicons);

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
      <StyledIonicons name="trash-outline" size={22} className="text-danger" />
    </Pressable>
  );
}
