import { SelectBitsModal } from '@/features/material/components/select-bits-modal'
import { parseCsvParam, toCsvParam } from '@/features/material/filters/filter-query'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback } from 'react'

export default function PremiseAddBitModal() {
    const router = useRouter()
    const { selected: selectedParam, premiseId } = useLocalSearchParams<{
        selected?: string
        premiseId?: string
    }>()

    const initialSelectedIds = parseCsvParam(selectedParam)

    const handleConfirm = useCallback((selectedIds: Set<string>) => {
        if (!premiseId) {
            router.back()
            return
        }

        router.dismissTo({
            pathname: '/(app)/(detail)/premise/[id]',
            params: {
                id: premiseId,
                selectedBits: toCsvParam(selectedIds),
                bitsNonce: Date.now().toString(),
            },
        })
    }, [premiseId])

    const handleCreate = useCallback(() => {
        if (!premiseId) return

        router.back()
        router.push({
            pathname: '/(app)/(detail)/bit/[id]',
            params: {
                id: 'new',
                metaPremiseId: premiseId,
                metaNonce: Date.now().toString(),
            },
        })
    }, [premiseId])

    return (
        <SelectBitsModal
            variant='premise'
            premiseId={premiseId}
            initialSelectedIds={initialSelectedIds}
            title='Choose Bits'
            searchPlaceholder='Search bits...'
            createLabel='Create a new bit from this premise'
            confirmLabel={(count) => `Save (${count})`}
            onCancel={() => router.back()}
            onCreate={handleCreate}
            onConfirm={handleConfirm}
        />
    )
}
