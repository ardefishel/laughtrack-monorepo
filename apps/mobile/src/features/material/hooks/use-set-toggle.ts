import { useCallback, useState } from 'react'

export function useSetToggle<T>(initial: T[] = []) {
    const [selected, setSelected] = useState<Set<T>>(() => new Set(initial))

    const toggle = useCallback((value: T) => {
        setSelected((prev) => {
            const next = new Set(prev)
            if (next.has(value)) next.delete(value)
            else next.add(value)
            return next
        })
    }, [])

    const clear = useCallback(() => {
        setSelected(new Set())
    }, [])

    return { selected, toggle, clear }
}
