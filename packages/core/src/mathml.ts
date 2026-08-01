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
  const el = document.createElementNS('http://www.w3.org/1998/Math/MathML', tag);
  for (const [k, v] of Object.entries(attr)) {
    el.setAttribute(k, v);
  }
  return el;
}

type H<T extends string[]> = {
  [K in keyof T]: T[K] extends keyof MathMLElementTagNameMap
    ? (attr?: Record<string, string>) => MathMLElementTagNameMap[T[K]]
    : never;
};

type CreatorTuple<S extends string, D extends string = '/'> = H<Split<S, D>>;

export const [
  math,
  mi,
  mn,
  mo,
  ms,
  mtext,
  mspace,
  mrow,
  mfrac,
  msqrt,
  mroot,
  msup,
  msub,
  msubsup,
  mover,
  munder,
  munderover,
  mtable,
  mtr,
  mtd,
  mphantom,
  mstyle,
  semantics,
  annotation,
] =
  'math/mi/mn/mo/ms/mtext/mspace/mrow/mfrac/msqrt/mroot/msup/msub/msubsup/mover/munder/munderover/mtable/mtr/mtd/mphantom/mstyle/semantics/annotation'
    .split('/')
    .map(
      (t) => (attr) => mathml(t, attr),
    ) as CreatorTuple<'math/mi/mn/mo/ms/mtext/mspace/mrow/mfrac/msqrt/mroot/msup/msub/msubsup/mover/munder/munderover/mtable/mtr/mtd/mphantom/mstyle/semantics/annotation'>;
