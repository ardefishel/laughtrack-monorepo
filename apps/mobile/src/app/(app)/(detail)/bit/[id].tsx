import { Icon } from '@/components/ui/ion-icon'
import { BIT_TABLE, PREMISE_TABLE } from '@/database/constants'
import { bitModelToDomain } from '@/database/mappers/bitMapper'
import { Bit as BitModel } from '@/database/models/bit'
import { Premise as PremiseModel } from '@/database/models/premise'
import type { BitStatus } from '@/types'
import type { Database } from '@nozbe/watermelondb'
import { useDatabase } from '@nozbe/watermelondb/react'
import { router, useLocalSearchParams, useNavigation } from 'expo-router'
import { Button, useThemeColor } from 'heroui-native'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import type { EnrichedTextInputInstance, OnChangeStateEvent } from 'react-native-enriched'
import { EnrichedTextInput } from 'react-native-enriched'
import { KeyboardStickyView } from 'react-native-keyboard-controller'

export default function BitDetailScreen() {
    const { id, metaStatus, metaTags, metaPremiseId, metaNonce } = useLocalSearchParams<{
        id: string
        metaStatus?: string
        metaTags?: string
        metaPremiseId?: string
        metaNonce?: string
    }>()
    const navigation = useNavigation('/(app)')
    const database = useDatabase()
    const editorRef = useRef<EnrichedTextInputInstance>(null)
    const isEditing = id !== 'new'

    const [bitModel, setBitModel] = useState<BitModel | null>(null)
    const [content, setContent] = useState('')
    const [status, setStatus] = useState<BitStatus>('draft')
    const [tags, setTags] = useState<string[]>([])
    const [premiseId, setPremiseId] = useState<string | null>(null)
    const [linkedPremiseContent, setLinkedPremiseContent] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    const [stylesState, setStylesState] = useState<OnChangeStateEvent | null>(null)
    const [isPremiseExpanded, setIsPremiseExpanded] = useState(false)

    const foreground = useThemeColor('foreground')
    const muted = useThemeColor('muted')
    const accent = useThemeColor('accent')

    useEffect(() => {
        if (!isEditing || !id) {
            setBitModel(null)
            setContent('')
            setStatus('draft')
            setTags([])
            setPremiseId(null)
            setLinkedPremiseContent('')
            return
        }

        const subscription = database
            .get<BitModel>(BIT_TABLE)
            .findAndObserve(id)
            .subscribe((result: BitModel) => {
                const bit = bitModelToDomain(result)
                setBitModel(result)
                setContent(bit.content)
                setStatus(bit.status)
                setTags((bit.tags ?? []).map((tag) => tag.name))
                setPremiseId(bit.premiseId ?? null)
            })

        return () => subscription.unsubscribe()
    }, [database, id, isEditing])

    useEffect(() => {
        if (typeof metaNonce !== 'string' || metaNonce.length === 0) return

        if (typeof metaStatus === 'string' && metaStatus.length > 0) {
            setStatus(metaStatus as BitStatus)
        }

        if (typeof metaTags === 'string') {
            setTags(metaTags.length > 0 ? metaTags.split(',').filter(Boolean) : [])
        }

        if (typeof metaPremiseId === 'string') {
            setPremiseId(metaPremiseId.length > 0 ? metaPremiseId : null)
        }

        router.setParams({
            metaStatus: '',
            metaTags: '',
            metaPremiseId: '',
            metaNonce: '',
        })
    }, [metaNonce, metaPremiseId, metaStatus, metaTags])

    useEffect(() => {
        if (!premiseId) {
            setLinkedPremiseContent('')
            return
        }

        void (async () => {
            try {
                const premise = await database.get<PremiseModel>(PREMISE_TABLE).find(premiseId)
                setLinkedPremiseContent(premise.content)
            } catch {
                setLinkedPremiseContent('')
            }
        })()
    }, [database, premiseId])

    const canSave = content.trim().length > 0 && !isSaving

    const handleSave = useCallback(async () => {
        const trimmed = content.trim()
        if (!trimmed || isSaving) return

        setIsSaving(true)
        try {
            if (isEditing && bitModel) {
                const previousPremiseId = bitModel.premiseId

                await bitModel.updateBit({
                    content: trimmed,
                    status,
                    tags,
                    premiseId,
                })

                await syncBitPremiseRelation({
                    database,
                    bitId: bitModel.id,
                    previousPremiseId,
                    nextPremiseId: premiseId,
                })

                router.back()
                return
            }

            let createdBitId = ''
            await database.write(async () => {
                const created = await database.get<BitModel>(BIT_TABLE).create((bit: BitModel) => {
                    const now = Date.now()
                    bit.content = trimmed
                    bit.status = status
                    bit.tagsJson = JSON.stringify(tags)
                    bit.premiseId = premiseId
                    bit.setlistIdsJson = JSON.stringify([])
                    bit.createdAt = new Date(now)
                    bit.updatedAt = new Date(now)
                })

                createdBitId = created.id
            })

            await syncBitPremiseRelation({
                database,
                bitId: createdBitId,
                previousPremiseId: null,
                nextPremiseId: premiseId,
            })

            router.back()
        } finally {
            setIsSaving(false)
        }
    }, [bitModel, content, database, isEditing, isSaving, premiseId, status, tags])

    const openBitMeta = useCallback(() => {
        router.push({
            pathname: '/(app)/(modal)/bit-meta',
            params: {
                tags: tags.join(','),
                status,
                premiseId: premiseId ?? '',
                bitId: id,
            },
        })
    }, [id, premiseId, status, tags])

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: isEditing ? 'Edit Bit' : 'New Bit',
            headerRight: () => (
                <View className='flex-row items-center gap-1'>
                    <Button size='sm' variant='ghost' onPress={openBitMeta}>
                        <Button.Label className='text-accent font-semibold'>Meta</Button.Label>
                    </Button>
                    <Button size='sm' variant='ghost' onPress={handleSave} isDisabled={!canSave}>
                        <Button.Label className='text-accent font-semibold'>
                            {isEditing ? 'Save' : 'Create'}
                        </Button.Label>
                    </Button>
                </View>
            ),
        })
    }, [canSave, handleSave, isEditing, navigation, openBitMeta])

    const editorKey = useMemo(() => {
        if (!isEditing) return 'bit-new'
        return `${id}-${bitModel?.updatedAt?.getTime() ?? 0}`
    }, [bitModel?.updatedAt, id, isEditing])

    return (
        <View className='flex-1 bg-background'>
            {premiseId && (
                <Pressable
                    onPress={() => setIsPremiseExpanded((prev) => !prev)}
                    className='px-4 py-3 bg-surface-secondary border-b border-separator'
                >
                    <View className='flex-row items-center gap-2 mb-1'>
                        <Icon name='bulb-outline' size={14} className='text-accent' />
                        <Text className='text-muted text-[10px] tracking-[2px] font-semibold uppercase'>
                            Premise
                        </Text>
                        <View className='flex-1' />
                        <Icon
                            name={isPremiseExpanded ? 'chevron-up' : 'chevron-down'}
                            size={14}
                            className='text-muted'
                        />
                    </View>
                    <Text className='text-muted text-[13px]' numberOfLines={isPremiseExpanded ? undefined : 1}>
                        {linkedPremiseContent || `Linked premise: ${premiseId}`}
                    </Text>
                </Pressable>
            )}

            <ScrollView
                className='flex-1'
                contentContainerClassName='px-4 pt-4 pb-28'
                keyboardShouldPersistTaps='handled'
            >
                <EnrichedTextInput
                    key={editorKey}
                    ref={editorRef}
                    defaultValue={content}
                    onChangeText={(event) => {
                        const payload = event.nativeEvent as { html?: string; value?: string; text?: string }
                        setContent(payload.html ?? payload.value ?? payload.text ?? '')
                    }}
                    onChangeHtml={(event) => {
                        const payload = event.nativeEvent as { html?: string; value?: string; text?: string }
                        setContent(payload.html ?? payload.value ?? payload.text ?? '')
                    }}
                    onChangeState={(event) => setStylesState(event.nativeEvent)}
                    style={{
                        fontSize: 17,
                        lineHeight: 26,
                        color: foreground,
                        minHeight: 300,
                    }}
                    placeholder='Start writing your bit...'
                    placeholderTextColor={muted}
                    cursorColor={accent}
                    selectionColor={accent}
                />
            </ScrollView>

            <EditorToolbar editorRef={editorRef} stylesState={stylesState} />
        </View>
    )
}

