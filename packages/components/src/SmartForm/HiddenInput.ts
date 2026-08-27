import { TenillaInput } from '@tenilla/core';

export class HiddenInput<T> extends TenillaInput<T> {
  disabled: boolean = false;
  readonly: boolean = false;
  value: T;

  constructor(args: { name: string; value: T }) {
    super(args);
    this._element = null as any;
    this.name = args.name;
    this.value = args.value;
  }

  get required() {
    return false;
  }

  remove() {
    return;
  }
}
