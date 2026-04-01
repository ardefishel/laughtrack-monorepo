import { PremiseBitsSection } from '@/features/premise/components/premise-bits-section'
import { TagInput } from '@/features/material/components/tag-input'
import { Icon } from '@/components/ui/ion-icon'
import { attitudeConfig, getAttitudeLabel } from '@/config/attitudes'
import { getPremiseStatusOptions } from '@/config/premise-statuses'
import { useDetailHeader } from '@/features/material/hooks/use-detail-header'
import { usePremiseForm } from '@/features/premise/hooks/use-premise-form'
import { useI18n } from '@/i18n'
import { useNavigation } from 'expo-router'
import { PressableFeedback, TextArea } from 'heroui-native'
import { Pressable, Text, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'

export default function PremiseFormScreen() {
    const navigation = useNavigation('/(app)')
    const { t } = useI18n()
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
    const premiseStatusOptions = getPremiseStatusOptions(t)

    useDetailHeader({
        navigation,
        title: isEditing ? t('premise.detail.editTitle') : t('premise.detail.newTitle'),
        onSave: handleSave,
        canSave,
        isEditing,
    })

    return (
        <KeyboardAwareScrollView
            className='flex-1 bg-background'
            contentContainerClassName='px-4 pt-6 pb-24 gap-6'
            bottomOffset={20}
            keyboardShouldPersistTaps='handled'
        >
            <View className='gap-2'>
                <Text className='text-muted text-xs tracking-[2px] font-semibold uppercase'>{t('premise.detail.title')}</Text>
                <TextArea
                    value={content}
                    onChangeText={setContent}
                    placeholder={t('premise.detail.placeholder')}
                    className='min-h-[120px] text-[17px] leading-6'
                />
            </View>

            <View className='gap-2'>
                <Text className='text-muted text-xs tracking-[2px] font-semibold uppercase'>{t('premise.detail.status')}</Text>
                <PressableFeedback
                    onPress={openStatusPicker}
                    accessibilityRole='button'
                    accessibilityLabel={t('premise.detail.chooseStatus')}
                >
                    <View className='min-h-12 flex-row items-center gap-3 rounded-xl border border-separator bg-field px-4 py-3'>
                        <View
                            className={`size-2.5 rounded-full ${premiseStatusOptions.find((item) => item.value === status)?.dotClass}`}
                        />
                        <Text className='text-foreground flex-1'>
                            {premiseStatusOptions.find((item) => item.value === status)?.label ?? t('premise.detail.selectStatus')}
                        </Text>
                        <Icon name='chevron-down' size={18} className='text-muted' />
                    </View>
                </PressableFeedback>
            </View>

            <View className='gap-2'>
                <Text className='text-muted text-xs tracking-[2px] font-semibold uppercase'>{t('premise.detail.attitude')}</Text>
                <PressableFeedback
                    onPress={openAttitudePicker}
                    accessibilityRole='button'
                    accessibilityLabel={t('premise.detail.chooseAttitude')}
                >
                    <View className='min-h-12 flex-row items-center gap-3 rounded-xl border border-separator bg-field px-4 py-3'>
                        <View className='flex-row items-center gap-2 flex-1'>
                            {attitude ? <Text className='text-base'>{attitudeConfig[attitude].emoji}</Text> : null}
                            <Text className={`flex-1 ${attitude ? 'text-foreground' : 'text-muted'}`}>
                                {attitude ? getAttitudeLabel(t, attitude) : t('premise.detail.attitudePlaceholder')}
                            </Text>
                        </View>
                        <View className='flex-row items-center gap-1'>
                            {attitude && (
                                <Pressable
                                    onPress={clearAttitude}
                                    hitSlop={8}
                                    accessibilityRole='button'
                                    accessibilityLabel={t('premise.detail.clearAttitude')}
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
                <Text className='text-muted text-xs tracking-[2px] font-semibold uppercase'>{t('bitMeta.tags')}</Text>
                <TagInput tags={tags} onTagsChange={setTags} />
            </View>

            <PremiseBitsSection isEditing={isEditing} bitCount={bitIds.length} onChooseBits={openBitPicker} />

            {updatedMeta && <Text className='text-muted text-xs px-1'>{updatedMeta}</Text>}
        </KeyboardAwareScrollView>
    )
}
