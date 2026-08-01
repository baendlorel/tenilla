/**
 * Helper function for creating HTML elements
 * @param tag
 * @param className Optional class name
 * @param node Optional child node
 */
export function h<T extends keyof HTMLElementTagNameMap>(
  tag: T,
  className?: string,
  node?: any,
): HTMLElementTagNameMap[T] {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (node) e.append(node);
  return e;
}

// Factory: one line per tag, types inferred from h()'s generic signature
const c =
  <T extends keyof HTMLElementTagNameMap>(t: T) =>
  (className?: string, node?: any) =>
    h(t, className, node);

declare global {
  interface Window {
    div(): HTMLDivElement;
  }
}

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
] = [
  c('div'),
  c('span'),
  c('td'),
  c('tr'),
  c('th'),
  c('tbody'),
  c('thead'),
  c('tfoot'),
  c('table'),
  c('ol'),
  c('ul'),
  c('li'),
  c('input'),
  c('select'),
  c('textarea'),
  c('button'),
  c('nav'),
  c('dialog'),
];

/**
 * Create an option element
 * @param value The value for this option
 * @param label Element inside the option, will be appended
 * @param currentValue Current value, if equals value then selected will be true
 */
export function option(
  value?: string | number,
  label?: any,
  currentValue?: string | number,
): HTMLOptionElement {
  const e = h('option');
  if (value) e.value = String(value);
  if (label) e.append(label);
  e.selected = currentValue !== undefined && currentValue === value;
  return e;
}

/**
 * Create a checkbox element
 */
export function checkbox(
  className?: string,
  child?: any,
  checked?: boolean,
): HTMLInputElement & { type: 'checkbox' } {
  const e = h('input', className, child) as HTMLInputElement & { type: 'checkbox' };
  e.type = 'checkbox';
  e.checked = !!checked;
  return e;
}
