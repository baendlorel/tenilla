import { _noop, div, OnChange, TenillaInput } from '@tenilla/core';
import { input, label } from '../common.js';
import './BooleanInput.css';

export interface BooleanInputArgs {
  name?: string;
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
  protected _element: HTMLDivElement;
  /** @internal */
  private _input: HTMLInputElement;

  name: string;

  /** @internal */
  protected onChange: OnChange<boolean>;

  constructor(args: BooleanInputArgs = {}) {
    super();
    this.name = args.name ?? '';
    this.onChange = args.onChange ?? _noop;
    const id = `tenilla-bi-${BooleanInput.index++}`;

    this._element = div(`tenilla-boolean-input ${args.customClass ?? ''}`).child(
      (this._input = input()
        .attrs({
          type: 'checkbox',
          id,
          checked: args.value,
          disabled: args.disabled === true,
        })
        .on('change', () => this.onChange(this._input.checked, !this._input.checked))),
      args.label !== undefined
        ? label('tenilla-boolean-input-label', args.label).attr('for', id)
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
    this._element = anynull;
    this._input = anynull;
    this.onChange = anynull;
  }
}