function parseIdsJson(value: string): string[] {
    try {
        const parsed = JSON.parse(value)
        if (!Array.isArray(parsed)) return []
        return parsed.filter((entry): entry is string => typeof entry === 'string')
    } catch {
        return []
    }
}

async function syncBitPremiseRelation(input: {
    database: Database
    bitId: string
    previousPremiseId: string | null
    nextPremiseId: string | null
}) {
    const { database, bitId, previousPremiseId, nextPremiseId } = input

    if (previousPremiseId === nextPremiseId) return

    await database.write(async () => {
        if (previousPremiseId) {
            try {
                const previous = await database.get<PremiseModel>(PREMISE_TABLE).find(previousPremiseId)
                const previousIds = parseIdsJson(previous.bitIdsJson).filter((entry) => entry !== bitId)

                await previous.update((model) => {
                    model.bitIdsJson = JSON.stringify(previousIds)
                    model.updatedAt = new Date()
                })
            } catch {
                // Ignore dangling relation.
            }
        }

        if (nextPremiseId) {
            try {
                const next = await database.get<PremiseModel>(PREMISE_TABLE).find(nextPremiseId)
                const nextIds = parseIdsJson(next.bitIdsJson)

                if (!nextIds.includes(bitId)) {
                    nextIds.push(bitId)
                }

                await next.update((model) => {
                    model.bitIdsJson = JSON.stringify(nextIds)
                    model.updatedAt = new Date()
                })
            } catch {
                // Ignore invalid target relation.
            }
        }
    })
}

