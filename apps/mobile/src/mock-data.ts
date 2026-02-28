/**
 * Mock Data Source
 * 
 * Toggle USE_MOCK_DATA to switch between mock and real data.
 * When false, components will need to fetch from actual data source.
 * 
 * Set to true to use mock data for development/debugging.
 * Set to false when connecting to real backend.
 */
import type { Bit, Premise, Setlist } from './types'

export const USE_MOCK_DATA = true

// ══════════════════════════════════════════════════════════════════════════════
// TAGS
// ══════════════════════════════════════════════════════════════════════════════

export const MOCK_TAGS = {
  parenting: { id: 't1', name: 'Parenting', createdAt: new Date(), updatedAt: new Date() },
  idioms: { id: 't2', name: 'Idioms', createdAt: new Date(), updatedAt: new Date() },
  technology: { id: 't3', name: 'Technology', createdAt: new Date(), updatedAt: new Date() },
  dating: { id: 't4', name: 'Dating', createdAt: new Date(), updatedAt: new Date() },
  fitness: { id: 't6', name: 'Fitness', createdAt: new Date(), updatedAt: new Date() },
  marriage: { id: 't7', name: 'Marriage', createdAt: new Date(), updatedAt: new Date() },
  club: { id: 't8', name: 'Club', createdAt: new Date(), updatedAt: new Date() },
  short: { id: 't9', name: 'Short', createdAt: new Date(), updatedAt: new Date() },
  openMic: { id: 't10', name: 'Open Mic', createdAt: new Date(), updatedAt: new Date() },
  corporate: { id: 't11', name: 'Corporate', createdAt: new Date(), updatedAt: new Date() },
  clean: { id: 't12', name: 'Clean', createdAt: new Date(), updatedAt: new Date() },
} as const

// ══════════════════════════════════════════════════════════════════════════════
// PREMISES
// ══════════════════════════════════════════════════════════════════════════════

