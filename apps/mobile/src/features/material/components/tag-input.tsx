import { Icon } from '@/components/ui/ion-icon'
import { useI18n } from '@/i18n'
import { Button, Chip, Input } from 'heroui-native'
import { useState } from 'react'
import { View } from 'react-native'

type TagInputProps = {
    tags: string[]
    onTagsChange: (nextTags: string[]) => void
    placeholder?: string
}

export function TagInput({ tags, onTagsChange, placeholder }: TagInputProps) {
    const { t } = useI18n()
    const [tagInput, setTagInput] = useState('')
    const resolvedPlaceholder = placeholder ?? t('tags.addPlaceholder')

    const handleAddTag = () => {
        const trimmed = tagInput.trim()
        if (trimmed && !tags.includes(trimmed)) {
            onTagsChange([...tags, trimmed])
        }
        setTagInput('')
    }

    const handleRemoveTag = (tag: string) => {
        onTagsChange(tags.filter((entry) => entry !== tag))
    }

    return (
        <View className='gap-3'>
            {tags.length > 0 && (
                <View className='flex-row flex-wrap gap-2'>
                    {tags.map((tag) => (
                        <Chip key={tag} variant='secondary' color='default' onPress={() => handleRemoveTag(tag)}>
                            <Chip.Label className='text-sm'>#{tag}</Chip.Label>
                            <Icon name='close' size={12} className='text-muted' />
                        </Chip>
                    ))}
                </View>
            )}

            <View className='flex-row gap-2'>
                <Input
                    className='flex-1'
                    value={tagInput}
                    onChangeText={setTagInput}
                    placeholder={resolvedPlaceholder}
                    accessibilityLabel={resolvedPlaceholder}
                    returnKeyType='done'
                    onSubmitEditing={handleAddTag}
                />

                <Button isIconOnly variant='secondary' onPress={handleAddTag} isDisabled={!tagInput.trim()} accessibilityLabel={t('tags.addButton')}>
                    <Icon name='add' size={20} className='text-accent' />
                </Button>
            </View>
        </View>
    )
}
