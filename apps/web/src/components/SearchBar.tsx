import { useEffect, useState } from 'react'

interface SearchBarProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
}

export function SearchBar({ value, onChange, placeholder = 'Search...', className = '' }: SearchBarProps) {
    const [localValue, setLocalValue] = useState(value)

    useEffect(() => {
        setLocalValue(value)
    }, [value])

    useEffect(() => {
        const timer = setTimeout(() => {
            if (localValue !== value) {
                onChange(localValue)
            }
        }, 300)
        return () => clearTimeout(timer)
    }, [localValue, onChange, value])

    return (
        <div className={`relative ${className}`}>
            <input
                type="text"
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                placeholder={placeholder}
                className="pl-10 pr-4 py-2 bg-field-background border border-border rounded-lg text-sm text-field-foreground placeholder:text-field-placeholder focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent w-full"
            />
            <span className="absolute left-3 top-2.5 text-muted-dim text-xs select-none pointer-events-none">🔍</span>
        </div>
    )
}
