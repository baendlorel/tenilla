import { _noop, div, OnChange, TenillaInput } from '@tenilla/core';
import { label, textarea } from '../common.js';
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
  /** Extra class names appended to the wrapper. */
  customClass?: string;
}

/**
 * A thin wrapper around a native `<textarea>`.
 * The value lives in the DOM; assigning `value` only re-renders
 * and never fires `onChange`.
 */
export class TextArea extends TenillaInput {
  /** @internal */
  protected readonly _element: HTMLDivElement;
  /** @internal */
  private readonly _textarea: HTMLTextAreaElement;

  name: string;

  /** @internal */
  protected onChange: OnChange<string>;

  constructor(args: TextAreaArgs = {}) {
    super();
    this.name = args.name ?? '';
    this.onChange = args.onChange ?? _noop;

    this._element = div(`tenilla-textarea ${args.customClass ?? ''}`).child(
      args.label !== undefined ? label('tenilla-textarea-label', args.label) : '',
      (this._textarea = textarea('tenilla-textarea-native')
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

  destroy(): void {
    this._element.remove();
    // @ts-ignore
    this._element = null;
    // @ts-ignore
    this._textarea = null;
    // @ts-ignore
    this.onChange = null;
  }
}
