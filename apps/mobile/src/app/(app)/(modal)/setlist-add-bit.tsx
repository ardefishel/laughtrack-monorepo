import { SelectBitsModal } from '@/components/feature/material/select-bits-modal'
import { parseCsvParam, toCsvParam } from '@/utils/filter-query'
import { router, useLocalSearchParams } from 'expo-router'

export default function SetlistAddBitModal() {
    const { selected: selectedParam } = useLocalSearchParams<{ selected?: string }>()
    const initialSelectedIds = parseCsvParam(selectedParam)

    return (
        <SelectBitsModal
            variant='setlist'
            initialSelectedIds={initialSelectedIds}
            title='Select Bits'
            searchPlaceholder='Search bits...'
            createLabel='Create a new bit'
            confirmLabel={(count) => (count > 0 ? `Add (${count})` : 'Add')}
            isConfirmDisabled={(count) => count === 0}
            onCancel={() => router.back()}
            onCreate={() => {
                router.back()
                router.push('/bit/new')
            }}
            onConfirm={(selectedIds) => {
                router.back()
                requestAnimationFrame(() => {
                    router.setParams({
                        addedBits: toCsvParam(selectedIds),
                        addedBitsNonce: Date.now().toString(),
                    })
                })
            }}
        />
    )
}
