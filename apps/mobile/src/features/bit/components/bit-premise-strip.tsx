import { Icon } from '@/components/ui/ion-icon'
import { Pressable, Text, View } from 'react-native'

type BitPremiseStripProps = {
    premiseId: string
    linkedPremiseContent: string
    isExpanded: boolean
    onToggle: () => void
}

export function BitPremiseStrip({ premiseId, linkedPremiseContent, isExpanded, onToggle }: BitPremiseStripProps) {
    return (
        <Pressable onPress={onToggle} className='px-4 py-3 bg-surface-secondary border-b border-separator'>
            <View className='flex-row items-center gap-2 mb-1'>
                <Icon name='bulb-outline' size={14} className='text-accent' />
                <Text className='text-muted text-[10px] tracking-[2px] font-semibold uppercase'>Premise</Text>
                <View className='flex-1' />
                <Icon name={isExpanded ? 'chevron-up' : 'chevron-down'} size={14} className='text-muted' />
            </View>

            <Text className='text-muted text-[13px]' numberOfLines={isExpanded ? undefined : 1}>
                {linkedPremiseContent || `Linked premise: ${premiseId}`}
            </Text>
        </Pressable>
    )
}
