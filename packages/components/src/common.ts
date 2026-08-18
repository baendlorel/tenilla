import { hAlias } from '@tenilla/core';

export const [button, span, li, select, ul, input, dialog, label] = hAlias(
  'button,span,li,select,ul,input,dialog,label',
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

/** Transparent text-style variants (keep padding, no background/border) */
export type TenillaTextVariant =
  | 'primary-text'
  | 'secondary-text'
  | 'success-text'
  | 'danger-text'
  | 'warning-text'
  | 'info-text';
