import { z } from 'zod'

export const RecentWorkTypeSchema = z.enum(['premise', 'bit', 'set'])

export const RecentWorkSchema = z.object({
    id: z.string(),
    type: RecentWorkTypeSchema,
    title: z.string(),
    updatedAt: z.date(),
})

export type RecentWork = z.infer<typeof RecentWorkSchema>
