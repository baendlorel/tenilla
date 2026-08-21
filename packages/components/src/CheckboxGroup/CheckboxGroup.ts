import { _noop, div, TenillaInput, type TenillaInputArgs } from '@tenilla/core';
import { input, label, nodenull } from '../common.js';
import './CheckboxGroup.css';

export interface CheckboxOption<T = any> {
  label: string;
  value: T;
  disabled?: boolean;
}

export interface CheckboxGroupArgs<T = any> extends TenillaInputArgs<T[]> {
  options: readonly CheckboxOption<T>[];
}

export class CheckboxGroup<T = any> extends TenillaInput {
  /** @internal */
  private _value: Set<T>;

  /** @internal */
  private _items: Map<T, HTMLInputElement> = new Map();

  /** @internal */
  private _list: HTMLDivElement;

  /** @internal */
  private _disabled: boolean;

  /** @internal */
  private _readonly: boolean = false;

  constructor(args: CheckboxGroupArgs<T>) {
    super(args);
    this._value = args.value ? new Set(args.value) : new Set();
    this._disabled = args.disabled === true;
    this._readonly = args.readonly === true;

    this._element = div(`tenilla-checkbox-group ${args.customClass ?? ''}`)
      .attr('disabled', this._disabled)
      .child(
        args.label ? div('tenilla-checkbox-group-label', args.label) : nodenull,
        (this._list = div('tenilla-checkbox-group-items')),
      );

    this.setOptions(args.options);
    this._initErrorEl();
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
   * Whether the group is disabled. When disabled, user interactions are
   * reverted to the cached value and `onChange` is not fired.
   */
  get disabled(): boolean {
    return this._disabled;
  }

  /**
   * Disable or enable the entire group. When disabled, the wrapper gets
   * a `[disabled]` attribute so CSS can dim the whole group.
   */
  set disabled(v: boolean) {
    this._disabled = v;
    if (v) {
      this._element.setAttribute('disabled', '');
    } else {
      this._element.removeAttribute('disabled');
    }
  }

  get readonly(): boolean {
    return this._readonly;
  }

  set readonly(v: boolean) {
    this._readonly = v;
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
          disabled: disabled === true,
        })
        .on('change', () => {
          if (this._disabled || this._readonly) {
            inputEl.checked = this._value.has(value);
            return;
          }
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
    if (this._disabled || this._readonly) return this;
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
    if (this._disabled || this._readonly) return this;
    const oldValue = [...this._value];
    this._items.forEach((el) => (el.checked = false));
    this._value.clear();
    this.onChange([], oldValue);
    return this;
  }

  remove(): void {
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
