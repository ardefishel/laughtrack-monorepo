import type { PremiseStatus } from '@/types'

type TranslateFn = (key: string) => string

export type PremiseStatusOption = {
    value: PremiseStatus
    label: string
    dotClass: string
}

export const PREMISE_STATUS_CONFIG: Record<PremiseStatus, { labelKey: string; dotClass: string }> = {
    draft: { labelKey: 'premise.statuses.draft', dotClass: 'bg-muted' },
    rework: { labelKey: 'premise.statuses.rework', dotClass: 'bg-warning' },
    ready: { labelKey: 'premise.statuses.ready', dotClass: 'bg-success' },
    archived: { labelKey: 'premise.statuses.archived', dotClass: 'bg-default' },
}

export function getPremiseStatusOptions(t: TranslateFn): PremiseStatusOption[] {
    return (Object.entries(PREMISE_STATUS_CONFIG) as [PremiseStatus, { labelKey: string; dotClass: string }][]).map(([value, config]) => ({
        value,
        label: t(config.labelKey),
        dotClass: config.dotClass,
    }))
}

export function getPremiseStatusLabel(t: TranslateFn, status: PremiseStatus, uppercase = false) {
    const label = t(PREMISE_STATUS_CONFIG[status].labelKey)

    if (uppercase) {
        return label.toUpperCase()
    }

    return label
}
