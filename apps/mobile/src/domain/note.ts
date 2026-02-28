import { z } from 'zod'

export const NoteSchema = z.object({
    id: z.string(),
    content: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export type Note = z.infer<typeof NoteSchema>
