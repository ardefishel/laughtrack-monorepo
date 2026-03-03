import { Card, PressableFeedback } from "heroui-native";
import { Icon } from "@/components/ui/ion-icon";
import { useRef } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import type { Note } from "@/types";
import { timeAgo } from "@/utils/time-ago";

interface RecentNoteCardProps {
    note: Note;
    onPress?: () => void;
    onDelete?: () => void;
}

function getPreview(content: string) {
    const normalized = content.replace(/\s+/g, ' ').trim();
    const title = normalized.slice(0, 72);
    const description = normalized.length > 72 ? normalized.slice(72).trim() : '';

    return {
        title: title.length > 0 ? title : 'Untitled note',
        description,
    };
}

export function RecentNoteCard({ note, onPress, onDelete }: RecentNoteCardProps) {
    const preview = getPreview(note.content);
    const swipeableRef = useRef<Swipeable>(null);

    const card = (
        <PressableFeedback onPress={onPress}>
            <Card >
                <Card.Body>
                    <View className="mb-2 flex-row items-center justify-between">
                        <Text className="text-[11px] tracking-[2px] font-semibold text-muted uppercase">Note</Text>
                        <Text className="text-[11px] text-muted">{timeAgo(note.updatedAt)}</Text>
                    </View>
                    <Card.Title className="line-clamp-1">{preview.title}</Card.Title>
                    {preview.description.length > 0 && (
                        <Card.Description className="line-clamp-2">{preview.description}</Card.Description>
                    )}
                </Card.Body>
            </Card>
        </PressableFeedback>
    )

    if (!onDelete) return card

    const renderRightActions = (
        _progress: Animated.AnimatedInterpolation<number>,
        dragX: Animated.AnimatedInterpolation<number>,
    ) => {
        const scale = dragX.interpolate({
            inputRange: [-80, 0],
            outputRange: [1, 0.5],
            extrapolate: "clamp",
        });

        return (
            <Pressable
                onPress={() => {
                    swipeableRef.current?.close();
                    onDelete();
                }}
                className="bg-danger rounded-xl items-center justify-center ml-3"
                style={{ width: 72 }}
            >
                <Animated.View
                    style={{ transform: [{ scale }] }}
                    className="items-center gap-1"
                >
                    <Icon name="trash-outline" size={20} className="text-white" />
                    <Text className="text-white text-[10px] font-semibold">Delete</Text>
                </Animated.View>
            </Pressable>
        )
    }

    return (
        <Swipeable
            ref={swipeableRef}
            renderRightActions={renderRightActions}
            overshootRight={false}
            friction={2}
        >
            {card}
        </Swipeable>
    )
}
