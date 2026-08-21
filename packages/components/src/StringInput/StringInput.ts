import { _noop, div, TenillaInput, type TenillaInputArgs } from '@tenilla/core';
import { input, label } from '../common.js';
import './StringInput.css';

export interface StringInputArgs extends TenillaInputArgs<string> {
  /** Placeholder text for the input */
  placeholder?: string;
}

/**
 * A thin wrapper around a native text `<input>`.
 * The value lives in the DOM; assigning `value` only re-renders
 * and never fires `onChange`.
 */
export class StringInput extends TenillaInput<string> {
  /** @internal */
  private _input: HTMLInputElement;

  private _value: string;

  constructor(args: StringInputArgs = {}) {
    super(args);
    this._value = args.value ?? '';

    this._element = div(`tenilla-string-input ${args.customClass ?? ''}`).child(
      args.label !== undefined ? label('tenilla-input-label', args.label) : '',
      (this._input = input('tenilla-string-input-native')
        .attrs({
          value: this._value,
          placeholder: args.placeholder,
        })
        .on('input', () => {
          const oldValue = this._value;
          this._value = this._input.value;
          this.onChange(this._value, oldValue);
        })),
    );
    this._input.disabled = args.disabled === true;
    this._input.readOnly = args.readonly === true;

    this._initErrorEl();
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
 * Quick-create a StringInput and return its root element.
 *
 * @param className   Extra class appended to `tenilla-string-input`.
 * @param label       Floating label text.
 * @param placeholder Input placeholder text.
 * @param value       Initial value.
 */
export function stringInput(className?: string, value?: string, placeholder?: string) {
  return new StringInput({
    customClass: className,
    value,
    placeholder,
  });
}
