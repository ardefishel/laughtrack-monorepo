/**
 * HTML parsing utilities for extracting text content from HTML
 */

/**
 * Decodes common HTML entities to their character equivalents
 * @param text - String containing HTML entities
 * @returns Decoded string with entities replaced
 */
export function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/**
 * Strips HTML tags from a string
 * @param html - String containing HTML tags
 * @returns Plain text with HTML tags removed
 */
export function stripHtmlTags(html: string): string {
  return html.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '');
}

/**
 * Extracts title (first line) and description (remaining lines) from HTML content
 * @param html - HTML content string
 * @returns Object containing title and description
 */
export function extractTitleAndDescription(html: string): { title: string; description: string } {
  if (!html || html.length === 0) {
    return { title: '', description: '' };
  }

  const text = stripHtmlTags(html);
  const decoded = decodeHtmlEntities(text);
  const lines = decoded.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  if (lines.length === 0) {
    return { title: '', description: '' };
  }

  const title = lines[0];
  const description = lines.slice(1).join(' ');

  return { title, description };
}

/**
 * Extracts plain text from HTML content for search indexing
 * @param html - HTML content string
 * @returns Plain text string with HTML tags removed and entities decoded
 */
export function extractTextFromHtml(html: string): string {
  if (!html || html.length === 0) {
    return '';
  }

  const stripped = stripHtmlTags(html);
  const decoded = decodeHtmlEntities(stripped);

  // Clean up multiple newlines and trim
  return decoded
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join(' ');
}

/**
 * Removes only the <html> and </html> wrapper tags from content
 * @param html - HTML content string
 * @returns Content without <html> wrapper tags
 */
export function stripHtmlWrapper(html: string): string {
  if (!html || html.length === 0) {
    return '';
  }
  return html.replace(/<\/?html[^>]*>/gi, '').trim();
}

/**
 * Combines multiple HTML content strings into a single HTML document
 * @param contents - Array of HTML content strings
 * @returns Combined HTML document with <html> wrapper
 */
export function combineHtmlContents(contents: string[]): string {
  const validContents = contents.filter((c) => c && c.length > 0);
  if (validContents.length === 0) {
    return '<html><body></body></html>';
  }
  return `<html><body>${validContents.join('<br><br>')}</body></html>`;
}
