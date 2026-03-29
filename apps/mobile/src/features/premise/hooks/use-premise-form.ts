import { BIT_TABLE, PREMISE_TABLE } from '@/database/constants'
import { premiseModelToDomain } from '../data/premise.mapper'
import { Bit as BitModel } from '@/features/bit/data/bit.model'
import { Premise as PremiseModel } from '../data/premise.model'
import { reconcilePremiseBitLinks } from '@/features/premise/services/premise-bit-links'
import { dbLogger } from '@/lib/loggers'
import { AttitudeSchema, PremiseStatusSchema } from '@/schemas'
import type { Attitude, PremiseStatus } from '@/types'
import { parseCsvParam, toCsvParam } from '@/features/material/filters/filter-query'
import { timeAgo } from '@/lib/time-ago'
import { useDatabase } from '@nozbe/watermelondb/react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useEffect, useMemo, useReducer } from 'react'

type PremiseFormState = {
    premiseModel: PremiseModel | null
    content: string
    status: PremiseStatus
    attitude: Attitude | undefined
    tags: string[]
    bitIds: string[]
    updatedAt: Date | null
    isSaving: boolean
}

const INITIAL_STATE: PremiseFormState = {
    premiseModel: null,
    content: '',
    status: 'draft',
    attitude: undefined,
    tags: [],
    bitIds: [],
    updatedAt: null,
    isSaving: false,
}

type PremiseFormAction =
    | { type: 'RESET' }
    | { type: 'LOAD'; model: PremiseModel; content: string; status: PremiseStatus; attitude: Attitude | undefined; tags: string[]; bitIds: string[]; updatedAt: Date }
    | { type: 'SET_CONTENT'; content: string }
    | { type: 'SET_STATUS'; status: PremiseStatus }
    | { type: 'SET_ATTITUDE'; attitude: Attitude | undefined }
    | { type: 'SET_TAGS'; tags: string[] }
    | { type: 'SET_SAVING'; isSaving: boolean }

function premiseFormReducer(state: PremiseFormState, action: PremiseFormAction): PremiseFormState {
    switch (action.type) {
        case 'RESET':
            return INITIAL_STATE
        case 'LOAD':
            return {
                ...state,
                premiseModel: action.model,
                content: action.content,
                status: action.status,
                attitude: action.attitude,
                tags: action.tags,
                bitIds: action.bitIds,
                updatedAt: action.updatedAt,
            }
        case 'SET_CONTENT':
            return { ...state, content: action.content }
        case 'SET_STATUS':
            return { ...state, status: action.status }
        case 'SET_ATTITUDE':
            return { ...state, attitude: action.attitude }
        case 'SET_TAGS':
            return { ...state, tags: action.tags }
        case 'SET_SAVING':
            return { ...state, isSaving: action.isSaving }
    }
}

