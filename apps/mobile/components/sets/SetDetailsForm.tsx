import { Ionicons } from '@expo/vector-icons';
import { Button, Input, Select, TextField } from 'heroui-native';
import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { withUniwind } from 'uniwind';

import { getJokeSetStatusDotClass } from '@/lib/status';
import type { JokeSetStatus } from '@/lib/types';

const StyledIonicons = withUniwind(Ionicons);

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'performed', label: 'Performed' },
  { value: 'bombed', label: 'Bombed' },
  { value: 'killed', label: 'Killed' }
];

interface SetDetailsFormProps {
  title: string;
  description: string;
  duration: string;
  place: string;
  status: JokeSetStatus;
  onChangeTitle: (value: string) => void;
  onChangeDescription: (value: string) => void;
  onChangeDuration: (value: string) => void;
  onChangePlace: (value: string) => void;
  onChangeStatus: (value: JokeSetStatus) => void;
  primaryActionLabel: string;
  secondaryActionLabel: string;
  onPrimaryAction: () => void;
  onSecondaryAction: () => void;
  isPrimaryActionDisabled?: boolean;
}

export function SetDetailsForm({
  title,
  description,
  duration,
  place,
  status,
  onChangeTitle,
  onChangeDescription,
  onChangeDuration,
  onChangePlace,
  onChangeStatus,
  primaryActionLabel,
  secondaryActionLabel,
  onPrimaryAction,
  onSecondaryAction,
  isPrimaryActionDisabled = false,
}: SetDetailsFormProps) {
  const selectedStatus = useMemo(() => {
    return STATUS_OPTIONS.find((opt) => opt.value === status);
  }, [status]);

  return (
    <View className="flex-1 bg-background px-4 pt-6">
      <Text className="text-2xl font-bold text-foreground mb-6">Set Details</Text>

      <TextField className="w-full mb-3">
        <Input
          placeholder="Title"
          placeholderTextColor="var(--muted)"
          value={title}
          onChangeText={onChangeTitle}
          className="text-foreground py-3"
        />
      </TextField>

      <TextField className="w-full mb-3">
        <Input
          placeholder="Description"
          placeholderTextColor="var(--muted)"
          value={description}
          onChangeText={onChangeDescription}
          className="text-foreground min-h-[80px] py-3"
          multiline
          textAlignVertical="top"
        />
      </TextField>

      <View className="flex-row gap-3 mb-3">
        <TextField className="flex-1">
          <Input
            placeholder="Duration"
            placeholderTextColor="var(--muted)"
            value={duration}
            onChangeText={onChangeDuration}
            className="text-foreground py-3"
            keyboardType="numeric"
          />
        </TextField>

        <Select
          value={selectedStatus}
          onValueChange={(value) => value && onChangeStatus(value.value as JokeSetStatus)}
        >
          <Select.Trigger asChild>
            <Pressable className="flex-row items-center justify-between px-3 py-3 min-w-[140px] border-b border-default">
              <View className="flex-row items-center gap-2">
                <View className={`w-2 h-2 rounded-full ${getJokeSetStatusDotClass(status)}`} />
                <Text className="text-foreground text-base font-medium capitalize">
                  {status}
                </Text>
              </View>
              <StyledIonicons name="chevron-down" size={16} className="text-muted" />
            </Pressable>
          </Select.Trigger>
          <Select.Portal>
            <Select.Overlay />
            <Select.Content presentation="popover">
              {STATUS_OPTIONS.map((option) => (
                <Select.Item key={option.value} value={option.value} label={option.label}>
                  {() => (
                    <View className="flex-row items-center gap-2 py-2">
                      <View className={`w-2 h-2 rounded-full ${getJokeSetStatusDotClass(option.value as JokeSetStatus)}`} />
                      <Text className="text-foreground text-base font-medium capitalize">
                        {option.label}
                      </Text>
                    </View>
                  )}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Portal>
        </Select>
      </View>

      <TextField className="w-full mb-3">
        <Input
          placeholder="Place"
          placeholderTextColor="var(--muted)"
          value={place}
          onChangeText={onChangePlace}
          className="text-foreground py-3"
        />
      </TextField>

      <View className="flex-row gap-3 mt-6">
        <Button variant="secondary" onPress={onSecondaryAction} className="flex-1">
          <Button.Label>{secondaryActionLabel}</Button.Label>
        </Button>
        <Button
          variant="primary"
          onPress={onPrimaryAction}
          isDisabled={isPrimaryActionDisabled}
          className="flex-1"
        >
          <Button.Label>{primaryActionLabel}</Button.Label>
        </Button>
      </View>
    </View>
  );
}
