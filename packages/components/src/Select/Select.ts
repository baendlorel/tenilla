import { div, option } from '@tenilla/core';
import { label, select } from '../common.js';
import './Select.css';

export interface SelectOption<T = any> {
  label: string;
  value: T;
  disabled?: boolean;
}

export interface SelectOptions<T = any> {
  options: readonly SelectOption<T>[];
  /** Currently selected value. Falls back to the first enabled option. */
  value?: T;
  /** Floating label text. Omit to skip the label. */
  label?: string;
  disabled?: boolean;
  /** Fires whenever the user picks an option, or `select(v, true)` is called. */
  onChange?: (value: T) => void;
  /** Extra class names appended to the wrapper. */
  customClass?: string;
}

/**
 * A thin wrapper around the native `<select>` element.
 * Value is managed externally: assigning `value` only re-renders the DOM
 * and never fires `onChange` — use `select(v, true)` for that.
 */
export class Select<T = any> {
  /** @internal */
  private readonly _element: HTMLDivElement;
  /** @internal */
  private readonly _select: HTMLSelectElement;
  /** @internal */
  private _options: readonly SelectOption<T>[];
  /** @internal */
  private _value: T | undefined;
  /** @internal */
  private _onChange: (value: T) => void;

  constructor(options: SelectOptions<T>) {
    this._options = options.options ?? [];
    this._onChange = options.onChange ?? (() => {});
    this._value = options.value;

    this._element = div(`tenilla-select ${options.customClass ?? ''}`).child(
      options.label !== undefined ? label('tenilla-select-label', options.label) : '',
      (this._select = select('tenilla-select-native')
        .attrs({ disabled: options.disabled === true })
        .on('change', () => {
          const opt = this._options[this._select.selectedIndex];
          if (opt !== undefined) {
            this._value = opt.value;
            this._onChange(opt.value);
          }
        })),
    );

    this._render();
  }

  get element(): HTMLDivElement {
    return this._element;
  }

  get value(): T | undefined {
    return this._value;
  }

  set value(v: T | undefined) {
    this._value = v;
    this._syncSelection();
  }

  get disabled(): boolean {
    return this._select.disabled;
  }

  set disabled(v: boolean) {
    this._select.disabled = v;
  }

  /** Set value programmatically. Pass `fire = true` to also trigger onChange. */
  select(v: T, fire: boolean = false): this {
    this._value = v;
    this._syncSelection();
    if (fire) this._onChange(v);
    return this;
  }

  /** Replace the option list. Keeps the current value if it still exists. */
  setOptions(options: readonly SelectOption<T>[]): this {
    this._options = options;
    this._render();
    return this;
  }

  /** @internal */
  private _render(): void {
    this._select.innerHTML = '';
    if (this._value === undefined) {
      const first = this._options.find((o) => !o.disabled);
      if (first) this._value = first.value;
    }
    for (const opt of this._options) {
      const el = option(String(opt.value), opt.label, opt.value === this._value);
      el.disabled = opt.disabled === true;
      this._select.append(el);
    }
  }

  /** @internal */
  private _syncSelection(): void {
    const idx = this._options.findIndex((o) => o.value === this._value);
    this._select.selectedIndex = idx; // -1 clears the selection
  }

  destroy(): void {
    this._element.remove();
    // @ts-ignore
    this._element = null;
    // @ts-ignore
    this._select = null;
    // @ts-ignore
    this._options = null;
    // @ts-ignore
    this._onChange = null;
  }
}
