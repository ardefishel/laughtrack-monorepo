import { z } from 'zod'
import { BitSchema } from './bit'
import { PremiseTagSchema } from './premise'

export const SetlistNoteSchema = z.object({
    id: z.string(),
    content: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
})

const SetlistBitItemSchema = z.object({
    id: z.string(),
    type: z.literal('bit'),
    bitId: z.string(),
    bit: BitSchema.optional(),
})

const SetlistNoteItemSchema = z.object({
    id: z.string(),
    type: z.literal('set-note'),
    setlistNote: SetlistNoteSchema,
})

export const SetlistItemSchema = z.discriminatedUnion('type', [
    SetlistBitItemSchema,
    SetlistNoteItemSchema,
])

export const SetlistSchema = z.object({
    id: z.string(),
    items: z.array(SetlistItemSchema),
    tags: z.array(PremiseTagSchema).optional(),
    description: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export type SetlistNote = z.infer<typeof SetlistNoteSchema>
export type SetlistItem = z.infer<typeof SetlistItemSchema>
export type Setlist = z.infer<typeof SetlistSchema>
