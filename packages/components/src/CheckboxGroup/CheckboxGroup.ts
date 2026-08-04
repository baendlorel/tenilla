import { _noop, div, OnChange, TenillaInput } from '@tenilla/core';
import { input, label, nodenull } from '../common.js';
import './CheckboxGroup.css';

export interface CheckboxOption<T = any> {
  label: string;
  value: T;
  disabled?: boolean;
}

export interface CheckboxGroupArgs<T = any> {
  name?: string;
  options: readonly CheckboxOption<T>[];
  /** Initially checked values. */
  value?: T[];
  /** Group label rendered above the items. Omit to skip it. */
  label?: string;
  disabled?: boolean;
  /** Fires with the full checked-values array whenever a checkbox toggles. */
  onChange?: OnChange<T[]>;
  /** Extra class names appended to the wrapper. */
  customClass?: string;
}

export class CheckboxGroup<T = any> extends TenillaInput {
  /** @internal */
  protected _element: HTMLDivElement;

  name: string;

  /** @internal */
  protected onChange: OnChange<T[]>;

  private _value: Set<T>;

  private _items: Map<T, HTMLInputElement> = new Map();

  /** @internal */
  private _list: HTMLDivElement;

  /** @internal */
  private _disabled: boolean;

  constructor(args: CheckboxGroupArgs<T>) {
    super();

    this.name = args.name ?? '';
    this.onChange = args.onChange ?? _noop;
    this._value = args.value ? new Set(args.value) : new Set();
    this._disabled = args.disabled === true;

    this._element = div(`tenilla-checkbox-group ${args.customClass ?? ''}`).child(
      args.label ? div('tenilla-checkbox-group-label', args.label) : nodenull,
      (this._list = div('tenilla-checkbox-group-items')),
    );

    this.setOptions(args.options);
  }

  get element(): HTMLDivElement {
    return this._element;
  }

  get value(): T[] {
    return [...this._value];
  }

  /**
   * Won't trigger `onChange`.
   */
  set value(v: T[]) {
    this._value.clear(); // release inner values
    this._value = new Set(v);

    this._items.forEach((el, value) => (el.checked = this._value.has(value)));
  }

  /**
   * Every checkbox is disabled if all of them are disabled. Otherwise, the group is considered enabled.
   */
  get disabled(): boolean {
    let disabledCount = 0;
    this._items.forEach((el) => {
      if (el.disabled) {
        disabledCount++;
      }
    });
    return disabledCount === this._items.size;
  }

  /**
   * Set every checkbox to disabled or enabled.
   */
  set disabled(v: boolean) {
    this._items.forEach((el) => (el.disabled = v));
  }

  /**
   * Set a specific checkbox to disabled or enabled via value.
   * @param value matched by **SameValueZero**
   * @param disabled
   */
  setDisabled(value: any, disabled: boolean): this {
    const el = this._items.get(value);
    if (el) {
      el.disabled = disabled;
    } else {
      console.warn(`CheckboxGroup.setDisabled: value "${value}" not found in args.`);
    }
    return this;
  }

  /** Replace the option list. Keeps the current values that still exist. */
  setOptions(options: readonly CheckboxOption<T>[]): this {
    this._list.innerHTML = '';
    this._items.clear();

    for (const { value, disabled, label: text } of options) {
      const inputEl = input('tenilla-checkbox-group-input')
        .attrs({
          type: 'checkbox',
          checked: this._value.has(value),
          disabled: this._disabled || disabled === true,
        })
        .on('change', () => {
          const old = [...this._value];
          if (inputEl.checked) {
            this._value.add(value);
          } else {
            this._value.delete(value);
          }
          this.onChange([...this._value], old);
        });

      this._items.set(value, inputEl);

      this._list.child(
        label('tenilla-checkbox-group-item').child(
          inputEl,
          div('tenilla-checkbox-group-text', text),
        ),
      );
    }

    // Clean up values that no longer exist in the new options
    this.value = [...this._value];
    return this;
  }

  /** Check every enabled option. */
  checkAll(): this {
    const oldValue = [...this._value];
    this._items.forEach((el, value) => {
      if (!el.disabled) {
        el.checked = true;
        this._value.add(value);
      }
    });
    this.onChange([...this._value], oldValue);
    return this;
  }

  /** Uncheck everything. */
  clear(): this {
    const oldValue = [...this._value];
    this._items.forEach((el) => (el.checked = false));
    this._value.clear();
    this.onChange([], oldValue);
    return this;
  }

  destroy(): void {
    this._element.remove();
    this._items.clear();
    this._value.clear();

    this._element = anynull;
    this._items = anynull;
    this._value = anynull;
    this._list = anynull;
    this._disabled = anynull;
    this.onChange = anynull;
  }
}
