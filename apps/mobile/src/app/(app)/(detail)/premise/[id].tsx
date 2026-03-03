import { PremiseBitsSection } from '@/features/material/components/premise-bits-section'
import { TagInput } from '@/features/material/components/tag-input'
import { Icon } from '@/components/ui/ion-icon'
import { attitudeConfig } from '@/config/attitudes'
import { PREMISE_STATUS_OPTIONS } from '@/config/premise-statuses'
import { usePremiseForm } from '@/features/premise/hooks/use-premise-form'
import type { Attitude, PremiseStatus } from '@/types'
import { useNavigation } from 'expo-router'
import { Button, Select, TextArea } from 'heroui-native'
import { useLayoutEffect } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native'

const ATTITUDE_OPTIONS = Object.entries(attitudeConfig).map(([key, config]) => ({
    value: key as Attitude,
    label: config.label,
    emoji: config.emoji,
}))

export default function PremiseFormScreen() {
    const navigation = useNavigation('/(app)')
    const {
        isEditing,
        content,
        setContent,
        status,
        setStatus,
        attitude,
        setAttitude,
        clearAttitude,
        tags,
        setTags,
        bitIds,
        updatedMeta,
        canSave,
        handleSave,
        openBitPicker,
    } = usePremiseForm()

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: isEditing ? 'Edit Premise' : 'New Premise',
            headerRight: () => (
                <Button size='sm' variant='ghost' onPress={handleSave} isDisabled={!canSave}>
                    <Button.Label className='text-accent font-semibold'>
                        {isEditing ? 'Save' : 'Create'}
                    </Button.Label>
                </Button>
            ),
        })
    }, [navigation, isEditing, canSave, handleSave])

    return (
        <KeyboardAvoidingView
            className='flex-1 bg-background'
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={100}
        >
            <ScrollView
                className='flex-1'
                contentContainerClassName='px-4 pt-6 pb-24 gap-6'
                keyboardShouldPersistTaps='handled'
            >
                <View className='gap-2'>
                    <Text className='text-muted text-xs tracking-[2px] font-semibold uppercase'>Premise</Text>
                    <TextArea
                        value={content}
                        onChangeText={setContent}
                        placeholder="What's the funny observation or idea?"
                        className='min-h-[120px] text-[17px] leading-6'
                    />
                </View>

                <View className='gap-2'>
                    <Text className='text-muted text-xs tracking-[2px] font-semibold uppercase'>Status</Text>
                    <Select
                        presentation='bottom-sheet'
                        value={{
                            value: status,
                            label: PREMISE_STATUS_OPTIONS.find((item) => item.value === status)?.label ?? '',
                        }}
                        onValueChange={(option) => {
                            const selected = Array.isArray(option) ? option[0] : option
                            setStatus(selected.value as PremiseStatus)
                        }}
                    >
                        <Select.Trigger>
                            <View className='flex-row items-center gap-2 flex-1'>
                                <View
                                    className={`size-2.5 rounded-full ${PREMISE_STATUS_OPTIONS.find((item) => item.value === status)?.dotClass}`}
                                />
                                <Select.Value placeholder='Select status' />
                            </View>
                            <Select.TriggerIndicator />
                        </Select.Trigger>
                        <Select.Portal>
                            <Select.Overlay />
                            <Select.Content presentation='bottom-sheet'>
                                <Select.ListLabel>Status</Select.ListLabel>
                                {PREMISE_STATUS_OPTIONS.map((option) => (
                                    <Select.Item key={option.value} value={option.value} label={option.label}>
                                        {({ isSelected }) => (
                                            <View className='flex-row items-center gap-3 flex-1'>
                                                <View className={`size-2.5 rounded-full ${option.dotClass}`} />
                                                <Text className='text-foreground flex-1'>{option.label}</Text>
                                                {isSelected && <Select.ItemIndicator />}
                                            </View>
                                        )}
                                    </Select.Item>
                                ))}
                            </Select.Content>
                        </Select.Portal>
                    </Select>
                </View>

                <View className='gap-2'>
                    <Text className='text-muted text-xs tracking-[2px] font-semibold uppercase'>Attitude</Text>
                    <Select
                        presentation='bottom-sheet'
                        value={attitude ? { value: attitude, label: attitudeConfig[attitude].label } : undefined}
                        onValueChange={(option) => {
                            const selected = Array.isArray(option) ? option[0] : option
                            setAttitude(selected.value as Attitude)
                        }}
                    >
                        <Select.Trigger>
                            <View className='flex-row items-center gap-2 flex-1'>
                                {attitude && <Text className='text-base'>{attitudeConfig[attitude].emoji}</Text>}
                                <Select.Value placeholder='How does this make you feel?' />
                            </View>
                            <View className='flex-row items-center gap-1'>
                                {attitude && (
                                    <Pressable onPress={clearAttitude} hitSlop={8}>
                                        <Icon name='close-circle' size={18} className='text-muted' />
                                    </Pressable>
                                )}
                                <Select.TriggerIndicator />
                            </View>
                        </Select.Trigger>
                        <Select.Portal>
                            <Select.Overlay />
                            <Select.Content presentation='bottom-sheet'>
                                <Select.ListLabel>Attitude</Select.ListLabel>
                                {ATTITUDE_OPTIONS.map((option) => (
                                    <Select.Item key={option.value} value={option.value} label={option.label}>
                                        {({ isSelected }) => (
                                            <View className='flex-row items-center gap-3 flex-1'>
                                                <Text className='text-base'>{option.emoji}</Text>
                                                <Text className='text-foreground flex-1'>{option.label}</Text>
                                                {isSelected && <Select.ItemIndicator />}
                                            </View>
                                        )}
                                    </Select.Item>
                                ))}
                            </Select.Content>
                        </Select.Portal>
                    </Select>
                </View>

                <View className='gap-3'>
                    <Text className='text-muted text-xs tracking-[2px] font-semibold uppercase'>Tags</Text>
                    <TagInput tags={tags} onTagsChange={setTags} />
                </View>

                <PremiseBitsSection isEditing={isEditing} bitCount={bitIds.length} onChooseBits={openBitPicker} />

                {updatedMeta && <Text className='text-muted text-xs px-1'>{updatedMeta}</Text>}
            </ScrollView>
        </KeyboardAvoidingView>
    )
}
