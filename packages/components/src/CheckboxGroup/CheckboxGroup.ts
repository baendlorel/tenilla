import { _noop, div, OnChange, TenillaInput } from '@tenilla/core';
import { input, label } from '../common.js';
import './CheckboxGroup.css';

export interface CheckboxOption<T = any> {
  label: string;
  value: T;
  disabled?: boolean;
}

export interface CheckboxGroupOptions<T = any> {
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
  protected readonly _element: HTMLDivElement;

  name: string;

  /** @internal */
  protected onChange: OnChange<T[]>;

  private _value: Set<T>;

  private readonly _el2option: Map<HTMLInputElement, CheckboxOption<T>> = new Map();

  constructor(options: CheckboxGroupOptions<T>) {
    super();

    this.name = options.name ?? '';
    this.onChange = options.onChange ?? _noop;
    this._value = options.value ? new Set(options.value) : new Set();

    this._element = div(`tenilla-checkbox-group ${options.customClass ?? ''}`);
    if (options.label !== undefined) {
      this._element.child(div('tenilla-checkbox-group-label', options.label));
    }

    const list = div('tenilla-checkbox-group-items');
    for (const o of options.options ?? []) {
      const inputEl = input('tenilla-checkbox-group-input')
        .attrs({
          type: 'checkbox',
          checked: this._value.has(o.value),
          disabled: options.disabled === true || o.disabled === true,
        })
        .on('change', () => {
          const old = [...this._value];
          if (inputEl.checked) {
            this._value.add(o.value);
          } else {
            this._value.delete(o.value);
          }
          this.onChange([...this._value], old);
        });

      this._el2option.set(inputEl, o);

      list.child(
        label('tenilla-checkbox-group-item').child(
          inputEl,
          div('tenilla-checkbox-group-text', o.label),
        ),
      );
    }

    this._element.child(list);
  }

  get element(): HTMLDivElement {
    return this._element;
  }

  get value(): T[] {
    return [...this._value];
  }

  set value(v: T[]) {
    this._value = new Set(v ?? []);
    this._el2option.forEach((o, e) => (e.checked = this._value.has(o.value)));
  }

  /**
   * Every checkbox is disabled if all of them are disabled. Otherwise, the group is considered enabled.
   */
  get disabled(): boolean {
    let disabledCount = 0;
    this._el2option.forEach((_, inputEl) => {
      if (inputEl.disabled) {
        disabledCount++;
      }
    });
    return disabledCount === this._el2option.size;
  }

  /**
   * Set every checkbox to disabled or enabled.
   */
  set disabled(v: boolean) {
    this._el2option.forEach((_, inputEl) => (inputEl.disabled = v));
  }

  /** Check every enabled option. */
  checkAll(): this {
    const oldValue = [...this._value];
    this._el2option.forEach((o, inputEl) => {
      if (!inputEl.disabled) {
        inputEl.checked = true;
        this._value.add(o.value);
      }
    });
    this.onChange([...this._value], oldValue);
    return this;
  }

  /** Uncheck everything. */
  clear(): this {
    const oldValue = [...this._value];
    this._el2option.forEach((o, inputEl) => {
      inputEl.checked = false;
    });
    this._value.clear();
    this.onChange([], oldValue);
    return this;
  }

  destroy(): void {
    this._element.remove();
    // @ts-ignore
    this._element = null;
    // @ts-ignore
    this._el2option = null;
    // @ts-ignore
    this._value = null;
    // @ts-ignore
    this.onChange = null;
  }
}
