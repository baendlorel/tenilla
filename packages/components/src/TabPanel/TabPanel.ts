import './TabPanel.css';
import { div, isTenillaComponent, type TenillaComponent } from '@tenilla/core';
import { button, span } from '../common.js';

export interface TabData {
  /** Unique id */
  id: string | number | symbol;
  /** Tab title */
  title: string;
  /** The body specification (element, factory, class instance, or class constructor) */
  body: (() => HTMLElement) | (() => TenillaComponent);
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
  /** Body content — created lazily on activation */
  body: (() => HTMLElement) | (() => TenillaComponent);
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

  /** @internal Cache of the currently-active resolved body content */
  private _current: TenillaComponent | HTMLElement | null = null;

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
      `tenilla-tab-panel tenilla-tab-panel-${position} tenilla-tab-panel-theme-${theme} tenilla-tab-panel-size-${size} ${bordered ? 'tenilla-tab-panel-bordered' : ''}`,
    ).child(
      div(position === 'left' ? 'tenilla-tab-panel-left-wrapper' : '').child(
        (this._header = div('tenilla-tab-panel-header').attr('role', 'tablist')),
        (this._body = div('tenilla-tab-panel-content')),
      ),
    );
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
      body,
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

    const oldTab = this._tabs[i];
    const wasActive = this._activeId === oldTab.id;

    const newTab = this._create(opts);
    this._tabs[i] = newTab;

    oldTab.button.replaceWith(newTab.button);

    // Re-activate so the new body is created (mountBody handles destroy of old)
    if (wasActive) {
      this._activeId = newTab.id;
      this._mountBody(newTab);
    }

    return true;
  }

  remove(id: string | number | symbol): void {
    const i = this._tabs.findIndex((v) => v.id === id);
    if (i === -1) {
      return;
    }

    const wasActive = this._activeId === this._tabs[i].id;
    if (wasActive) {
      // TODO 是不是能把tenilla的destroy用remove完成？
      if (isTenillaComponent(this._current)) {
        this._current.destroy();
      } else {
        this._current?.remove();
      }
      this._current = null;
    }

    this._tabs[i].button.remove();
    this._tabs.splice(i, 1);

    // If the active tab was removed, switch to the first remaining tab
    if (wasActive) {
      this.setActive(this._tabs[0]?.id ?? null);
    }
  }

  /** @internal Resolve and mount the body for a tab. Destroys any previous content. */
  private _mountBody(tab: TabData): void {
    // TODO destroy current
    this._body.innerHTML = '';
    this._current = tab.body();
    this._body.appendChild(
      div('tenilla-tab-pane')
        .attr('role', 'tabpanel')
        .class('tenilla-active')
        // TODO 是不是能在Node上增加一个叫self的属性返回自己，然后TenillaComponent的self也会返回自己的element属性
        .child(this._current.element),
    );
  }

  setActive(id: string | number | symbol): boolean {
    // Clear button active styles
    this._tabs.forEach((t) => {
      t.button.classList.remove('tenilla-active');
    });

    const t = this._tabs.find((v) => v.id === id);
    if (!t || (t.button as any).disabled) {
      this._activeId = null;
      return false;
    }

    // Animate: hide overflow during transition
    this._body.classList.add('tenilla-animating');

    // Mount the new body (destroys previous)
    this._mountBody(t);

    t.button.classList.add('tenilla-active');

    setTimeout(() => {
      this._body.classList.remove('tenilla-animating');
    }, 300);

    const old = this._activeId;
    this._activeId = id;

    if (this._onChange && old !== id) {
      this._onChange(id, t);
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

  destroy(): void {
    // TODO destroy current
    this._tabs.forEach((t) => t.button.remove());
    this._tabs.length = 0;
    this._activeId = null;
    this._header.remove();
    this._body.remove();
    this._element.remove();
    this._element = anynull;
    this._header = anynull;
    this._body = anynull;
    this._tabs = anynull;
    this._onChange = anynull;
  }
}
