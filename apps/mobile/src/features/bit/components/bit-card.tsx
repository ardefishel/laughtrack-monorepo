import { Icon } from '@/components/ui/ion-icon'
import { BIT_STATUS_CONFIG, getBitStatusLabel } from '@/config/bit-statuses'
import { bitContentToPreview } from '@/database/mappers/bitMapper'
import { MaterialCard } from '@/features/material/components/material-card'
import { useI18n } from '@/i18n'
import type { Bit, BitStatus } from '@/types'
import { timeAgo } from '@/lib/time-ago'
import { Chip } from 'heroui-native'
import { memo } from 'react'
import { Text, View } from 'react-native'

const statusConfig = Object.fromEntries(
    (Object.entries(BIT_STATUS_CONFIG) as [BitStatus, { labelKey: string; dotClass: string }][]).map(([value, config]) => [value, { dotClass: config.dotClass }])
) as Record<BitStatus, { dotClass: string }>

interface BitCardProps {
    bit: Bit
    onPress?: () => void
    onDelete?: () => void
}

function BitCardComponent({ bit, onPress, onDelete }: BitCardProps) {
    const { t } = useI18n()
    const status = statusConfig[bit.status]
    const hasTags = bit.tags && bit.tags.length > 0
    const hasPremise = !!bit.premiseId
    const preview = bitContentToPreview(bit.content)

    return (
        <MaterialCard accentColor="bg-blue-500" onPress={onPress} onDelete={onDelete}>
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                    <View className={`size-2 rounded-full ${status.dotClass}`} />
                    <Text className="text-muted text-[10px] tracking-[3px] font-semibold">
                        {getBitStatusLabel(t, bit.status, true)}
                    </Text>
                </View>
                <View className="flex-row items-center gap-2">
                    {hasPremise && (
                        <Icon name="bulb-outline" size={13} className="text-muted" />
                    )}
                    <Text className="text-muted text-[11px]">
                        {timeAgo(bit.updatedAt)}
                    </Text>
                </View>
            </View>

            <Text className="text-foreground text-[17px] font-medium leading-6" numberOfLines={1}>
                {preview.title || t('bit.untitled')}
            </Text>

            {preview.description ? (
                <Text className="text-muted text-[14px] leading-5" numberOfLines={2}>
                    {preview.description}
                </Text>
            ) : null}

            {hasTags && (
                <View className="flex-row flex-wrap gap-1.5 pt-1">
                    {bit.tags?.map((tag) => (
                        <Chip key={tag.id} size="sm" variant="tertiary" color="default">
                            <Chip.Label className="text-[11px]">#{tag.name}</Chip.Label>
                        </Chip>
                    ))}
                </View>
            )}
        </MaterialCard>
    )
}

export const BitCard = memo(BitCardComponent)
