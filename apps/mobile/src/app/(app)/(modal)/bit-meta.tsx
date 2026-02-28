import { Icon } from '@/components/ui/ion-icon'
import { PREMISE_TABLE } from '@/database/constants'
import { premiseModelToDomain } from '@/database/mappers/premiseMapper'
import { Premise as PremiseModel } from '@/database/models/premise'
import type { BitStatus } from '@/types'
import { useDatabase } from '@nozbe/watermelondb/react'
import { router, useLocalSearchParams } from 'expo-router'
import { Button, Chip, Input, Select, Separator } from 'heroui-native'
import { useEffect, useMemo, useState } from 'react'
import { Text, View } from 'react-native'

const STATUS_OPTIONS: { value: BitStatus; label: string; dotClass: string }[] = [
    { value: 'draft', label: 'Draft', dotClass: 'bg-muted' },
    { value: 'rework', label: 'Rework', dotClass: 'bg-warning' },
    { value: 'tested', label: 'Tested', dotClass: 'bg-blue-500' },
    { value: 'final', label: 'Final', dotClass: 'bg-success' },
    { value: 'dead', label: 'Dead', dotClass: 'bg-danger' },
]

export default function BitMetaModal() {
    const database = useDatabase()
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
            .subscribe((value: PremiseModel[]) => {
                setPremises(
                    value
                        .map(premiseModelToDomain)
                        .map((premise) => ({ id: premise.id, content: premise.content })),
                )
            })

        return () => subscription.unsubscribe()
    }, [database])

    const selectedPremiseLabel = useMemo(() => {
        if (!selectedPremiseId) return 'None'
        const selected = premises.find((premise) => premise.id === selectedPremiseId)
        if (!selected) return 'Linked premise'
        return selected.content
    }, [premises, selectedPremiseId])

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
                <Button variant="ghost" onPress={() => router.back()}>
                    <Button.Label>Cancel</Button.Label>
                </Button>
                <Text className="text-foreground text-lg font-semibold">Bit Info</Text>
                <Button variant="ghost" onPress={handleDone}>
                    <Button.Label>Done</Button.Label>
                </Button>
            </View>
            <Separator />

            <View className="flex-1 px-6 pt-6 gap-4">
                <View className="gap-2">
                    <Text className="text-muted text-xs font-semibold tracking-[2px]">
                        STATUS
                    </Text>
                    <Select
                        presentation="bottom-sheet"
                        value={{
                            value: status,
                            label: STATUS_OPTIONS.find((s) => s.value === status)?.label ?? '',
                        }}
                        onValueChange={(option) => {
                            const selected = Array.isArray(option) ? option[0] : option
                            setStatus(selected.value as BitStatus)
                        }}
                    >
                        <Select.Trigger>
                            <View className="flex-row items-center gap-2 flex-1">
                                <View className={`size-2.5 rounded-full ${STATUS_OPTIONS.find((s) => s.value === status)?.dotClass}`} />
                                <Select.Value placeholder="Select status" />
                            </View>
                            <Select.TriggerIndicator />
                        </Select.Trigger>
                        <Select.Portal>
                            <Select.Overlay />
                            <Select.Content presentation="bottom-sheet">
                                <Select.ListLabel>Status</Select.ListLabel>
                                {STATUS_OPTIONS.map((option) => (
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
                        PREMISE
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
                            <Select.Value placeholder="Connect to premise (optional)" />
                            <Select.TriggerIndicator />
                        </Select.Trigger>
                        <Select.Portal>
                            <Select.Overlay />
                            <Select.Content presentation="bottom-sheet">
                                <Select.ListLabel>Premise</Select.ListLabel>
                                <Select.Item value="" label="None">
                                    {({ isSelected }) => (
                                        <View className="flex-row items-center gap-3 flex-1">
                                            <Text className="text-foreground flex-1">None</Text>
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
                        TAGS
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
                            placeholder="Add a tag..."
                            returnKeyType="done"
                            onSubmitEditing={handleAddTag}
                        />
                        <Button
                            isIconOnly
                            variant="secondary"
                            onPress={handleAddTag}
                            isDisabled={!tagInput.trim()}
                        >
                            <Icon name="add" size={20} className="text-accent" />
                        </Button>
                    </View>
                </View>

                {selectedPremiseId ? (
                    <View className="flex-row items-center gap-2 pt-2 border-t border-separator">
                        <Icon name="bulb-outline" size={14} className="text-accent" />
                        <Text className="text-muted text-sm">Connected to a premise</Text>
                    </View>
                ) : null}
            </View>
        </View>
    )
}
