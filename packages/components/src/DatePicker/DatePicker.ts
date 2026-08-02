import { _formatDate, _isSameDay, _split, div } from '@tenilla/core';
import { button, input, span } from '../h-alias.js';
import './DatePicker.css';

const DAY_NAMES = _split`Su,Mo,Tu,We,Th,Fr,Sa`;
const MONTH_NAMES = _split`January,February,March,April,May,June,July,August,September,October,November,December`;

export interface DatePickerOptions {
  /** Initial date value (Date object or YYYY-MM-DD string) */
  value?: Date | string | null;
  /** Date format for display */
  format?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the picker is disabled */
  disabled?: boolean;
  /** Callback when date is selected */
  onChange?: (date: Date | null) => void;
  /** Custom CSS class */
  customClass?: string;
}

export interface CalendarControls {
  update: (date: Date | null) => void;
  destroy: () => void;
}

export class DatePicker {
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
  private _calendarControls: CalendarControls | null = null;
  /** @internal */
  private _onDocClick: (e: Event) => void;
  /** @internal */
  private _onKeyDown: (e: Event) => void;

  constructor(options: DatePickerOptions = {}) {
    this._onChange = options.onChange ?? (() => {});
    const customClass = options.customClass || '';
    const placeholder = options.placeholder || 'Select date';
    const disabled = options.disabled || false;

    if (options.value) {
      this._selectedDate =
        typeof options.value === 'string' ? new Date(options.value) : options.value;
    }

    const now = this._selectedDate || new Date();
    this._viewYear = now.getFullYear();
    this._viewMonth = now.getMonth();

    this._element = div(`tenilla-datepicker ${customClass}`);

    this._input = input('tenilla-datepicker-input')
      .attr('type', 'text')
      .attr('placeholder', placeholder)
      .attr('readonly', '');

    if (this._selectedDate) {
      this._input.value = _formatDate(this._selectedDate);
    }
    if (disabled) {
      (this._input as any).disabled = true;
      this._element.classList.add('tenilla-disabled');
    }

    const icon = span('tenilla-datepicker-icon', '📅');

    this._element.child(this._input, icon);

    this._popup = div('tenilla-datepicker-popup');
    this._calendarControls = DatePicker._createCalendar(
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
      this._input.value = _formatDate(this._selectedDate);
      this._viewYear = this._selectedDate.getFullYear();
      this._viewMonth = this._selectedDate.getMonth();
    }
    if (this._calendarControls) {
      this._calendarControls.update(this._selectedDate);
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
  }

  close(): void {
    if (!this._isOpen) return;
    this._isOpen = false;
    this._popup.classList.remove('tenilla-open');
  }

  /** @internal */
  private _onDateSelected(date: Date): void {
    this._selectedDate = date;
    this._input.value = _formatDate(date);
    this.close();
    this._onChange(date);
  }

  destroy(): void {
    if (this._calendarControls) {
      this._calendarControls.destroy();
    }
    document.removeEventListener('click', this._onDocClick);
    document.removeEventListener('keydown', this._onKeyDown);
    this._element.remove();
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
    const header = div('tenilla-calendar-header');

    const prevYearBtn = button('tenilla-calendar-nav', '«').on('click', (e: Event) => {
      e.stopPropagation();
      viewYear--;
      onNavigate(viewYear, viewMonth);
      renderGrid();
    });

    const prevMonthBtn = button('tenilla-calendar-nav', '‹').on('click', (e: Event) => {
      e.stopPropagation();
      viewMonth--;
      if (viewMonth < 0) {
        viewMonth = 11;
        viewYear--;
      }
      onNavigate(viewYear, viewMonth);
      renderGrid();
    });

    const title = span('tenilla-calendar-title', `${MONTH_NAMES[viewMonth]} ${viewYear}`);

    const nextMonthBtn = button('tenilla-calendar-nav', '›').on('click', (e: Event) => {
      e.stopPropagation();
      viewMonth++;
      if (viewMonth > 11) {
        viewMonth = 0;
        viewYear++;
      }
      onNavigate(viewYear, viewMonth);
      renderGrid();
    });

    const nextYearBtn = button('tenilla-calendar-nav', '»').on('click', (e: Event) => {
      e.stopPropagation();
      viewYear++;
      onNavigate(viewYear, viewMonth);
      renderGrid();
    });

    header.child(prevYearBtn, prevMonthBtn, title, nextMonthBtn, nextYearBtn);

    const dayNames = div('tenilla-calendar-days');
    DAY_NAMES.forEach((name) => {
      dayNames.child(span('tenilla-calendar-day-name', name));
    });

    const grid = div('tenilla-calendar-grid');

    function renderGrid(): void {
      title.textContent = `${MONTH_NAMES[viewMonth]} ${viewYear}`;
      grid.innerHTML = '';

      const firstDay = new Date(viewYear, viewMonth, 1).getDay();
      const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
      const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();
      const today = new Date();

      // Previous month padding
      for (let i = firstDay - 1; i >= 0; i--) {
        const dayNum = prevMonthDays - i;
        const m = viewMonth - 1;
        const y = m < 0 ? viewYear - 1 : viewYear;
        const adjM = m < 0 ? 11 : m;
        grid.child(
          span('tenilla-calendar-date tenilla-other-month', String(dayNum)).on(
            'click',
            (e: Event) => {
              e.stopPropagation();
              onSelect(new Date(y, adjM, dayNum));
            },
          ),
        );
      }

      // Current month days
      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(viewYear, viewMonth, d);
        let cls = 'tenilla-calendar-date';
        if (selectedDate && _isSameDay(date, selectedDate)) cls += ' tenilla-selected';
        if (_isSameDay(date, today)) cls += ' tenilla-today';

        const dayNum = d;
        grid.child(
          span(cls, String(d)).on('click', (e: Event) => {
            e.stopPropagation();
            onSelect(new Date(viewYear, viewMonth, dayNum));
          }),
        );
      }

      // Next month padding (fill up to 42 cells = 6 rows)
      const totalCells = firstDay + daysInMonth;
      const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
      for (let i = 1; i <= remaining; i++) {
        const m = viewMonth + 1;
        const y = m > 11 ? viewYear + 1 : viewYear;
        const adjM = m > 11 ? 0 : m;
        grid.child(
          span('tenilla-calendar-date tenilla-other-month', String(i)).on('click', (e: Event) => {
            e.stopPropagation();
            onSelect(new Date(y, adjM, i));
          }),
        );
      }
    }

    renderGrid();
    container.child(header, dayNames, grid);

    return {
      update(date: Date | null) {
        selectedDate = date;
        if (date) {
          viewYear = date.getFullYear();
          viewMonth = date.getMonth();
          onNavigate(viewYear, viewMonth);
        }
        renderGrid();
      },
      destroy() {
        container.innerHTML = '';
      },
    };
  }
}
