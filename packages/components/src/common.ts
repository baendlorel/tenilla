import { hAlias, TenillaComponent } from '@tenilla/core';

export const [button, span, li, select, ul, input, dialog, label, textarea] = hAlias(
  'button,span,li,select,ul,input,dialog,label,textarea',
);

// TODO 增加类约束
export abstract class TenillaInputComponent extends TenillaComponent {
  abstract get value(): any;
  abstract set value(v: any);
  abstract get disabled(): boolean;
  abstract set disabled(v: boolean);
}
