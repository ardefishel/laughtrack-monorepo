import { SetDetailsForm } from '@/components/sets';
import { useJokeSet, useUpdateJokeSet } from '@/hooks/sets';
import { uiLogger } from '@/lib/loggers';
import type { JokeSetStatus } from '@laughtrack/shared-types';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, Text, View } from 'react-native';

import { Icon } from '@/components/ui/Icon';

export default function SetEditScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const navigation = useNavigation();

    const { jokeSet, isLoading } = useJokeSet(id as string);
    const { updateJokeSet, isLoading: isSaving } = useUpdateJokeSet();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [duration, setDuration] = useState("");
    const [place, setPlace] = useState("");
    const [status, setStatus] = useState("draft");

    useEffect(() => {
        if (jokeSet) {
            setTitle(jokeSet.title);
            setDescription(jokeSet.description || "");
            setDuration(jokeSet.duration?.toString() || "");
            setPlace(jokeSet.place || "");
            setStatus(jokeSet.status);
        }
    }, [jokeSet]);

    const handleSave = useCallback(async () => {
        uiLogger.debug('[EditSetScreen] Saving set:', id);

        const result = await updateJokeSet(id as string, {
            title,
            description: description || undefined,
            duration: duration ? parseInt(duration) : undefined,
            place: place || undefined,
            status: status as JokeSetStatus,
        });

        if (result) {
            uiLogger.debug('[EditSetScreen] Set saved successfully:', id);
            router.back();
        } else {
            uiLogger.error('[EditSetScreen] Failed to save set:', id);
        }
    }, [id, title, description, duration, place, status, updateJokeSet, router]);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerLeft: () => (
                <Pressable
                    onPress={() => router.back()}
                    className="p-2 -m-2 min-h-[44px] min-w-[44px] justify-center items-center"
                    accessibilityRole="button"
                    accessibilityLabel="Go back"
                >
                    <Icon name="chevron-back" size={24} className="text-foreground" />
                </Pressable>
            ),
            headerTitle: "Edit Set",
            headerRight: () => (
                <Pressable
                    onPress={handleSave}
                    disabled={isSaving}
                    className="px-3 py-1.5 min-h-[44px] min-w-[44px] justify-center items-center"
                    accessibilityRole="button"
                    accessibilityLabel="Save set"
                    accessibilityState={{ disabled: isSaving }}
                >
                    {isSaving ? (
                        <ActivityIndicator size="small" className="text-accent" />
                    ) : (
                        <Text className="text-accent text-base font-medium">Save</Text>
                    )}
                </Pressable>
            ),
        });
    }, [navigation, router, handleSave, isSaving]);

    if (isLoading) {
        return (
            <View className="flex-1 bg-background items-center justify-center">
                <ActivityIndicator size="large" className="text-accent" />
            </View>
        );
    }

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
                status={status as JokeSetStatus}
                onChangeTitle={setTitle}
                onChangeDescription={setDescription}
                onChangeDuration={setDuration}
                onChangePlace={setPlace}
                onChangeStatus={(value) => setStatus(value)}
                primaryActionLabel="Save"
                secondaryActionLabel="Cancel"
                onPrimaryAction={handleSave}
                onSecondaryAction={() => router.back()}
                isPrimaryActionDisabled={isSaving}
            />
        </KeyboardAvoidingView>
    );
}
