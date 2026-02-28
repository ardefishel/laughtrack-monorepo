import { PremiseTagSchema as TagsSchema } from '@/domain/premise';
export { NoteSchema } from '@/domain/note';
export type { Note } from '@/domain/note';
export { BitSchema, BitStatusSchema } from '@/domain/bit'
export type { Bit, BitStatus } from '@/domain/bit'
export { SetlistNoteSchema, SetlistItemSchema, SetlistSchema } from '@/domain/setlist'
export type { SetlistNote, SetlistItem, Setlist } from '@/domain/setlist'
export {
    AttitudeSchema,
    PremiseSchema,
    PremiseStatusSchema,
    PremiseTagSchema,
} from '@/domain/premise';
export type {
    Attitude,
    Premise,
    PremiseStatus,
    PremiseTag,
} from '@/domain/premise';

export { TagsSchema };
export type { PremiseTag as Tags } from '@/domain/premise';
