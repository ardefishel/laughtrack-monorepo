import { SetlistCard } from '@/features/setlist/components/setlist-card'
import { useSetlistList } from '@/features/setlist/hooks/use-setlist-list'
import { deleteSetlist } from '@/features/setlist/services/delete-setlist'
import { MaterialListScreen } from '@/features/material/components/material-list-screen'
import type { Setlist } from '@/types'
import { parseCsvParam } from '@/features/material/filters/filter-query'
import { useFocusEffect } from '@react-navigation/native'
import type { FlashListRef } from '@shopify/flash-list'
import { useDatabase } from '@nozbe/watermelondb/react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export default function SetlistListScreen() {
    const router = useRouter()
    const database = useDatabase()
    const { setlists, refresh } = useSetlistList()
    const params = useLocalSearchParams<{ tags?: string }>()
    const [search, setSearch] = useState('')
    const listRef = useRef<FlashListRef<Setlist> | null>(null)
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
        if (countBeforeCreate === null || setlists.length <= countBeforeCreate) return

        requestAnimationFrame(() => {
            listRef.current?.scrollToOffset({ offset: 0, animated: true })
        })
        countBeforeCreateRef.current = null
    }, [setlists.length])

    const filteredSetlists = useMemo(() => {
        let result = setlists
        const tags = parseCsvParam(params.tags)
        const searchTerm = search.trim().toLowerCase()

        if (searchTerm) {
            result = result.filter((s) => s.description.toLowerCase().includes(searchTerm))
        }

        if (tags.length > 0) {
            result = result.filter((s) => s.tags?.some((t) => tags.includes(t.name)))
        }
        return result
    }, [params.tags, search, setlists])

    const hasActiveFilters = !!params.tags

    const openFilter = useCallback(() => {
        router.push({
            pathname: '/setlist-filter',
            params: { tags: params.tags ?? '' },
        })
    }, [params.tags, router])

    const keyExtractor = useCallback((item: Setlist) => item.id, [])

    const handleFabPress = useCallback(() => {
        countBeforeCreateRef.current = setlists.length
        router.push('/setlist/new')
    }, [setlists.length, router])

    const renderItem = useCallback(({ item }: { item: Setlist }) => {
        const handlePress = () => {
            router.push(`/setlist/${item.id}`)
        }

        const handleDelete = async () => {
            await deleteSetlist(database, item.id)
        }

        return <SetlistCard setlist={item} onPress={handlePress} onDelete={handleDelete} />
    }, [database, router])

    return (
        <MaterialListScreen
            data={filteredSetlists}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            hasActiveFilters={hasActiveFilters}
            onFilterPress={openFilter}
            onFabPress={handleFabPress}
            fabLabel='Add Setlist'
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder='Search setlists'
            listRef={listRef}
        />
    )
}
