import type { Attitude } from '@/types'

export const attitudeConfig: Record<Attitude, { label: string; emoji: string }> = {
    angry: { label: 'Angry', emoji: '🤬' },
    confused: { label: 'Confused', emoji: '😵‍💫' },
    scared: { label: 'Scared', emoji: '😰' },
    proud: { label: 'Proud', emoji: '😏' },
    disgusted: { label: 'Disgusted', emoji: '🤢' },
    lustful: { label: 'Lustful', emoji: '😏' },
    envious: { label: 'Envious', emoji: '😒' },
    embarrassed: { label: 'Embarrassed', emoji: '😳' },
}
