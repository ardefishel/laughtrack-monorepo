import { stripHtmlWrapper } from '@laughtrack/html-utils'
import type { SetlistItem } from '@/types'

interface ThemeColors {
    background: string
    foreground: string
    muted: string
    accent: string
    surface: string
}

export function buildSetlistReaderHtml(
    items: SetlistItem[],
    description: string,
    colors: ThemeColors,
): string {
    const sections = items
        .map((item, index) => {
            if (item.type === 'bit') {
                const rawHtml = item.bit?.content ?? ''
                const content = stripHtmlWrapper(rawHtml)
                const title = item.bit ? '' : '<p class="empty">Untitled bit</p>'
                const divider = index > 0 ? '<hr/>' : ''
                return `${divider}<section class="bit">${title}${content}</section>`
            }

            const noteText = item.setlistNote?.content ?? 'Note'
            const divider = index > 0 ? '<hr/>' : ''
            return `${divider}<section class="note"><span class="note-icon">📝</span> ${escapeHtml(noteText)}</section>`
        })
        .join('\n')

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 17px;
    line-height: 1.6;
    color: ${colors.foreground};
    background: ${colors.background};
    padding: 24px 20px 80px 20px;
    -webkit-text-size-adjust: 100%;
  }
  h1 { font-size: 28px; font-weight: 700; margin: 0 0 12px 0; line-height: 1.3; }
  h2 { font-size: 24px; font-weight: 700; margin: 0 0 10px 0; line-height: 1.3; }
  h3 { font-size: 20px; font-weight: 600; margin: 0 0 8px 0; line-height: 1.3; }
  p { margin: 0 0 12px 0; }
  b, strong { font-weight: 700; }
  i, em { font-style: italic; }
  u { text-decoration: underline; }
  s, strike { text-decoration: line-through; }
  ul, ol { margin: 0 0 12px 24px; }
  li { margin: 0 0 4px 0; }
  blockquote {
    border-left: 3px solid ${colors.accent};
    padding: 8px 0 8px 16px;
    margin: 0 0 12px 0;
    color: ${colors.muted};
    font-style: italic;
  }
  code {
    font-family: 'SF Mono', 'Menlo', monospace;
    font-size: 15px;
    background: ${colors.surface};
    padding: 2px 6px;
    border-radius: 4px;
  }
  pre {
    background: ${colors.surface};
    padding: 12px 16px;
    border-radius: 8px;
    margin: 0 0 12px 0;
    overflow-x: auto;
  }
  pre code { background: none; padding: 0; }
  hr {
    border: none;
    border-top: 1px solid ${colors.surface};
    margin: 28px 0;
  }
  section.bit { margin: 0 0 8px 0; }
  section.note {
    background: ${colors.surface};
    border-radius: 10px;
    padding: 14px 16px;
    margin: 0 0 8px 0;
    font-size: 15px;
    color: ${colors.muted};
    font-style: italic;
    line-height: 1.5;
  }
  .note-icon { font-style: normal; margin-right: 4px; }
  .empty { color: ${colors.muted}; font-style: italic; }
</style>
</head>
<body>
${sections}
</body>
</html>`
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
}