export function usePremiseForm() {
    const router = useRouter()
    const database = useDatabase()
    const { id, selectedBits, bitsNonce, selectedStatus, statusNonce, selectedAttitude, attitudeNonce } = useLocalSearchParams<{
        id: string
        selectedBits?: string
        bitsNonce?: string
        selectedStatus?: string
        statusNonce?: string
        selectedAttitude?: string
        attitudeNonce?: string
    }>()
    const isEditing = id !== 'new'

    const [state, dispatch] = useReducer(premiseFormReducer, INITIAL_STATE)
    const { premiseModel, content, status, attitude, tags, bitIds, updatedAt, isSaving } = state

    const setContent = useCallback((value: string) => dispatch({ type: 'SET_CONTENT', content: value }), [])
    const setTags = useCallback((value: string[]) => dispatch({ type: 'SET_TAGS', tags: value }), [])

    useEffect(() => {
        if (!isEditing || !id) {
            dispatch({ type: 'RESET' })
            return
        }

        const subscription = database
            .get<PremiseModel>(PREMISE_TABLE)
            .findAndObserve(id)
            .subscribe({
                next: (result: PremiseModel) => {
                    const premise = premiseModelToDomain(result)
                    dispatch({
                        type: 'LOAD',
                        model: result,
                        content: premise.content,
                        status: premise.status,
                        attitude: premise.attitude,
                        tags: (premise.tags ?? []).map((tag) => tag.name),
                        bitIds: premise.bitIds ?? [],
                        updatedAt: premise.updatedAt,
                    })
                },
                error: (error: unknown) => {
                    dbLogger.error('PremiseDetail subscription failed', { error, premiseId: id })
                },
            })

        return () => subscription.unsubscribe()
    }, [database, id, isEditing])

    const canSave = useMemo(() => content.trim().length > 0 && !isSaving, [content, isSaving])

    const applySelectedBits = useCallback(async (nextBitIdsInput: string[]) => {
        if (!isEditing || !id) return

        const nextBitIds = [...new Set(nextBitIdsInput.filter(Boolean))]
        const currentBitIds = [...new Set(bitIds)]

        const idsToUnlink = currentBitIds.filter((entry) => !nextBitIds.includes(entry))
        const idsToLink = nextBitIds.filter((entry) => !currentBitIds.includes(entry))

        if (idsToUnlink.length === 0 && idsToLink.length === 0) return

        try {
            await database.write(async () => {
                for (const bitId of idsToUnlink) {
                    try {
                        const bit = await database.get<BitModel>(BIT_TABLE).find(bitId)
                        if (bit.premiseId !== id) continue

                        await bit.update((model) => {
                            model.premiseId = null
                            model.updatedAt = new Date()
                        })
                    } catch (error) {
                        dbLogger.warn('PremiseForm applySelectedBits ignored unlink failure', {
                            bitId,
                            premiseId: id,
                            error,
                        })
                    }
                }

                for (const bitId of idsToLink) {
                    try {
                        const bit = await database.get<BitModel>(BIT_TABLE).find(bitId)

                        await bit.update((model) => {
                            model.premiseId = id
                            model.updatedAt = new Date()
                        })
                    } catch (error) {
                        dbLogger.warn('PremiseForm applySelectedBits ignored link failure', {
                            bitId,
                            premiseId: id,
                            error,
                        })
                    }
                }

                try {
                    const premise = await database.get<PremiseModel>(PREMISE_TABLE).find(id)
                    await premise.update((model) => {
                        model.bitIdsJson = JSON.stringify(nextBitIds)
                        model.updatedAt = new Date()
                    })
                } catch (error) {
                    dbLogger.warn('PremiseForm applySelectedBits ignored premise update failure', {
                        premiseId: id,
                        error,
                    })
                }
            })

            await reconcilePremiseBitLinks(database)
        } catch (error) {
            dbLogger.error('PremiseForm failed to apply selected bits', {
                error,
                premiseId: id,
                unlinkCount: idsToUnlink.length,
                linkCount: idsToLink.length,
            })
        }
    }, [bitIds, database, id, isEditing])

    useEffect(() => {
        if (typeof bitsNonce !== 'string' || bitsNonce.length === 0) return

        const nextBitIds = parseCsvParam(selectedBits)

        void applySelectedBits(nextBitIds).finally(() => {
            router.setParams({ selectedBits: '', bitsNonce: '' })
        })
    }, [applySelectedBits, bitsNonce, router, selectedBits])

    useEffect(() => {
        if (typeof statusNonce !== 'string' || statusNonce.length === 0) return
        if (typeof selectedStatus !== 'string' || selectedStatus.length === 0) return

        const parsed = PremiseStatusSchema.safeParse(selectedStatus)
        if (parsed.success) {
            dispatch({ type: 'SET_STATUS', status: parsed.data })
        }
        router.setParams({ selectedStatus: '', statusNonce: '' })
    }, [router, selectedStatus, statusNonce])

    useEffect(() => {
        if (typeof attitudeNonce !== 'string' || attitudeNonce.length === 0) return

        if (typeof selectedAttitude === 'string' && selectedAttitude.length > 0) {
            const parsed = AttitudeSchema.safeParse(selectedAttitude)
            if (parsed.success) {
                dispatch({ type: 'SET_ATTITUDE', attitude: parsed.data })
            }
        } else {
            dispatch({ type: 'SET_ATTITUDE', attitude: undefined })
        }

        router.setParams({ selectedAttitude: '', attitudeNonce: '' })
    }, [attitudeNonce, router, selectedAttitude])

    const handleSave = useCallback(async () => {
        const trimmed = content.trim()
        if (!canSave || !trimmed) return

        dispatch({ type: 'SET_SAVING', isSaving: true })
        try {
            if (isEditing && premiseModel) {
                await premiseModel.updatePremise({
                    content: trimmed,
                    status,
                    attitude,
                    tags,
                })
                router.back()
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
            router.back()
        } catch (error) {
            dbLogger.error('PremiseDetail failed to save premise', {
                error,
                premiseId: isEditing ? premiseModel?.id ?? id : 'new',
                isEditing,
                attitude,
                status,
                tagCount: tags.length,
            })
        } finally {
            dispatch({ type: 'SET_SAVING', isSaving: false })
        }
    }, [attitude, canSave, content, database, id, isEditing, premiseModel, router, status, tags])

    const clearAttitude = useCallback(() => {
        dispatch({ type: 'SET_ATTITUDE', attitude: undefined })
    }, [])

    const openStatusPicker = useCallback(() => {
        router.push({
            pathname: '/premise-status',
            params: {
                premiseId: id,
                selectedStatus: status,
            },
        })
    }, [id, router, status])

    const openAttitudePicker = useCallback(() => {
        router.push({
            pathname: '/premise-attitude',
            params: {
                premiseId: id,
                selectedAttitude: attitude ?? '',
            },
        })
    }, [attitude, id, router])

    const openBitPicker = useCallback(() => {
        if (!isEditing || !id) return

        router.push({
            pathname: '/(app)/(modal)/premise-add-bit',
            params: {
                premiseId: id,
                selected: toCsvParam(bitIds),
            },
        })
    }, [bitIds, id, isEditing, router])

    const updatedMeta = useMemo(() => {
        if (!updatedAt) return null
        const value = timeAgo(updatedAt)
        return `Updated ${value === 'Just now' ? 'just now' : value}`
    }, [updatedAt])

    return {
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
    }
}
