import { z } from 'zod'
import { TagSchema, type Tag } from './tag'

export const PremiseTagSchema = TagSchema

export const PremiseStatusSchema = z.enum(['draft', 'rework', 'archived', 'ready'])

export const AttitudeSchema = z.enum([
    'angry',
    'confused',
    'scared',
    'proud',
    'disgusted',
    'lustful',
    'envious',
    'embarrassed',
])

export const PremiseSchema = z.object({
    id: z.string(),
    content: z.string(),
    status: PremiseStatusSchema,
    tags: z.array(TagSchema).optional(),
    attitude: AttitudeSchema.optional(),
    bitIds: z.array(z.string()).optional(),
    sourceNoteId: z.string().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export type PremiseTag = Tag
export type PremiseStatus = z.infer<typeof PremiseStatusSchema>
export type Attitude = z.infer<typeof AttitudeSchema>
export type Premise = z.infer<typeof PremiseSchema>
