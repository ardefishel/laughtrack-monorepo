import {
  decodeHtmlEntities,
  stripHtmlTags,
  extractTitleAndDescription,
  extractTextFromHtml,
  stripHtmlWrapper,
  combineHtmlContents,
} from '@/lib/htmlParser';

describe('decodeHtmlEntities', () => {
  it('should decode &nbsp; to space', () => {
    expect(decodeHtmlEntities('Hello&nbsp;World')).toBe('Hello World');
  });

  it('should decode &amp; to &', () => {
    expect(decodeHtmlEntities('Tom &amp; Jerry')).toBe('Tom & Jerry');
  });

  it('should decode &lt; and &gt; to < and >', () => {
    expect(decodeHtmlEntities('5 &lt; 10 &gt; 3')).toBe('5 < 10 > 3');
  });

  it('should decode &quot; to "', () => {
    expect(decodeHtmlEntities('&quot;Hello&quot;')).toBe('"Hello"');
  });

  it('should decode &#39; to apostrophe', () => {
    expect(decodeHtmlEntities('It&#39;s a test')).toBe("It's a test");
  });

  it('should decode multiple entities in one string', () => {
    expect(decodeHtmlEntities('&lt;div&gt;Hello&nbsp;&amp;&nbsp;World&lt;/div&gt;')).toBe(
      '<div>Hello & World</div>'
    );
  });

  it('should return plain text unchanged', () => {
    expect(decodeHtmlEntities('Plain text')).toBe('Plain text');
  });
});

describe('stripHtmlTags', () => {
  it('should remove HTML tags', () => {
    expect(stripHtmlTags('<p>Hello</p>')).toBe('Hello');
  });

  it('should replace <br> tags with newlines', () => {
    expect(stripHtmlTags('Line 1<br>Line 2')).toBe('Line 1\nLine 2');
  });

  it('should handle self-closing br tags', () => {
    expect(stripHtmlTags('Line 1<br/>Line 2<br />Line 3')).toBe('Line 1\nLine 2\nLine 3');
  });

  it('should remove nested tags', () => {
    expect(stripHtmlTags('<div><p>Hello <strong>World</strong></p></div>')).toBe('Hello World');
  });

  it('should handle empty input', () => {
    expect(stripHtmlTags('')).toBe('');
  });
});

describe('extractTitleAndDescription', () => {
  it('should extract title and description from HTML', () => {
    const html = 'Joke Title<br>First line of joke<br>Second line';
    const result = extractTitleAndDescription(html);
    expect(result.title).toBe('Joke Title');
    expect(result.description).toBe('First line of joke Second line');
  });

  it('should handle HTML with br tags', () => {
    const html = 'Title<br>Line 1<br>Line 2';
    const result = extractTitleAndDescription(html);
    expect(result.title).toBe('Title');
    expect(result.description).toBe('Line 1 Line 2');
  });

  it('should handle empty HTML', () => {
    const result = extractTitleAndDescription('');
    expect(result.title).toBe('');
    expect(result.description).toBe('');
  });

  it('should handle HTML with only one line', () => {
    const result = extractTitleAndDescription('<p>Only Title</p>');
    expect(result.title).toBe('Only Title');
    expect(result.description).toBe('');
  });

  it('should handle HTML entities in content', () => {
    const html = 'Tom &amp; Jerry<br>The cat &amp; mouse';
    const result = extractTitleAndDescription(html);
    expect(result.title).toBe('Tom & Jerry');
    expect(result.description).toBe('The cat & mouse');
  });
});

describe('extractTextFromHtml', () => {
  it('should extract plain text from HTML', () => {
    const html = '<p>Hello <strong>World</strong></p>';
    expect(extractTextFromHtml(html)).toBe('Hello World');
  });

  it('should handle multiple lines', () => {
    const html = 'Line 1<br>Line 2<br>Line 3';
    expect(extractTextFromHtml(html)).toBe('Line 1 Line 2 Line 3');
  });

  it('should handle empty input', () => {
    expect(extractTextFromHtml('')).toBe('');
  });

  it('should decode HTML entities', () => {
    expect(extractTextFromHtml('Hello&nbsp;&amp;&nbsp;World')).toBe('Hello & World');
  });

  it('should handle multiple paragraphs', () => {
    const html = '<p>Line 1</p><p>Line 2</p>';
    expect(extractTextFromHtml(html)).toBe('Line 1Line 2');
  });
});

describe('stripHtmlWrapper', () => {
  it('should remove html wrapper tags', () => {
    expect(stripHtmlWrapper('<html><body>Content</body></html>')).toBe('<body>Content</body>');
  });

  it('should handle attributes on html tag', () => {
    expect(stripHtmlWrapper('<html lang="en">Content</html>')).toBe('Content');
  });

  it('should handle empty input', () => {
    expect(stripHtmlWrapper('')).toBe('');
  });

  it('should return content without wrapper unchanged', () => {
    expect(stripHtmlWrapper('<div>Content</div>')).toBe('<div>Content</div>');
  });
});

describe('combineHtmlContents', () => {
  it('should combine multiple HTML contents', () => {
    const contents = ['<p>Joke 1</p>', '<p>Joke 2</p>'];
    expect(combineHtmlContents(contents)).toBe(
      '<html><body><p>Joke 1</p><br><br><p>Joke 2</p></body></html>'
    );
  });

  it('should filter out empty content', () => {
    const contents = ['<p>Joke 1</p>', '', '<p>Joke 2</p>', null as any];
    expect(combineHtmlContents(contents)).toBe(
      '<html><body><p>Joke 1</p><br><br><p>Joke 2</p></body></html>'
    );
  });

  it('should return empty HTML for empty array', () => {
    expect(combineHtmlContents([])).toBe('<html><body></body></html>');
  });

  it('should return empty HTML for array with only empty strings', () => {
    expect(combineHtmlContents(['', '', null as any])).toBe('<html><body></body></html>');
  });
});
