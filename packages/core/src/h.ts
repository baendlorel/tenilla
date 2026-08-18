import type { Split } from './utils.js';

/**
 * Helper function for creating HTML elements
 * @param tag
 * @param className Optional class name
 * @param node Optional child node
 */
export function h<T extends keyof HTMLElementTagNameMap>(
  tag: T,
  className?: string,
  child?: any,
): HTMLElementTagNameMap[T];
/**
 * Helper function for creating HTML elements
 * @param tag
 * @param className Optional class name
 * @param node Optional child node
 */
export function h(tag: string, className?: string, child?: any): HTMLElement;
export function h(t: string, c?: string, n?: any) {
  const e = document.createElement(t);
  if (c) e.className = c;
  if (n) e.append(n);
  return e;
}

type H<T extends string[]> = {
  [K in keyof T]: T[K] extends keyof HTMLElementTagNameMap
    ? (className?: string, child?: any) => HTMLElementTagNameMap[T[K]]
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
 * const [div, span, td] = hAlias('div,span,td');
 * ```
 */
export function hAlias<T extends string>(aliases: T): CreatorTuple<T> {
  return aliases.split(',').map((t) => (c, b) => h(t, c, b)) as CreatorTuple<T>;
}

export const [div] = hAlias('div');

/**
 * Create a document fragment.
 * - ignores `false`, `null` and `undefined`.
 * - extracts `.element` from `TenillaComponent` and appends that instead.
 * @param nodes strings are converted to text nodes.
 */
export function frag(...a: any[]): DocumentFragment {
  const f = document.createDocumentFragment();
  for (let i = 0; i < a.length; i++) {
    const v = a[i];
    if (v !== false && v !== null && v !== undefined) {
      if (v.element) {
        f.append(v.element);
      } else {
        f.append(v);
      }
    }
  }
  return f;
}

/**
 * Create an option element
 * @param value The value for this option
 * @param label Element inside the option, will be appended
 */
export function option(value: string, label: string, selected?: boolean): HTMLOptionElement;
export function option(value: any, label: any, selected?: boolean): HTMLOptionElement;
export function option(v, l, s = false) {
  const e = h('option');
  e.value = String(v);
  e.append(l);
  e.selected = s;
  return e;
}
