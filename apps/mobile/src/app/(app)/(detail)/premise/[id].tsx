import { Icon } from '@/components/ui/ion-icon'
import { BIT_TABLE, PREMISE_TABLE } from '@/database/constants'
import { attitudeConfig } from '@/config/attitudes'
import { reconcilePremiseBitLinks } from '@/database/reconcilePremiseBitLinks'
import { premiseModelToDomain } from '@/database/mappers/premiseMapper'
import { Bit as BitModel } from '@/database/models/bit'
import { Premise as PremiseModel } from '@/database/models/premise'
import type { Attitude, PremiseStatus } from '@/types'
import { parseCsvParam, toCsvParam } from '@/utils/filter-query'
import { useDatabase } from '@nozbe/watermelondb/react'
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router'
import { Button, Chip, Input, Select, TextArea } from 'heroui-native'
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native'
import { timeAgo } from '@/utils/time-ago'

const STATUS_OPTIONS: { value: PremiseStatus; label: string; dotClass: string }[] = [
    { value: 'draft', label: 'Draft', dotClass: 'bg-muted' },
    { value: 'rework', label: 'Rework', dotClass: 'bg-warning' },
    { value: 'ready', label: 'Ready', dotClass: 'bg-success' },
    { value: 'archived', label: 'Archived', dotClass: 'bg-default' },
]

const ATTITUDE_OPTIONS = Object.entries(attitudeConfig).map(([key, config]) => ({
    value: key as Attitude,
    label: config.label,
    emoji: config.emoji,
}))


