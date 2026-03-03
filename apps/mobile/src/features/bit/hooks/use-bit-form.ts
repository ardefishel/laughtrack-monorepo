import { syncBitPremiseRelation } from '@/features/premise/services/premise-bit-links'
import { BIT_TABLE, PREMISE_TABLE } from '@/database/constants'
import { bitModelToDomain } from '@/database/mappers/bitMapper'
import { Bit as BitModel } from '@/database/models/bit'
import { Premise as PremiseModel } from '@/database/models/premise'
import { dbLogger } from '@/lib/loggers'
import type { BitStatus } from '@/types'
import { useDatabase } from '@nozbe/watermelondb/react'
import { router, useLocalSearchParams } from 'expo-router'
import { useCallback, useEffect, useMemo, useState } from 'react'

const BIT_STATUS_VALUES: BitStatus[] = ['draft', 'rework', 'tested', 'final', 'dead']

function isBitStatus(value: string): value is BitStatus {
    return BIT_STATUS_VALUES.includes(value as BitStatus)
}

export function useBitForm() {
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

    const [bitModel, setBitModel] = useState<BitModel | null>(null)
    const [content, setContent] = useState('')
    const [editorInitialValue, setEditorInitialValue] = useState('')
    const [editorRevision, setEditorRevision] = useState(0)
    const [status, setStatus] = useState<BitStatus>('draft')
    const [tags, setTags] = useState<string[]>([])
    const [premiseId, setPremiseId] = useState<string | null>(null)
    const [linkedPremiseContent, setLinkedPremiseContent] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (!isEditing || !id) {
            setBitModel(null)
            setContent('')
            setEditorInitialValue('')
            setEditorRevision(0)
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
                setEditorInitialValue(bit.content)
                setEditorRevision(result.updatedAt.getTime())
                setStatus(bit.status)
                setTags((bit.tags ?? []).map((tag) => tag.name))
                setPremiseId(bit.premiseId ?? null)
            })

        return () => subscription.unsubscribe()
    }, [database, id, isEditing])

    useEffect(() => {
        if (typeof metaNonce !== 'string' || metaNonce.length === 0) return

        if (typeof metaStatus === 'string' && isBitStatus(metaStatus)) {
            setStatus(metaStatus)
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
            } catch (error) {
                dbLogger.debug('BitDetail failed to load linked premise preview', {
                    premiseId,
                    error,
                })
                setLinkedPremiseContent('')
            }
        })()
    }, [database, premiseId])

    const canSave = useMemo(() => content.trim().length > 0 && !isSaving, [content, isSaving])

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

            if (fromSetlist === 'true' && createdBitId) {
                requestAnimationFrame(() => {
                    router.setParams({
                        addedBits: createdBitId,
                        addedBitsNonce: Date.now().toString(),
                    })
                })
            }
        } finally {
            setIsSaving(false)
        }
    }, [bitModel, content, database, fromSetlist, isEditing, isSaving, premiseId, status, tags])

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
