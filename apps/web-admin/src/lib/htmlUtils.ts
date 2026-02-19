/**
 * Strips HTML tags and decodes common HTML entities
 */
function stripHtml(html: string): string {
    return html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
}

/**
 * Extracts a display title from HTML content (first non-empty line),
 * with an optional fallback when html is null/empty.
 */
export function extractTitleFromHtml(html: string | null | undefined, fallback = '(empty)'): string {
    if (!html) return fallback
    const text = stripHtml(html)
    const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0)
    return lines[0] ?? fallback
}
