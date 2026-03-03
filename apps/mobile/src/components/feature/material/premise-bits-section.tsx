import { Icon } from '@/components/ui/ion-icon'
import { Button } from 'heroui-native'
import { Text, View } from 'react-native'

type PremiseBitsSectionProps = {
    isEditing: boolean
    bitCount: number
    onChooseBits: () => void
}

export function PremiseBitsSection({ isEditing, bitCount, onChooseBits }: PremiseBitsSectionProps) {
    return (
        <View className='gap-3 pt-2 border-t border-separator'>
            <Text className='text-muted text-xs tracking-[2px] font-semibold uppercase'>Bits</Text>

            {isEditing ? (
                <>
                    <View className='flex-row items-center gap-2'>
                        <Button size='sm' variant='secondary' onPress={onChooseBits}>
                            <Icon name='albums-outline' size={14} className='text-accent' />
                            <Button.Label className='text-accent'>Choose Bits</Button.Label>
                        </Button>
                    </View>

                    <Text className='text-muted text-xs px-1'>
                        {bitCount > 0
                            ? `${bitCount} connected ${bitCount === 1 ? 'bit' : 'bits'}`
                            : 'No bits connected yet.'}
                    </Text>
                </>
            ) : (
                <Text className='text-muted text-xs px-1'>
                    Save this premise first, then choose or create bits from here.
                </Text>
            )}
        </View>
    )
}
