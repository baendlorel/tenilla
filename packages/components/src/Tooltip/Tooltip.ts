import { div, span } from '@tenilla/shared';

export type TooltipDirection = 'top' | 'bottom' | 'left' | 'right';
export type TooltipVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'light'
  | 'dark';

export interface TooltipOptions {
  /** Tooltip display direction */
  direction?: TooltipDirection;
  /** Custom CSS class */
  customClass?: string;
  /** Color variant */
  variant?: TooltipVariant;
  /** Show delay (ms) */
  delay?: number;
}

export class Tooltip {
  static readonly VARIANTS: Record<TooltipVariant, string> = {
    primary: 'bg-primary text-white',
    secondary: 'bg-secondary text-white',
    success: 'bg-success text-white',
    danger: 'bg-danger text-white',
    warning: 'bg-warning text-dark',
    info: 'bg-info text-white',
    light: 'bg-light text-dark',
    dark: 'bg-dark text-white',
  };

  static readonly VARIANT_COLORS: Record<TooltipVariant, string> = {
    primary: 'var(--bs-primary, #0d6efd)',
    secondary: 'var(--bs-secondary, #6c757d)',
    success: 'var(--bs-success, #198754)',
    danger: 'var(--bs-danger, #dc3545)',
    warning: 'var(--bs-warning, #ffc107)',
    info: 'var(--bs-info, #0dcaf0)',
    light: 'var(--bs-light, #f8f9fa)',
    dark: 'var(--bs-dark, #212529)',
  };

  private _host: HTMLElement;
  private _content: HTMLElement;
  private _tooltipEl: HTMLElement | null = null;
  private _direction: TooltipDirection;
  private _customClass: string;
  private _variant: TooltipVariant | null;
  private _delay: number;
  private _showTimer: ReturnType<typeof setTimeout> | null = null;
  private _onMouseEnter: (e: Event) => void;
  private _onMouseLeave: (e: Event) => void;

  constructor(
    hostElement: HTMLElement,
    content: string | HTMLElement,
    options: TooltipOptions = {},
  ) {
    this._host = hostElement;
    this._content = typeof content === 'string' ? span('', content) : content;
    this._direction = options.direction || 'top';
    this._customClass = options.customClass || '';
    this._variant = options.variant || null;
    this._delay = options.delay || 0;

    this._onMouseEnter = (e) => this._handleMouseEnter(e);
    this._onMouseLeave = (e) => this._handleMouseLeave(e);

    this._host.on('mouseenter', this._onMouseEnter);
    this._host.on('mouseleave', this._onMouseLeave);
  }

  private _handleMouseEnter(_e: Event): void {
    if (this._showTimer !== null) {
      return;
    }

    const delay = this._delay;

    if (delay > 0) {
      this._showTimer = setTimeout(() => {
        this._showTimer = null;
        this._show();
      }, delay);
    } else {
      this._show();
    }
  }

  private _handleMouseLeave(_e: Event): void {
    if (this._showTimer !== null) {
      clearTimeout(this._showTimer);
      this._showTimer = null;
    }
    this._hide();
  }

  private _show(): void {
    if (this._tooltipEl) {
      return;
    }

    const variantClasses = this._variant ? Tooltip.VARIANTS[this._variant] || '' : '';
    this._tooltipEl = div(
      `fluxion-tooltip ${this._direction} ${this._customClass} ${variantClasses}`,
    );

    if (this._variant) {
      this._tooltipEl.style.setProperty('--tooltip-bg', Tooltip.VARIANT_COLORS[this._variant]);
    }

    this._tooltipEl.child(this._content.cloneNode(true));
    document.body.child(this._tooltipEl);

    this._position();

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this._tooltipEl?.classList.add('visible');
      });
    });
  }

  private _hide(): void {
    if (!this._tooltipEl) {
      return;
    }

    this._tooltipEl.classList.remove('visible');

    setTimeout(() => {
      if (this._tooltipEl) {
        this._tooltipEl.remove();
        this._tooltipEl = null;
      }
    }, 150);
  }

  private _position(): void {
    if (!this._tooltipEl) {
      return;
    }

    const hostRect = this._host.getBoundingClientRect();
    const tooltipRect = this._tooltipEl.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

    let top: number, left: number;
    const gap = 0;

    switch (this._direction) {
      case 'top':
        top = hostRect.top + scrollTop - tooltipRect.height - gap;
        left = hostRect.left + scrollLeft + (hostRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = hostRect.bottom + scrollTop + gap;
        left = hostRect.left + scrollLeft + (hostRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = hostRect.top + scrollTop + (hostRect.height - tooltipRect.height) / 2;
        left = hostRect.left + scrollLeft - tooltipRect.width - gap;
        break;
      case 'right':
        top = hostRect.top + scrollTop + (hostRect.height - tooltipRect.height) / 2;
        left = hostRect.right + scrollLeft + gap;
        break;
      default:
        top = hostRect.top + scrollTop - tooltipRect.height - gap;
        left = hostRect.left + scrollLeft + (hostRect.width - tooltipRect.width) / 2;
    }

    this._tooltipEl.style.top = `${top}px`;
    this._tooltipEl.style.left = `${left}px`;
  }

  destroy(): void {
    this._host.removeEventListener('mouseenter', this._onMouseEnter);
    this._host.removeEventListener('mouseleave', this._onMouseLeave);

    if (this._showTimer !== null) {
      clearTimeout(this._showTimer);
      this._showTimer = null;
    }

    if (this._tooltipEl) {
      this._tooltipEl.remove();
      this._tooltipEl = null;
    }
  }

  setContent(content: string | HTMLElement): this {
    this._content = typeof content === 'string' ? span('', content) : content;
    if (this._tooltipEl) {
      this._tooltipEl.innerHTML = '';
      this._tooltipEl.child(this._content.cloneNode(true));
    }
    return this;
  }

  setDirection(direction: TooltipDirection): this {
    this._direction = direction;
    if (this._tooltipEl) {
      const variantClasses = this._variant ? Tooltip.VARIANTS[this._variant] || '' : '';
      this._tooltipEl.className = `fluxion-tooltip ${direction} ${this._customClass} ${variantClasses}`;

      if (this._variant) {
        this._tooltipEl.style.setProperty('--tooltip-bg', Tooltip.VARIANT_COLORS[this._variant]);
      }

      this._position();
    }
    return this;
  }

  setVariant(variant: TooltipVariant | null): this {
    this._variant = variant;
    if (this._tooltipEl) {
      const variantClasses = variant ? Tooltip.VARIANTS[variant] || '' : '';
      this._tooltipEl.className = `fluxion-tooltip ${this._direction} ${this._customClass} ${variantClasses}`;

      if (variant) {
        this._tooltipEl.style.setProperty('--tooltip-bg', Tooltip.VARIANT_COLORS[variant]);
      } else {
        this._tooltipEl.style.removeProperty('--tooltip-bg');
      }
    }
    return this;
  }
}

