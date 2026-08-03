import { _formatDateTime, div, TenillaInput } from '@tenilla/core';
import { input, span } from '../common.js';
import { DatePicker } from '../DatePicker/DatePicker.js';
import { TimePicker } from '../TimePicker/TimePicker.js';
import './DateTimePicker.css';

export interface DateTimePickerOptions {
  /** Initial datetime value (Date object or ISO string) */
  value?: Date | string | null;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the picker is disabled */
  disabled?: boolean;
  /** Callback when datetime is selected */
  onChange?: (date: Date | null) => void;
  /** Custom CSS class */
  customClass?: string;
}

export class DateTimePicker extends TenillaInput {
  /** @internal */
  protected readonly _element: HTMLElement;
  /** @internal */
  private readonly _input: HTMLInputElement;
  /** @internal */
  private readonly _popup: HTMLElement;
  /** @internal */
  private _selectedDate: Date | null = null;
  /** @internal */
  private _viewYear: number;
  /** @internal */
  private _viewMonth: number;
  /** @internal */
  private _isOpen: boolean = false;
  /** @internal */
  private _calendar: any = null;
  /** @internal */
  private _clock: any = null;
  /** @internal */
  private _onClickOutside: (e: Event) => void;
  /** @internal */
  private _onKeyDown: (e: KeyboardEvent) => void;

  /** @internal */
  private _disabled: boolean = false;

  protected onChange: (date: Date | null) => void;
  constructor(options: DateTimePickerOptions = {}) {
    super();
    this.onChange = options.onChange ?? (() => {});
    this._disabled = options.disabled || false;

    if (options.value) {
      this._selectedDate =
        typeof options.value === 'string' ? new Date(options.value) : options.value;
    }

    const now = this._selectedDate || new Date();
    this._viewYear = now.getFullYear();
    this._viewMonth = now.getMonth();

    this._element = div(
      `tenilla-datetimepicker ${options.customClass ?? ''} ${this._disabled ? 'tenilla-disabled' : ''}`,
    ).child(
      (this._input = input('tenilla-datetimepicker-input')
        .attrs({
          placeholder: options.placeholder,
          readonly: true,
          value: this._selectedDate ? _formatDateTime(this._selectedDate) : '',
          disabled: this._disabled === true,
        })
        .on('click', (e: Event) => {
          e.stopPropagation();
          if (!this._disabled) {
            this.toggle();
          }
        })),
      span('tenilla-datetimepicker-icon', '📅🕐'),
      (this._popup = div('tenilla-datetimepicker-popup')),
    );

    const calendarSection = div('tenilla-datetime-section');
    const clockSection = div('tenilla-datetime-section');

    // Reuse DatePicker's calendar logic
    this._calendar = DatePicker._createCalendar(
      calendarSection,
      this._viewYear,
      this._viewMonth,
      this._selectedDate,
      (date) => this._onDateSelected(date),
      (y, m) => {
        this._viewYear = y;
        this._viewMonth = m;
      },
    );

    // Reuse TimePicker's clock logic
    this._clock = TimePicker._createClock(
      clockSection,
      this._selectedDate?.getHours() ?? new Date().getHours(),
      this._selectedDate?.getMinutes() ?? new Date().getMinutes(),
      this._selectedDate?.getSeconds() ?? new Date().getSeconds(),
      '24h',
      'minutes',
      1,
      (h, m) => this._onTimeSelected(h, m),
    );

    this._popup.child(calendarSection, clockSection);

    this._onClickOutside = (e: Event) => {
      if (!this._element.contains(e.target as Node)) {
        this.close();
      }
    };
    this._onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.close();
      }
    };
    document.addEventListener('click', this._onClickOutside);
    document.addEventListener('keydown', this._onKeyDown);
  }

  get element(): HTMLElement {
    return this._element;
  }

  get value(): Date | null {
    return this._selectedDate;
  }

  set value(value: Date | string | null) {
    this.setValue(value);
  }

  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(v: boolean) {
    this._disabled = v;
    this._input.disabled = v;
    if (v) {
      this._element.classList.add('tenilla-disabled');
    } else {
      this._element.classList.remove('tenilla-disabled');
    }
  }

  setValue(value: Date | string | null): this {
    if (value === null) {
      this._selectedDate = null;
      this._input.value = '';
    } else {
      this._selectedDate = typeof value === 'string' ? new Date(value) : value;
      this._input.value = _formatDateTime(this._selectedDate);
      this._viewYear = this._selectedDate.getFullYear();
      this._viewMonth = this._selectedDate.getMonth();
    }
    if (this._calendar) {
      this._calendar.update(this._selectedDate);
    }
    if (this._clock && this._selectedDate) {
      this._clock.update(this._selectedDate.getHours(), this._selectedDate.getMinutes());
    }
    return this;
  }

  toggle(): void {
    this._isOpen ? this.close() : this.open();
  }

  open(): void {
    if (this._isOpen) {
      return;
    }
    this._isOpen = true;
    this._popup.classList.add('tenilla-open');
    if (this._calendar) {
      this._calendar.update(this._selectedDate);
    }
    if (this._clock && this._selectedDate) {
      this._clock.update(this._selectedDate.getHours(), this._selectedDate.getMinutes());
    }
  }

  close(): void {
    if (!this._isOpen) {
      return;
    }
    this._isOpen = false;
    this._popup.classList.remove('tenilla-open');
  }

  /** @internal */
  private _onDateSelected(date: Date): void {
    const hour = this._selectedDate?.getHours() ?? date.getHours();
    const minute = this._selectedDate?.getMinutes() ?? date.getMinutes();
    this._selectedDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      hour,
      minute,
    );
    this._input.value = _formatDateTime(this._selectedDate);
    if (this._calendar) {
      this._calendar.update(this._selectedDate);
    }
    if (this._clock) {
      this._clock.update(hour, minute);
    }
    this.onChange(this._selectedDate);
  }

  /** @internal */
  private _onTimeSelected(hour: number, minute: number): void {
    if (!this._selectedDate) {
      this._selectedDate = new Date();
    }
    this._selectedDate.setHours(hour);
    this._selectedDate.setMinutes(minute);
    this._input.value = _formatDateTime(this._selectedDate);
    this.onChange(this._selectedDate);
  }

  destroy(): void {
    document.removeEventListener('click', this._onClickOutside);
    document.removeEventListener('keydown', this._onKeyDown);
    this._element.remove();
    if (this._calendar) {
      this._calendar.destroy();
    }
    if (this._clock) {
      this._clock.destroy();
    }
    // & nullify
    // @ts-ignore
    this._element = null;
    // @ts-ignore
    this._input = null;
    // @ts-ignore
    this._popup = null;
    // @ts-ignore
    this.onChange = null;
    // @ts-ignore
    this._onClickOutside = null;
    // @ts-ignore
    this._onKeyDown = null;
    // @ts-ignore
    this._calendar = null;
    // @ts-ignore
    this._clock = null;
  }
}
