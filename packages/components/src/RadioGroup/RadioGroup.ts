import { div, TenillaInput } from '@tenilla/core';
import { input, label } from '../common.js';
import './RadioGroup.css';

export interface RadioOption<T = any> {
  label: string;
  value: T;
  disabled?: boolean;
}

export interface RadioGroupOptions<T = any> {
  options: readonly RadioOption<T>[];
  /** Initially selected value. */
  value?: T;
  /** Group label rendered above the items. Omit to skip it. */
  label?: string;
  /**
   * Native `name` shared by the radio inputs, so they behave as one group.
   * Auto-generated when omitted.
   */
  name?: string;
  disabled?: boolean;
  /** Fires with the newly selected value whenever the user picks an option. */
  onChange?: (value: T) => void;
  /** Extra class names appended to the wrapper. */
  customClass?: string;
}

export class RadioGroup<T = any> extends TenillaInput {
  /** @internal */
  private static index: number = 1;

  /** @internal */
  protected readonly _element: HTMLDivElement;
  /** @internal */
  private readonly _items: Array<{ option: RadioOption<T>; input: HTMLInputElement }> = [];
  /** @internal */
  private _value: T | undefined;

  protected onChange: (value: T) => void;

  constructor(options: RadioGroupOptions<T>) {
    super();
    this.onChange = options.onChange ?? (() => {});
    this._value = options.value;
    const groupName = options.name ?? `tenilla-rg-${RadioGroup.index++}`;

    this._element = div(`tenilla-radio-group ${options.customClass ?? ''}`);
    if (options.label !== undefined) {
      this._element.child(div('tenilla-radio-group-label', options.label));
    }

    const list = div('tenilla-radio-group-items');
    for (const opt of options.options ?? []) {
      const inputEl = input('tenilla-radio-group-input').attrs({
        type: 'radio',
        name: groupName,
        checked: opt.value === this._value,
        disabled: options.disabled === true || opt.disabled === true,
      });
      inputEl.on('change', () => {
        if (inputEl.checked) {
          this._value = opt.value;
          this.onChange(opt.value);
        }
      });
      this._items.push({ option: opt, input: inputEl });
      // The label wraps the input, so no for/id association is needed.
      list.child(
        label('tenilla-radio-group-item').child(
          inputEl,
          div('tenilla-radio-group-text', opt.label),
        ),
      );
    }
    this._element.child(list);
  }

  get element(): HTMLDivElement {
    return this._element;
  }

  get value(): T | undefined {
    return this._value;
  }

  set value(v: T | undefined) {
    this._value = v;
    for (const item of this._items) {
      item.input.checked = item.option.value === v;
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

  /** Set value programmatically. Pass `fire = true` to also trigger onChange. */
  select(v: T, fire: boolean = false): this {
    this.value = v;
    if (fire) this.onChange(v);
    return this;
  }

  destroy(): void {
    this._element.remove();
    // @ts-ignore
    this._element = null;
    // @ts-ignore
    this._items = null;
    // @ts-ignore
    this.onChange = null;
  }
}
