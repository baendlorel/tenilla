import { div } from '@tenilla/core';
import { input, label } from '../h-alias.js';

export interface CheckboxOption<T = any> {
  label: string;
  value: T;
  disabled?: boolean;
}

export interface CheckboxGroupOptions<T = any> {
  options: CheckboxOption<T>[];
  /** Initially checked values. */
  value?: T[];
  /** Group label rendered above the items. Omit to skip it. */
  label?: string;
  disabled?: boolean;
  /** Fires with the full checked-values array whenever a checkbox toggles. */
  onChange?: (value: T[]) => void;
  /** Extra class names appended to the wrapper. */
  customClass?: string;
}

export class CheckboxGroup<T = any> {
  /** @internal */
  private readonly _element: HTMLDivElement;
  /** @internal */
  private readonly _items: Array<{ option: CheckboxOption<T>; input: HTMLInputElement }> = [];
  /** @internal */
  private _onChange: (value: T[]) => void;

  constructor(options: CheckboxGroupOptions<T>) {
    this._onChange = options.onChange ?? (() => {});
    const selected = new Set(options.value ?? []);

    this._element = div(`tenilla-checkbox-group ${options.customClass ?? ''}`);
    if (options.label !== undefined) {
      this._element.child(div('tenilla-checkbox-group-label', options.label));
    }

    const list = div('tenilla-checkbox-group-items');
    for (const opt of options.options ?? []) {
      const inputEl = input('tenilla-checkbox-group-input').attrs({
        type: 'checkbox',
        checked: selected.has(opt.value),
        disabled: options.disabled === true || opt.disabled === true,
      });
      inputEl.on('change', () => this._onChange(this.value));
      this._items.push({ option: opt, input: inputEl });
      // The label wraps the input, so no for/id association is needed.
      list.child(
        label('tenilla-checkbox-group-item').child(
          inputEl,
          div('tenilla-checkbox-group-text', opt.label),
        ),
      );
    }
    this._element.child(list);
  }

  get element(): HTMLDivElement {
    return this._element;
  }

  get value(): T[] {
    return this._items.filter((i) => i.input.checked).map((i) => i.option.value);
  }

  set value(v: T[]) {
    const selected = new Set(v ?? []);
    for (const item of this._items) {
      item.input.checked = selected.has(item.option.value);
    }
  }

  get disabled(): boolean {
    return this._items.every((i) => i.input.disabled);
  }

  set disabled(v: boolean) {
    for (const item of this._items) {
      item.input.disabled = v || item.option.disabled === true;
    }
  }

  /** Check every enabled option. */
  checkAll(): this {
    for (const item of this._items) {
      if (!item.input.disabled) item.input.checked = true;
    }
    this._onChange(this.value);
    return this;
  }

  /** Uncheck everything. */
  clear(): this {
    for (const item of this._items) {
      item.input.checked = false;
    }
    this._onChange(this.value);
    return this;
  }

  destroy(): void {
    this._element.remove();
    // @ts-ignore
    this._element = null;
    // @ts-ignore
    this._items = null;
    // @ts-ignore
    this._onChange = null;
  }
}
