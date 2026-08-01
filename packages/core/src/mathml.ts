import type { Split } from './utils.js';

/**
 * Helper function for creating MathML elements
 * @param tag MathML element tag name
 * @param attr Optional attributes
 */
export function mathml<T extends keyof MathMLElementTagNameMap>(
  tag: T,
  attr?: Record<string, string>,
): MathMLElementTagNameMap[T];
/**
 * Helper function for creating MathML elements
 * @param tag MathML element tag name
 * @param attr Optional attributes
 */ export function mathml(tag: string, attr?: Record<string, string>): Element;
export function mathml(tag: string, attr: Record<string, string> = {}) {
  const e = document.createElementNS('http://www.w3.org/1998/Math/MathML', tag);
  for (const k in attr) {
    e.setAttribute(k, attr[k]);
  }
  return e;
}

type H<T extends string[]> = {
  [K in keyof T]: T[K] extends keyof MathMLElementTagNameMap
    ? (attr?: Record<string, string>) => MathMLElementTagNameMap[T[K]]
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
 * const [math, mi, mn] = mathMLAlias('math,mi,mn');
 * ```
 */
export function mathMLAlias<T extends string>(alias: T): CreatorTuple<T> {
  return alias.split(',').map((t) => (attr) => mathml(t, attr)) as CreatorTuple<T>;
}
