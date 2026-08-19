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
  protected _element: HTMLDivElement;
  /** @internal */
  private _input: HTMLInputElement;

  constructor(args: NumberInputArgs = {}) {
    super(args);

    this._element = div(`tenilla-number-input ${args.customClass ?? ''}`).child(
      args.label !== undefined ? label('tenilla-input-label', args.label) : '',
      (this._input = input('tenilla-number-input-native')
        .attrs({ type: 'number', value: args.value, disabled: args.disabled === true })
        .on('input', () => {
          const oldValue = this.value;
          this.onChange(this._input.valueAsNumber, oldValue);
        })),
    );
    this._initErrorEl();
  }

  get value(): number {
    return this._input.valueAsNumber;
  }

  set value(v: number) {
    this._input.valueAsNumber = v;
  }

  get disabled(): boolean {
    return this._input.disabled;
  }

  set disabled(v: boolean) {
    this._input.disabled = v;
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