export const MOCK_PREMISE_1: Premise = {
  id: 'p1',
  content: 'Why do we always say "sleeping like a baby" when babies wake up every two hours screaming? Like, if I slept like a baby, I\'d be fired from every job I ever had.',
  status: 'ready',
  attitude: 'confused',
  tags: [MOCK_TAGS.parenting, MOCK_TAGS.idioms],
  bitIds: ['b1', 'b2', 'b3'],
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const MOCK_PREMISE_2: Premise = {
  id: 'p2',
  content: 'Self-checkout machines have turned us all into unpaid grocery store employees',
  status: 'draft',
  tags: [MOCK_TAGS.technology],
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const MOCK_PREMISE_3: Premise = {
  id: 'p3',
  content: 'Nobody warns you that adulting is just Googling how to do things forever',
  status: 'rework',
  attitude: 'angry',
  bitIds: ['b4'],
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const MOCK_PREMISE_4: Premise = {
  id: 'p4',
  content: 'Dating apps are just online shopping for humans — with a terrible return policy',
  status: 'archived',
  attitude: 'envious',
  tags: [MOCK_TAGS.dating, MOCK_TAGS.technology],
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const MOCK_PREMISES: Premise[] = [
  MOCK_PREMISE_1,
  MOCK_PREMISE_2,
  MOCK_PREMISE_3,
  MOCK_PREMISE_4,
]

// ══════════════════════════════════════════════════════════════════════════════
// BITS
// ══════════════════════════════════════════════════════════════════════════════

export const MOCK_BIT_1: Bit = {
  id: 'b1',
  content: "The thing about sleeping like a baby is — I did sleep like a baby last night. I woke up at 3am crying and didn't know where I was.",
  status: 'final',
  tags: [MOCK_TAGS.parenting, MOCK_TAGS.idioms],
  premiseId: 'p1',
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const MOCK_BIT_2: Bit = {
  id: 'b2',
  content: 'Self-checkout is just a store saying "You look like you need a part-time job. Congratulations — you\'re hired. No pay."',
  status: 'tested',
  tags: [MOCK_TAGS.technology],
  premiseId: 'p2',
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const MOCK_BIT_3: Bit = {
  id: 'b3',
  content: 'I Googled "how to be an adult" and the first result was an article written by someone who also Googled it.',
  status: 'draft',
  premiseId: 'p1',
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const MOCK_BIT_4: Bit = {
  id: 'b4',
  content: "My gym membership is basically a donation at this point. I'm a philanthropist for treadmills.",
  status: 'final',
  tags: [MOCK_TAGS.fitness],
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const MOCK_BIT_5: Bit = {
  id: 'b5',
  content: "Adulthood is just Googling symptoms and convincing yourself you have everything except what you actually have.",
  status: 'rework',
  tags: [MOCK_TAGS.dating, MOCK_TAGS.technology],
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const MOCK_BIT_6: Bit = {
  id: 'b6',
  content: '<html><p>So my wife told me I sleep like a baby...</p><p>And I was like, yeah, I wake up every two hours screaming and crying too.</p></html>',
  status: 'draft',
  premiseId: 'p1',
  tags: [MOCK_TAGS.parenting, MOCK_TAGS.marriage],
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const MOCK_BITS: Bit[] = [
  MOCK_BIT_1,
  MOCK_BIT_2,
  MOCK_BIT_3,
  MOCK_BIT_4,
  MOCK_BIT_5,
]

// ══════════════════════════════════════════════════════════════════════════════
// SETLISTS
// ══════════════════════════════════════════════════════════════════════════════

export const MOCK_SETLIST_1: Setlist = {
  id: '1',
  description: 'Friday Club Night — 20 min set',
  tags: [MOCK_TAGS.club, MOCK_TAGS.short],
  items: [
    { id: 'i1', type: 'bit', bitId: MOCK_BIT_1.id, bit: MOCK_BIT_1 },
    { id: 'i2', type: 'set-note', setlistNote: { id: 'n1', content: 'Pause here — let it breathe.', createdAt: new Date(), updatedAt: new Date() } },
    { id: 'i3', type: 'bit', bitId: MOCK_BIT_2.id, bit: MOCK_BIT_2 },
    { id: 'i4', type: 'bit', bitId: MOCK_BIT_3.id, bit: MOCK_BIT_3 },
    { id: 'i5', type: 'set-note', setlistNote: { id: 'n2', content: 'Callback to sleeping like a baby here.', createdAt: new Date(), updatedAt: new Date() } },
    { id: 'i6', type: 'bit', bitId: MOCK_BIT_4.id, bit: MOCK_BIT_4 },
  ],
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
  updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
}

export const MOCK_SETLIST_2: Setlist = {
  id: '2',
  description: 'Open Mic Warmup — 10 min',
  tags: [MOCK_TAGS.openMic],
  items: [
    { id: 'i7', type: 'bit', bitId: MOCK_BIT_3.id, bit: MOCK_BIT_3 },
    { id: 'i8', type: 'bit', bitId: MOCK_BIT_5.id, bit: MOCK_BIT_5 },
  ],
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
  updatedAt: new Date(Date.now() - 1000 * 60 * 30),
}

export const MOCK_SETLIST_3: Setlist = {
  id: '3',
  description: 'Corporate Gig — Clean Material Only',
  tags: [MOCK_TAGS.corporate, MOCK_TAGS.clean],
  items: [
    { id: 'i9', type: 'set-note', setlistNote: { id: 'n3', content: 'Start with crowd work — read the room.', createdAt: new Date(), updatedAt: new Date() } },
    { id: 'i10', type: 'bit', bitId: MOCK_BIT_4.id, bit: MOCK_BIT_4 },
  ],
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
  updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
}

export const MOCK_SETLISTS: Setlist[] = [
  MOCK_SETLIST_1,
  MOCK_SETLIST_2,
  MOCK_SETLIST_3,
]

// ══════════════════════════════════════════════════════════════════════════════
// RE-EXPORTS FOR COMPATIBILITY
// ══════════════════════════════════════════════════════════════════════════════

export { MOCK_PREMISE_1 as MOCK_PREMISE, MOCK_BIT_6 as MOCK_BIT }
