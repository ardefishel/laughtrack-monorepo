import { SETLIST_TABLE } from '@/database/constants'
import { setlistModelToDomain } from '../data/setlist.mapper'
import { Setlist as SetlistModel } from '../data/setlist.model'
import { fetchBitsByIds } from '@/database/utils/fetch-bits'
import { dbLogger } from '@/lib/loggers'
import type { SetlistItem } from '@/types'
import { extractBitIds, saveSetlist } from '@/features/setlist/services/setlist-actions'
import { useDatabase } from '@nozbe/watermelondb/react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useEffect, useReducer, useState } from 'react'

type SetlistFormState = {
    setlistState: { setlist: SetlistModel; _key: number } | null
    description: string
    tags: string[]
    items: SetlistItem[]
    isSaving: boolean
}

const INITIAL_STATE: SetlistFormState = {
    setlistState: null,
    description: '',
    tags: [],
    items: [],
    isSaving: false,
}

type SetlistFormAction =
    | { type: 'RESET' }
    | { type: 'LOAD'; setlist: SetlistModel; key: number; description: string; tags: string[] }
    | { type: 'SET_DESCRIPTION'; description: string }
    | { type: 'SET_TAGS'; tags: string[] }
    | { type: 'SET_ITEMS'; items: SetlistItem[] }
    | { type: 'UPDATE_ITEMS'; updater: (prev: SetlistItem[]) => SetlistItem[] }
    | { type: 'SET_SAVING'; isSaving: boolean }

function setlistFormReducer(state: SetlistFormState, action: SetlistFormAction): SetlistFormState {
    switch (action.type) {
        case 'RESET':
            return INITIAL_STATE
        case 'LOAD':
            return {
                ...state,
                setlistState: { setlist: action.setlist, _key: action.key },
                description: action.description,
                tags: action.tags,
            }
        case 'SET_DESCRIPTION':
            return { ...state, description: action.description }
        case 'SET_TAGS':
            return { ...state, tags: action.tags }
        case 'SET_ITEMS':
            return { ...state, items: action.items }
        case 'UPDATE_ITEMS':
            return { ...state, items: action.updater(state.items) }
        case 'SET_SAVING':
            return { ...state, isSaving: action.isSaving }
    }
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

    const [state, dispatch] = useReducer(setlistFormReducer, INITIAL_STATE)
    const { setlistState, description, tags, items, isSaving } = state
    const setlistModel = setlistState?.setlist ?? null

    const setDescription = useCallback((value: string) => dispatch({ type: 'SET_DESCRIPTION', description: value }), [])
    const setTags = useCallback((value: string[]) => dispatch({ type: 'SET_TAGS', tags: value }), [])
    const setItems = useCallback((value: SetlistItem[] | ((prev: SetlistItem[]) => SetlistItem[])) => {
        if (typeof value === 'function') {
            dispatch({ type: 'UPDATE_ITEMS', updater: value })
        } else {
            dispatch({ type: 'SET_ITEMS', items: value })
        }
    }, [])

    const [typeDialogOpen, setTypeDialogOpen] = useState(false)
    const [noteDialogOpen, setNoteDialogOpen] = useState(false)
    const [noteText, setNoteText] = useState('')

    const hydrateItemsWithBits = useCallback(
        async (sourceItems: SetlistItem[]): Promise<SetlistItem[]> => {
            const bitIds = extractBitIds(sourceItems)
            if (bitIds.length === 0) return sourceItems

            const bitById = await fetchBitsByIds(database, bitIds)

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
            dispatch({ type: 'RESET' })
            return
        }

        const subscription = database
            .get<SetlistModel>(SETLIST_TABLE)
            .findAndObserve(id)
            .subscribe({
                next: (result: SetlistModel) => {
                    const domainSetlist = setlistModelToDomain(result)
                    dispatch({
                        type: 'LOAD',
                        setlist: result,
                        key: result.updatedAt.getTime(),
                        description: domainSetlist.description,
                        tags: (domainSetlist.tags ?? []).map((tag) => tag.name),
                    })
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
                const bitById = await fetchBitsByIds(database, incomingIds)

                const newItems: SetlistItem[] = [...bitById.entries()].map(([bitId, bit], idx) => ({
                    id: `new-bit-${Date.now()}-${idx}`,
                    type: 'bit' as const,
                    bitId,
                    bit,
                }))

                setItems((prev) => {
                    const existingBitIds = new Set(
                        prev
                            .filter((item): item is Extract<SetlistItem, { type: 'bit' }> => item.type === 'bit')
                            .map((item) => item.bitId),
                    )
                    const dedupedIncomingItems = newItems.filter((item) => !existingBitIds.has(item.bitId))
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

        dispatch({ type: 'SET_SAVING', isSaving: true })
        try {
            await saveSetlist(database, {
                description: trimmedDescription,
                tags,
                items,
                existingSetlist: isEditing && id && setlistModel ? { id, model: setlistModel } : null,
            })

            router.back()
        } catch (error) {
            dbLogger.error('SetlistDetail failed to save setlist', {
                error,
                setlistId: isEditing ? id : 'new',
                isEditing,
            })
        } finally {
            dispatch({ type: 'SET_SAVING', isSaving: false })
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
