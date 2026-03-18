export function isValidDate(value: unknown): value is Date {
    return value instanceof Date && !Number.isNaN(value.getTime())
}

export function toValidDate(value: unknown, fallback: Date): Date {
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return value
    }

    if (typeof value === 'string' || typeof value === 'number') {
        const parsed = new Date(value)
        if (!Number.isNaN(parsed.getTime())) {
            return parsed
        }
    }

    return fallback
}
