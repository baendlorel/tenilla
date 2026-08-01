import { button, dialog, div, h, noop } from '@tenilla/shared';

export interface ModalOptions {
  /** Modal 标题 */
  title?: string;
  /** Modal 内容 HTML */
  body?: HTMLElement | string;
  /** 自定义 footer 内容 */
  footer?: HTMLElement | string | null;
  /** 使用 div 元素创建而非 dialog */
  useDiv?: boolean;
  /** Modal 大小：'sm' | 'lg' | 'xl' | '' */
  size?: 'sm' | 'lg' | 'xl' | '';
  /** 是否显示背景遮罩 */
  backdrop?: boolean;
  /** 是否支持 ESC 键关闭 */
  keyboard?: boolean;
  /** 确认按钮文本 */
  confirmText?: string;
  /** 取消按钮文本 */
  cancelText?: string;
  /** 确认按钮样式类 */
  confirmClass?: string;
  /** 取消按钮样式类 */
  cancelClass?: string;
  /** 是否显示取消按钮 */
  showCancel?: boolean;
  /** 是否显示确认按钮 */
  showConfirm?: boolean;
  /** 确认回调，返回 false 可阻止关闭 */
  onConfirm?: (data?: any) => unknown;
  /** 取消回调 */
  onCancel?: () => void | Promise<void>;
  /** 显示前回调 */
  onShow?: () => void | Promise<void>;
  /** 显示后回调 */
  onShown?: () => void | Promise<void>;
  /** 隐藏前回调 */
  onHide?: () => void | Promise<void>;
  /** 隐藏后回调 */
  onHidden?: () => void | Promise<void>;
}

export interface ModalStaticOptions extends Omit<
  ModalOptions,
  'onCancel' | 'onShown' | 'onHidden' | 'onHide'
> {
  /** 确认/警告时的按钮样式类 */
  confirmClass?: string;
}

export type FormModalOptions<T extends Record<string, any>> = Omit<ModalOptions, 'onConfirm'> & {
  /** 可以用这个函数来设置数据，非必须 */
  setData?: (data: T) => void;
  /** 获取表单数据，必须填写 */
  getData: () => T;
  /** 确认回调，返回 false 可阻止关闭 */
  onConfirm: (data: T) => boolean | void | Promise<boolean | void>;
};

// 状态常量

const enum ModalState {
  Hidden,
  Transition,
  Shown,
}

export class Modal {
  el: HTMLElement | HTMLDialogElement;
  dialog: HTMLElement;
  title: HTMLElement;
  body: HTMLElement;
  footer: HTMLElement;
  state: ModalState = ModalState.Hidden;

  private _onEscape: ((e: KeyboardEvent) => void) | null = null;
  private _onShow: () => void;
  private _onHide: () => void;
  private _show: () => void;
  private _hide: () => void;

