import { SwipeableRow } from '@/components/ui/swipeable-row'
import { Card, PressableFeedback } from 'heroui-native'
import type { ReactNode } from 'react'
import { View } from 'react-native'

interface MaterialCardProps {
    accentColor: string
    onPress?: () => void
    onDelete?: () => void
    children: ReactNode
}

export function MaterialCard({ accentColor, onPress, onDelete, children }: MaterialCardProps) {
    const card = (
        <PressableFeedback onPress={onPress}>
            <Card className="flex-row overflow-hidden">
                <View className={`w-1 ${accentColor} rounded-full`} />
                <View className="flex-1 pl-4 gap-3">
                    {children}
                </View>
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
