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

const DANGEROUS_TAGS = [
    'script', 'style', 'iframe', 'object', 'embed', 'form',
    'input', 'textarea', 'select', 'button', 'link', 'meta', 'base',
];

const ALLOWED_TAGS: Record<string, boolean> = {
    'p': true, 'br': true, 'b': true, 'strong': true, 'i': true, 'em': true, 'u': true, 's': true, 'strike': true,
    'ul': true, 'ol': true, 'li': true, 'blockquote': true, 'code': true, 'pre': true,
    'h1': true, 'h2': true, 'h3': true, 'span': true, 'div': true, 'a': true, 'hr': true,
};

const SAFE_HREF_PROTOCOL = /^(?:https?:|mailto:)/i;

export function sanitizeHtml(html: string): string {
    if (!html || html.length === 0) {
        return '';
    }

    // Remove dangerous tags and their contents
    let result = html;
    for (const tag of DANGEROUS_TAGS) {
        const pattern = new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`, 'gi');
        result = result.replace(pattern, '');
        // Also remove self-closing / unclosed dangerous tags
        result = result.replace(new RegExp(`<${tag}\\b[^>]*\\/?>`, 'gi'), '');
    }

    // Remove all on* event handler attributes
    result = result.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');

    // Process remaining tags: allow safe tags, strip unsafe ones
    result = result.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)?\/?>/g, (match, tagName: string, attrs: string) => {
        const tag = tagName.toLowerCase();

        if (!ALLOWED_TAGS[tag]) {
            return '';
        }

        const isClosing = match.charAt(1) === '/';
        const isSelfClosing = match.charAt(match.length - 2) === '/';

        if (isClosing) {
            return `</${tag}>`;
        }

        // For <a> tags, preserve safe href attributes only
        if (tag === 'a' && attrs) {
            const hrefMatch = attrs.match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
            if (hrefMatch) {
                const href = hrefMatch[1] ?? hrefMatch[2] ?? '';
                if (SAFE_HREF_PROTOCOL.test(href.trim())) {
                    return `<a href="${href}"${isSelfClosing ? '/>' : '>'}`;
                }
            }
            return `<a${isSelfClosing ? '/>' : '>'}`;
        }

        // Strip all attributes from other allowed tags
        return `<${tag}${isSelfClosing ? '/>' : '>'}`;
    });

    return result;
}
