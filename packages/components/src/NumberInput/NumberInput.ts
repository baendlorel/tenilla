import { _noop, div, OnChange, TenillaInput } from '@tenilla/core';
import { input, label } from '../common.js';
import './NumberInput.css';

export interface NumberInputArgs {
  name?: string;
  value?: number;
  /** Floating label text. Omit to skip the label. */
  label?: string;
  disabled?: boolean;
  /** Fires whenever the user edits the number. */
  onChange?: OnChange<number>;
  /** Extra class names appended to the wrapper. */
  customClass?: string;
}

/**
 * A thin wrapper around a native `<input type="number">`.
 * The value lives in the DOM; assigning `value` only re-renders
 * and never fires `onChange`.
 */
export class NumberInput extends TenillaInput {
  /** @internal */
  protected readonly _element: HTMLDivElement;
  /** @internal */
  private readonly _input: HTMLInputElement;

  name: string;

  /** @internal */
  protected onChange: OnChange<number>;

  constructor(args: NumberInputArgs = {}) {
    super();
    this.name = args.name ?? '';
    this.onChange = args.onChange ?? _noop;

    this._element = div(`tenilla-number-input ${args.customClass ?? ''}`).child(
      args.label !== undefined ? label('tenilla-number-input-label', args.label) : '',
      (this._input = input('tenilla-number-input-native')
        .attrs({ type: 'number', value: args.value, disabled: args.disabled === true })
        .on('input', () => {
          const oldValue = this.value;
          this.onChange(this._input.valueAsNumber, oldValue);
        })),
    );
  }

  get element(): HTMLDivElement {
    return this._element;
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

  destroy(): void {
    this._element.remove();
    // @ts-ignore
    this._element = null;
    // @ts-ignore
    this._input = null;
    // @ts-ignore
    this.onChange = null;
  }
}
