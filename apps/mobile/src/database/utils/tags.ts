/**
 * Derive a deterministic tag ID from a tag name.
 */
export function toTagId(name: string): string {
    return `tag-${name.toLowerCase().replace(/\s+/g, '-')}`
}

type TagLike = {
    id: string
    name: string
    createdAt: Date
    updatedAt: Date
}

/**
 * Convert an array of tag name strings into full tag objects with derived IDs.
 */
export function tagNamesToTags(tagNames: string[], createdAt: Date, updatedAt: Date): TagLike[] {
    return tagNames.map((name) => ({
        id: toTagId(name),
        name,
        createdAt,
        updatedAt,
    }))
}
