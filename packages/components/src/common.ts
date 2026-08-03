import { hAlias, TenillaComponent } from '@tenilla/core';

export const [button, span, li, select, ul, input, dialog, label, textarea] = hAlias(
  'button,span,li,select,ul,input,dialog,label,textarea',
);

/**
 * Tenilla's input component protocol
 */
export abstract class TenillaInput extends TenillaComponent {
  abstract get value(): any;
  abstract set value(v: any);
  abstract get disabled(): boolean;
  abstract set disabled(v: boolean);
}
