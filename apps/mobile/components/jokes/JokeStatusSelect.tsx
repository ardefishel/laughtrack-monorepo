import { getJokeStatusDotClass } from '@/lib/status';
import { JokeStatus } from '@/lib/types';
import { Ionicons } from '@expo/vector-icons';
import { Select } from 'heroui-native';
import { Pressable, Text, View } from 'react-native';
import { withUniwind } from 'uniwind';

const StyledIonicons = withUniwind(Ionicons);

const STATUS_OPTIONS: { value: JokeStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' }
];

interface JokeStatusSelectProps {
  status: JokeStatus;
  onStatusChange: (status: JokeStatus) => void;
}

export function JokeStatusSelect({ status, onStatusChange }: JokeStatusSelectProps) {
  const handleValueChange = (value: { value: string; label: string } | undefined) => {
    if (value) {
      onStatusChange(value.value as JokeStatus);
    }
  };

  const selectedOption = STATUS_OPTIONS.find((opt) => opt.value === status);

  return (
    <Select
      value={selectedOption}
      onValueChange={handleValueChange}
    >
      <Select.Trigger asChild>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Joke status: ${status}`}
          className="flex-row items-center gap-1 px-3 py-1 rounded-full bg-surface border border-default active:opacity-70"
        >
          <View className={`w-2 h-2 rounded-full ${getJokeStatusDotClass(status)}`} />
          <Text className="text-foreground text-sm font-medium capitalize ml-1">
            {status}
          </Text>
          <StyledIonicons name="chevron-down" size={14} className="text-muted ml-1" />
        </Pressable>
      </Select.Trigger>
      <Select.Portal>
        <Select.Overlay />
        <Select.Content presentation="popover" >
          {STATUS_OPTIONS.map((option) => (
            <Select.Item key={option.value} value={option.value} label={option.label}>
              {({ value }) => (
                <>
                  <View className={`w-2 h-2 rounded-full ${getJokeStatusDotClass(value as JokeStatus)}`} />
                  <Text className="text-foreground text-sm font-medium capitalize ">
                    {option.label}
                  </Text>
                </>
              )}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Portal>
    </Select>
  );
}
