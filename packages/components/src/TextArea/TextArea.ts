import { _noop, div, h, TenillaInput, type TenillaInputArgs } from '@tenilla/core';
import { label } from '../common.js';
import './TextArea.css';

export interface TextAreaArgs extends TenillaInputArgs<string> {
  /** Placeholder text for the textarea */
  placeholder?: string;
}

/**
 * A thin wrapper around a native `<textarea>`.
 * The value lives in the DOM; assigning `value` only re-renders
 * and never fires `onChange`.
 */
export class TextArea extends TenillaInput {
  protected _element: HTMLDivElement;
  /** @internal */
  private _input: HTMLTextAreaElement;

  constructor(args: TextAreaArgs = {}) {
    super(args);

    this._element = div(`tenilla-textarea ${args.customClass ?? ''}`).child(
      args.label !== undefined ? label('tenilla-input-label', args.label) : '',
      (this._input = h('textarea', 'tenilla-textarea-native')
        .attrs({
          value: args.value,
          placeholder: args.placeholder,
        })
        .on('input', () => {
          const oldValue = this.value;
          this.onChange(this._input.value, oldValue);
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
 * Quick-create a TextArea and return its root element.
 *
 * @param className   Extra class appended to `tenilla-textarea`.
 * @param label       Floating label text.
 * @param placeholder Placeholder text.
 * @param value       Initial value.
 */
export function textarea(className?: string, value?: string, placeholder?: string) {
  return new TextArea({ customClass: className, value, placeholder });
}
