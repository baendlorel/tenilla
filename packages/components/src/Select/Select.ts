import {
  _noop,
  div,
  OnChange,
  option,
  TenillaInput,
  type Validator,
  type TenillaInputArgs,
} from '@tenilla/core';
import { label, nodenull, select as nativeSelect } from '../common.js';
import './Select.css';

export interface SelectOption<T = any> {
  label: string;
  value: T;
  disabled?: boolean;
}

export interface SelectArgs<T = any> extends TenillaInputArgs<T | undefined> {
  options: readonly SelectOption<T>[];
}

export class Select<T = any> extends TenillaInput {
  /** @internal */
  private _select: HTMLSelectElement;

  /** @internal */
  private _value: T | undefined;

  /** @internal */
  private _items: Map<T, HTMLOptionElement> = new Map();

  /** @internal */
  private _readonly: boolean = false;

  constructor(args: SelectArgs<T>) {
    super(args);
    this._value = args.value;
    this._readonly = args.readonly === true;

    this._element = div(`tenilla-select ${args.customClass ?? ''}`).child(
      args.label ? label('tenilla-input-label', args.label) : nodenull,
      (this._select = nativeSelect('tenilla-select-native').on('change', () => {
        if (this._readonly) {
          this.value = this._value; // revert to original value
          return;
        }
        const old = this._value;

        // Find the value
        let i = this._select.selectedIndex;
        for (const v of this._items.keys()) {
          if (i === 0) {
            this._value = v;
            break;
          }
          i--;
        }
        this.onChange(this._value, old);
      })),
    );

    this._select.disabled = args.disabled === true;
    this.setOptions(args.options);
    this._initErrorEl();
  }

  get value(): T | undefined {
    return this._value;
  }

  /**
   * Won't trigger `onChange`.
   */
  set value(v: T | undefined) {
    this._value = v;
    this._items.forEach((el) => (el.selected = false));
    if (v !== undefined) {
      const el = this._items.get(v as T);
      if (el) {
        el.selected = true;
      } else {
        console.warn(`Select.value: value "${v}" not found in options.`);
      }
    }
  }

  get disabled(): boolean {
    return this._select.disabled;
  }

  set disabled(v: boolean) {
    this._select.disabled = v;
  }

  get readonly(): boolean {
    return this._readonly;
  }

  set readonly(v: boolean) {
    this._readonly = v;
  }

  /**
   * Set a specific option to disabled or enabled via value.
   * @param value matched by SameValueZero
   * @param disabled
   */
  setDisabled(value: any, disabled: boolean): this {
    const el = this._items.get(value);
    if (el) {
      el.disabled = disabled;
    } else {
      console.warn(`Select.setDisabled: value "${value}" not found in options.`);
    }
    return this;
  }

  /** Replace the option list. Keeps the current value if it still exists. */
  setOptions(options: readonly SelectOption<T>[]): this {
    this._select.innerHTML = '';
    this._items.clear();

    this._select.child(
      ...options.map((o) => {
        const el = option(o.value, o.label).attr('disabled', o.disabled === true);
        this._items.set(o.value, el);
        return el;
      }),
    );

    this.value = this._value; // triggers selection
    return this;
  }

  remove(): void {
    this._element.remove();
    this._element = anynull;

    this._items.clear();
    this._items = anynull;

    this._select = anynull;
    this._value = anynull;
    this.onChange = anynull;
  }
}

/**
 * Quick-create a Select and return its root element.
 *
 * @param className   Extra class appended to `tenilla-select`.
 * @param label       Floating label text.
 * @param options     Option list (required).
 * @param value       Initially selected value.
 */
export function select(className?: string, options?: readonly SelectOption[], value?: any) {
  return new Select({ customClass: className, options: options ?? [], value });
}
