import { _noop, div, OnChange, TenillaInput } from '@tenilla/core';
import { input, label, nodenull } from '../common.js';
import './RadioGroup.css';

export interface RadioOption<T = any> {
  label: string;
  value: T;
  disabled?: boolean;
}

export interface RadioGroupArgs<T = any> {
  name?: string;
  options: readonly RadioOption<T>[];
  /** Initially selected value. */
  value?: T;
  /** Group label rendered above the items. Omit to skip it. */
  label?: string;
  disabled?: boolean;
  /** Fires with the newly selected value whenever the user picks an option. */
  onChange?: OnChange<T>;
  /** Extra class names appended to the wrapper. */
  customClass?: string;
}

export class RadioGroup<T = any> extends TenillaInput {
  name: string;

  /** @internal */
  protected _element: HTMLDivElement;

  /** @internal */
  protected onChange: OnChange<T>;

  /** @internal */
  private _list: HTMLDivElement;

  private _value: T | undefined;

  private _items: Map<T, HTMLInputElement> = new Map();

  /** @internal */
  private _disabled: boolean;

  constructor(args: RadioGroupArgs<T>) {
    super();

    this.name = args.name ?? '';
    this.onChange = args.onChange ?? _noop;
    this._value = args.value;
    this._disabled = args.disabled === true;

    this._element = div(`tenilla-radio-group ${args.customClass ?? ''}`).child(
      args.label ? label('tenilla-radio-group-label', args.label) : nodenull,
      (this._list = div('tenilla-radio-group-items')),
    );

    this.setOptions(args.options);
  }

  get element(): HTMLDivElement {
    return this._element;
  }

  get value(): T | undefined {
    return this._value;
  }

  /**
   * Won't trigger `onChange`.
   */
  set value(v: T | undefined) {
    this._value = v;
    this._items.forEach((el, value) => (el.checked = value === v));
  }

  /**
   * Every radio is disabled if all of them are disabled. Otherwise, the group is considered enabled.
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
   * Set every radio to disabled or enabled.
   */
  set disabled(v: boolean) {
    this._items.forEach((el) => (el.disabled = v));
  }

  /**
   * Set a specific radio to disabled or enabled via value.
   * @param value matched by **SameValueZero**
   * @param disabled
   */
  setDisabled(value: any, disabled: boolean): this {
    const el = this._items.get(value);
    if (el) {
      el.disabled = disabled;
    } else {
      console.warn(`RadioGroup.setDisabled: value "${value}" not found in args.`);
    }
    return this;
  }

  /** Replace the option list. Keeps the current value if it still exists. */
  setOptions(options: readonly RadioOption<T>[]): this {
    this._list.innerHTML = '';
    this._items.clear();

    for (const { value, disabled, label: text } of options) {
      const inputEl = input('tenilla-radio-group-input')
        .attrs({
          type: 'radio',
          checked: value === this._value,
          disabled: this._disabled || disabled === true,
        })
        .on('change', () => {
          if (inputEl.checked) {
            const old = this._value;
            this._value = value;
            this.onChange(value, old as T);
          }
        });

      this._items.set(value, inputEl);
      this._list.child(
        label('tenilla-radio-group-item').child(inputEl, div('tenilla-radio-group-text', text)),
      );
    }

    // Clean up value if it no longer exists in the new options
    this.value = this._value;
    return this;
  }

  destroy(): void {
    this._element.remove();
    this._items.clear();
    this._value = undefined;

    this._element = anynull;
    this._items = anynull;
    this._value = anynull;
    this._list = anynull;
    this._disabled = anynull;
    this.onChange = anynull;
  }
}
