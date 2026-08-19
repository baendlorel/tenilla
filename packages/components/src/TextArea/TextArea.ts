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
  private _textarea: HTMLTextAreaElement;

  constructor(args: TextAreaArgs = {}) {
    super(args);

    this._element = div(`tenilla-textarea ${args.customClass ?? ''}`).child(
      args.label !== undefined ? label('tenilla-input-label', args.label) : '',
      (this._textarea = h('textarea', 'tenilla-textarea-native')
        .attrs({
          value: args.value,
          placeholder: args.placeholder,
          disabled: args.disabled === true,
        })
        .on('input', () => {
          const oldValue = this.value;
          this.onChange(this._textarea.value, oldValue);
        })),
    );
    this._initErrorEl();
  }

  get value(): string {
    return this._textarea.value;
  }

  set value(v: string) {
    this._textarea.value = v ?? '';
  }

  get disabled(): boolean {
    return this._textarea.disabled;
  }

  set disabled(v: boolean) {
    this._textarea.disabled = v;
  }

  remove(): void {
    this._element.remove();
    this._element = anynull;
    this._textarea = anynull;
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