export default function PremiseFormScreen() {
    const routeRouter = useRouter()
    const database = useDatabase()
    const { id, selectedBits, bitsNonce } = useLocalSearchParams<{
        id: string
        selectedBits?: string
        bitsNonce?: string
    }>()
    const navigation = useNavigation('/(app)')
    const isEditing = id !== 'new'

    const [premiseModel, setPremiseModel] = useState<PremiseModel | null>(null)
    const [content, setContent] = useState('')
    const [status, setStatus] = useState<PremiseStatus>('draft')
    const [attitude, setAttitude] = useState<Attitude | undefined>(undefined)
    const [tagInput, setTagInput] = useState('')
    const [tags, setTags] = useState<string[]>([])
    const [bitIds, setBitIds] = useState<string[]>([])
    const [updatedAt, setUpdatedAt] = useState<Date | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (!isEditing || !id) {
            setPremiseModel(null)
            setContent('')
            setStatus('draft')
            setAttitude(undefined)
            setTags([])
            setBitIds([])
            setUpdatedAt(null)
            return
        }

        const subscription = database
            .get<PremiseModel>(PREMISE_TABLE)
            .findAndObserve(id)
            .subscribe((result: PremiseModel) => {
                const premise = premiseModelToDomain(result)
                setPremiseModel(result)
                setContent(premise.content)
                setStatus(premise.status)
                setAttitude(premise.attitude)
                setTags((premise.tags ?? []).map((tag) => tag.name))
                setBitIds(premise.bitIds ?? [])
                setUpdatedAt(premise.updatedAt)
            })

        return () => subscription.unsubscribe()
    }, [database, id, isEditing])

    const canSave = content.trim().length > 0 && !isSaving

    const applySelectedBits = useCallback(async (nextBitIdsInput: string[]) => {
        if (!isEditing || !id) return

        const nextBitIds = [...new Set(nextBitIdsInput.filter(Boolean))]
        const currentBitIds = [...new Set(bitIds)]

        const idsToUnlink = currentBitIds.filter((entry) => !nextBitIds.includes(entry))
        const idsToLink = nextBitIds.filter((entry) => !currentBitIds.includes(entry))

        if (idsToUnlink.length === 0 && idsToLink.length === 0) return

        await database.write(async () => {
            for (const bitId of idsToUnlink) {
                try {
                    const bit = await database.get<BitModel>(BIT_TABLE).find(bitId)
                    if (bit.premiseId !== id) continue

                    await bit.update((model) => {
                        model.premiseId = null
                        model.updatedAt = new Date()
                    })
                } catch {
                    // Ignore invalid relation target.
                }
            }

            for (const bitId of idsToLink) {
                try {
                    const bit = await database.get<BitModel>(BIT_TABLE).find(bitId)

                    await bit.update((model) => {
                        model.premiseId = id
                        model.updatedAt = new Date()
                    })
                } catch {
                    // Ignore missing bit.
                }
            }

            try {
                const premise = await database.get<PremiseModel>(PREMISE_TABLE).find(id)
                await premise.update((model) => {
                    model.bitIdsJson = JSON.stringify(nextBitIds)
                    model.updatedAt = new Date()
                })
            } catch {
                // Ignore missing premise.
            }
        })

        await reconcilePremiseBitLinks(database)
    }, [bitIds, database, id, isEditing])

    useEffect(() => {
        if (typeof bitsNonce !== 'string' || bitsNonce.length === 0) return

        const nextBitIds = parseCsvParam(selectedBits)

        void applySelectedBits(nextBitIds).finally(() => {
            routeRouter.setParams({ selectedBits: '', bitsNonce: '' })
        })
    }, [applySelectedBits, bitsNonce, routeRouter, selectedBits])

    const handleSave = useCallback(async () => {
        const trimmed = content.trim()
        if (!canSave || !trimmed) return

        setIsSaving(true)
        try {
            if (isEditing && premiseModel) {
                await premiseModel.updatePremise({
                    content: trimmed,
                    status,
                    attitude,
                    tags,
                })
                routeRouter.back()
                return
            }

            await database.write(async () => {
                await database.get<PremiseModel>(PREMISE_TABLE).create((premise: PremiseModel) => {
                    const now = Date.now()
                    premise.content = trimmed
                    premise.status = status
                    premise.attitude = attitude ?? null
                    premise.tagsJson = JSON.stringify(tags)
                    premise.bitIdsJson = JSON.stringify([])
                    premise.createdAt = new Date(now)
                    premise.updatedAt = new Date(now)
                })
            })
            routeRouter.back()
        } finally {
            setIsSaving(false)
        }
    }, [attitude, canSave, content, database, isEditing, premiseModel, routeRouter, status, tags])

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: isEditing ? 'Edit Premise' : 'New Premise',
            headerRight: () => (
                <Button size="sm" variant="ghost" onPress={handleSave} isDisabled={!canSave}>
                    <Button.Label className="text-accent font-semibold">
                        {isEditing ? 'Save' : 'Create'}
                    </Button.Label>
                </Button>
            ),
        })
    }, [navigation, isEditing, canSave, handleSave])

    const handleAddTag = () => {
        const trimmed = tagInput.trim()
        if (trimmed && !tags.includes(trimmed)) {
            setTags([...tags, trimmed])
        }
        setTagInput('')
    }

    const handleRemoveTag = (tag: string) => {
        setTags(tags.filter((t) => t !== tag))
    }

    const clearAttitude = () => {
        setAttitude(undefined)
    }

    const openBitPicker = useCallback(() => {
        if (!isEditing || !id) return

        routeRouter.push({
            pathname: '/(app)/(modal)/premise-add-bit',
            params: {
                premiseId: id,
                selected: toCsvParam(bitIds),
            },
        })
    }, [bitIds, id, isEditing, routeRouter])

    const updatedMeta = useMemo(() => {
        if (!updatedAt) return null
        const value = timeAgo(updatedAt)
        return `Updated ${value === 'Just now' ? 'just now' : value}`
    }, [updatedAt])

    return (
        <KeyboardAvoidingView
            className="flex-1 bg-background"
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={100}
        >
            <ScrollView
                className="flex-1"
                contentContainerClassName="px-4 pt-6 pb-24 gap-6"
                keyboardShouldPersistTaps="handled"
            >
                {/* Content */}
                <View className="gap-2">
                    <Text className="text-muted text-xs tracking-[2px] font-semibold uppercase">
                        Premise
                    </Text>
                    <TextArea
                        value={content}
                        onChangeText={setContent}
                        placeholder="What's the funny observation or idea?"
                        className="min-h-[120px] text-[17px] leading-6"
                    />
                </View>

                {/* Status */}
                <View className="gap-2">
                    <Text className="text-muted text-xs tracking-[2px] font-semibold uppercase">
                        Status
                    </Text>
                    <Select
                        presentation="bottom-sheet"
                        value={{ value: status, label: STATUS_OPTIONS.find((s) => s.value === status)?.label ?? '' }}
                        onValueChange={(option) => {
                            const selected = Array.isArray(option) ? option[0] : option
                            setStatus(selected.value as PremiseStatus)
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

                {/* Attitude */}
                <View className="gap-2">
                    <Text className="text-muted text-xs tracking-[2px] font-semibold uppercase">
                        Attitude
                    </Text>
                    <Select
                        presentation="bottom-sheet"
                        value={attitude ? { value: attitude, label: attitudeConfig[attitude].label } : undefined}
                        onValueChange={(option) => {
                            const selected = Array.isArray(option) ? option[0] : option
                            setAttitude(selected.value as Attitude)
                        }}
                    >
                        <Select.Trigger>
                            <View className="flex-row items-center gap-2 flex-1">
                                {attitude && (
                                    <Text className="text-base">{attitudeConfig[attitude].emoji}</Text>
                                )}
                                <Select.Value placeholder="How does this make you feel?" />
                            </View>
                            <View className="flex-row items-center gap-1">
                                {attitude && (
                                    <Pressable onPress={clearAttitude} hitSlop={8}>
                                        <Icon name="close-circle" size={18} className="text-muted" />
                                    </Pressable>
                                )}
                                <Select.TriggerIndicator />
                            </View>
                        </Select.Trigger>
                        <Select.Portal>
                            <Select.Overlay />
                            <Select.Content presentation="bottom-sheet">
                                <Select.ListLabel>Attitude</Select.ListLabel>
                                {ATTITUDE_OPTIONS.map((option) => (
                                    <Select.Item key={option.value} value={option.value} label={option.label}>
                                        {({ isSelected }) => (
                                            <View className="flex-row items-center gap-3 flex-1">
                                                <Text className="text-base">{option.emoji}</Text>
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

                {/* Tags */}
                <View className="gap-3">
                    <Text className="text-muted text-xs tracking-[2px] font-semibold uppercase">
                        Tags
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

                <View className="gap-3 pt-2 border-t border-separator">
                    <Text className="text-muted text-xs tracking-[2px] font-semibold uppercase">
                        Bits
                    </Text>
                    {isEditing ? (
                        <>
                            <View className="flex-row items-center gap-2">
                                <Button size="sm" variant="secondary" onPress={openBitPicker}>
                                    <Icon name="albums-outline" size={14} className="text-accent" />
                                    <Button.Label className="text-accent">Choose Bits</Button.Label>
                                </Button>
                            </View>
                            <Text className="text-muted text-xs px-1">
                                {bitIds.length > 0
                                    ? `${bitIds.length} connected ${bitIds.length === 1 ? 'bit' : 'bits'}`
                                    : 'No bits connected yet.'}
                            </Text>
                        </>
                    ) : (
                        <Text className="text-muted text-xs px-1">
                            Save this premise first, then choose or create bits from here.
                        </Text>
                    )}
                </View>

                {updatedMeta && (
                    <Text className="text-muted text-xs px-1">{updatedMeta}</Text>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    )
}
