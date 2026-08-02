import { _formatDateTime, div } from '@tenilla/core';
import { input, span } from '../h-alias.js';
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

export class DateTimePicker {
  /** @internal */
  _element: HTMLElement;
  /** @internal */
  _input: HTMLInputElement;
  /** @internal */
  _popup: HTMLElement;
  /** @internal */
  _selectedDate: Date | null = null;
  /** @internal */
  _viewYear: number;
  /** @internal */
  _viewMonth: number;
  /** @internal */
  private _isOpen: boolean = false;
  /** @internal */
  private _onChange: (date: Date | null) => void;
  /** @internal */
  private _calendarControls: any = null;
  /** @internal */
  private _clockControls: any = null;
  /** @internal */
  private _onDocClick: (e: Event) => void;
  /** @internal */
  private _onKeyDown: (e: Event) => void;

  constructor(options: DateTimePickerOptions = {}) {
    this._onChange = options.onChange ?? (() => {});
    const customClass = options.customClass || '';
    const placeholder = options.placeholder || 'Select date and time';
    const disabled = options.disabled || false;

    if (options.value) {
      this._selectedDate =
        typeof options.value === 'string' ? new Date(options.value) : options.value;
    }

    const now = this._selectedDate || new Date();
    this._viewYear = now.getFullYear();
    this._viewMonth = now.getMonth();

    this._element = div(`tenilla-datetimepicker ${customClass}`);

    this._input = input('tenilla-datetimepicker-input')
      .attr('type', 'text')
      .attr('placeholder', placeholder)
      .attr('readonly', '');

    if (this._selectedDate) {
      this._input.value = _formatDateTime(this._selectedDate);
    }
    if (disabled) {
      (this._input as any).disabled = true;
      this._element.classList.add('tenilla-disabled');
    }

    const icon = span('tenilla-datetimepicker-icon', '📅🕐');

    this._element.child(this._input, icon);

    this._popup = div('tenilla-datetimepicker-popup');

    const calendarSection = div('tenilla-datetime-section');
    const clockSection = div('tenilla-datetime-section');

    // Reuse DatePicker's calendar logic
    this._calendarControls = DatePicker._createCalendar(
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
    this._clockControls = TimePicker._createClock(
      clockSection,
      this._selectedDate?.getHours() ?? new Date().getHours(),
      this._selectedDate?.getMinutes() ?? new Date().getMinutes(),
      '24h',
      1,
      (h, m) => this._onTimeSelected(h, m),
    );

    this._popup.child(calendarSection, clockSection);
    this._element.child(this._popup);

    this._input.on('click', (e: Event) => {
      e.stopPropagation();
      if (!disabled) this.toggle();
    });

    this._onDocClick = (e: Event) => {
      if (!this._element.contains(e.target as Node)) {
        this.close();
      }
    };
    this._onKeyDown = (e: Event) => {
      if ((e as KeyboardEvent).key === 'Escape') this.close();
    };
    document.addEventListener('click', this._onDocClick);
    document.addEventListener('keydown', this._onKeyDown);
  }

  get element(): HTMLElement {
    return this._element;
  }

  get value(): Date | null {
    return this._selectedDate;
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
    if (this._calendarControls) {
      this._calendarControls.update(this._selectedDate);
    }
    if (this._clockControls && this._selectedDate) {
      this._clockControls.update(this._selectedDate.getHours(), this._selectedDate.getMinutes());
    }
    return this;
  }

  toggle(): void {
    this._isOpen ? this.close() : this.open();
  }

  open(): void {
    if (this._isOpen) return;
    this._isOpen = true;
    this._popup.classList.add('tenilla-open');
    if (this._calendarControls) {
      this._calendarControls.update(this._selectedDate);
    }
    if (this._clockControls && this._selectedDate) {
      this._clockControls.update(this._selectedDate.getHours(), this._selectedDate.getMinutes());
    }
  }

  close(): void {
    if (!this._isOpen) return;
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
    if (this._clockControls) {
      this._clockControls.update(hour, minute);
    }
    this._onChange(this._selectedDate);
  }

  /** @internal */
  private _onTimeSelected(hour: number, minute: number): void {
    if (!this._selectedDate) {
      this._selectedDate = new Date();
    }
    this._selectedDate.setHours(hour);
    this._selectedDate.setMinutes(minute);
    this._input.value = _formatDateTime(this._selectedDate);
    this._onChange(this._selectedDate);
  }

  destroy(): void {
    if (this._calendarControls) {
      this._calendarControls.destroy();
    }
    if (this._clockControls) {
      this._clockControls.destroy();
    }
    document.removeEventListener('click', this._onDocClick);
    document.removeEventListener('keydown', this._onKeyDown);
    this._element.remove();
  }
}
