declare global {
  interface Node {
    on(
      type: string,
      callback: EventListenerOrEventListenerObject | null,
      options?: AddEventListenerOptions | boolean,
    ): this;

    /**
     * 函数式调用，修改自己返回自己
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
 * 创建 HTML 元素的辅助函数
 * @param tag
 * @param className 可选的类名
 * @param node 可选的子节点
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
 * 创建 div 元素
 */
export function div(className?: string, node?: any): HTMLDivElement {
  return h('div', className, node);
}

/**
 * 创建 td 元素
 */
export function td(className?: string, node?: any): HTMLTableCellElement {
  return h('td', className, node);
}

/**
 * 创建 tr 元素
 */
export function tr(className?: string, node?: any): HTMLTableRowElement {
  return h('tr', className, node);
}

/**
 * 创建 th 元素
 */
export function th(className?: string, node?: any): HTMLTableCellElement {
  return h('th', className, node);
}

/**
 * 创建 tbody 元素
 */
export function tbody(className?: string, node?: any): HTMLTableSectionElement {
  return h('tbody', className, node);
}

/**
 * 创建 thead 元素
 */
export function thead(className?: string, node?: any): HTMLTableSectionElement {
  return h('thead', className, node);
}

/**
 * 创建 tfoot 元素
 */
export function tfoot(className?: string, node?: any): HTMLTableSectionElement {
  return h('tfoot', className, node);
}

/**
 * 创建 table 元素
 */
export function table(className?: string, node?: any): HTMLTableElement {
  return h('table', className, node);
}

/**
 * 创建 ol 元素
 */
export function ol(className?: string, node?: any): HTMLOListElement {
  return h('ol', className, node);
}

/**
 * 创建 ul 元素
 */
export function ul(className?: string, node?: any): HTMLUListElement {
  return h('ul', className, node);
}

/**
 * 创建 li 元素
 */
export function li(className?: string, node?: any): HTMLLIElement {
  return h('li', className, node);
}

/**
 * 创建 input 元素
 */
export function input(className?: string, node?: any): HTMLInputElement {
  return h('input', className, node);
}

/**
 * 创建 select 元素
 */
export function select(className?: string, node?: any): HTMLSelectElement {
  return h('select', className, node);
}

/**
 * 创建 textarea 元素
 */
export function textarea(className?: string, node?: any): HTMLTextAreaElement {
  return h('textarea', className, node);
}

/**
 * 创建 option 元素
 * @param value 这个option对应的value
 * @param label option元素内部的元素，会被option.appendChild调用
 * @param currentValue 当前值，如果等于value，那么它的selected将为true
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
 * 创建 checkbox 元素
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
 *
 * 想创建bootstrap风格的按钮可以用`btn()`
 */
export function button(className?: string, node?: any): HTMLButtonElement {
  return h('button', className, node);
}

/**
 * 创建 span 元素
 */
export function span(className?: string, node?: any): HTMLSpanElement {
  return h('span', className, node);
}

/**
 * 创建 nav 元素
 */
export function nav(className?: string, node?: any): HTMLElement {
  return h('nav', className, node);
}

/**
 * 创建 dialog 元素
 */
export function dialog(className?: string, node?: any): HTMLDialogElement {
  return h('dialog', className, node);
}

// 扩展 Node 原型
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

// 扩展 HTMLElement 原型
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
