import type { BitStatus } from '@/types'

type TranslateFn = (key: string) => string

export type BitStatusOption = {
    value: BitStatus
    label: string
    dotClass: string
}

export const BIT_STATUS_CONFIG: Record<BitStatus, { labelKey: string; dotClass: string }> = {
    draft: { labelKey: 'bit.statuses.draft', dotClass: 'bg-muted' },
    rework: { labelKey: 'bit.statuses.rework', dotClass: 'bg-warning' },
    tested: { labelKey: 'bit.statuses.tested', dotClass: 'bg-blue-500' },
    final: { labelKey: 'bit.statuses.final', dotClass: 'bg-success' },
    dead: { labelKey: 'bit.statuses.dead', dotClass: 'bg-danger' },
}

export function getBitStatusOptions(t: TranslateFn): BitStatusOption[] {
    return (Object.entries(BIT_STATUS_CONFIG) as [BitStatus, { labelKey: string; dotClass: string }][]).map(([value, config]) => ({
        value,
        label: t(config.labelKey),
        dotClass: config.dotClass,
    }))
}

export function getBitStatusLabel(t: TranslateFn, status: BitStatus, uppercase = false) {
    const label = t(BIT_STATUS_CONFIG[status].labelKey)

    if (uppercase) {
        return label.toUpperCase()
    }

    return label
}
