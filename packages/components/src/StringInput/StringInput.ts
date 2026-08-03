import { _noop, div, OnChange, TenillaInput } from '@tenilla/core';
import { input, label } from '../common.js';
import './StringInput.css';

export interface StringInputOptions {
  name?: string;
  value?: string;
  /** Floating label text. Omit to skip the label. */
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  /** Fires whenever the user edits the text. */
  onChange?: OnChange<string>;
  /** Extra class names appended to the wrapper. */
  customClass?: string;
}

/**
 * A thin wrapper around a native text `<input>`.
 * The value lives in the DOM; assigning `value` only re-renders
 * and never fires `onChange`.
 */
export class StringInput extends TenillaInput {
  /** @internal */
  protected readonly _element: HTMLDivElement;
  /** @internal */
  private readonly _input: HTMLInputElement;

  name: string;

  /** @internal */
  protected onChange: OnChange<string>;

  constructor(options: StringInputOptions = {}) {
    super();
    this.name = options.name ?? '';
    this.onChange = options.onChange ?? _noop;

    this._element = div(`tenilla-string-input ${options.customClass ?? ''}`).child(
      options.label !== undefined ? label('tenilla-string-input-label', options.label) : '',
      (this._input = input('tenilla-string-input-native')
        .attrs({
          value: options.value,
          placeholder: options.placeholder,
          disabled: options.disabled === true,
        })
        .on('input', () => {
          const oldValue = this.value;
          this.onChange(this._input.value, oldValue);
        })),
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
    this.onChange = null;
  }
}
