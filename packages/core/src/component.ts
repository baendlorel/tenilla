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
 * A validator returns `true` or `undefined` (valid), or a `string` (error message).
 * - Only when the input component being a child of smartForm, the validator will receive the smartForm instance as the second argument.
 */
export type Validator<T = any> = (value: T, smartForm?: any) => boolean | string | undefined;

/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
const _noop = (() => {}) as (...args: any[]) => any;

export interface TenillaInputArgs {
  name?: string;
  onChange?: OnChange;
  validator?: Validator;
  smartForm?: any;
}

/**
 * Tenilla's input component protocol.
 *
 * Every concrete input component provides a `validate()` method that
 * runs the component's `validator` (if set) plus a built-in required check.
 * On failure the wrapper gets `.tenilla-invalid` and an error message
 * appears below the input via `.tenilla-input-error`.
 */
export abstract class TenillaInput extends TenillaComponent {
  public name: string;
  abstract get value(): any;
  abstract set value(v: any);
  abstract get disabled(): boolean;
  abstract set disabled(v: boolean);
  protected onChange: OnChange;

  /** Custom validator function. Returns `true` or an error string. */
  protected validator: Validator;

  /** @internal The error message element. Created by `_initErrorEl()`. */
  private _errorEl: HTMLElement | null = null;

  /** @internal this input might be the child of a SmartForm instance*/
  protected _smartForm?: any;

  constructor(args: TenillaInputArgs = {}) {
    super();
    this.name = args.name ?? '';
    this.onChange = args.onChange ?? _noop;
    this.validator = args.validator ?? _noop;
    this._smartForm = args.smartForm;
  }

  /**
   * Initialise the error-message element inside `this._element`.
   * Call this at the end of every concrete component's constructor.
   */
  protected _initErrorEl(): void {
    if (this._errorEl) return;
    this._errorEl = document.createElement('div');
    this._errorEl.className = 'tenilla-input-error';
    this._element.appendChild(this._errorEl);
  }

  /**
   * Run validation and update the UI.
   *
   * - Returns `true` or `undefined` if the value is valid.
   * - Returns an error `string` if invalid.
   * - Also updates `.tenilla-invalid` on `_element` and the error message text.
   * - Clears error state at the start of each validation run.
   */
  validate(): boolean | string | undefined {
    const v = this.value;

    // Clear any previous error state at the start of validation
    this._clearError();

    // 1. Custom validator
    if (this.validator !== _noop) {
      const result = this.validator(v, this._smartForm);

      if (typeof result === 'string') {
        this._showError(result);
        return result;
      }
    }

    // 2. Built-in required check
    if (this.required && (v === undefined || v === null || v === '')) {
      const msg = '此项为必填';
      this._showError(msg);
      return msg;
    }

    return true;
  }

  /** Show an error message and mark the component invalid. */
  private _showError(msg: string): void {
    this._element.classList.add('tenilla-invalid');
    this._element.classList.remove('tenilla-valid');
    if (this._errorEl) {
      this._errorEl.textContent = msg;
    }
  }

  /** Clear the error state. */
  private _clearError(): void {
    this._element.classList.remove('tenilla-invalid');
    this._element.classList.add('tenilla-valid');
    if (this._errorEl) {
      this._errorEl.textContent = '';
    }
  }

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
