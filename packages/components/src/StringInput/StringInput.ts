import { _noop, div, OnChange, TenillaInput } from '@tenilla/core';
import { input, label } from '../common.js';
import './StringInput.css';

export interface StringInputArgs {
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
  protected _element: HTMLDivElement;
  /** @internal */
  private _input: HTMLInputElement;

  name: string;

  protected onChange: OnChange<string>;

  constructor(args: StringInputArgs = {}) {
    super();
    this.name = args.name ?? '';
    this.onChange = args.onChange ?? _noop;

    this._element = div(`tenilla-string-input ${args.customClass ?? ''}`).child(
      args.label !== undefined ? label('tenilla-input-label', args.label) : '',
      (this._input = input('tenilla-string-input-native')
        .attrs({
          value: args.value,
          placeholder: args.placeholder,
          disabled: args.disabled === true,
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
