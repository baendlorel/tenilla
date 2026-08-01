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

type CreatorTuple<S extends string, D extends string = '/'> = H<Split<S, D>>;

export const [
  div,
  span,
  td,
  tr,
  th,
  tbody,
  thead,
  tfoot,
  table,
  ol,
  ul,
  li,
  input,
  select,
  textarea,
  button,
  nav,
  dialog,
] = 'div/span/td/tr/th/tbody/thead/tfoot/table/ol/ul/li/input/select/textarea/button/nav/dialog'
  .split('/')
  .map(
    (t) => (c, b) => h(t, c, b),
  ) as CreatorTuple<'div/span/td/tr/th/tbody/thead/tfoot/table/ol/ul/li/input/select/textarea/button/nav/dialog'>;

/**
 * Create an option element
 * @param value The value for this option
 * @param label Element inside the option, will be appended
 * @param currentValue Current value, if equals value then selected will be true
 */
export function option(value: any, label: any, currentValue: any): HTMLOptionElement;
export function option(v, l, c) {
  const e = h('option');
  if (v !== undefined) e.value = String(v);
  if (l !== undefined) e.append(l);
  e.selected = c !== undefined && c === v;
  return e;
}

type HTMLCheckboxElement = HTMLInputElement & { type: 'checkbox' };

/**
 * Create a checkbox element
 */
export function checkbox(className: string, checked: boolean): HTMLCheckboxElement;
export function checkbox(c, b): HTMLCheckboxElement {
  const e = h('input', c);
  e.type = 'checkbox';
  e.checked = !!b;
  return e as HTMLInputElement & { type: 'checkbox' };
}
