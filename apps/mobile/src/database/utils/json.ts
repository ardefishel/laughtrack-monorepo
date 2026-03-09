import { dbLogger } from '@/lib/loggers'

/**
 * Safely parse a JSON string that is expected to contain a string array.
 * Returns an empty array for malformed JSON, non-array values, or non-string entries.
 */
export function parseStringArrayJson(value: string): string[] {
    try {
        const parsed = JSON.parse(value)
        if (!Array.isArray(parsed)) return []
        return parsed.filter((entry): entry is string => typeof entry === 'string')
    } catch (error) {
        dbLogger.warn('parseStringArrayJson failed', {
            valueLength: value.length,
            error,
        })
        return []
    }
}
