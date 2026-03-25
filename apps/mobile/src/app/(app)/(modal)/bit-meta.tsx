import { Icon } from '@/components/ui/ion-icon'
import { getBitStatusOptions } from '@/config/bit-statuses'
import { PREMISE_TABLE } from '@/database/constants'
import { premiseModelToDomain } from '@/database/mappers/premiseMapper'
import { Premise as PremiseModel } from '@/database/models/premise'
import { dbLogger } from '@/lib/loggers'
import { useI18n } from '@/i18n'
import type { BitStatus } from '@/types'
import { useDatabase } from '@nozbe/watermelondb/react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Button, Chip, Input, Select, Separator } from 'heroui-native'
import { useEffect, useMemo, useState } from 'react'
import { Text, View } from 'react-native'

export default function BitMetaModal() {
    const router = useRouter()
    const database = useDatabase()
    const { t } = useI18n()
    const bitStatusOptions = useMemo(() => getBitStatusOptions(t), [t])
    const params = useLocalSearchParams<{ tags?: string; status?: string; premiseId?: string; bitId?: string }>()

    const initialStatus = (params.status as BitStatus | undefined) ?? 'draft'
    const [status, setStatus] = useState<BitStatus>(initialStatus)

    const [tags, setTags] = useState<string[]>(() => {
        if (params.tags) return params.tags.split(',').filter(Boolean)
        return []
    })
    const [premises, setPremises] = useState<{ id: string; content: string }[]>([])
    const [selectedPremiseId, setSelectedPremiseId] = useState<string>(params.premiseId ?? '')
    const [tagInput, setTagInput] = useState('')

    useEffect(() => {
        const subscription = database
            .get<PremiseModel>(PREMISE_TABLE)
            .query()
            .observe()
            .subscribe({
                next: (value: PremiseModel[]) => {
                    setPremises(
                        value
                            .map(premiseModelToDomain)
                            .map((premise) => ({ id: premise.id, content: premise.content })),
                    )
                },
                error: (error: unknown) => {
                    dbLogger.error('BitMeta failed to observe premise options', error)
                },
            })

        return () => subscription.unsubscribe()
    }, [database])

    const selectedPremiseLabel = useMemo(() => {
        if (!selectedPremiseId) return t('bitMeta.none')
        const selected = premises.find((premise) => premise.id === selectedPremiseId)
        if (!selected) return t('bitMeta.premise')
        return selected.content
    }, [premises, selectedPremiseId, t])

    const handleAddTag = () => {
        const trimmed = tagInput.trim()
        if (trimmed && !tags.includes(trimmed)) {
            setTags((prev) => [...prev, trimmed])
        }
        setTagInput('')
    }

    const handleRemoveTag = (tag: string) => {
        setTags((prev) => prev.filter((t) => t !== tag))
    }

    const handleDone = () => {
        router.back()
        requestAnimationFrame(() => {
            router.setParams({
                id: params.bitId ?? 'new',
                metaStatus: status,
                metaTags: tags.join(','),
                metaPremiseId: selectedPremiseId,
                metaNonce: `${Date.now()}`,
            })
        })
    }

    return (
        <View style={{ flex: 1 }}>
            <View className="flex-row items-center justify-between px-4 pt-4 pb-3 bg-field">
                <Button variant="ghost" onPress={() => router.back()} accessibilityLabel={t('bitMeta.cancel')}>
                    <Button.Label>{t('bitMeta.cancel')}</Button.Label>
                </Button>
                <Text className="text-foreground text-lg font-semibold">{t('bitMeta.title')}</Text>
                <Button variant="ghost" onPress={handleDone} accessibilityLabel={t('bitMeta.done')}>
                    <Button.Label>{t('bitMeta.done')}</Button.Label>
                </Button>
            </View>
            <Separator />

            <View className="flex-1 px-6 pt-6 gap-4">
                <View className="gap-2">
                    <Text className="text-muted text-xs font-semibold tracking-[2px]">
                        {t('bitMeta.status')}
                    </Text>
                    <Select
                        presentation="bottom-sheet"
                        value={{
                            value: status,
                            label: bitStatusOptions.find((s) => s.value === status)?.label ?? '',
                        }}
                        onValueChange={(option) => {
                            const selected = Array.isArray(option) ? option[0] : option
                            setStatus(selected.value as BitStatus)
                        }}
                    >
                        <Select.Trigger>
                            <View className="flex-row items-center gap-2 flex-1">
                                <View className={`size-2.5 rounded-full ${bitStatusOptions.find((s) => s.value === status)?.dotClass}`} />
                                <Select.Value placeholder={t('bitMeta.selectStatus')} />
                            </View>
                            <Select.TriggerIndicator />
                        </Select.Trigger>
                        <Select.Portal>
                            <Select.Overlay />
                            <Select.Content presentation="bottom-sheet">
                                <Select.ListLabel>{t('bitMeta.status')}</Select.ListLabel>
                                {bitStatusOptions.map((option) => (
                                    <Select.Item key={option.value} value={option.value} label={option.label}>
                                        {({ isSelected }) => (
                                            <View className="flex-row items-center gap-3 flex-1">
                                                <View className={`size-2.5 rounded-full ${option.dotClass}`} />
                                                <Text className="text-foreground flex-1">{option.label}</Text>
                                                {isSelected && <Select.ItemIndicator />}
                                            </View>
                                        )}
                                    </Select.Item>
                                ))}
                            </Select.Content>
                        </Select.Portal>
                    </Select>
                </View>

                <View className="gap-2">
                    <Text className="text-muted text-xs font-semibold tracking-[2px]">
                        {t('bitMeta.premise')}
                    </Text>
                    <Select
                        presentation="bottom-sheet"
                        value={{ value: selectedPremiseId, label: selectedPremiseLabel }}
                        onValueChange={(option) => {
                            const selected = Array.isArray(option) ? option[0] : option
                            setSelectedPremiseId(selected.value as string)
                        }}
                    >
                        <Select.Trigger>
                            <Select.Value placeholder={t('bitMeta.connectToPremiseOptional')} />
                            <Select.TriggerIndicator />
                        </Select.Trigger>
                        <Select.Portal>
                            <Select.Overlay />
                            <Select.Content presentation="bottom-sheet">
                                <Select.ListLabel>{t('bitMeta.premise')}</Select.ListLabel>
                                <Select.Item value="" label={t('bitMeta.none')}>
                                    {({ isSelected }) => (
                                        <View className="flex-row items-center gap-3 flex-1">
                                            <Text className="text-foreground flex-1">{t('bitMeta.none')}</Text>
                                            {isSelected && <Select.ItemIndicator />}
                                        </View>
                                    )}
                                </Select.Item>
                                {premises.map((premise) => (
                                    <Select.Item key={premise.id} value={premise.id} label={premise.content}>
                                        {({ isSelected }) => (
                                            <View className="flex-row items-center gap-3 flex-1">
                                                <Text className="text-foreground flex-1" numberOfLines={2}>
                                                    {premise.content}
                                                </Text>
                                                {isSelected && <Select.ItemIndicator />}
                                            </View>
                                        )}
                                    </Select.Item>
                                ))}
                            </Select.Content>
                        </Select.Portal>
                    </Select>
                </View>

                {/* Tags */}
                <View className="gap-3">
                    <Text className="text-muted text-xs font-semibold tracking-[2px]">
                        {t('bitMeta.tags')}
                    </Text>
                    {tags.length > 0 && (
                        <View className="flex-row flex-wrap gap-2">
                            {tags.map((tag) => (
                                <Chip key={tag} variant="secondary" color="default" onPress={() => handleRemoveTag(tag)}>
                                    <Chip.Label className="text-sm">#{tag}</Chip.Label>
                                    <Icon name="close" size={12} className="text-muted" />
                                </Chip>
                            ))}
                        </View>
                    )}
                    <View className="flex-row gap-2">
                        <Input
                            className="flex-1"
                            value={tagInput}
                            onChangeText={setTagInput}
                            placeholder={t('tags.addPlaceholder')}
                            returnKeyType="done"
                            onSubmitEditing={handleAddTag}
                        />
                        <Button
                            isIconOnly
                            variant="secondary"
                            onPress={handleAddTag}
                            isDisabled={!tagInput.trim()}
                            accessibilityLabel={t('tags.addButton')}
                        >
                            <Icon name="add" size={20} className="text-accent" />
                        </Button>
                    </View>
                </View>

                {selectedPremiseId ? (
                    <View className="flex-row items-center gap-2 pt-2 border-t border-separator">
                        <Icon name="bulb-outline" size={14} className="text-accent" />
                        <Text className="text-muted text-sm">{t('bitMeta.connectedToPremise')}</Text>
                    </View>
                ) : null}
            </View>
        </View>
    )
}
