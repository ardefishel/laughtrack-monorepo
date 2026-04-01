import { Icon } from '@/components/ui/ion-icon'
import { getBitStatusLabel } from '@/config/bit-statuses'
import { bitContentToPreview } from '@/features/bit/data/bit.mapper'
import { useI18n } from '@/i18n'
import type { SetlistItem } from '@/types'
import { Text, View } from 'react-native'

type SetlistItemContentProps = {
    item: SetlistItem
}

export function SetlistItemContent({ item }: SetlistItemContentProps) {
    const { t } = useI18n()

    if (item.type === 'bit') {
        const preview = item.bit ? bitContentToPreview(item.bit.content) : null

        return (
            <View className='gap-1.5'>
                <Text className='text-muted text-[10px] tracking-[2px] font-semibold'>
                    {getBitStatusLabel(t, item.bit?.status ?? 'draft', true)}
                </Text>

                <Text className='text-foreground text-[16px] font-medium leading-5' numberOfLines={1}>
                    {preview?.title || t('bit.untitled')}
                </Text>

                {preview?.description ? (
                    <Text className='text-muted text-[13px] leading-4' numberOfLines={1}>
                        {preview.description}
                    </Text>
                ) : null}
            </View>
        )
    }

    return (
        <View className='gap-1.5'>
            <Text className='text-muted text-[10px] tracking-[2px] font-semibold'>{t('notes.label').toUpperCase()}</Text>
            <View className='flex-row items-center gap-2'>
                <Icon name='document-text-outline' size={14} className='text-blue-500' />
                <Text className='text-foreground text-[14px]' numberOfLines={1}>
                    {item.setlistNote?.content ?? t('notes.label')}
                </Text>
            </View>
        </View>
    )
}
