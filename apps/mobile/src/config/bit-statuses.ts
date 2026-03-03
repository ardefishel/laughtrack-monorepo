import type { BitStatus } from '@/types'

export type BitStatusOption = {
    value: BitStatus
    label: string
    dotClass: string
}

export const BIT_STATUS_OPTIONS: BitStatusOption[] = [
    { value: 'draft', label: 'Draft', dotClass: 'bg-muted' },
    { value: 'rework', label: 'Rework', dotClass: 'bg-warning' },
    { value: 'tested', label: 'Tested', dotClass: 'bg-blue-500' },
    { value: 'final', label: 'Final', dotClass: 'bg-success' },
    { value: 'dead', label: 'Dead', dotClass: 'bg-danger' },
]

export const BIT_STATUS_LABEL: Record<BitStatus, string> = {
    draft: 'DRAFT',
    rework: 'REWORK',
    tested: 'TESTED',
    final: 'FINAL',
    dead: 'DEAD',
}
