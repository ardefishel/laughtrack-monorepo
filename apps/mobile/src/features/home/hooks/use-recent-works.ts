import { useEffect, useRef, useState } from 'react'
import { Q } from '@nozbe/watermelondb'
import { useDatabase } from '@nozbe/watermelondb/react'
import { BIT_TABLE, PREMISE_TABLE, SETLIST_TABLE } from '@/database/constants'
import { isValidDate } from '@/database/utils/dates'
import { stripHtmlToLines } from '@/database/utils/html'
import type { RecentWork } from '@/domain/recent-work'
import { dbLogger } from '@/lib/loggers'
import { Bit } from '@/features/bit/data/bit.model'
import { Premise } from '@/features/premise/data/premise.model'
import { Setlist } from '@/features/setlist/data/setlist.model'

const MAX_RECENT_WORKS = 5

function mergeAndSort(
    premises: RecentWork[],
    bits: RecentWork[],
    setlists: RecentWork[],
): RecentWork[] {
    return [...premises, ...bits, ...setlists]
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .slice(0, MAX_RECENT_WORKS)
}

function toRecentWorkOrNull(input: {
    type: RecentWork['type']
    id: string
    title: unknown
    updatedAt: unknown
}): RecentWork | null {
    if (typeof input.title !== 'string' || !isValidDate(input.updatedAt)) {
        dbLogger.warn('Skipping malformed recent work record', {
            type: input.type,
            id: input.id,
        })
        return null
    }

    return {
        id: input.id,
        type: input.type,
        title: input.title,
        updatedAt: input.updatedAt,
    }
}

type PremiseRecentWorkInput = {
    id: string
    content: unknown
    updatedAt: unknown
}

type BitRecentWorkInput = {
    id: string
    content: unknown
    updatedAt: unknown
}

type SetlistRecentWorkInput = {
    id: string
    description: unknown
    updatedAt: unknown
}

export function premiseToRecentWork(premise: PremiseRecentWorkInput): RecentWork | null {
    return toRecentWorkOrNull({
        id: premise.id,
        type: 'premise',
        title: premise.content,
        updatedAt: premise.updatedAt,
    })
}

export function bitToRecentWork(bit: BitRecentWorkInput): RecentWork | null {
    if (typeof bit.content !== 'string') {
        dbLogger.warn('Skipping malformed recent bit record', { id: bit.id })
        return null
    }

    return toRecentWorkOrNull({
        id: bit.id,
        type: 'bit',
        title: stripHtmlToLines(bit.content).join(' '),
        updatedAt: bit.updatedAt,
    })
}

export function setlistToRecentWork(setlist: SetlistRecentWorkInput): RecentWork | null {
    return toRecentWorkOrNull({
        id: setlist.id,
        type: 'set',
        title: setlist.description,
        updatedAt: setlist.updatedAt,
    })
}

function compactRecentWorks(items: (RecentWork | null)[]): RecentWork[] {
    return items.filter((item): item is RecentWork => item !== null)
}

export function useRecentWorks() {
    const database = useDatabase()
    const [recentWorks, setRecentWorks] = useState<RecentWork[]>([])

    const latestPremises = useRef<RecentWork[]>([])
    const latestBits = useRef<RecentWork[]>([])
    const latestSetlists = useRef<RecentWork[]>([])

    useEffect(() => {
        const recentQuery = [Q.sortBy('updated_at', Q.desc), Q.take(MAX_RECENT_WORKS)] as const

        const premiseSub = database
            .get<Premise>(PREMISE_TABLE)
            .query(...recentQuery)
            .observe()
            .subscribe({
                next: (items) => {
                    latestPremises.current = compactRecentWorks(items.map(premiseToRecentWork))
                    setRecentWorks(mergeAndSort(latestPremises.current, latestBits.current, latestSetlists.current))
                },
                error: (error: unknown) => {
                    dbLogger.error('Recent premises subscription failed', error)
                },
            })

        const bitSub = database
            .get<Bit>(BIT_TABLE)
            .query(...recentQuery)
            .observe()
            .subscribe({
                next: (items) => {
                    latestBits.current = compactRecentWorks(items.map(bitToRecentWork))
                    setRecentWorks(mergeAndSort(latestPremises.current, latestBits.current, latestSetlists.current))
                },
                error: (error: unknown) => {
                    dbLogger.error('Recent bits subscription failed', error)
                },
            })

        const setlistSub = database
            .get<Setlist>(SETLIST_TABLE)
            .query(...recentQuery)
            .observe()
            .subscribe({
                next: (items) => {
                    latestSetlists.current = compactRecentWorks(items.map(setlistToRecentWork))
                    setRecentWorks(mergeAndSort(latestPremises.current, latestBits.current, latestSetlists.current))
                },
                error: (error: unknown) => {
                    dbLogger.error('Recent setlists subscription failed', error)
                },
            })

        return () => {
            premiseSub.unsubscribe()
            bitSub.unsubscribe()
            setlistSub.unsubscribe()
        }
    }, [database])

    return recentWorks
}
