import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

import { renderMarkdown } from './markdown';

/**
 * Two things about this renderer would fail silently if they regressed, and
 * both did before it moved to `react-markdown` (audit A7).
 *
 * The first is GFM: the hand-written parser understood four constructs and
 * printed everything else verbatim, so a table the doctor wrote in the back
 * office reached a visitor as a row of pipe characters. The second is `rel` on
 * a link — every link in this text was typed by an editor, and an outbound one
 * without `noopener` hands the new tab a handle on ours.
 *
 * `TESTING.md` keeps presentational components out of the suite; this is a pure
 * function from a string to markup, and it is the one place the client's own
 * words are transformed before a patient reads them.
 */
describe('renderMarkdown', () => {
  const html = (src: string) => renderToStaticMarkup(renderMarkdown(src));

  it('renders a GFM table rather than the pipes it is written with', () => {
    const out = html('| a | b |\n| - | - |\n| 1 | 2 |');
    expect(out).toContain('<table');
    expect(out).toContain('<th');
    expect(out).not.toContain('| a | b |');
  });

  it('gives every link a safe rel', () => {
    expect(html('A [link](https://example.com).')).toContain(
      'rel="noopener noreferrer nofollow"',
    );
  });

  it('renders ordered lists, which the old parser turned into paragraphs', () => {
    expect(html('1. unu\n2. doi')).toContain('<ol');
  });

  it('leaves raw HTML as text rather than executing it', () => {
    expect(html('<script>alert(1)</script>')).not.toContain('<script>');
  });
});
