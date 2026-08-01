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

  interface Element {
    attr(name: string, property: any): this;
    attrs(attributes: string | Record<string, any>): this;
  }

  interface HTMLElement {
    on<K extends keyof HTMLElementEventMap>(
      type: K,
      listener: (this: this, ev: HTMLElementEventMap[K]) => any,
      options?: boolean | AddEventListenerOptions,
    ): this;

    child(...args: any[]): this;

    css(cssText: string): this;
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

Element.prototype.attr = function (attrName: string, property: any) {
  this.setAttribute(attrName, property);
  return this;
};

Element.prototype.attrs = function (this: Element, attributes: Record<string, any>) {
  //! This is faster than Object.entries + forEach
  for (const key in attributes) {
    this.setAttribute(key, attributes[key]);
  }
  return this;
};

// Extend HTMLElement prototype
HTMLElement.prototype.child = function (...a: any[]) {
  this.append(...a);
  return this;
};

HTMLElement.prototype.css = function (s: string) {
  this.style.cssText = s;
  return this;
};
