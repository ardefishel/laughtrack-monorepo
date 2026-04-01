import { Icon } from '@/components/ui/ion-icon'
import { MaterialCard } from '@/features/material/components/material-card'
import { useI18n } from '@/i18n'
import type { Setlist } from '@/types'
import { timeAgo } from '@/lib/time-ago'
import { Chip } from 'heroui-native'
import { memo } from 'react'
import { Text, View } from 'react-native'

interface SetlistCardProps {
    setlist: Setlist
    onPress?: () => void
    onDelete?: () => void
}

function SetlistCardComponent({ setlist, onPress, onDelete }: SetlistCardProps) {
    const { t } = useI18n()
    const bitCount = setlist.items.filter((item) => item.type === 'bit').length
    const hasTags = setlist.tags && setlist.tags.length > 0

    return (
        <MaterialCard accentColor="bg-green-500" onPress={onPress} onDelete={onDelete}>
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                    <Icon name="list-outline" size={13} className="text-muted" />
                    <Text className="text-muted text-[10px] tracking-[3px] font-semibold">
                        {t('setlist.label')}
                    </Text>
                </View>
                <Text className="text-muted text-[11px]">
                    {timeAgo(setlist.updatedAt)}
                </Text>
            </View>

            <Text
                className="text-foreground text-[17px] font-medium leading-6"
                numberOfLines={2}
            >
                {setlist.description || t('setlist.untitled')}
            </Text>

            <View className="flex-row items-center justify-between pt-1 border-t border-separator">
                <View className="flex-row flex-wrap gap-1.5 flex-1">
                    {hasTags
                        ? setlist.tags?.map((tag) => (
                            <Chip key={tag.id} size="sm" variant="tertiary" color="default">
                                <Chip.Label className="text-[11px]">#{tag.name}</Chip.Label>
                            </Chip>
                        ))
                        : null}
                </View>
                <View className="flex-row items-center gap-3 ml-3">
                    {bitCount > 0 && (
                        <View className="flex-row items-center gap-1">
                            <Icon name="reader-outline" size={13} className="text-muted" />
                            <Text className="text-muted text-xs font-medium">{bitCount}</Text>
                        </View>
                    )}
                </View>
            </View>
        </MaterialCard>
    )
}

export const SetlistCard = memo(SetlistCardComponent)
