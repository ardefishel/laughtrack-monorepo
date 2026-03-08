import { SwipeableRow } from '@/components/ui/swipeable-row'
import type { Note } from '@/types'
import { timeAgo } from '@/lib/time-ago'
import { Card, PressableFeedback } from 'heroui-native'
import { Text, View } from 'react-native'

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

    return (
        <SwipeableRow
            actions={onDelete ? [{ key: 'delete', icon: 'trash-outline', label: 'Delete', color: 'bg-danger', onPress: onDelete }] : []}
        >
            {card}
        </SwipeableRow>
    )
}
