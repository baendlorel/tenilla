import { _formatDate, _isSameDay, _split, div, OnChange, TenillaInput } from '@tenilla/core';
import { button, input, label, span } from '../common.js';
import './DatePicker.css';

const DAY_NAMES = _split`Su,Mo,Tu,We,Th,Fr,Sa`;
const MONTH_NAMES = _split`January,February,March,April,May,June,July,August,September,October,November,December`;

export interface DatePickerArgs {
  name?: string;
  /** Initial date value (Date object or YYYY-MM-DD string) */
  value?: Date | string | null;
  /** Floating label text. Omit to skip the label. */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the picker is disabled */
  disabled?: boolean;
  /** Callback when date is selected */
  onChange?: OnChange<Date | null>;
  /** Custom CSS class */
  customClass?: string;
}

export interface CalendarControls {
  update: (date: Date | null) => void;
  destroy: () => void;
}

export class DatePicker extends TenillaInput {
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
  private _calendar: CalendarControls;
  /** @internal */
  private _onClickOutside: (e: Event) => void;
  /** @internal */
  private _onKeyDown: (e: KeyboardEvent) => void;

  /** @internal */
  private _disabled: boolean = false;

  name: string;

  protected onChange: OnChange<Date | null>;

  constructor(args: DatePickerArgs = {}) {
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
      `tenilla-datepicker ${args.customClass ?? ''} ${this._disabled ? 'tenilla-disabled' : ''}`,
    ).child(
      args.label ? label('tenilla-input-label', args.label) : '',
      (this._input = input('tenilla-datepicker-input')
        .attrs({
          placeholder: args.placeholder,
          readonly: true,
          value: this._selectedDate ? _formatDate(this._selectedDate) : '',
          disabled: this._disabled === true,
        })
        .on('click', (e: Event) => {
          e.stopPropagation();
          if (!this._disabled) {
            this.toggle();
          }
        })),
      span('tenilla-datepicker-icon', '📅'),
      (this._popup = div('tenilla-datepicker-popup')),
    );

    this._calendar = DatePicker._createCalendar(
      this._popup,
      this._viewYear,
      this._viewMonth,
      this._selectedDate,
      (date) => this._onDateSelected(date),
      (y, m) => {
        this._viewYear = y;
        this._viewMonth = m;
      },
    );

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
    if (value === null) {
      this._selectedDate = null;
      this._input.value = '';
    } else {
      this._selectedDate = typeof value === 'string' ? new Date(value) : value;
      this._input.value = _formatDate(this._selectedDate);
      this._viewYear = this._selectedDate.getFullYear();
      this._viewMonth = this._selectedDate.getMonth();
    }
    if (this._calendar) {
      this._calendar.update(this._selectedDate);
    }
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
    const oldValue = this._selectedDate;
    this._selectedDate = date;
    this._input.value = _formatDate(date);
    this.close();
    this.onChange(date, oldValue);
  }

  remove(): void {
    document.removeEventListener('click', this._onClickOutside);
    document.removeEventListener('keydown', this._onKeyDown);
    this._element.remove();
    this._calendar.destroy();
    this._element = anynull;
    this._input = anynull;
    this._popup = anynull;
    this.onChange = anynull;
    this._onClickOutside = anynull;
    this._onKeyDown = anynull;
    this._calendar = anynull;
  }

  /**
   * Create a calendar selector element (shared with DateTimePicker).
   * @internal
   */
  static _createCalendar(
    container: HTMLElement,
    viewYear: number,
    viewMonth: number,
    selectedDate: Date | null,
    onSelect: (date: Date) => void,
    onNavigate: (year: number, month: number) => void,
  ): CalendarControls {
    const calendar = new Calendar(viewYear, viewMonth, selectedDate, onSelect, onNavigate);
    container.child(calendar.element);
    return calendar;
  }
}

/**
 * Quick-create a DatePicker and return its root element.
 *
 * @param className   Extra class appended to `tenilla-datepicker`.
 * @param label       Floating label text.
 * @param value       Initial date value (Date or YYYY-MM-DD string).
 */
export function datePicker(
  className?: string,
  value?: Date | string | null,
) {
  return new DatePicker({ customClass: className, value });
}

class Calendar implements CalendarControls {
  /** @internal */
  private _element: HTMLElement;
  /** @internal */
  private _header: HTMLElement;
  /** @internal */
  private _title: HTMLElement;
  /** @internal */
  private _grid: HTMLDivElement;
  /** @internal */
  private _onSelect: (date: Date) => void;
  /** @internal */
  private _onNavigate: (year: number, month: number) => void;
  /** @internal */
  private _viewYear: number;
  /** @internal */
  private _viewMonth: number;
  /** @internal */
  private _selectedDate: Date | null;

