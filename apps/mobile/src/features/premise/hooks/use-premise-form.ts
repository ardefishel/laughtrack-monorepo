import { BIT_TABLE, PREMISE_TABLE } from '@/database/constants'
import { premiseModelToDomain } from '@/database/mappers/premiseMapper'
import { Bit as BitModel } from '@/database/models/bit'
import { Premise as PremiseModel } from '@/database/models/premise'
import { reconcilePremiseBitLinks } from '@/features/premise/services/premise-bit-links'
import { dbLogger } from '@/lib/loggers'
import type { Attitude, PremiseStatus } from '@/types'
import { parseCsvParam, toCsvParam } from '@/features/material/filters/filter-query'
import { timeAgo } from '@/utils/time-ago'
import { useDatabase } from '@nozbe/watermelondb/react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useEffect, useMemo, useState } from 'react'

export function usePremiseForm() {
    const router = useRouter()
    const database = useDatabase()
    const { id, selectedBits, bitsNonce } = useLocalSearchParams<{
        id: string
        selectedBits?: string
        bitsNonce?: string
    }>()
    const isEditing = id !== 'new'

    const [premiseModel, setPremiseModel] = useState<PremiseModel | null>(null)
    const [content, setContent] = useState('')
    const [status, setStatus] = useState<PremiseStatus>('draft')
    const [attitude, setAttitude] = useState<Attitude | undefined>(undefined)
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

    const canSave = useMemo(() => content.trim().length > 0 && !isSaving, [content, isSaving])

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
                } catch (error) {
                    dbLogger.debug('PremiseForm applySelectedBits ignored unlink failure', {
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
                    dbLogger.debug('PremiseForm applySelectedBits ignored link failure', {
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
                dbLogger.debug('PremiseForm applySelectedBits ignored premise update failure', {
                    premiseId: id,
                    error,
                })
            }
        })

        await reconcilePremiseBitLinks(database)
    }, [bitIds, database, id, isEditing])

    useEffect(() => {
        if (typeof bitsNonce !== 'string' || bitsNonce.length === 0) return

        const nextBitIds = parseCsvParam(selectedBits)

        void applySelectedBits(nextBitIds).finally(() => {
            router.setParams({ selectedBits: '', bitsNonce: '' })
        })
    }, [applySelectedBits, bitsNonce, router, selectedBits])

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
        } finally {
            setIsSaving(false)
        }
    }, [attitude, canSave, content, database, isEditing, premiseModel, router, status, tags])

    const clearAttitude = useCallback(() => {
        setAttitude(undefined)
    }, [])

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
        setStatus,
        attitude,
        setAttitude,
        clearAttitude,
        tags,
        setTags,
        bitIds,
        updatedMeta,
        canSave,
        handleSave,
        openBitPicker,
    }
}
