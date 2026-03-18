import { dbLogger } from '@/lib/loggers'

/**
 * Safely parse a JSON string that is expected to contain a string array.
 * Handles both `string[]` and `{name: string}[]` formats.
 * Returns an empty array for malformed JSON, non-array values, or non-string entries.
 */
export function parseStringArrayJson(value: string): string[] {
    try {
        const parsed = JSON.parse(value)
        if (!Array.isArray(parsed)) return []
        return parsed
            .map((entry) => {
                if (typeof entry === 'string') return entry
                if (
                    entry &&
                    typeof entry === 'object' &&
                    'name' in entry &&
                    typeof entry.name === 'string'
                ) {
                    return entry.name
                }
                return null
            })
            .filter((entry): entry is string => entry !== null)
    } catch (error) {
        dbLogger.warn('parseStringArrayJson failed', {
            valueLength: value.length,
            error,
        })
        return []
    }
}
