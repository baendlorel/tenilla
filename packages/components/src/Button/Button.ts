import { h } from '@tenilla/core';
import './Button.css';

export function btn(child: any): HTMLButtonElement;
export function btn(variant: string, child?: any): HTMLButtonElement;
export function btn(...args: any[]) {
  if (args.length === 1) {
    return h('button', 'tenilla-btn', args[0]);
  }
  return h('button', `btn-${args[0]} tenilla-btn`, args[1]);
}
