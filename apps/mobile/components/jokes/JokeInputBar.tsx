import { AudioRecorderButton } from '@/components/audio/AudioRecorderButton';
import { Ionicons } from '@expo/vector-icons';
import { Input, TextField } from 'heroui-native';
import { Pressable, View } from 'react-native';
import { withUniwind } from 'uniwind';

const StyledIonicons = withUniwind(Ionicons);

interface JokeInputBarProps {
  newJokeText: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  isCreating: boolean;
  isQuickCapture: boolean;
  onToggleQuickCapture: () => void;
}

function JokeInputBarComponent({
  newJokeText,
  onChangeText,
  onSubmit,
  isCreating,
  isQuickCapture,
  onToggleQuickCapture,
}: JokeInputBarProps) {
  return (
    <View className="flex-row items-end gap-2">
      <TextField className="flex-1">
        <Input
          placeholder="Add a new joke..."
          placeholderTextColor="var(--muted)"
          value={newJokeText}
          onChangeText={onChangeText}
          className="text-foreground min-h-[44px] max-h-[100px] py-2.5 pl-8"
          multiline
          maxLength={500}
          onSubmitEditing={onSubmit}
          accessibilityLabel="New joke text"
        />
        <View className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
          <Pressable
            onPress={onToggleQuickCapture}
            accessibilityRole="button"
            accessibilityLabel={isQuickCapture ? 'Disable quick capture' : 'Enable quick capture'}
          >
            <StyledIonicons
              name={isQuickCapture ? 'flash' : 'flash-outline'}
              size={16}
              className={isQuickCapture ? 'text-warning/80' : 'text-muted/40'}
            />
          </Pressable>
        </View>
      </TextField>
      <AudioRecorderButton />
      <Pressable
        onPress={onSubmit}
        disabled={!newJokeText.trim() || isCreating}
        className={`p-2.5 mb-0.5 rounded-lg ${newJokeText.trim() && !isCreating ? 'bg-accent' : 'opacity-40'}`}
        accessibilityRole="button"
        accessibilityLabel="Submit joke"
        accessibilityState={{ disabled: !newJokeText.trim() || isCreating }}
      >
        {isCreating ? (
          <StyledIonicons name="refresh-outline" size={18} className="text-accent animate-spin" />
        ) : (
          <StyledIonicons
            name="send-outline"
            size={18}
            className={newJokeText.trim() ? 'text-accent' : 'text-muted'}
          />
        )}
      </Pressable>
    </View>
  );
}

export function JokeInputBar(props: JokeInputBarProps) {
  return <JokeInputBarComponent {...props} />;
}