  constructor(o: ModalOptions = {}) {
    this._show = noop;
    this._hide = noop;
    this._onShow = o.onShow ?? noop;
    this._onHide = o.onHide ?? noop;

    const title = o.title || '';
    const body = o.body || '';
    const useDiv = o.useDiv || false;
    const size = o.size || '';
    const backdrop = o.backdrop !== undefined ? o.backdrop : true;
    const keyboard = o.keyboard !== undefined ? o.keyboard : true;
    const onConfirm = o.onConfirm ?? noop;
    const onCancel = o.onCancel ?? noop;
    const onShown = o.onShown ?? noop;
    const onHidden = o.onHidden ?? noop;
    const confirmText = o.confirmText || '确定';
    const cancelText = o.cancelText || '取消';
    const showCancel = o.showCancel !== undefined ? o.showCancel : true;
    const showConfirm = o.showConfirm !== undefined ? o.showConfirm : true;
    const confirmClass = o.confirmClass || 'btn-primary';
    const cancelClass = o.cancelClass || 'btn-secondary';
    const footer = o.footer ?? null;

    this.state = ModalState.Hidden;

    const dialogInner = div('modal-content').child(
      div('modal-header').child(
        (this.title = h('h5', 'modal-title', title)),
        button('btn-close modal-close-btn', '\u00D7')
          .attr('data-dismiss', 'modal')
          .attr('aria-label', 'Close')
          .on('click', () => this.hide()),
      ),
      (this.body = div('modal-body', body)),
      (this.footer = div('modal-footer')),
    );

    if (useDiv) {
      this.dialog = div(`modal-dialog-div ${size ? `modal-${size}` : ''}`).child(dialogInner);
      this.el = div('modal-overlay').child(this.dialog);
    } else {
      this.el = dialog(`modal-dialog ${size ? `modal-${size}` : ''}`).child(dialogInner);
      this.dialog = this.el;
    }

    // & setup footer

    if (footer) {
      this.footer = typeof footer === 'string' ? div(footer) : footer;
      return;
    }

    if (showCancel) {
      this.footer.child(
        button(`btn ${cancelClass} modal-cancel-btn`, cancelText)
          .attr('type', 'button')
          .on('click', (e: Event) => {
            e.preventDefault();
            onCancel?.();
            this.hide();
          }),
      );
    }

    if (showConfirm) {
      this.footer.child(
        button(`btn ${confirmClass} modal-confirm-btn`, confirmText)
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
        (this.el as HTMLElement).style.display = 'flex';
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            this.el.classList.add('visible');
            this.dialog.classList.add('show');
            this.state = ModalState.Shown;
            onShown?.();
          });
        });
      };

      this._hide = () => {
        this.dialog.classList.remove('show');
        this.dialog.classList.add('closing');
        this.el.classList.remove('visible');

        let ended = false;

        const end = () => {
          if (ended) return;
          ended = true;

          (this.el as HTMLElement).style.display = 'none';
          this.dialog.classList.remove('closing');
          this.state = ModalState.Hidden;

          onHidden?.();
        };

        (this.el as HTMLElement).on('transitionend', end, { once: true });
        setTimeout(end, 300);
      };

      if (backdrop) {
        this.el.addEventListener('click', (e) => {
          if (e.target === this.el) {
            this.hide();
          }
        });
      }
    } else {
      this._show = () => {
        (this.el as HTMLDialogElement).showModal();
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            this.el.classList.add('show');
            this.state = ModalState.Shown;
            onShown?.();
          });
        });
      };

      this._hide = () => {
        this.el.classList.remove('show');
        this.el.classList.add('closing');

        let ended = false;

        const end = () => {
          if (ended) return;
          ended = true;

          (this.el as HTMLDialogElement).close();
          this.el.classList.remove('closing');
          this.state = ModalState.Hidden;

          onHidden?.();
        };

        (this.el as HTMLElement).on('transitionend', end, { once: true });
        setTimeout(end, 150);
      };
    }

    if (keyboard) {
      this._onEscape = (e) => {
        if (e.key === 'Escape' && this.state === ModalState.Shown) {
          this.hide();
        }
      };
      document.addEventListener('keydown', this._onEscape);
    }

    // 挂载到body上去
    document.body.appendChild(this.el);
  }

  show(): this {
    if (this.state !== ModalState.Hidden) {
      return this;
    }

    this._onShow();
    this.state = ModalState.Transition;

    this._show();
    return this;
  }

  hide(): this {
    if (this.state !== ModalState.Shown) {
      return this;
    }

    this._onHide();
    this.state = ModalState.Transition;
    this._hide();
    return this;
  }

  toggle(): this {
    if (this.state === ModalState.Shown) {
      this.hide();
    } else if (this.state === ModalState.Hidden) {
      this.show();
    }
    return this;
  }

  setBody(body: string): this {
    this.body.innerHTML = body;
    return this;
  }

  setTitle(title: string): this {
    this.title.textContent = title;
    return this;
  }

  destroy(): void {
    if (this._onEscape) {
      document.removeEventListener('keydown', this._onEscape);
    }

    this.el.remove();
    this.state = ModalState.Hidden;
  }

  static confirm(options: ModalStaticOptions): Promise<boolean> {
    return new Promise((resolve) =>
      new Modal({
        title: options.title || '确认',
        body: options.body || '',
        size: options.size || '',
        confirmText: options.confirmText || '确定',
        cancelText: options.cancelText || '取消',
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
        title: options.title || '提示',
        body: options.body || '',
        size: options.size || '',
        confirmText: options.confirmText || '确定',
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
      throw new Error('FormModal必须传入getData函数用以获取数据');
    }
    if (o.setData && typeof o.setData !== 'function') {
      throw new Error('FormModal的setData必须是函数');
    }
    super(o);
    this.getData = o.getData;
  }
}

