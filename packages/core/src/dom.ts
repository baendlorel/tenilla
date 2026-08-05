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
     */
    child(...nodes: any[]): this;

    /**
     * Set the `style.cssText` property, returns self.
     *
     * _This is actually in `ElementCSSInlineStyle`_
     */
    cssText(text: string): this;

    /**
     * Assign the object to the `style` property, returns self.
     *
     * _This is actually in `ElementCSSInlineStyle`_
     */
    css(style: Partial<CSSStyleDeclaration>): this;
  }

  interface HTMLElement {
    on(
      type: string,
      listener: EventListenerOrEventListenerObject | null,
      options?: AddEventListenerOptions | boolean,
    ): this;
    on<K extends keyof HTMLElementEventMap>(
      type: K,
      listener: (this: this, ev: HTMLElementEventMap[K]) => any,
      options?: boolean | AddEventListenerOptions,
    ): this;
  }

  interface SVGElement {
    on(
      type: string,
      listener: EventListenerOrEventListenerObject | null,
      options?: AddEventListenerOptions | boolean,
    ): this;
    on<K extends keyof SVGElementEventMap>(
      type: K,
      listener: (this: this, ev: SVGElementEventMap[K]) => any,
      options?: boolean | AddEventListenerOptions,
    ): this;
  }

  interface MathMLElement {
    on(
      type: string,
      listener: EventListenerOrEventListenerObject | null,
      options?: AddEventListenerOptions | boolean,
    ): this;
    on<K extends keyof MathMLElementEventMap>(
      type: K,
      listener: (this: this, ev: MathMLElementEventMap[K]) => any,
      options?: boolean | AddEventListenerOptions,
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
HTMLElement.prototype.child = function (...a: any[]) {
  this.append(...a);
  return this;
};

Element.prototype.cssText = function (s: string) {
  (this as ElementCSSInlineStyle).style.cssText = s;
  return this;
};

Element.prototype.css = function (s: CSSStyleDeclaration) {
  Object.assign((this as ElementCSSInlineStyle).style, s);
  return this;
};
