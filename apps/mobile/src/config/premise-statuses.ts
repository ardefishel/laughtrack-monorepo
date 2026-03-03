import type { PremiseStatus } from '@/types'

export type PremiseStatusOption = {
    value: PremiseStatus
    label: string
    dotClass: string
}

export const PREMISE_STATUS_OPTIONS: PremiseStatusOption[] = [
    { value: 'draft', label: 'Draft', dotClass: 'bg-muted' },
    { value: 'rework', label: 'Rework', dotClass: 'bg-warning' },
    { value: 'ready', label: 'Ready', dotClass: 'bg-success' },
    { value: 'archived', label: 'Archived', dotClass: 'bg-default' },
]
