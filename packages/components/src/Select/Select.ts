import { _noop, div, OnChange, option, TenillaInput } from '@tenilla/core';
import { label, select } from '../common.js';
import './Select.css';

export interface SelectOption<T = any> {
  label: string;
  value: T;
  disabled?: boolean;
}

export interface SelectArgs<T = any> {
  name?: string;
  options: readonly SelectOption<T>[];
  /** Currently selected value. Falls back to the first enabled option. */
  value?: T;
  /** Floating label text. Omit to skip the label. */
  label?: string;
  disabled?: boolean;
  /** Fires whenever the user picks an option, or `select(v, true)` is called. */
  onChange?: OnChange<T | undefined>;
  /** Extra class names appended to the wrapper. */
  customClass?: string;
}

export class Select<T = any> extends TenillaInput {
  /** @internal */
  protected _element: HTMLDivElement;
  /** @internal */
  private _input: HTMLSelectElement;

  name: string;

  /** @internal */
  protected onChange: OnChange<T | undefined>;

  private _value: T | undefined;

  private _items: Map<T, HTMLOptionElement> = new Map();

  constructor(args: SelectArgs<T>) {
    super();

    this.name = args.name ?? '';
    this.onChange = args.onChange ?? _noop;
    this._value = args.value;

    this._element = div(`tenilla-select ${args.customClass ?? ''}`);
    if (args.label !== undefined) {
      this._element.child(label('tenilla-select-label', args.label));
    }

    this._input = select('tenilla-select-native')
      .attr('disabled', args.disabled === true)
      .on('change', () => {
        const old = this._value;

        // Find the value
        let i = this._input.selectedIndex;
        for (const v of this._items.keys()) {
          if (i === 0) {
            this._value = v;
            break;
          }
          i--;
        }
        this.onChange(this._value, old);
      });

    this._element.child(this._input);
    this.setOptions(args.options);
  }

  get element(): HTMLDivElement {
    return this._element;
  }

  get value(): T | undefined {
    return this._value;
  }

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
    return this._input.disabled;
  }

  set disabled(v: boolean) {
    this._input.disabled = v;
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
    this._input.innerHTML = '';
    this._items.clear();

    this._input.child(
      ...options.map((o) => {
        const el = option(o.value, o.label).attr('disabled', o.disabled === true);
        this._items.set(o.value, el);
        return el;
      }),
    );

    this.value = this._value; // triggers selection
    return this;
  }

  destroy(): void {
    this._element.remove();
    this._element = anynull;

    this._items.clear();
    this._items = anynull;

    this._input = anynull;
    this._value = anynull;
    this.onChange = anynull;
  }
}
