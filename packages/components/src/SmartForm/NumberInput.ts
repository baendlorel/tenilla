import { _noop, div } from '@tenilla/core';
import { input, label } from '../h-alias.js';

export interface NumberInputOptions {
  value?: number;
  /** Floating label text. Omit to skip the label. */
  label?: string;
  disabled?: boolean;
  /** Fires whenever the user edits the number. */
  onChange?: (value: number) => void;
  /** Extra class names appended to the wrapper. */
  customClass?: string;
}

/**
 * A thin wrapper around a native `<input type="number">`.
 * The value lives in the DOM; assigning `value` only re-renders
 * and never fires `onChange`.
 */
export class NumberInput {
  /** @internal */
  private readonly _element: HTMLDivElement;
  /** @internal */
  private readonly _input: HTMLInputElement;
  /** @internal */
  private _onChange: (value: number) => void;

  constructor(options: NumberInputOptions = {}) {
    this._onChange = options.onChange ?? _noop;

    this._element = div(`tenilla-number-input ${options.customClass ?? ''}`).child(
      options.label !== undefined ? label('tenilla-number-input-label', options.label) : '',
      (this._input = input('tenilla-number-input-native')
        .attrs({ type: 'number', value: options.value, disabled: options.disabled === true })
        .on('input', () => this._onChange(this._input.valueAsNumber))),
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
    this._onChange = null;
  }
}
