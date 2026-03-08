export function normalizedIds(value: string[]): string[] {
    return [...new Set(value)].sort((a, b) => a.localeCompare(b))
}

export function areEqualIds(left: string[], right: string[]): boolean {
    if (left.length !== right.length) return false
    return left.every((value, index) => value === right[index])
}
