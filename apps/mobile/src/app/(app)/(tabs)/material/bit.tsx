import { BitCard } from '@/components/feature/material/bit-card'
import { MaterialListScreen } from '@/components/feature/material/material-list-screen'
import { BIT_TABLE, PREMISE_TABLE } from '@/database/constants'
import { bitModelToDomain } from '@/database/mappers/bitMapper'
import { Bit as BitModel } from '@/database/models/bit'
import { Premise as PremiseModel } from '@/database/models/premise'
import type { Bit, BitStatus } from '@/types'
import { parseBooleanParam, parseCsvParam } from '@/utils/filter-query'
import { useFocusEffect } from '@react-navigation/native'
import type { FlashListRef } from '@shopify/flash-list'
import { Q } from '@nozbe/watermelondb'
import { useDatabase } from '@nozbe/watermelondb/react'
import { router, useLocalSearchParams } from 'expo-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export default function BitListScreen() {
    const database = useDatabase()
    const params = useLocalSearchParams<{ statuses?: string; tags?: string; hasPremise?: string }>()
    const [search, setSearch] = useState('')
    const [bits, setBits] = useState<Bit[]>([])
    const listRef = useRef<FlashListRef<Bit> | null>(null)
    const countBeforeCreateRef = useRef<number | null>(null)

    const loadBits = useCallback(async () => {
        const value = await database
            .get<BitModel>(BIT_TABLE)
            .query(Q.sortBy('updated_at', Q.desc))
            .fetch()

        const mapped = value.map(bitModelToDomain)
        setBits(mapped)
        return mapped
    }, [database])

    useEffect(() => {
        const subscription = database
            .get<BitModel>(BIT_TABLE)
            .query(Q.sortBy('updated_at', Q.desc))
            .observe()
            .subscribe((value: BitModel[]) => {
                setBits(value.map(bitModelToDomain))
            })

        return () => subscription.unsubscribe()
    }, [database])

    useFocusEffect(
        useCallback(() => {
            void (async () => {
                const latest = await loadBits()
                const countBeforeCreate = countBeforeCreateRef.current

                if (countBeforeCreate !== null && latest.length > countBeforeCreate) {
                    requestAnimationFrame(() => {
                        listRef.current?.scrollToOffset({ offset: 0, animated: true })
                    })
                }

                countBeforeCreateRef.current = null
            })()
        }, [loadBits]),
    )

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
    }, [params.hasPremise, params.statuses, params.tags])

    const keyExtractor = useCallback((item: Bit) => item.id, [])

    const handleFabPress = useCallback(() => {
        countBeforeCreateRef.current = bits.length
        router.push('/bit/new')
    }, [bits.length])

    const renderItem = useCallback(({ item }: { item: Bit }) => {
        const handlePress = () => {
            router.push(`/bit/${item.id}`)
        }

        const handleDelete = async () => {
            await database.write(async () => {
                const bit = await database.get<BitModel>(BIT_TABLE).find(item.id)

                if (bit.premiseId) {
                    try {
                        const premise = await database.get<PremiseModel>(PREMISE_TABLE).find(bit.premiseId)
                        const currentBitIds = parseIdsJson(premise.bitIdsJson).filter((id) => id !== bit.id)

                        await premise.update((model) => {
                            model.bitIdsJson = JSON.stringify(currentBitIds)
                            model.updatedAt = new Date()
                        })
                    } catch {
                        // Ignore dangling premise relation.
                    }
                }

                await bit.destroyPermanently()
            })
        }

        return <BitCard bit={item} onPress={handlePress} onDelete={handleDelete} />
    }, [database])

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

function parseIdsJson(value: string): string[] {
    try {
        const parsed = JSON.parse(value)
        if (!Array.isArray(parsed)) return []
        return parsed.filter((entry): entry is string => typeof entry === 'string')
    } catch {
        return []
    }
}
