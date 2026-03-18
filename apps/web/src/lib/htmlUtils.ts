export function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

export function stripHtmlTags(html: string): string {
  return html.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')
}

export function extractTitleFromHtml(html: string | null | undefined, fallback = '(empty)'): string {
  if (!html) return fallback
  const stripped = stripHtmlTags(html)
  const text = decodeHtmlEntities(stripped)
  const lines = text.split('\n').map((line) => line.trim()).filter((line) => line.length > 0)
  return lines[0] ?? fallback
}

export function extractTextFromHtml(html: string): string {
  if (!html) return ''
  const stripped = stripHtmlTags(html)
  const decoded = decodeHtmlEntities(stripped)
  return decoded
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join(' ')
}
