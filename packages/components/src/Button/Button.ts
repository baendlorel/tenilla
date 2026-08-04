import { h } from '@tenilla/core';

export function btn(className?: string, child?: any) {
  return h('button', `${className ?? ''} tenilla-btn`, child);
}
