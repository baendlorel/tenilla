import { button, dialog } from '../h-alias.js';
import './Modal.css';
import { div, h, _noop } from '@tenilla/core';

export interface ModalOptions {
  /** Modal title */
  title?: string;
  /** Modal body content HTML */
  body?: HTMLElement | string;
  /** Custom footer content */
  footer?: HTMLElement | string | null;
  /** Use a div element instead of a dialog */
  useDiv?: boolean;
  /** Modal size: 'sm' | 'lg' | 'xl' | '' */
  size?: 'sm' | 'lg' | 'xl' | '';
  /** Whether to show the backdrop overlay */
  backdrop?: boolean;
  /** Whether to support closing with ESC key */
  keyboard?: boolean;
  /** Confirm button text */
  confirmText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Confirm button CSS class */
  confirmClass?: string;
  /** Cancel button CSS class */
  cancelClass?: string;
  /** Whether to show the cancel button */
  showCancel?: boolean;
  /** Whether to show the confirm button */
  showConfirm?: boolean;
  /** Confirm callback, return false to prevent closing */
  onConfirm?: (data?: any) => unknown;
  /** Cancel callback */
  onCancel?: () => void | Promise<void>;
  /** Callback before showing */
  onShow?: () => void | Promise<void>;
  /** Callback after shown */
  onShown?: () => void | Promise<void>;
  /** Callback before hiding */
  onHide?: () => void | Promise<void>;
  /** Callback after hidden */
  onHidden?: () => void | Promise<void>;
}

export interface ModalStaticOptions extends Omit<
  ModalOptions,
  'onCancel' | 'onShown' | 'onHidden' | 'onHide'
> {
  /** Button CSS class for confirm/alert dialogs */
  confirmClass?: string;
}

export type FormModalOptions<T extends Record<string, any>> = Omit<ModalOptions, 'onConfirm'> & {
  /** Optional function to set data */
  setData?: (data: T) => void;
  /** Function to get form data, required */
  getData: () => T;
  /** Confirm callback, return false to prevent closing */
  onConfirm: (data: T) => boolean | void | Promise<boolean | void>;
};

// State constants

export const enum ModalState {
  Hidden,
  Transition,
  Shown,
}

export class Modal {
  /** @internal */
  _element: HTMLElement | HTMLDialogElement;
  /** @internal */
  _dialog: HTMLElement;
  /** @internal */
  _title: HTMLElement;
  /** @internal */
  _body: HTMLElement;
  /** @internal */
  _footer: HTMLElement;
  /** @internal */
  _state: ModalState = ModalState.Hidden;

  /** @internal */
  private _onEscape: ((e: KeyboardEvent) => void) | null = null;
  /** @internal */
  private _onShow: () => void;
  /** @internal */
  private _onHide: () => void;
  /** @internal */
  private _show: () => void;
  /** @internal */
  private _hide: () => void;

