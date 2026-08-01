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

// export declare function div(className?: string, child?: any): HTMLDivElement;
// export declare function span(className?: string, child?: any): HTMLSpanElement;
// export declare function td(className?: string, child?: any): HTMLTableCellElement;
// export declare function tr(className?: string, child?: any): HTMLTableRowElement;
// export declare function th(className?: string, child?: any): HTMLTableCellElement;
// export declare function tbody(className?: string, child?: any): HTMLTableSectionElement;
// export declare function thead(className?: string, child?: any): HTMLTableSectionElement;
// export declare function tfoot(className?: string, child?: any): HTMLTableSectionElement;
// export declare function table(className?: string, child?: any): HTMLTableElement;
// export declare function ol(className?: string, child?: any): HTMLOListElement;
// export declare function ul(className?: string, child?: any): HTMLUListElement;
// export declare function li(className?: string, child?: any): HTMLLIElement;
// export declare function input(className?: string, child?: any): HTMLInputElement;
// export declare function select(className?: string, child?: any): HTMLSelectElement;
// export declare function textarea(className?: string, child?: any): HTMLTextAreaElement;
// export declare function button(className?: string, child?: any): HTMLButtonElement;
// export declare function nav(className?: string, child?: any): HTMLElement;
// export declare function dialog(className?: string, child?: any): HTMLDialogElement;

// 'div/span/td/tr/th/tbody/thead/tfoot/table/ol/ul/li/input/select/textarea/button/span/nav/dialog'
//   .split('/')
//   .forEach((v) => (window[v] = (c, a) => h(v, c, a)));

type Split<S extends string, D extends string> = S extends `${infer Head}${D}${infer Tail}`
  ? [Head, ...Split<Tail, D>]
  : [S];

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