function EditorToolbar({
    editorRef,
    stylesState,
}: {
    editorRef: React.RefObject<EnrichedTextInputInstance | null>
    stylesState: OnChangeStateEvent | null
}) {
    const isH1Active = stylesState?.h1?.isActive ?? false
    const isH2Active = stylesState?.h2?.isActive ?? false
    const isParagraphActive = !isH1Active && !isH2Active

    return (
        <KeyboardStickyView offset={{ closed: 0, opened: 0 }} className='absolute bottom-0 right-0 left-0'>
            <View className='flex-row items-center gap-2 px-4 py-2.5 bg-surface border-t border-separator'>
                <ToolbarButton
                    label='H1'
                    isActive={isH1Active}
                    onPress={() => editorRef.current?.toggleH1()}
                />
                <ToolbarButton
                    label='H2'
                    isActive={isH2Active}
                    onPress={() => editorRef.current?.toggleH2()}
                />
                <View className='w-px h-5 bg-separator mx-1' />
                <ToolbarButton
                    label='P'
                    isActive={isParagraphActive}
                    onPress={() => {
                        if (isH1Active) editorRef.current?.toggleH1()
                        if (isH2Active) editorRef.current?.toggleH2()
                    }}
                />
            </View>
        </KeyboardStickyView>
    )
}

function ToolbarButton({
    label,
    isActive,
    onPress,
}: {
    label: string
    isActive: boolean
    onPress: () => void
}) {
    return (
        <Pressable
            onPress={onPress}
            className={`px-3.5 py-1.5 rounded-lg ${isActive ? 'bg-accent' : 'bg-default'}`}
        >
            <Text
                className={`text-sm font-bold ${isActive ? 'text-accent-foreground' : 'text-foreground'}`}
            >
                {label}
            </Text>
        </Pressable>
    )
}