  constructor(o: ModalOptions = {}) {
    this._show = _noop;
    this._hide = _noop;
    this._onShow = o.onShow ?? _noop;
    this._onHide = o.onHide ?? _noop;

    const title = o.title || '';
    const body = o.body || '';
    const useDiv = o.useDiv || false;
    const size = o.size || '';
    const backdrop = o.backdrop !== undefined ? o.backdrop : true;
    const keyboard = o.keyboard !== undefined ? o.keyboard : true;
    const onConfirm = o.onConfirm ?? _noop;
    const onCancel = o.onCancel ?? _noop;
    const onShown = o.onShown ?? _noop;
    const onHidden = o.onHidden ?? _noop;
    const confirmText = o.confirmText || 'OK';
    const cancelText = o.cancelText || 'Cancel';
    const showCancel = o.showCancel !== undefined ? o.showCancel : true;
    const showConfirm = o.showConfirm !== undefined ? o.showConfirm : true;
    const confirmClass = o.confirmClass || 'btn-primary';
    const cancelClass = o.cancelClass || 'btn-secondary';
    const footer = o.footer ?? null;

    this._state = ModalState.Hidden;

    const dialogInner = div('tenilla-modal-content').child(
      div('tenilla-modal-header').child(
        (this._title = h('h5', 'tenilla-modal-title', title)),
        button('btn-close tenilla-modal-close-btn', '×')
          .attr('data-dismiss', 'modal')
          .attr('aria-label', 'Close')
          .on('click', () => this.hide()),
      ),
      (this._body = div('tenilla-modal-body', body)),
      (this._footer = div('tenilla-modal-footer')),
    );

    if (useDiv) {
      this._dialog = div(`tenilla-modal-dialog-div ${size ? `tenilla-modal-${size}` : ''}`).child(
        dialogInner,
      );
      this._element = div('tenilla-modal-overlay').child(this._dialog);
    } else {
      this._element = dialog(`tenilla-modal-dialog ${size ? `tenilla-modal-${size}` : ''}`).child(
        dialogInner,
      );
      this._dialog = this._element;
    }

    // & setup footer

    if (footer) {
      this._footer = typeof footer === 'string' ? div(footer) : footer;
      return;
    }

    if (showCancel) {
      this._footer.child(
        button(`btn ${cancelClass} tenilla-modal-cancel-btn`, cancelText)
          .attr('type', 'button')
          .on('click', (e: Event) => {
            e.preventDefault();
            onCancel?.();
            this.hide();
          }),
      );
    }

    if (showConfirm) {
      this._footer.child(
        button(`btn ${confirmClass} tenilla-modal-confirm-btn`, confirmText)
          .attr('type', 'button')
          .on('click', (e: Event) => {
            e.preventDefault();
            if (onConfirm) {
              // !getData is defined in FormModal, so it should be errored
              // @ts-expect-error
              const data = this.getData?.();
              const result = onConfirm(data);
              if (result === false) {
                return;
              }
            }
            this.hide();
          }),
      );
    }

    // setup events
    if (useDiv) {
      this._show = () => {
        (this._element as HTMLElement).style.display = 'flex';
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            this._element.classList.add('tenilla-visible');
            this._dialog.classList.add('tenilla-show');
            this._state = ModalState.Shown;
            onShown?.();
          });
        });
      };

      this._hide = () => {
        this._dialog.classList.remove('tenilla-show');
        this._dialog.classList.add('tenilla-closing');
        this._element.classList.remove('tenilla-visible');

        let ended = false;

        const end = () => {
          if (ended) return;
          ended = true;

          (this._element as HTMLElement).style.display = 'none';
          this._dialog.classList.remove('tenilla-closing');
          this._state = ModalState.Hidden;

          onHidden?.();
        };

        (this._element as HTMLElement).on('transitionend', end, { once: true });
        setTimeout(end, 300);
      };

      if (backdrop) {
        this._element.addEventListener('click', (e) => {
          if (e.target === this._element) {
            this.hide();
          }
        });
      }
    } else {
      this._show = () => {
        (this._element as HTMLDialogElement).showModal();
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            this._element.classList.add('tenilla-show');
            this._state = ModalState.Shown;
            onShown?.();
          });
        });
      };

      this._hide = () => {
        this._element.classList.remove('tenilla-show');
        this._element.classList.add('tenilla-closing');

        let ended = false;

        const end = () => {
          if (ended) return;
          ended = true;

          (this._element as HTMLDialogElement).close();
          this._element.classList.remove('tenilla-closing');
          this._state = ModalState.Hidden;

          onHidden?.();
        };

        (this._element as HTMLElement).on('transitionend', end, { once: true });
        setTimeout(end, 150);
      };
    }

    if (keyboard) {
      this._onEscape = (e) => {
        if (e.key === 'Escape' && this._state === ModalState.Shown) {
          this.hide();
        }
      };
      document.addEventListener('keydown', this._onEscape);
    }

    // Append to body
    document.body.appendChild(this._element);
  }

  get element(): HTMLElement | HTMLDialogElement {
    return this._element;
  }

  show(): this {
    if (this._state !== ModalState.Hidden) {
      return this;
    }

    this._onShow();
    this._state = ModalState.Transition;

    this._show();
    return this;
  }

  hide(): this {
    if (this._state !== ModalState.Shown) {
      return this;
    }

    this._onHide();
    this._state = ModalState.Transition;
    this._hide();
    return this;
  }

  toggle(): this {
    if (this._state === ModalState.Shown) {
      this.hide();
    } else if (this._state === ModalState.Hidden) {
      this.show();
    }
    return this;
  }

  setBody(body: string): this {
    this._body.innerHTML = body;
    return this;
  }

  setTitle(title: string): this {
    this._title.textContent = title;
    return this;
  }

  destroy(): void {
    if (this._onEscape) {
      document.removeEventListener('keydown', this._onEscape);
    }

    this._element.remove();
    this._state = ModalState.Hidden;
    // nullify
    // @ts-ignore
    this._element = null;
    // @ts-ignore
    this._dialog = null;
    // @ts-ignore
    this._title = null;
    // @ts-ignore
    this._body = null;
    // @ts-ignore
    this._footer = null;
    // @ts-ignore
    this._onEscape = null;
    // @ts-ignore
    this._onShow = null;
    // @ts-ignore
    this._onHide = null;
    // @ts-ignore
    this._show = null;
    // @ts-ignore
    this._hide = null;
  }

  static confirm(options: ModalStaticOptions): Promise<boolean> {
    return new Promise((resolve) =>
      new Modal({
        title: options.title || 'Confirm',
        body: options.body || '',
        size: options.size || '',
        confirmText: options.confirmText || 'OK',
        cancelText: options.cancelText || 'Cancel',
        confirmClass: options.confirmClass || 'btn-danger',
        useDiv: options.useDiv || false,
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
      }).show(),
    );
  }

  static alert(options: ModalStaticOptions): Promise<void> {
    return new Promise((resolve) =>
      new Modal({
        title: options.title || 'Alert',
        body: options.body || '',
        size: options.size || '',
        confirmText: options.confirmText || 'OK',
        showCancel: false,
        useDiv: options.useDiv || false,
        onConfirm: resolve,
        onHidden: resolve,
      }).show(),
    );
  }
}

export class FormModal<T extends Record<string, any>> extends Modal {
  getData: () => T;

  constructor(o: FormModalOptions<T>) {
    if (typeof o.getData !== 'function') {
      throw new Error('FormModal requires a getData function to retrieve form data');
    }
    if (o.setData && typeof o.setData !== 'function') {
      throw new Error('FormModal setData must be a function');
    }
    super(o);
    this.getData = o.getData;
  }
}
