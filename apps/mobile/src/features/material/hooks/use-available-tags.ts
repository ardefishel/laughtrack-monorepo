import type { Model } from '@nozbe/watermelondb'
import { dbLogger } from '@/lib/loggers'
import { useDatabase } from '@nozbe/watermelondb/react'
import { useEffect, useState } from 'react'

export function useAvailableTags<M extends Model>(
    table: string,
    parseTagsFn: (tagsJson: string) => string[],
    tagsJsonField: keyof M & string = 'tagsJson' as keyof M & string,
): string[] {
    const database = useDatabase()
    const [tags, setTags] = useState<string[]>([])

    useEffect(() => {
        const subscription = database
            .get<M>(table)
            .query()
            .observe()
            .subscribe({
                next: (records: M[]) => {
                    const tagSet = new Set<string>()

                    for (const record of records) {
                        const json = (record as Record<string, unknown>)[tagsJsonField] as string
                        for (const tag of parseTagsFn(json)) {
                            tagSet.add(tag)
                        }
                    }

                    setTags([...tagSet].sort((a, b) => a.localeCompare(b)))
                },
                error: (error: unknown) => {
                    dbLogger.error(`${table} filter failed to observe available tags`, error)
                },
            })

        return () => subscription.unsubscribe()
    }, [database, table, parseTagsFn, tagsJsonField])

    return tags
}
