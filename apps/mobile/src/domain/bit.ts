import { z } from 'zod'
import { PremiseTagSchema } from './premise'

export const BitStatusSchema = z.enum(['draft', 'rework', 'tested', 'final', 'dead'])

export const BitSchema = z.object({
    id: z.string(),
    content: z.string(),
    status: BitStatusSchema,
    tags: z.array(PremiseTagSchema).optional(),
    premiseId: z.string().optional(),
    setlistIds: z.array(z.string()).optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export type BitStatus = z.infer<typeof BitStatusSchema>
export type Bit = z.infer<typeof BitSchema>
