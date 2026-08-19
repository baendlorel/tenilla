import { _noop, div, h, type OnChange, type Validator, TenillaInput } from '@tenilla/core';
import { label } from '../common.js';
import './TextArea.css';

export interface TextAreaArgs {
  name?: string;
  value?: string;
  /** Floating label text. Omit to skip the label. */
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  /** Fires whenever the user edits the text. */
  onChange?: OnChange<string>;
  validator?: Validator<string>;
  /** Extra class names appended to the wrapper. */
  customClass?: string;
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

  name: string;

  protected onChange: OnChange<string>;
  protected validator: Validator<string>;

  constructor(args: TextAreaArgs = {}) {
    super();
    this.name = args.name ?? '';
    this.onChange = args.onChange ?? _noop;
    this.validator = args.validator ?? _noop;

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

  get element(): HTMLDivElement {
    return this._element;
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
export function textarea(
  className?: string,
  value?: string,
  placeholder?: string,
) {
  return new TextArea({ customClass: className, value, placeholder });
}
