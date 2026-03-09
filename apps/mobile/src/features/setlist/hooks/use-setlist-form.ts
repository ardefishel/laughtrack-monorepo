import { BIT_TABLE, SETLIST_TABLE } from '@/database/constants'
import { bitModelToDomain } from '@/database/mappers/bitMapper'
import { setlistModelToDomain } from '@/database/mappers/setlistMapper'
import { Bit as BitModel } from '@/database/models/bit'
import { Setlist as SetlistModel } from '@/database/models/setlist'
import { parseStringArrayJson } from '@/database/utils/json'
import { dbLogger } from '@/lib/loggers'
import type { SetlistItem } from '@/types'
import { useDatabase } from '@nozbe/watermelondb/react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'

function toPersistedSetlistItems(items: SetlistItem[]): SetlistItem[] {
    return items
        .map((item): SetlistItem | null => {
            if (item.type === 'bit') {
                return {
                    id: item.id,
                    type: 'bit',
                    bitId: item.bitId,
                }
            }

            if (!item.setlistNote) return null

            return {
                id: item.id,
                type: 'set-note',
                setlistNote: {
                    id: item.setlistNote.id,
                    content: item.setlistNote.content,
                    createdAt: item.setlistNote.createdAt,
                    updatedAt: item.setlistNote.updatedAt,
                },
            }
        })
        .filter((item): item is SetlistItem => item !== null)
}

function uniqueSortedIds(values: string[]): string[] {
    return [...new Set(values)].sort((left, right) => left.localeCompare(right))
}

function extractBitIds(items: SetlistItem[]): string[] {
    return uniqueSortedIds(
        items
            .filter((item): item is Extract<SetlistItem, { type: 'bit' }> => item.type === 'bit')
            .map((item) => item.bitId),
    )
}

