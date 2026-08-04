import './TabPanel.css';
import { div } from '@tenilla/core';
import { button, span } from '../common.js';

export interface TabData {
  /** Unique id */
  id: string | number | symbol;
  /** Tab title */
  title: string;
  /** Tab content element */
  body: HTMLElement;
  /** Tab button element */
  button: HTMLButtonElement;
  /** Whether the tab is closable */
  closable: boolean;
}

export interface TabOptions {
  /** Unique id */
  id: string | number | symbol;
  /** Title */
  title: string;
  /** Content to be displayed in the panel */
  body: HTMLElement | { element: HTMLElement };
  /** Whether the tab is closable */
  closable?: boolean;
}

export interface TabPanelArgs {
  /** Tab position: 'top' or 'left' */
  position?: 'top' | 'left';
  /** Initially active tab ID */
  activeId?: string | number | symbol | null;
  /** Callback when tab changes */
  onChange?: (id: string | number | symbol, tab: TabData) => void;
  /** Theme color */
  theme?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  /** Size */
  size?: 'small' | 'normal' | 'large';
  /** Whether to show border */
  bordered?: boolean;
}

export class TabPanel {
  /** @internal */
  protected _element: HTMLElement;
  /** @internal */
  private _header: HTMLElement;

  /** @internal */
  _body: HTMLElement;
  /** @internal */
  private _tabs: TabData[] = [];
  /** @internal */
  private _activeId: string | number | symbol | null = null;

  /** @internal */
  private _onChange: ((id: string | number | symbol, tab: TabData) => void) | null = null;

  constructor(args: TabPanelArgs = {}) {
    const {
      position = 'top',
      activeId = null,
      onChange = null,
      theme = 'default',
      size = 'normal',
      bordered = true,
    } = args;

    this._activeId = activeId;
    this._onChange = onChange;

    // Create structure
    this._element = div(
      `tenilla-tab-panel tenilla-tab-panel-${position} tenilla-tab-panel-theme-${theme} tenilla-tab-panel-size-${size}`,
    );

    if (bordered) {
      this._element.classList.add('tenilla-tab-panel-bordered');
    }

    const wrapper = div(position === 'left' ? 'tenilla-tab-panel-left-wrapper' : '');
    this._header = div('tenilla-tab-panel-header').attr('role', 'tablist');
    this._body = div('tenilla-tab-panel-content');

    wrapper.child(this._header, this._body);
    this._element.child(wrapper);
  }

  get element(): HTMLElement {
    return this._element;
  }

  /** @internal */
  private _create(opts: TabOptions): TabData {
    const { id, title, body, closable = false } = opts;

    return {
      id,
      title,
      body: div('tenilla-tab-pane')
        .attr('role', 'tabpanel')
        .child((body as { element: HTMLElement })?.element ?? body),
      button: button('tenilla-tab-btn')
        .attr('role', 'tab')
        .on('click', () => this.setActive(id))
        .tap((e: any) => {
          if (closable) {
            e.appendChild(
              span('tenilla-tab-close-btn', '×').on('click', (ev: Event) => {
                ev.stopPropagation();
                this.remove(id);
              }),
            );
          }
        })
        .child(span('tenilla-tab-title', title)),
      closable,
    };
  }

  add(opts: TabOptions): string {
    const newTab = this._create(opts);
    this._tabs.push(newTab);
    this._header.child(newTab.button);
    this._body.child(newTab.body);

    if (this._tabs.length === 1) {
      this.setActive(this._tabs[0].id);
    }

    return newTab.title;
  }

  update(opts: TabOptions): boolean {
    const i = this._tabs.findIndex((v) => v.id === opts.id);
    if (i === -1) {
      return false;
    }

    // Replace entirely with new content
    const a = this._tabs[i];
    const b = this._create(opts);
    this._tabs[i] = b;

    a.body.replaceWith(b.body);
    a.button.replaceWith(b.button);

    if (this._activeId === a.title) {
      this._activeId = b.title;
    }

    return true;
  }

  remove(id: string | number | symbol): void {
    const i = this._tabs.findIndex((v) => v.id === id);
    if (i === -1) {
      return;
    }

    this._tabs[i].button.remove();
    this._tabs[i].body.remove();
    this._tabs.splice(i, 1);
    this.setActive(this._tabs[0]?.id ?? null);
  }

  setActive(id: string | number | symbol): boolean {
    // Clear active styles first
    this._tabs.forEach((t) => {
      t.body.classList.remove('tenilla-active');
      t.body.classList.remove('tenilla-animating');
      t.button.classList.remove('tenilla-active');
    });

    const t = this._tabs.find((v) => v.id === id);
    if (!t || (t.button as any).disabled) {
      // If no match found, skip
      this._activeId = null;
      return false;
    }

    // Add animation class, hide overflow
    this._body.classList.add('tenilla-animating');
    t.body.classList.add('tenilla-animating');

    t.button.classList.add('tenilla-active');
    t.body.classList.add('tenilla-active');

    // Remove animating class after animation ends
    setTimeout(() => {
      this._body.classList.remove('tenilla-animating');
      t.body.classList.remove('tenilla-animating');
    }, 300);

    const old = this._activeId;
    this._activeId = id;

    if (this._onChange && old !== id) {
      this._onChange(id, this._tabs.find((v) => v.id === id)!);
    }

    return true;
  }

  setDisabled(id: string | number | symbol, disabled: boolean): boolean {
    const t = this._tabs.find((v) => v.id === id);
    if (!t) {
      return false;
    }

    if (disabled) {
      t.button.classList.add('tenilla-tab-btn-disabled');
    } else {
      t.button.classList.remove('tenilla-tab-btn-disabled');
    }
    (t.button as any).disabled = disabled;
    return true;
  }

  setVisible(id: string | number | symbol, visible: boolean): boolean {
    const t = this._tabs.find((v) => v.id === id);
    if (!t) {
      return false;
    }
    t.button.style.display = visible ? '' : 'none';
    return true;
  }

  clear(): void {
    this._tabs.forEach((t) => {
      t.body.remove();
      t.button.remove();
    });

    this._tabs = [];
    this._header.innerHTML = '';
    this._body.innerHTML = '';
    this._activeId = null;
  }

  destroy(): void {
    this.clear();
    this._element.remove();
    // & nullify
    // @ts-ignore
    this._element = null;
    // @ts-ignore
    this._header = null;
    // @ts-ignore
    this._body = null;
    // @ts-ignore
    this._tabs = null;
    // @ts-ignore
    this._onChange = null;
  }
}
