import { SetDetailsForm } from '@/components/sets';
import { useSetEditing } from '@/context/SetEditingContext';
import type { JokeSetStatus } from '@laughtrack/shared-types';
import { useNavigation, useRouter } from 'expo-router';
import { useCallback, useLayoutEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, Text } from 'react-native';

import { Icon } from '@/components/ui/Icon';

export default function EditSetDetailScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { setDetails, updateSetDetails } = useSetEditing();

  const [title, setTitle] = useState(setDetails.title);
  const [description, setDescription] = useState(setDetails.description);
  const [duration, setDuration] = useState(setDetails.duration);
  const [place, setPlace] = useState(setDetails.place);
  const [status, setStatus] = useState<JokeSetStatus>(setDetails.status);

  const handleSave = useCallback(() => {
    updateSetDetails({
      title: title.trim() || "Untitled Set",
      description: description || "",
      duration: duration || "",
      place: place || "",
      status,
    });
    router.dismiss();
  }, [title, description, duration, place, status, updateSetDetails, router]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Pressable
          onPress={() => router.dismiss()}
          className="p-2 -m-2 min-h-[44px] min-w-[44px] justify-center items-center"
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Icon name="chevron-back" size={24} className="text-foreground" />
        </Pressable>
      ),
      headerTitle: "Set Details",
      headerRight: () => (
        <Pressable
          onPress={handleSave}
          className="px-3 py-1.5 min-h-[44px] min-w-[44px] justify-center items-center"
          accessibilityRole="button"
          accessibilityLabel="Save set details"
        >
          <Text className="text-accent text-base font-medium">Done</Text>
        </Pressable>
      ),
    });
  }, [navigation, router, handleSave]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
      className="flex-1 bg-background"
    >
      <SetDetailsForm
        title={title}
        description={description}
        duration={duration}
        place={place}
        status={status}
        onChangeTitle={setTitle}
        onChangeDescription={setDescription}
        onChangeDuration={setDuration}
        onChangePlace={setPlace}
        onChangeStatus={setStatus}
        primaryActionLabel="Done"
        secondaryActionLabel="Cancel"
        onPrimaryAction={handleSave}
        onSecondaryAction={() => router.dismiss()}
      />
    </KeyboardAvoidingView>
  );
}
