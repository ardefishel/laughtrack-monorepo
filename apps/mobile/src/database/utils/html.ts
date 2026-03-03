const HTML_ENTITY_MAP: Record<string, string> = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
}

function decodeHtmlEntities(value: string): string {
    return value.replace(/&nbsp;|&amp;|&lt;|&gt;|&quot;|&#39;/g, (match) => HTML_ENTITY_MAP[match] ?? match)
}

export function stripHtmlToLines(content: string): string[] {
    const withBreaks = content
        .replace(/<\s*br\s*\/?\s*>/gi, '\n')
        .replace(/<\s*\/\s*p\s*>/gi, '\n')
        .replace(/<\s*\/\s*div\s*>/gi, '\n')
        .replace(/<\s*\/\s*li\s*>/gi, '\n')

    const withoutTags = withBreaks.replace(/<[^>]+>/g, ' ')
    const decoded = decodeHtmlEntities(withoutTags)

    return decoded
        .split('\n')
        .map((line) => line.replace(/\s+/g, ' ').trim())
        .filter(Boolean)
}
