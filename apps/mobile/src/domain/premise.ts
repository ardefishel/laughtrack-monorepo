import { z } from 'zod'

export const PremiseTagSchema = z.object({
    id: z.string(),
    name: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
})

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
    tags: z.array(PremiseTagSchema).optional(),
    attitude: AttitudeSchema.optional(),
    bitIds: z.array(z.string()).optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export type PremiseTag = z.infer<typeof PremiseTagSchema>
export type PremiseStatus = z.infer<typeof PremiseStatusSchema>
export type Attitude = z.infer<typeof AttitudeSchema>
export type Premise = z.infer<typeof PremiseSchema>
