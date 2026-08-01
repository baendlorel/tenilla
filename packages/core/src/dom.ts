declare global {
  interface Node {
    on(
      type: string,
      callback: EventListenerOrEventListenerObject | null,
      options?: AddEventListenerOptions | boolean,
    ): this;

    /**
     * Chainable call, modifies self and returns self
     * @param fn
     */
    tap(fn: (thisArg: this) => unknown): this;
  }

  interface HTMLElement {
    on<K extends keyof HTMLElementEventMap>(
      type: K,
      listener: (this: this, ev: HTMLElementEventMap[K]) => any,
      options?: boolean | AddEventListenerOptions,
    ): this;

    attr(name: string, property: any): this;

    child(...args: any[]): this;

    css(cssText: string): this;
  }
}

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

/**
 * Create a div element
 */
export function div(className?: string, node?: any): HTMLDivElement {
  return h('div', className, node);
}

/**
 * Create a td element
 */
export function td(className?: string, node?: any): HTMLTableCellElement {
  return h('td', className, node);
}

/**
 * Create a tr element
 */
export function tr(className?: string, node?: any): HTMLTableRowElement {
  return h('tr', className, node);
}

/**
 * Create a th element
 */
export function th(className?: string, node?: any): HTMLTableCellElement {
  return h('th', className, node);
}

/**
 * Create a tbody element
 */
export function tbody(className?: string, node?: any): HTMLTableSectionElement {
  return h('tbody', className, node);
}

/**
 * Create a thead element
 */
export function thead(className?: string, node?: any): HTMLTableSectionElement {
  return h('thead', className, node);
}

/**
 * Create a tfoot element
 */
export function tfoot(className?: string, node?: any): HTMLTableSectionElement {
  return h('tfoot', className, node);
}

/**
 * Create a table element
 */
export function table(className?: string, node?: any): HTMLTableElement {
  return h('table', className, node);
}

/**
 * Create an ol element
 */
export function ol(className?: string, node?: any): HTMLOListElement {
  return h('ol', className, node);
}

/**
 * Create a ul element
 */
export function ul(className?: string, node?: any): HTMLUListElement {
  return h('ul', className, node);
}

/**
 * Create a li element
 */
export function li(className?: string, node?: any): HTMLLIElement {
  return h('li', className, node);
}

/**
 * Create an input element
 */
export function input(className?: string, node?: any): HTMLInputElement {
  return h('input', className, node);
}

/**
 * Create a select element
 */
export function select(className?: string, node?: any): HTMLSelectElement {
  return h('select', className, node);
}

/**
 * Create a textarea element
 */
export function textarea(className?: string, node?: any): HTMLTextAreaElement {
  return h('textarea', className, node);
}

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

/**
 * Create a button element
 * Use `btn()` for Bootstrap-style buttons
 */
export function button(className?: string, node?: any): HTMLButtonElement {
  return h('button', className, node);
}

/**
 * Create a span element
 */
export function span(className?: string, node?: any): HTMLSpanElement {
  return h('span', className, node);
}

/**
 * Create a nav element
 */
export function nav(className?: string, node?: any): HTMLElement {
  return h('nav', className, node);
}

/**
 * Create a dialog element
 */
export function dialog(className?: string, node?: any): HTMLDialogElement {
  return h('dialog', className, node);
}

// Extend Node prototype
Node.prototype.on = function (
  n: string,
  e: EventListenerOrEventListenerObject | null,
  o?: AddEventListenerOptions | boolean,
) {
  this.addEventListener(n, e, o);
  return this;
};

Node.prototype.tap = function (f: (thisArg: Node) => unknown) {
  f(this);
  return this;
};

// Extend HTMLElement prototype
HTMLElement.prototype.child = function (...a: any[]) {
  this.append(...a);
  return this;
};

HTMLElement.prototype.attr = function (n: string, p: any) {
  this.setAttribute(n, p);
  return this;
};

HTMLElement.prototype.css = function (s: string) {
  this.style.cssText = s;
  return this;
};
