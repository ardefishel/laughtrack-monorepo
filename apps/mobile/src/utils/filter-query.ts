export function parseCsvParam(value?: string): string[] {
    if (!value) return []
    return value.split(',').map((entry) => entry.trim()).filter(Boolean)
}

export function parseBooleanParam(value?: string): boolean | null {
    if (value === 'true') return true
    if (value === 'false') return false
    return null
}

export function toCsvParam(values: Iterable<string>): string {
    const entries = [...values]
    return entries.length > 0 ? entries.join(',') : ''
}
