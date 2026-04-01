import { toCsvParam } from '@/features/material/filters/filter-query'
import { useRouter } from 'expo-router'
import { useCallback } from 'react'

export function useFilterModal(buildParams: () => Record<string, string>) {
    const router = useRouter()

    const applyFilters = useCallback(() => {
        router.back()
        requestAnimationFrame(() => {
            router.setParams(buildParams())
        })
    }, [router, buildParams])

    return { applyFilters }
}

export { toCsvParam }
