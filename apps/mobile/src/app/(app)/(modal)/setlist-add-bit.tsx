import { SelectBitsModal } from '@/features/material/components/select-bits-modal'
import { parseCsvParam, toCsvParam } from '@/features/material/filters/filter-query'
import { useLocalSearchParams, useRouter } from 'expo-router'

export default function SetlistAddBitModal() {
    const router = useRouter()
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
                router.push({ pathname: '/(app)/(detail)/bit/[id]', params: { id: 'new', fromSetlist: 'true' } })
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
