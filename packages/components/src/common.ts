import { hAlias } from '@tenilla/core';

export const [button, span, li, select, ul, input, dialog, label, textarea] = hAlias(
  'button,span,li,select,ul,input,dialog,label,textarea',
);

export const nodenull = document.createComment('');

/** Common color variants */
export type TenillaVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'light'
  | 'dark';
