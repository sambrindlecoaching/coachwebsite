import { describe, expect, it } from 'vitest';
import { demoIssue, demoLinks, escapeText, pollUrl, renderKitchenTable, renderBaseEmail, safeEmailUrl } from '../emails/kitchen-table';
describe('email text and links', () => {
  it('escapes text and attribute delimiters', () => { expect(escapeText('<img a="x">&\'')).toBe('&lt;img a=&quot;x&quot;&gt;&amp;&#39;'); });
  it('rejects executable and protocol-relative links', () => {
    for (const url of ['javascript:alert(1)', 'data:text/html,x', '//evil.test', '/\\evil.test']) expect(safeEmailUrl(url)).toBe('#');
    expect(safeEmailUrl('/book')).toBe('/book');
  });
  it('keeps the three poll answers on the existing poll page', () => {
    expect(pollUrl('/poll', 'calm')).toBe('/poll?a=calm');
    expect(pollUrl('/poll', 'coping')).toBe('/poll?a=coping');
    expect(pollUrl('/poll', 'rough')).toBe('/poll?a=rough');
  });
  it('does not re-interpret user template markers or HTML', () => {
    const text = '{{signOff}} <script>alert(1)</script>';
    expect(renderKitchenTable({ ...demoIssue, heroQuote: text }, demoLinks)).toContain(escapeText(text));
    expect(renderBaseEmail({ title: text, date: '', preheader: text, paragraphs: [text], signOff: text }, demoLinks)).toContain(escapeText(text));
  });
});
