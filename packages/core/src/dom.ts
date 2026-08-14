declare global {
  interface Node {
    on(
      type: string,
      listener: EventListenerOrEventListenerObject | null,
      options?: AddEventListenerOptions | boolean,
    ): this;

    /**
     * Chainable call, modifies self and returns self
     * @param fn
     */
    tap(fn: (thisArg: this) => unknown): this;

    readonly self: this;
  }

  interface Element {
    /**
     * Remove the attribute when property is `undefined` | `null` | `false`
     */
    attr(name: string, property: any): this;

    /**
     * Set multiple attributes at once
     * - remove the attribute when property is `undefined` | `null` | `false`
     */
    attrs(attributes: Record<string, any>): this;

    /**
     * A chainable `append` call, returns self.
     * - ignores `false`, `null` and `undefined`.
     * @param nodes strings are converted to text nodes; objects with `.self` are unwrapped.
     */
    //  @param nodes automically dealt with `TenillaComponent`
    child(...nodes: any[]): this;

    /**
     * Calls `classList.toggle(className, toggle)` and returns self.
     */
    class(className: string, toggle?: boolean): this;

    /**
     * `this.className = classNames` and returns self.
     */
    classes(classNames: string | string[]): this;

    /**
     * Set one CSS property, returns self.
     */
    css<K extends keyof CSSStyleDeclaration>(propName: K, value: CSSStyleDeclaration[K]): this;

    /**
     * Set the `style.cssText` property, returns self.
     *
     * _This is actually in `ElementCSSInlineStyle`_
     */
    styleText(text: string): this;

    /**
     * Assign the object to the `style` property, returns self.
     *
     * _This is actually in `ElementCSSInlineStyle`_
     */
    styles(style: Partial<CSSStyleDeclaration>): this;

    styleProp(name: string, value: string): this;

    styleProps(styles: Record<string, string>): this;
  }

  interface HTMLElement {
    on<K extends keyof HTMLElementEventMap>(
      type: K,
      listener: (this: this, ev: HTMLElementEventMap[K]) => any,
      options?: boolean | AddEventListenerOptions,
    ): this;
    on(
      type: string,
      listener: EventListenerOrEventListenerObject | null,
      options?: AddEventListenerOptions | boolean,
    ): this;
  }

  interface SVGElement {
    on<K extends keyof SVGElementEventMap>(
      type: K,
      listener: (this: this, ev: SVGElementEventMap[K]) => any,
      options?: boolean | AddEventListenerOptions,
    ): this;
    on(
      type: string,
      listener: EventListenerOrEventListenerObject | null,
      options?: AddEventListenerOptions | boolean,
    ): this;
  }

  interface MathMLElement {
    on<K extends keyof MathMLElementEventMap>(
      type: K,
      listener: (this: this, ev: MathMLElementEventMap[K]) => any,
      options?: boolean | AddEventListenerOptions,
    ): this;
    on(
      type: string,
      listener: EventListenerOrEventListenerObject | null,
      options?: AddEventListenerOptions | boolean,
    ): this;
  }
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

Node.prototype.tap = function (f: (thisArg: Node) => void) {
  f(this);
  return this;
};

Element.prototype.attr = function (attrName: string, v: any) {
  if (v === undefined || v === null || v === false) {
    this.removeAttribute(attrName);
  } else if (v === true) {
    this.setAttribute(attrName, '');
  } else {
    this.setAttribute(attrName, v);
  }
  return this;
};

Element.prototype.attrs = function (this: Element, attrs: Record<string, any>) {
  //! This is faster than Object.entries + forEach
  for (const key in attrs) {
    this.attr(key, attrs[key]);
  }
  return this;
};

// Extend HTMLElement prototype
const _fullish = (v) => v !== false && v !== null && v !== undefined;
Element.prototype.child = function (...a: any[]) {
  this.append(...a.filter(_fullish));
  return this;
};

Element.prototype.class = function (className: string, toggle: boolean = true) {
  if (toggle) {
    (this as Element).classList.add(className);
  } else {
    (this as Element).classList.remove(className);
  }
  return this;
};

Element.prototype.classes = function (c: string | string[]) {
  (this as Element).className = Array.isArray(c) ? c.join(' ') : c;
  return this;
};

Element.prototype.styleText = function (s: string) {
  (this as ElementCSSInlineStyle).style.cssText = s;
  return this;
};

Element.prototype.styles = function (s: CSSStyleDeclaration) {
  Object.assign((this as ElementCSSInlineStyle).style, s);
  return this;
};

Element.prototype.styleProp = function (name: string, value: string) {
  (this as ElementCSSInlineStyle).style.setProperty(name, value);
  return this;
};

Element.prototype.styleProps = function (styles: Record<string, string>) {
  for (const name in styles) {
    (this as ElementCSSInlineStyle).style.setProperty(name, styles[name]);
  }
  return this;
};
