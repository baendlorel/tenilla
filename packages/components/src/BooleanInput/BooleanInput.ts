import { _noop, div, h, type OnChange, TenillaInput, type TenillaInputArgs } from '@tenilla/core';
import { input } from '../common.js';
import './BooleanInput.css';

export interface BooleanInputArgs extends TenillaInputArgs<boolean> {}

/**
 * A thin wrapper around a native `<input type="checkbox">`.
 * The value lives in the DOM; assigning `value` only re-renders
 * and never fires `onChange`.
 *
 * The `<label>` wraps the `<input>` for implicit association —
 * clicking the label text toggles the checkbox without `for`/`id`.
 */
export class BooleanInput extends TenillaInput<boolean> {
  protected _element: HTMLDivElement;
  /** @internal */
  private _input: HTMLInputElement;

  constructor(args: BooleanInputArgs = {}) {
    super(args);

    this._input = input()
      .attrs({
        type: 'checkbox',
        checked: args.value,
        disabled: args.disabled === true,
      })
      .on('change', () => this.onChange(this._input.checked, !this._input.checked));

    this._element = div('tenilla-boolean-input-wrapper').child(
      h('label', 'tenilla-boolean-input')
        .class(args.customClass)
        .child(this._input, h('label', 'tenilla-boolean-input-label', args.label)),
    );
    this._initErrorEl();
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

  remove(): void {
    this._element.remove();
    this._element = anynull;
    this._input = anynull;
    this.onChange = anynull;
  }

  setOnChange(handler: OnChange<boolean>) {
    this.onChange = handler;
    return this;
  }
}

export function booleanInput(className: string, child?: any, checked?: boolean) {
  return new BooleanInput({ customClass: className, label: child, value: checked });
}
