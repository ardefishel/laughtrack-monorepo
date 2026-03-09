import { BitCard } from '@/features/bit/components/bit-card'
import { useBitList } from '@/features/bit/hooks/use-bit-list'
import { deleteBit } from '@/features/bit/services/delete-bit'
import { MaterialListScreen } from '@/features/material/components/material-list-screen'
import type { Bit, BitStatus } from '@/types'
import { parseBooleanParam, parseCsvParam } from '@/features/material/filters/filter-query'
import { useFocusEffect } from '@react-navigation/native'
import type { FlashListRef } from '@shopify/flash-list'
import { useDatabase } from '@nozbe/watermelondb/react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export default function BitListScreen() {
    const router = useRouter()
    const database = useDatabase()
    const { bits, refresh } = useBitList()
    const params = useLocalSearchParams<{ statuses?: string; tags?: string; hasPremise?: string }>()
    const [search, setSearch] = useState('')
    const listRef = useRef<FlashListRef<Bit> | null>(null)
    const countBeforeCreateRef = useRef<number | null>(null)
    useFocusEffect(
        useCallback(() => {
            void refresh().then((count) => {
                const countBeforeCreate = countBeforeCreateRef.current
                if (countBeforeCreate !== null && count <= countBeforeCreate) {
                    countBeforeCreateRef.current = null
                }
            })
        }, [refresh]),
    )

    useEffect(() => {
        const countBeforeCreate = countBeforeCreateRef.current
        if (countBeforeCreate === null || bits.length <= countBeforeCreate) return

        requestAnimationFrame(() => {
            listRef.current?.scrollToOffset({ offset: 0, animated: true })
        })
        countBeforeCreateRef.current = null
    }, [bits.length])

    const filteredBits = useMemo(() => {
        let result = bits
        const statuses = parseCsvParam(params.statuses) as BitStatus[]
        const tags = parseCsvParam(params.tags)
        const hasPremise = parseBooleanParam(params.hasPremise)
        const searchTerm = search.trim().toLowerCase()

        if (searchTerm) {
            result = result.filter((b) => b.content.toLowerCase().includes(searchTerm))
        }

        if (statuses.length > 0) {
            result = result.filter((b) => statuses.includes(b.status))
        }
        if (tags.length > 0) {
            result = result.filter((b) => b.tags?.some((t) => tags.includes(t.name)))
        }
        if (hasPremise !== null) {
            result = result.filter((b) => hasPremise ? !!b.premiseId : !b.premiseId)
        }

        return result
    }, [bits, params.statuses, params.tags, params.hasPremise, search])

    const hasActiveFilters = !!(params.statuses || params.tags || params.hasPremise)

    const openFilter = useCallback(() => {
        router.push({
            pathname: '/bit-filter',
            params: { statuses: params.statuses ?? '', tags: params.tags ?? '', hasPremise: params.hasPremise ?? '' },
        })
    }, [params.hasPremise, params.statuses, params.tags, router])

    const keyExtractor = useCallback((item: Bit) => item.id, [])

    const handleFabPress = useCallback(() => {
        countBeforeCreateRef.current = bits.length
        router.push('/bit/new')
    }, [bits.length, router])

    const renderItem = useCallback(({ item }: { item: Bit }) => {
        const handlePress = () => {
            router.push(`/bit/${item.id}`)
        }

        const handleDelete = async () => {
            await deleteBit(database, item.id)
        }

        return <BitCard bit={item} onPress={handlePress} onDelete={handleDelete} />
    }, [database, router])

    return (
        <MaterialListScreen
            data={filteredBits}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            hasActiveFilters={hasActiveFilters}
            onFilterPress={openFilter}
            onFabPress={handleFabPress}
            fabLabel='Add Bit'
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder='Search bits'
            listRef={listRef}
        />
    )
}
