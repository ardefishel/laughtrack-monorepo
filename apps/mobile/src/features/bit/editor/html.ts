const HTML_ENTITY_MAP: Record<string, string> = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
}

/**
 * Decode common HTML entities in a string.
 */
export function decodeHtmlEntities(value: string): string {
    return value.replace(/&nbsp;|&amp;|&lt;|&gt;|&quot;|&#39;/g, (match) => HTML_ENTITY_MAP[match] ?? match)
}

/**
 * Strip HTML tags and convert to separate text lines.
 */
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

/**
 * Extract plain text from an HTML string, replacing block elements with newlines
 * and decoding HTML entities.
 */
export function extractTextFromHtml(html: string): string {
    return html
        .replace(/<br\s*\/?\s*>/gi, '\n')
        .replace(/<\/p>/gi, '\n')
        .replace(/<\/h[1-6]>/gi, '\n')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&#39;/gi, "'")
        .replace(/&quot;/gi, '"')
}

/**
 * Normalize editor text by collapsing whitespace and lowercasing.
 */
export function normalizeEditorText(value: string): string {
    return value.replace(/\s+/g, ' ').trim().toLowerCase()
}

/**
 * Count the number of logical breaks (block elements + br tags) in HTML.
 */
export function countLogicalBreaks(html: string): number {
    const blockMatches = html.match(/<(h[1-6]|p|div|li)(\s|>)/gi)
    const breakMatches = html.match(/<br\s*\/?\s*>/gi)
    return (blockMatches?.length ?? 0) + (breakMatches?.length ?? 0)
}

/**
 * Test whether the HTML ends with a heading block of the given type.
 */
export function hasTrailingHeadingBlock(html: string, heading: string): boolean {
    const pattern = new RegExp(`<${heading}[^>]*>[\\s\\S]*<\\/${heading}>\\s*(?:<\\/html>\\s*)?$`, 'i')
    return pattern.test(html)
}

/**
 * Test whether the HTML contains exactly one paragraph block and no headings.
 */
export function hasSingleParagraphBlock(html: string): boolean {
    const headingBlocks = html.match(/<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/gi)
    if ((headingBlocks?.length ?? 0) > 0) return false

    const paragraphBlocks = html.match(/<p[^>]*>[\s\S]*?<\/p>/gi)
    return (paragraphBlocks?.length ?? 0) === 1
}

/**
 * Append an empty paragraph after the trailing heading block.
 * Returns the repaired HTML or null if no repair is needed.
 */
export function appendParagraphAfterTrailingHeading(html: string, heading: string): string | null {
    const alreadyHasTrailingParagraph = /<p>(?:<br\s*\/?\s*>|\s*)<\/p>\s*<\/html>\s*$/i.test(html)
    if (alreadyHasTrailingParagraph) return null

    const closingHtmlPattern = new RegExp(`(</${heading}>)(\\s*</html>\\s*)$`, 'i')
    if (closingHtmlPattern.test(html)) {
        return html.replace(closingHtmlPattern, `$1<p><br></p></html>`)
    }

    const trailingHeadingPattern = new RegExp(`(</${heading}>\\s*)$`, 'i')
    if (trailingHeadingPattern.test(html)) {
        return html.replace(trailingHeadingPattern, `$1<p><br></p>`)
    }

    return null
}
