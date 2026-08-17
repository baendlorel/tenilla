import { h } from '@tenilla/core';
import type { TenillaVariant } from '../common.js';
import './Button.css';

export function btn(child: any): HTMLButtonElement;
export function btn(
  variant: TenillaVariant,
  child: any,
  onClick?: HTMLElementEventMap['click'],
): HTMLButtonElement;
export function btn(...args: any[]) {
  switch (args.length) {
    case 0:
    case 1:
      return h('button', 'tenilla-btn', args[0]);
    case 2:
      return h('button', `btn-${args[0]} tenilla-btn`, args[1]);
    case 3:
      return h('button', `btn-${args[0]} tenilla-btn`, args[1]).on('click', args[2]);
    default:
      throw new Error(`Invalid number of arguments for 'btn' function`);
  }
}

export interface ButtonProps {
  variant?: TenillaVariant;
}
