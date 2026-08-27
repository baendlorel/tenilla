import { TenillaInput, type TenillaInputArgs } from '@tenilla/core';

export class HiddenInput<T> extends TenillaInput<T> {
  disabled: boolean = false;
  readonly: boolean = false;
  private _value: T;

  constructor(args: TenillaInputArgs<T> = {}) {
    super(args);
    if ('value' in args === false) {
      throw new Error('HiddenInput requires a value to be provided.');
    }
    this._value = args.value as any;
  }

  get value(): T {
    return this._value;
  }
  set value(v: T) {
    const old = this._value;
    this._value = v;
    this.onChange(v, old);
  }
  get required() {
    return false;
  }

  remove() {
    return;
  }
}
