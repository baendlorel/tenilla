export interface TenillaLike {
  element: HTMLElement;
  remove(): void;
}

/**
 * This is an advise.
 *
 * `@tenilla/components` uses this.
 */
export abstract class TenillaComponent implements TenillaLike {
  tenilla: true = true;

  protected abstract _element: HTMLElement;
  get element(): HTMLElement {
    return this._element;
  }

  abstract remove(): void;
}

export function isTenillaComponent(obj: any): obj is TenillaComponent {
  return obj?.tenilla === true;
}

/**
 * Returns whether an object satisfies `TenillaLike`
 */
export function isTenillaLike(obj: any): obj is TenillaLike {
  return typeof obj?.remove === 'function' && obj?.element instanceof HTMLElement;
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

  set required(v: boolean) {
    if (v) {
      this._element.classList.add('tenilla-required');
    } else {
      this._element.classList.remove('tenilla-required');
    }
  }

  get required(): boolean {
    return this._element.classList.contains('tenilla-required');
  }
}
