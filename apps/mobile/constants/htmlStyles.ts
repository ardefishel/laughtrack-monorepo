import type { MixedStyleRecord } from 'react-native-render-html';
import type { HtmlStyle } from 'react-native-enriched';

export const HTML_FONT_SIZE = 18;
export const HTML_H1_FONT_SIZE = 28;
export const HTML_H2_FONT_SIZE = 22;

export const ENRICHED_HTML_STYLE: HtmlStyle = {
  h1: { fontSize: HTML_H1_FONT_SIZE, bold: true },
  h2: { fontSize: HTML_H2_FONT_SIZE, bold: true },
};

export const RENDER_HTML_TAGS_STYLES: MixedStyleRecord = {
  h1: {
    fontSize: HTML_H1_FONT_SIZE,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  h2: {
    fontSize: HTML_H2_FONT_SIZE,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  p: {
    fontSize: HTML_FONT_SIZE,
    lineHeight: 30,
    marginBottom: 12,
  },
  b: { fontWeight: 'bold' },
  strong: { fontWeight: 'bold' },
  i: { fontStyle: 'italic' },
  em: { fontStyle: 'italic' },
  u: { textDecorationLine: 'underline' },
  span: { fontSize: HTML_FONT_SIZE },
};
