import { PremiseBitsSection } from '@/features/premise/components/premise-bits-section'
import { TagInput } from '@/features/material/components/tag-input'
import { Icon } from '@/components/ui/ion-icon'
import { attitudeConfig } from '@/config/attitudes'
import { PREMISE_STATUS_OPTIONS } from '@/config/premise-statuses'
import { useDetailHeader } from '@/features/material/hooks/use-detail-header'
import { usePremiseForm } from '@/features/premise/hooks/use-premise-form'
import { useNavigation } from 'expo-router'
import { PressableFeedback, TextArea } from 'heroui-native'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native'

export default function PremiseFormScreen() {
    const navigation = useNavigation('/(app)')
    const {
        isEditing,
        content,
        setContent,
        status,
        openStatusPicker,
        attitude,
        clearAttitude,
        openAttitudePicker,
        tags,
        setTags,
        bitIds,
        updatedMeta,
        canSave,
        handleSave,
        openBitPicker,
    } = usePremiseForm()

    useDetailHeader({
        navigation,
        title: isEditing ? 'Edit Premise' : 'New Premise',
        onSave: handleSave,
        canSave,
        isEditing,
    })

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
                    <PressableFeedback
                        onPress={openStatusPicker}
                        accessibilityRole='button'
                        accessibilityLabel='Choose premise status'
                    >
                        <View className='min-h-12 flex-row items-center gap-3 rounded-xl border border-separator bg-field px-4 py-3'>
                            <View
                                className={`size-2.5 rounded-full ${PREMISE_STATUS_OPTIONS.find((item) => item.value === status)?.dotClass}`}
                            />
                            <Text className='text-foreground flex-1'>
                                {PREMISE_STATUS_OPTIONS.find((item) => item.value === status)?.label ?? 'Select status'}
                            </Text>
                            <Icon name='chevron-down' size={18} className='text-muted' />
                        </View>
                    </PressableFeedback>
                </View>

                <View className='gap-2'>
                    <Text className='text-muted text-xs tracking-[2px] font-semibold uppercase'>Attitude</Text>
                    <PressableFeedback
                        onPress={openAttitudePicker}
                        accessibilityRole='button'
                        accessibilityLabel='Choose premise attitude'
                    >
                        <View className='min-h-12 flex-row items-center gap-3 rounded-xl border border-separator bg-field px-4 py-3'>
                            <View className='flex-row items-center gap-2 flex-1'>
                                {attitude ? <Text className='text-base'>{attitudeConfig[attitude].emoji}</Text> : null}
                                <Text className={`flex-1 ${attitude ? 'text-foreground' : 'text-muted'}`}>
                                    {attitude ? attitudeConfig[attitude].label : 'How does this make you feel?'}
                                </Text>
                            </View>
                            <View className='flex-row items-center gap-1'>
                                {attitude && (
                                    <Pressable
                                        onPress={clearAttitude}
                                        hitSlop={8}
                                        accessibilityRole='button'
                                        accessibilityLabel='Clear premise attitude'
                                    >
                                        <Icon name='close-circle' size={18} className='text-muted' />
                                    </Pressable>
                                )}
                                <Icon name='chevron-down' size={18} className='text-muted' />
                            </View>
                        </View>
                    </PressableFeedback>
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
