import { _noop, div } from '@tenilla/core';
import { input, label } from '../common.js';
import './StringInput.css';

export interface StringInputOptions {
  value?: string;
  /** Floating label text. Omit to skip the label. */
  label?: string;
  disabled?: boolean;
  /** Fires whenever the user edits the text. */
  onChange?: (value: string) => void;
  /** Extra class names appended to the wrapper. */
  customClass?: string;
}

/**
 * A thin wrapper around a native text `<input>`.
 * The value lives in the DOM; assigning `value` only re-renders
 * and never fires `onChange`.
 */
export class StringInput {
  /** @internal */
  private readonly _element: HTMLDivElement;
  /** @internal */
  private readonly _input: HTMLInputElement;
  /** @internal */
  private _onChange: (value: string) => void;

  constructor(options: StringInputOptions = {}) {
    this._onChange = options.onChange ?? _noop;

    this._element = div(`tenilla-string-input ${options.customClass ?? ''}`).child(
      options.label !== undefined ? label('tenilla-string-input-label', options.label) : '',
      (this._input = input('tenilla-string-input-native')
        .attrs({ value: options.value, disabled: options.disabled === true })
        .on('input', () => this._onChange(this._input.value))),
    );
  }

  get element(): HTMLDivElement {
    return this._element;
  }

  get value(): string {
    return this._input.value;
  }

  set value(v: string) {
    this._input.value = v ?? '';
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
