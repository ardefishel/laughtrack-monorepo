import type { Attitude } from '@/types'

type TranslateFn = (key: string) => string

export const attitudeConfig: Record<Attitude, { labelKey: string; emoji: string }> = {
    angry: { labelKey: 'attitudes.angry', emoji: '🤬' },
    confused: { labelKey: 'attitudes.confused', emoji: '😵‍💫' },
    scared: { labelKey: 'attitudes.scared', emoji: '😰' },
    proud: { labelKey: 'attitudes.proud', emoji: '😏' },
    disgusted: { labelKey: 'attitudes.disgusted', emoji: '🤢' },
    lustful: { labelKey: 'attitudes.lustful', emoji: '😏' },
    envious: { labelKey: 'attitudes.envious', emoji: '😒' },
    embarrassed: { labelKey: 'attitudes.embarrassed', emoji: '😳' },
}

export function getAttitudeLabel(t: TranslateFn, attitude: Attitude) {
    return t(attitudeConfig[attitude].labelKey)
}

export function getAttitudeOptions(t: TranslateFn): [Attitude, { label: string; emoji: string }][] {
    return (Object.entries(attitudeConfig) as [Attitude, { labelKey: string; emoji: string }][]).map(([value, config]) => [
        value,
        { label: t(config.labelKey), emoji: config.emoji },
    ])
}
