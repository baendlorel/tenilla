/**
 * This is an advise.
 *
 * `@tenilla/components` uses this.
 */
export abstract class TenillaComponent {
  tenilla: true = true;

  protected abstract _element: HTMLElement;
  get element(): HTMLElement {
    return this._element;
  }

  abstract remove(): void;

  /**
   * Returns `this.element` like `Node.prototype.self` we defined.
   */
  get self(): HTMLElement {
    return this._element;
  }
}

export function isTenillaComponent(obj: any): obj is TenillaComponent {
  return obj?.tenilla === true;
}

export type OnChange<T = any> = (value: T, oldValue: T) => void;

/**
 * Tenilla's input component protocol
 */
export abstract class TenillaInput extends TenillaComponent {
  abstract name: string;
  abstract get value(): any;
  abstract set value(v: any);
  abstract get disabled(): boolean;
  abstract set disabled(v: boolean);
  protected abstract onChange: OnChange;
}
