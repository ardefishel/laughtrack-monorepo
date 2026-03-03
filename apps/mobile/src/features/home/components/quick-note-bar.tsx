import { Icon } from "@/components/ui/ion-icon";
import { Button, Input, Surface } from "heroui-native";
import { useCallback, useState } from "react";
import { View } from "react-native";

interface QuickNoteBarProps {
  onSubmit?: (content: string) => Promise<void> | void;
  isSubmitting?: boolean;
}

export function QuickNoteBar({ onSubmit, isSubmitting = false }: QuickNoteBarProps) {
  const [content, setContent] = useState("");

  const handleSubmit = useCallback(async () => {
    const trimmed = content.trim();
    if (!trimmed || !onSubmit || isSubmitting) return;

    await onSubmit(trimmed);
    setContent("");
  }, [content, isSubmitting, onSubmit]);

  const canSubmit = content.trim().length > 0 && !isSubmitting;

  return (
    <View className="bg-linear-to-b from-field/0 to-field">
      <Surface variant="secondary" className="flex-row items-center relative rounded-full px-2 mb-4 py-2 mx-4 shadow-sm border border-separator ">
        <Input
          value={content}
          onChangeText={setContent}
          onSubmitEditing={handleSubmit}
          className="flex-1 rounded-full bg-transparent border-accent border-0 text-base ml-1"
          placeholder="What's funny?..."
          variant="secondary"
          returnKeyType="send"
        />
        <Button variant="primary" isIconOnly className="rounded-full w-10 h-10" onPress={handleSubmit} isDisabled={!canSubmit}>
          <Icon name="send" size={20} className="text-field" />
        </Button>
      </Surface>
    </View>
  );
}