export function useSetlistForm() {
    const router = useRouter()
    const database = useDatabase()
    const { id, addedBits, addedBitsNonce } = useLocalSearchParams<{
        id: string
        addedBits?: string
        addedBitsNonce?: string
    }>()
    const isEditing = id !== 'new'

    const [setlistState, setSetlistState] = useState<{ setlist: SetlistModel; _key: number } | null>(null)
    const setlistModel = setlistState?.setlist ?? null

    const [description, setDescription] = useState('')
    const [tags, setTags] = useState<string[]>([])
    const [items, setItems] = useState<SetlistItem[]>([])
    const [isSaving, setIsSaving] = useState(false)

    const [typeDialogOpen, setTypeDialogOpen] = useState(false)
    const [noteDialogOpen, setNoteDialogOpen] = useState(false)
    const [noteText, setNoteText] = useState('')

    const hydrateItemsWithBits = useCallback(
        async (sourceItems: SetlistItem[]): Promise<SetlistItem[]> => {
            const bitIds = extractBitIds(sourceItems)
            if (bitIds.length === 0) return sourceItems

            const foundModels = await Promise.all(
                bitIds.map(async (bitId) => {
                    try {
                        return await database.get<BitModel>(BIT_TABLE).find(bitId)
                    } catch (error) {
                        dbLogger.debug('SetlistDetail hydrateItemsWithBits missing bit', { bitId, error })
                        return null
                    }
                }),
            )

            const bitById = new Map(
                foundModels
                    .filter((model): model is BitModel => model !== null)
                    .map((model) => [model.id, bitModelToDomain(model)]),
            )

            return sourceItems.map((item) => {
                if (item.type !== 'bit') return item
                return {
                    ...item,
                    bit: bitById.get(item.bitId),
                }
            })
        },
        [database],
    )

    useEffect(() => {
        if (!isEditing || !id) {
            setSetlistState(null)
            setDescription('')
            setTags([])
            setItems([])
            return
        }

        const subscription = database
            .get<SetlistModel>(SETLIST_TABLE)
            .findAndObserve(id)
            .subscribe({
                next: (result: SetlistModel) => {
                    const domainSetlist = setlistModelToDomain(result)
                    setSetlistState({
                        setlist: result,
                        _key: result.updatedAt.getTime(),
                    })
                    setDescription(domainSetlist.description)
                    setTags((domainSetlist.tags ?? []).map((tag) => tag.name))
                    void hydrateItemsWithBits(domainSetlist.items).then((nextItems) => {
                        setItems(nextItems)
                    }).catch((error: unknown) => {
                        dbLogger.error('SetlistDetail failed to hydrate setlist items', { error, setlistId: id })
                    })
                },
                error: (error: unknown) => {
                    dbLogger.error('SetlistDetail subscription failed', { error, setlistId: id })
                },
            })

        return () => subscription.unsubscribe()
    }, [database, hydrateItemsWithBits, id, isEditing])

    useEffect(() => {
        if (!addedBitsNonce) return
        if (!addedBits) {
            router.setParams({ addedBits: '', addedBitsNonce: '' })
            return
        }

        const incomingIds = addedBits.split(',').filter(Boolean)
        if (incomingIds.length === 0) {
            router.setParams({ addedBits: '', addedBitsNonce: '' })
            return
        }

        void (async () => {
            try {
                const foundModels = await Promise.all(
                    incomingIds.map(async (bitId) => {
                        try {
                            return await database.get<BitModel>(BIT_TABLE).find(bitId)
                        } catch (error) {
                            dbLogger.debug('SetlistDetail add bits ignored missing model', { bitId, error })
                            return null
                        }
                    }),
                )

                const foundBits = foundModels
                    .filter((model): model is BitModel => model !== null)
                    .map(bitModelToDomain)

                const newItems: SetlistItem[] = foundBits.map((bit, idx) => ({
                    id: `new-bit-${Date.now()}-${idx}`,
                    type: 'bit',
                    bitId: bit.id,
                    bit,
                }))

                setItems((prev) => {
                    const existingBitIds = new Set(
                        prev
                            .filter((item): item is Extract<SetlistItem, { type: 'bit' }> => item.type === 'bit')
                            .map((item) => item.bitId),
                    )
                    const dedupedIncomingItems = newItems.filter(
                        (item): item is Extract<SetlistItem, { type: 'bit' }> =>
                            item.type === 'bit' && !existingBitIds.has(item.bitId),
                    )
                    return [...prev, ...dedupedIncomingItems]
                })
            } catch (error) {
                dbLogger.error('SetlistDetail failed to append selected bits', {
                    error,
                    setlistId: id,
                    incomingCount: incomingIds.length,
                })
            } finally {
                router.setParams({ addedBits: '', addedBitsNonce: '' })
            }
        })()
    }, [addedBits, addedBitsNonce, database, id, router])

    const handleSave = useCallback(async () => {
        const trimmedDescription = description.trim()
        if (!trimmedDescription || isSaving) return

        const persistedItems = toPersistedSetlistItems(items)
        const nextBitIds = extractBitIds(persistedItems)

        setIsSaving(true)
        try {
            await database.write(async () => {
                const now = new Date()

                if (isEditing && id && setlistModel) {
                    const previousBitIds = extractBitIds(setlistModelToDomain(setlistModel).items)

                    await setlistModel.update((setlist) => {
                        setlist.description = trimmedDescription
                        setlist.tagsJson = JSON.stringify(tags)
                        setlist.itemsJson = JSON.stringify(persistedItems)
                        setlist.updatedAt = now
                    })

                    const nextBitIdSet = new Set(nextBitIds)
                    const previousBitIdSet = new Set(previousBitIds)
                    const touchedBitIds = uniqueSortedIds([...nextBitIds, ...previousBitIds])

                    for (const bitId of touchedBitIds) {
                        try {
                            const bit = await database.get<BitModel>(BIT_TABLE).find(bitId)
                            const currentSetlistIds = uniqueSortedIds(parseStringArrayJson(bit.setlistIdsJson))
                            const shouldContain = nextBitIdSet.has(bitId)
                            const previouslyContained = previousBitIdSet.has(bitId)

                            if (!shouldContain && !previouslyContained) continue

                            const nextSetlistIds = shouldContain
                                ? uniqueSortedIds([...currentSetlistIds, id])
                                : currentSetlistIds.filter((setlistId) => setlistId !== id)

                            if (
                                nextSetlistIds.length === currentSetlistIds.length &&
                                nextSetlistIds.every((value, index) => value === currentSetlistIds[index])
                            ) {
                                continue
                            }

                            await bit.update((model) => {
                                model.setlistIdsJson = JSON.stringify(nextSetlistIds)
                                model.updatedAt = now
                            })
                        } catch (error) {
                            dbLogger.warn('SetlistDetail save ignored failed bit update', { bitId, error })
                            continue
                        }
                    }

                    return
                }

                const createdSetlist = await database.get<SetlistModel>(SETLIST_TABLE).create((setlist: SetlistModel) => {
                    setlist.description = trimmedDescription
                    setlist.tagsJson = JSON.stringify(tags)
                    setlist.itemsJson = JSON.stringify(persistedItems)
                    setlist.createdAt = now
                    setlist.updatedAt = now
                })

                for (const bitId of nextBitIds) {
                    try {
                        const bit = await database.get<BitModel>(BIT_TABLE).find(bitId)
                        const currentSetlistIds = uniqueSortedIds(parseStringArrayJson(bit.setlistIdsJson))
                        const nextSetlistIds = uniqueSortedIds([...currentSetlistIds, createdSetlist.id])

                        if (
                            nextSetlistIds.length === currentSetlistIds.length &&
                            nextSetlistIds.every((value, index) => value === currentSetlistIds[index])
                        ) {
                            continue
                        }

                        await bit.update((model) => {
                            model.setlistIdsJson = JSON.stringify(nextSetlistIds)
                            model.updatedAt = now
                        })
                    } catch (error) {
                        dbLogger.warn('SetlistDetail save ignored failed created setlist relation update', {
                            bitId,
                            error,
                        })
                        continue
                    }
                }
            })

            router.back()
        } catch (error) {
            dbLogger.error('SetlistDetail failed to save setlist', {
                error,
                setlistId: isEditing ? id : 'new',
                isEditing,
                bitCount: nextBitIds.length,
                itemCount: persistedItems.length,
                tagCount: tags.length,
            })
        } finally {
            setIsSaving(false)
        }
    }, [database, description, id, isEditing, isSaving, items, router, setlistModel, tags])

    const handleChooseBit = useCallback(() => {
        setTypeDialogOpen(false)
        const selected = items
            .filter((item): item is Extract<SetlistItem, { type: 'bit' }> => item.type === 'bit')
            .map((item) => item.bitId)
            .join(',')

        router.push({
            pathname: '/(app)/(modal)/setlist-add-bit',
            params: {
                selected,
            },
        })
    }, [items, router])

    const handleChooseNote = useCallback(() => {
        setTypeDialogOpen(false)
        setNoteText('')
        setNoteDialogOpen(true)
    }, [])

    const handleConfirmNote = useCallback(() => {
        const trimmed = noteText.trim()
        if (!trimmed) return

        const newItem: SetlistItem = {
            id: `new-note-${Date.now()}`,
            type: 'set-note',
            setlistNote: {
                id: `n-${Date.now()}`,
                content: trimmed,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        }

        setItems((prev) => [...prev, newItem])
        setNoteDialogOpen(false)
        setNoteText('')
    }, [noteText])

    const canSave = description.trim().length > 0 && !isSaving
    const bitCount = items.filter((item) => item.type === 'bit').length

    return {
        isEditing,
        description,
        setDescription,
        tags,
        setTags,
        items,
        setItems,
        isSaving,
        canSave,
        bitCount,
        handleSave,
        typeDialogOpen,
        setTypeDialogOpen,
        noteDialogOpen,
        setNoteDialogOpen,
        noteText,
        setNoteText,
        handleChooseBit,
        handleChooseNote,
        handleConfirmNote,
    }
}
