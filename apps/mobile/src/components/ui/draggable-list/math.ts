export function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value))
}

export function arrayMove<T>(items: readonly T[], fromIndex: number, toIndex: number): T[] {
    const copy = [...items]
    if (copy.length === 0) return copy

    const safeFrom = clamp(fromIndex, 0, copy.length - 1)
    const safeTo = clamp(toIndex, 0, copy.length - 1)
    if (safeFrom === safeTo) return copy

    const [moved] = copy.splice(safeFrom, 1)
    copy.splice(safeTo, 0, moved)
    return copy
}

export function isPermutation<T>(
    left: readonly T[],
    right: readonly T[],
    keySelector: (item: T) => string,
): boolean {
    if (left.length !== right.length) return false

    const counts = new Map<string, number>()
    for (const item of left) {
        const key = keySelector(item)
        counts.set(key, (counts.get(key) ?? 0) + 1)
    }

    for (const item of right) {
        const key = keySelector(item)
        const current = counts.get(key)
        if (!current) return false
        if (current === 1) counts.delete(key)
        else counts.set(key, current - 1)
    }

    return counts.size === 0
}

type InsertIndexInput = {
    absoluteY: number
    listTopY: number
    headerHeight: number
    scrollY: number
    itemOffset: number
    itemCount: number
}

export function getInsertIndex(input: InsertIndexInput): number {
    const { absoluteY, listTopY, headerHeight, scrollY, itemOffset, itemCount } = input
    if (itemCount <= 0) return 0

    const relativeY = absoluteY - listTopY - headerHeight + scrollY
    const rawIndex = Math.floor(relativeY / itemOffset)
    return clamp(rawIndex, 0, itemCount - 1)
}
