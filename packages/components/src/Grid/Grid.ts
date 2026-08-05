import { div } from '@tenilla/core';
import './Grid.css';

export function container({
  rowGap = '16px',
  colGap = '16px',
}: { rowGap?: string; colGap?: string } = {}): HTMLDivElement {
  return div('tenilla-grid-container').attr('style', `row-gap: ${rowGap}; column-gap: ${colGap};`);
}

/**
 * Create a grid row — a horizontal flex container with wrap enabled.
 * Vertical spacing between wrapped lines uses `--tenilla-grid-gap` (default 16px).
 *
 * Children are typically created via `col()`.
 *
 * @example
 * ```ts
 * row().child(
 *   col(6, 'left half'),
 *   col(6, 'right half'),
 * );
 * ```
 */
export function row(...children: any[]): HTMLDivElement {
  return div('tenilla-grid-row').child(...children);
}

export type GridColSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

/**
 * Create a grid column with width `span / 12 * 100%` of its parent row.
 *
 * Spacing between columns comes from each col's horizontal padding
 * (absorbed by `box-sizing: border-box`), so a row of `col(6) + col(6)`
 * fits exactly without overflow. The first and last col of a row
 * automatically drop their outer padding to align with the row edges.
 *
 * @param span Width in 12-column grid units. Defaults to 12 (full row).
 * @param child Content to place inside the column.
 */
export function col(span: GridColSpan = 12, child?: any): HTMLDivElement {
  // if (span < 1 || span > 12 || !Number.isInteger(span)) {
  //   throw new Error('span must be an integer between 1 and 12');
  // }
  const percent = (span / 12) * 100;
  return div('tenilla-grid-col').attr('style', `flex: 0 0 ${percent}%`).child(child);
}
