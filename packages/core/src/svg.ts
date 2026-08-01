import type { Split } from './utils.js';

/**
 * Helper function for creating SVG elements
 * @param tag SVG element tag name
 * @param attr Optional attributes
 */
export function svg<T extends keyof SVGElementTagNameMap>(
  tag: T,
  attr?: Record<string, string>,
): SVGElementTagNameMap[T];
/**
 * Helper function for creating SVG elements
 * @param tag SVG element tag name
 * @param attr Optional attributes
 */
export function svg(tag: string, attr?: Record<string, string>): SVGElement;
export function svg(tag: string, attr: Record<string, string> = {}) {
  const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const k in attr) {
    e.setAttribute(k, attr[k]);
  }
  return e;
}

type H<T extends string[]> = {
  [K in keyof T]: T[K] extends keyof SVGElementTagNameMap
    ? (attr?: Record<string, string>) => SVGElementTagNameMap[T[K]]
    : never;
};

type CreatorTuple<S extends string, D extends string = ','> = H<Split<S, D>>;

/**
 * Create a tuple of element creators from a string of tag names separated by a delimiter
 *
 * @param alias A string of tag names separated by  `','`
 *
 * @example
 * ```ts
 * const [a, circle, rect] = svgAlias('a,circle,rect');
 * ```
 */
export function svgAlias<T extends string>(alias: T): CreatorTuple<T> {
  return alias.split(',').map((t) => (attr) => svg(t, attr)) as CreatorTuple<T>;
}
