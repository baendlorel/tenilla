import { _noop, div } from '@tenilla/core';
import { input, label, TenillaInput } from '../common.js';
import './BooleanInput.css';

export interface BooleanInputOptions {
  value?: boolean;
  /** Label text rendered next to the checkbox. */
  label?: string;
  disabled?: boolean;
  /** Fires whenever the user toggles the checkbox. */
  onChange?: (value: boolean) => void;
  /** Extra class names appended to the wrapper. */
  customClass?: string;
}

/**
 * A thin wrapper around a native `<input type="checkbox">`.
 * The value lives in the DOM; assigning `value` only re-renders
 * and never fires `onChange`.
 */
export class BooleanInput extends TenillaInput {
  /** @internal */
  private static index: number = 1;

  /** @internal */
  protected readonly _element: HTMLDivElement;
  /** @internal */
  private readonly _input: HTMLInputElement;
  /** @internal */
  private _onChange: (value: boolean) => void;

  constructor(options: BooleanInputOptions = {}) {
    super();
    this._onChange = options.onChange ?? _noop;
    const id = `tenilla-bi-${BooleanInput.index++}`;

    this._element = div(`tenilla-boolean-input ${options.customClass ?? ''}`).child(
      (this._input = input()
        .attrs({
          type: 'checkbox',
          id,
          checked: options.value,
          disabled: options.disabled === true,
        })
        .on('change', () => this._onChange(this._input.checked))),
      options.label !== undefined
        ? label('tenilla-boolean-input-label', options.label).attr('for', id)
        : '',
    );
  }

  get element(): HTMLDivElement {
    return this._element;
  }

  get value(): boolean {
    return this._input.checked;
  }

  set value(v: boolean) {
    this._input.checked = v === true;
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