  constructor(
    viewYear: number,
    viewMonth: number,
    selectedDate: Date | null,
    onSelect: (date: Date) => void,
    onNavigate: (year: number, month: number) => void,
  ) {
    this._viewYear = viewYear;
    this._viewMonth = viewMonth;
    this._selectedDate = selectedDate;
    this._onSelect = onSelect;
    this._onNavigate = onNavigate;

    this._header = div('tenilla-calendar-header');
    this._title = span(
      'tenilla-calendar-title',
      `${MONTH_NAMES[this._viewMonth]} ${this._viewYear}`,
    );
    this._grid = div('tenilla-calendar-grid');

    const prevYearBtn = button('tenilla-calendar-nav', '«').on('click', (e: Event) => {
      e.stopPropagation();
      this._viewYear--;
      this._onNavigate(this._viewYear, this._viewMonth);
      this._renderGrid();
    });

    const prevMonthBtn = button('tenilla-calendar-nav', '‹').on('click', (e: Event) => {
      e.stopPropagation();
      this._viewMonth--;
      if (this._viewMonth < 0) {
        this._viewMonth = 11;
        this._viewYear--;
      }
      this._onNavigate(this._viewYear, this._viewMonth);
      this._renderGrid();
    });

    const nextMonthBtn = button('tenilla-calendar-nav', '›').on('click', (e: Event) => {
      e.stopPropagation();
      this._viewMonth++;
      if (this._viewMonth > 11) {
        this._viewMonth = 0;
        this._viewYear++;
      }
      this._onNavigate(this._viewYear, this._viewMonth);
      this._renderGrid();
    });

    const nextYearBtn = button('tenilla-calendar-nav', '»').on('click', (e: Event) => {
      e.stopPropagation();
      this._viewYear++;
      this._onNavigate(this._viewYear, this._viewMonth);
      this._renderGrid();
    });

    this._header.child(prevYearBtn, prevMonthBtn, this._title, nextMonthBtn, nextYearBtn);

    const dayNames = div('tenilla-calendar-days');
    DAY_NAMES.forEach((name: string) => {
      dayNames.child(span('tenilla-calendar-day-name', name));
    });

    this._element = div('tenilla-calendar').child(this._header, dayNames, this._grid);

    this._renderGrid();
  }

  get element(): HTMLElement {
    return this._element;
  }

  /** @internal */
  private _renderGrid(): void {
    this._title.textContent = `${MONTH_NAMES[this._viewMonth]} ${this._viewYear}`;
    this._grid.innerHTML = '';

    const firstDay = new Date(this._viewYear, this._viewMonth, 1).getDay();
    const daysInMonth = new Date(this._viewYear, this._viewMonth + 1, 0).getDate();
    const prevMonthDays = new Date(this._viewYear, this._viewMonth, 0).getDate();
    const today = new Date();

    // Previous month padding
    for (let i = firstDay - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const m = this._viewMonth - 1;
      const y = m < 0 ? this._viewYear - 1 : this._viewYear;
      const adjM = m < 0 ? 11 : m;
      this._grid.child(
        span('tenilla-calendar-date tenilla-other-month', String(dayNum)).on(
          'click',
          (e: Event) => {
            e.stopPropagation();
            this._onSelect(new Date(y, adjM, dayNum));
          },
        ),
      );
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(this._viewYear, this._viewMonth, d);
      let cls = 'tenilla-calendar-date';
      if (this._selectedDate && _isSameDay(date, this._selectedDate)) cls += ' tenilla-selected';
      if (_isSameDay(date, today)) cls += ' tenilla-today';

      const dayNum = d;
      this._grid.child(
        span(cls, String(d)).on('click', (e: Event) => {
          e.stopPropagation();
          this._onSelect(new Date(this._viewYear, this._viewMonth, dayNum));
        }),
      );
    }

    // Next month padding (fill up to 42 cells = 6 rows)
    const totalCells = firstDay + daysInMonth;
    const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let i = 1; i <= remaining; i++) {
      const m = this._viewMonth + 1;
      const y = m > 11 ? this._viewYear + 1 : this._viewYear;
      const adjM = m > 11 ? 0 : m;
      this._grid.child(
        span('tenilla-calendar-date tenilla-other-month', String(i)).on('click', (e: Event) => {
          e.stopPropagation();
          this._onSelect(new Date(y, adjM, i));
        }),
      );
    }
  }

  update(date: Date | null): void {
    this._selectedDate = date;
    if (date) {
      this._viewYear = date.getFullYear();
      this._viewMonth = date.getMonth();
      this._onNavigate(this._viewYear, this._viewMonth);
    }
    this._renderGrid();
  }

  destroy(): void {
    this._element.remove();
    this._element = anynull;
    this._header = anynull;
    this._title = anynull;
    this._grid = anynull;
    this._onSelect = anynull;
    this._onNavigate = anynull;
  }
}
