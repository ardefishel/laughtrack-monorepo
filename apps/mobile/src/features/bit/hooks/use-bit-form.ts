import { syncBitPremiseRelation } from '@/features/premise/services/premise-bit-links'
import { BIT_TABLE, PREMISE_TABLE } from '@/database/constants'
import { bitModelToDomain } from '../data/bit.mapper'
import { Bit as BitModel } from '../data/bit.model'
import { Premise as PremiseModel } from '@/features/premise/data/premise.model'
import { dbLogger } from '@/lib/loggers'
import type { BitStatus } from '@/types'
import { useDatabase } from '@nozbe/watermelondb/react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useEffect, useMemo, useReducer } from 'react'

const BIT_STATUS_VALUES: BitStatus[] = ['draft', 'rework', 'tested', 'final', 'dead']

function isBitStatus(value: string): value is BitStatus {
    return BIT_STATUS_VALUES.includes(value as BitStatus)
}

type BitFormState = {
    bitModel: BitModel | null
    content: string
    editorInitialValue: string
    editorRevision: number
    status: BitStatus
    tags: string[]
    premiseId: string | null
    linkedPremiseContent: string
    isSaving: boolean
}

const INITIAL_STATE: BitFormState = {
    bitModel: null,
    content: '',
    editorInitialValue: '',
    editorRevision: 0,
    status: 'draft',
    tags: [],
    premiseId: null,
    linkedPremiseContent: '',
    isSaving: false,
}

type BitFormAction =
    | { type: 'RESET' }
    | { type: 'LOAD'; model: BitModel; content: string; status: BitStatus; tags: string[]; premiseId: string | null; revision: number }
    | { type: 'SET_CONTENT'; content: string }
    | { type: 'SET_STATUS'; status: BitStatus }
    | { type: 'SET_TAGS'; tags: string[] }
    | { type: 'SET_PREMISE_ID'; premiseId: string | null }
    | { type: 'SET_LINKED_PREMISE_CONTENT'; content: string }
    | { type: 'SET_SAVING'; isSaving: boolean }

function bitFormReducer(state: BitFormState, action: BitFormAction): BitFormState {
    switch (action.type) {
        case 'RESET':
            return INITIAL_STATE
        case 'LOAD':
            return {
                ...state,
                bitModel: action.model,
                content: action.content,
                editorInitialValue: action.content,
                editorRevision: action.revision,
                status: action.status,
                tags: action.tags,
                premiseId: action.premiseId,
            }
        case 'SET_CONTENT':
            return { ...state, content: action.content }
        case 'SET_STATUS':
            return { ...state, status: action.status }
        case 'SET_TAGS':
            return { ...state, tags: action.tags }
        case 'SET_PREMISE_ID':
            return { ...state, premiseId: action.premiseId }
        case 'SET_LINKED_PREMISE_CONTENT':
            return { ...state, linkedPremiseContent: action.content }
        case 'SET_SAVING':
            return { ...state, isSaving: action.isSaving }
    }
}

export function useBitForm() {
    const router = useRouter()
    const { id, metaStatus, metaTags, metaPremiseId, metaNonce, fromSetlist } = useLocalSearchParams<{
        id: string
        metaStatus?: string
        metaTags?: string
        metaPremiseId?: string
        metaNonce?: string
        fromSetlist?: string
    }>()
    const database = useDatabase()
    const isEditing = id !== 'new'

    const [state, dispatch] = useReducer(bitFormReducer, INITIAL_STATE)
    const { bitModel, content, editorInitialValue, editorRevision, status, tags, premiseId, linkedPremiseContent, isSaving } = state

    const setContent = useCallback((value: string) => dispatch({ type: 'SET_CONTENT', content: value }), [])

    useEffect(() => {
        if (!isEditing || !id) {
            dispatch({ type: 'RESET' })
            return
        }

        const subscription = database
            .get<BitModel>(BIT_TABLE)
            .findAndObserve(id)
            .subscribe({
                next: (result: BitModel) => {
                    const bit = bitModelToDomain(result)
                    dispatch({
                        type: 'LOAD',
                        model: result,
                        content: bit.content,
                        status: bit.status,
                        tags: (bit.tags ?? []).map((tag) => tag.name),
                        premiseId: bit.premiseId ?? null,
                        revision: result.updatedAt.getTime(),
                    })
                },
                error: (error: unknown) => {
                    dbLogger.error('BitDetail subscription failed', { error, bitId: id })
                },
            })

        return () => subscription.unsubscribe()
    }, [database, id, isEditing])

    useEffect(() => {
        if (typeof metaNonce !== 'string' || metaNonce.length === 0) return

        if (typeof metaStatus === 'string' && isBitStatus(metaStatus)) {
            dispatch({ type: 'SET_STATUS', status: metaStatus })
        }

        if (typeof metaTags === 'string') {
            dispatch({ type: 'SET_TAGS', tags: metaTags.length > 0 ? metaTags.split(',').filter(Boolean) : [] })
        }

        if (typeof metaPremiseId === 'string') {
            dispatch({ type: 'SET_PREMISE_ID', premiseId: metaPremiseId.length > 0 ? metaPremiseId : null })
        }

        router.setParams({
            metaStatus: '',
            metaTags: '',
            metaPremiseId: '',
            metaNonce: '',
        })
    }, [metaNonce, metaPremiseId, metaStatus, metaTags, router])

    useEffect(() => {
        if (!premiseId) {
            dispatch({ type: 'SET_LINKED_PREMISE_CONTENT', content: '' })
            return
        }

        void (async () => {
            try {
                const premise = await database.get<PremiseModel>(PREMISE_TABLE).find(premiseId)
                dispatch({ type: 'SET_LINKED_PREMISE_CONTENT', content: premise.content })
            } catch (error) {
                dbLogger.debug('BitDetail failed to load linked premise preview', {
                    premiseId,
                    error,
                })
                dispatch({ type: 'SET_LINKED_PREMISE_CONTENT', content: '' })
            }
        })()
    }, [database, premiseId])

    const canSave = useMemo(() => content.trim().length > 0 && !isSaving, [content, isSaving])

    const handleSave = useCallback(async (nextContent?: string) => {
        const trimmed = (nextContent ?? content).trim()
        if (!trimmed || isSaving) return

        dispatch({ type: 'SET_SAVING', isSaving: true })
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

            if (fromSetlist === 'true' && createdBitId) {
                requestAnimationFrame(() => {
                    router.setParams({
                        addedBits: createdBitId,
                        addedBitsNonce: Date.now().toString(),
                    })
                })
            }
        } catch (error) {
            dbLogger.error('BitDetail failed to save bit', {
                error,
                bitId: isEditing ? bitModel?.id ?? id : 'new',
                isEditing,
                premiseId,
                tagCount: tags.length,
                fromSetlist,
            })
        } finally {
            dispatch({ type: 'SET_SAVING', isSaving: false })
        }
    }, [bitModel, content, database, fromSetlist, id, isEditing, isSaving, premiseId, router, status, tags])

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
    }, [id, premiseId, router, status, tags])

    const editorKey = useMemo(() => {
        if (!isEditing) return 'bit-new'
        return `${id}-${editorRevision}`
    }, [editorRevision, id, isEditing])

    return {
        isEditing,
        content,
        setContent,
        editorInitialValue,
        editorKey,
        premiseId,
        linkedPremiseContent,
        canSave,
        handleSave,
        openBitMeta,
    }
}
