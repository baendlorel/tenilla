import { _noop, div, TenillaInput, type TenillaInputArgs } from '@tenilla/core';
import { input, label } from '../common.js';
import './NumberInput.css';

export interface NumberInputArgs extends TenillaInputArgs<number> {}

/**
 * A thin wrapper around a native `<input type="number">`.
 * The value lives in the DOM; assigning `value` only re-renders
 * and never fires `onChange`.
 */
export class NumberInput extends TenillaInput {
  /** @internal */
  private _input: HTMLInputElement;

  /** @internal */
  private _value: number;

  constructor(args: NumberInputArgs = {}) {
    super(args);

    this._value = args.value ?? 0;
    this._element = div(`tenilla-number-input ${args.customClass ?? ''}`).child(
      args.label !== undefined ? label('tenilla-input-label', args.label) : '',
      (this._input = input('tenilla-number-input-native')
        .attrs({
          type: 'number',
          valueAsNumber: this._value,
          disabled: args.disabled === true,
          readonly: args.readonly === true,
        })
        .on('input', () => {
          const oldValue = this._value;
          this._value = this._input.valueAsNumber;
          this.onChange(this._value, oldValue);
        })),
    );
    this._initErrorEl();
  }

  get value(): number {
    return this._value;
  }

  set value(v: number) {
    this._value = v;
    this._input.valueAsNumber = v;
  }

  get disabled(): boolean {
    return this._input.disabled;
  }

  set disabled(v: boolean) {
    this._input.disabled = v;
  }

  get readonly(): boolean {
    return this._input.readOnly;
  }

  set readonly(v: boolean) {
    this._input.readOnly = v;
  }

  remove(): void {
    this._element.remove();
    this._element = anynull;
    this._input = anynull;
    this.onChange = anynull;
  }
}

/**
 * Quick-create a NumberInput and return its root element.
 *
 * @param className   Extra class appended to `tenilla-number-input`.
 * @param label       Floating label text.
 * @param value       Initial numeric value.
 */
export function numberInput(className?: string, value?: number) {
  return new NumberInput({ customClass: className, value });
}
