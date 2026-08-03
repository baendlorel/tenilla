import { _noop, div } from '@tenilla/core';
import { label, textarea } from '../common.js';
import './TextArea.css';

export interface TextAreaOptions {
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
 * A thin wrapper around a native `<textarea>`.
 * The value lives in the DOM; assigning `value` only re-renders
 * and never fires `onChange`.
 */
export class TextArea {
  /** @internal */
  private readonly _element: HTMLDivElement;
  /** @internal */
  private readonly _textarea: HTMLTextAreaElement;
  /** @internal */
  private _onChange: (value: string) => void;

  constructor(options: TextAreaOptions = {}) {
    this._onChange = options.onChange ?? _noop;

    this._element = div(`tenilla-textarea ${options.customClass ?? ''}`).child(
      options.label !== undefined ? label('tenilla-textarea-label', options.label) : '',
      (this._textarea = textarea('tenilla-textarea-native')
        .attrs({ value: options.value, disabled: options.disabled === true })
        .on('input', () => this._onChange(this._textarea.value))),
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
    this._onChange = null;
  }
}
