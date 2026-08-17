import { _formatDateTime, div, OnChange, TenillaInput } from '@tenilla/core';
import { input, label, span } from '../common.js';
import { DatePicker, type CalendarControls } from '../DatePicker/DatePicker.js';
import { TimePicker, type ClockControls } from '../TimePicker/TimePicker.js';
import './DateTimePicker.css';

export interface DateTimePickerArgs {
  name?: string;
  /** Initial datetime value (Date object or ISO string) */
  value?: Date | string | null;
  /** Floating label text. Omit to skip the label. */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the picker is disabled */
  disabled?: boolean;
  /** Callback when datetime is selected */
  onChange?: OnChange<Date | null>;
  /** Custom CSS class */
  customClass?: string;
}

export class DateTimePicker extends TenillaInput {
  protected _element: HTMLElement;
  /** @internal */
  private _input: HTMLInputElement;
  /** @internal */
  private _popup: HTMLElement;
  /** @internal */
  private _selectedDate: Date | null = null;
  /** @internal */
  private _viewYear: number;
  /** @internal */
  private _viewMonth: number;
  /** @internal */
  private _isOpen: boolean = false;
  /** @internal */
  private _calendar: CalendarControls | null = null;
  /** @internal */
  private _clock: ClockControls | null = null;
  /** @internal */
  private _onClickOutside: (e: Event) => void;
  /** @internal */
  private _onKeyDown: (e: KeyboardEvent) => void;

  /** @internal */
  private _disabled: boolean = false;

  name: string;

  protected onChange: OnChange<Date | null>;
  constructor(args: DateTimePickerArgs = {}) {
    super();
    this.name = args.name ?? '';
    this.onChange = args.onChange ?? (() => {});
    this._disabled = args.disabled || false;

    if (args.value) {
      this._selectedDate = typeof args.value === 'string' ? new Date(args.value) : args.value;
    }

    const now = this._selectedDate || new Date();
    this._viewYear = now.getFullYear();
    this._viewMonth = now.getMonth();

    this._element = div(
      `tenilla-datetimepicker ${args.customClass ?? ''} ${this._disabled ? 'tenilla-disabled' : ''}`,
    ).child(
      args.label ? label('tenilla-input-label', args.label) : '',
      (this._input = input('tenilla-datetimepicker-input')
        .attrs({
          placeholder: args.placeholder,
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
      this._clock.update(
        this._selectedDate.getHours(),
        this._selectedDate.getMinutes(),
        this._selectedDate.getSeconds(),
      );
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
      this._clock.update(
        this._selectedDate.getHours(),
        this._selectedDate.getMinutes(),
        this._selectedDate.getSeconds(),
      );
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
    const oldValue = this._selectedDate;
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
      this._clock.update(hour, minute, this._selectedDate?.getSeconds() ?? 0);
    }
    this.onChange(this._selectedDate, oldValue);
  }

  /** @internal */
  private _onTimeSelected(hour: number, minute: number): void {
    const oldValue = this._selectedDate;
    if (!this._selectedDate) {
      this._selectedDate = new Date();
    }
    this._selectedDate.setHours(hour);
    this._selectedDate.setMinutes(minute);
    this._input.value = _formatDateTime(this._selectedDate);
    this.onChange(this._selectedDate, oldValue);
  }

  remove(): void {
    document.removeEventListener('click', this._onClickOutside);
    document.removeEventListener('keydown', this._onKeyDown);
    this._element.remove();
    this._calendar?.destroy();
    this._clock?.destroy();
    this._element = anynull;
    this._input = anynull;
    this._popup = anynull;
    this._onClickOutside = anynull;
    this._onKeyDown = anynull;
    this._calendar = anynull;
    this._clock = anynull;
    this.onChange = anynull;
  }
}

/**
 * Quick-create a DateTimePicker and return its root element.
 *
 * @param className   Extra class appended to `tenilla-datetimepicker`.
 * @param label       Floating label text.
 * @param value       Initial datetime value (Date or ISO string).
 */
export function datetimePicker(
  className?: string,
  value?: Date | string | null,
) {
  return new DateTimePicker({ customClass: className, value });
}
