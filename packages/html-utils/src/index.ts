export function decodeHtmlEntities(text: string): string {
    return text
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
}

export function stripHtmlTags(html: string): string {
    return html.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '');
}

export function extractTitleFromHtml(html: string | null | undefined, fallback = '(empty)'): string {
    if (!html) return fallback;
    const stripped = stripHtmlTags(html);
    const text = decodeHtmlEntities(stripped);
    const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    return lines[0] ?? fallback;
}

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

export function stripHtmlWrapper(html: string): string {
    if (!html || html.length === 0) {
        return '';
    }
    return html.replace(/<\/?html[^>]*>/gi, '').trim();
}

export function combineHtmlContents(contents: string[]): string {
    const validContents = contents.filter((c) => c && c.length > 0);
    if (validContents.length === 0) {
        return '<html><body></body></html>';
    }
    return `<html><body>${validContents.join('<br><br>')}</body></html>`;
}
