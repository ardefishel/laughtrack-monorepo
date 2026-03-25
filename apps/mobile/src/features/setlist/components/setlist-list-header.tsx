import { TagInput } from '@/features/material/components/tag-input'
import { Icon } from '@/components/ui/ion-icon'
import { useI18n } from '@/i18n'
import type { SetlistItem } from '@/types'
import { useRouter } from 'expo-router'
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
    const router = useRouter()
    const { t } = useI18n()
    return (
        <View className='gap-6 px-4 pt-6'>
            <View className='gap-2'>
                <Text className='text-muted text-xs tracking-[2px] font-semibold uppercase'>{t('setlist.description')}</Text>
                <Input
                    value={description}
                    onChangeText={onDescriptionChange}
                    placeholder={t('setlist.descriptionPlaceholder')}
                />
            </View>

            <View className='gap-3'>
                <Text className='text-muted text-xs tracking-[2px] font-semibold uppercase'>{t('bitMeta.tags')}</Text>
                <TagInput tags={tags} onTagsChange={onTagsChange} />
            </View>

            <View className='flex-row items-center justify-between'>
                <Text className='text-muted text-xs tracking-[2px] font-semibold uppercase'>
                    {t('setlist.items')} ({bitCount} {bitCount === 1 ? t('material.variants.bit').toLowerCase() : t('setlist.bitsPlural')})
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
                                        title: description,
                                        items: JSON.stringify(items),
                                    },
                                })
                            }
                        >
                            <Icon name='book-outline' size={16} className='text-accent' />
                            <Button.Label className='text-accent text-xs'>{t('setlist.read')}</Button.Label>
                        </Button>
                    )}

                    <Button size='sm' variant='ghost' onPress={onOpenTypeDialog}>
                        <Icon name='add-outline' size={16} className='text-accent' />
                        <Button.Label className='text-accent text-xs'>{t('setlist.addSetItem')}</Button.Label>
                    </Button>
                </View>
            </View>
        </View>
    )
}
