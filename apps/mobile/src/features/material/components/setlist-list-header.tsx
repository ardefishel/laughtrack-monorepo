import { TagInput } from '@/features/material/components/tag-input'
import { Icon } from '@/components/ui/ion-icon'
import type { SetlistItem } from '@/types'
import { router } from 'expo-router'
import { Button, Input } from 'heroui-native'
import { Text, View } from 'react-native'

type SetlistListHeaderProps = {
    description: string
    onDescriptionChange: (value: string) => void
    tags: string[]
    onTagsChange: (tags: string[]) => void
    items: SetlistItem[]
    bitCount: number
    onOpenTypeDialog: () => void
}

export function SetlistListHeader({
    description,
    onDescriptionChange,
    tags,
    onTagsChange,
    items,
    bitCount,
    onOpenTypeDialog,
}: SetlistListHeaderProps) {
    return (
        <View className='gap-6 px-4 pt-6'>
            <View className='gap-2'>
                <Text className='text-muted text-xs tracking-[2px] font-semibold uppercase'>Description</Text>
                <Input
                    value={description}
                    onChangeText={onDescriptionChange}
                    placeholder='e.g. Friday Club Night - 20 min set'
                />
            </View>

            <View className='gap-3'>
                <Text className='text-muted text-xs tracking-[2px] font-semibold uppercase'>Tags</Text>
                <TagInput tags={tags} onTagsChange={onTagsChange} />
            </View>

            <View className='flex-row items-center justify-between'>
                <Text className='text-muted text-xs tracking-[2px] font-semibold uppercase'>
                    Items ({bitCount} {bitCount === 1 ? 'bit' : 'bits'})
                </Text>

                <View className='flex-row items-center gap-1'>
                    {items.length > 0 && (
                        <Button
                            size='sm'
                            variant='ghost'
                            onPress={() =>
                                router.push({
                                    pathname: '/(app)/(detail)/setlist/reader',
                                    params: {
                                        title: description || 'Reader',
                                        items: JSON.stringify(items),
                                    },
                                })
                            }
                        >
                            <Icon name='book-outline' size={16} className='text-accent' />
                            <Button.Label className='text-accent text-xs'>Read</Button.Label>
                        </Button>
                    )}

                    <Button size='sm' variant='ghost' onPress={onOpenTypeDialog}>
                        <Icon name='add-outline' size={16} className='text-accent' />
                        <Button.Label className='text-accent text-xs'>Add Set Item</Button.Label>
                    </Button>
                </View>
            </View>
        </View>
    )
}
