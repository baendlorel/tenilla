import { _pad, div, type OnChange, type Validator, TenillaInput, _noop } from '@tenilla/core';
import { input, label, span } from '../common.js';
import './TimePicker.css';

export type TimePrecision = 'hours' | 'minutes' | 'seconds';

export interface TimePickerArgs {
  name?: string;
  /** Initial time value (Date object, or HH:MM / HH:MM:SS string). */
  value?: Date | string | null;
  /** Floating label text. Omit to skip the label. */
  label?: string;
  /** Time format: '24h' or '12h'. */
  format?: '24h' | '12h';
  /**
   * How granular the picker is:
   * - `'hours'`   — only hour cells are shown.
   * - `'minutes'` — hour + minute cells (default).
   * - `'seconds'` — hour + minute + second cells.
   */
  precision?: TimePrecision;
  /** Step interval for minutes / seconds. */
  step?: number;
  /** Placeholder text. */
  placeholder?: string;
  /** Whether the picker is disabled. */
  disabled?: boolean;
  /** Fires whenever the user selects a new time. */
  onChange?: OnChange<Date>;
  validator?: Validator<Date>;
  /** Custom CSS class. */
  customClass?: string;
}

function formatTime(h: number, m: number, s: number, precision: TimePrecision): string {
  const base = `${_pad(h)}:${_pad(m)}`;
  return precision === 'seconds' ? `${base}:${_pad(s)}` : base;
}

function parseTimeValue(
  value: Date | string | null | undefined,
  precision: TimePrecision,
): { hour: number; minute: number; second: number } {
  if (value instanceof Date) {
    return { hour: value.getHours(), minute: value.getMinutes(), second: value.getSeconds() };
  }
  if (typeof value === 'string') {
    const parts = value.split(':').map(Number);
    return {
      hour: parts[0] ?? 0,
      minute: parts[1] ?? 0,
      second: precision === 'seconds' ? (parts[2] ?? 0) : 0,
    };
  }
  const now = new Date();
  return { hour: now.getHours(), minute: now.getMinutes(), second: now.getSeconds() };
}

export class TimePicker extends TenillaInput {
  protected _element: HTMLElement;
  /** @internal */
  private _input: HTMLInputElement;
  /** @internal */
  private _popup: HTMLElement;
  /** @internal */
  private _hour: number;
  /** @internal */
  private _minute: number;
  /** @internal */
  private _second: number;
  /** @internal */
  private _isOpen: boolean = false;
  /** @internal */
  private _precision: TimePrecision;
  /** @internal */
  private _step: number;
  /** @internal */
  private _clock: ClockControls;
  /** @internal */
  private _onClickOutside: (e: Event) => void;
  /** @internal */
  private _onKeyDown: (e: KeyboardEvent) => void;
  /** @internal */
  private _disabled: boolean = false;

  name: string;

  protected onChange: OnChange<Date>;
  protected validator: Validator<Date>;
  constructor(args: TimePickerArgs = {}) {
    super();
    this.name = args.name ?? '';
    this.onChange = args.onChange ?? (() => {});
    this.validator = args.validator ?? _noop;
    this._disabled = args.disabled || false;
    this._precision = args.precision ?? 'minutes';
    this._step = args.step || 1;

    const parsed = parseTimeValue(args.value, this._precision);
    this._hour = parsed.hour;
    this._minute = parsed.minute;
    this._second = parsed.second;

    this._element = div(
      `tenilla-timepicker ${args.customClass ?? ''} ${this._disabled ? 'tenilla-disabled' : ''}`,
    ).child(
      args.label ? label('tenilla-input-label', args.label) : '',
      (this._input = input('tenilla-timepicker-input')
        .attrs({
          placeholder: args.placeholder,
          readonly: true,
          value: formatTime(this._hour, this._minute, this._second, this._precision),
          disabled: this._disabled === true,
        })
        .on('click', (e: Event) => {
          e.stopPropagation();
          if (!this._disabled) {
            this.toggle();
          }
        })),
      span('tenilla-timepicker-icon', '🕐'),
      (this._popup = div('tenilla-timepicker-popup')),
    );

    this._clock = TimePicker._createClock(
      this._popup,
      this._hour,
      this._minute,
      this._second,
      args.format || '24h',
      this._precision,
      this._step,
      (h, m, s) => this._onTimeSelected(h, m, s),
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
    this._initErrorEl();
  }

  get element(): HTMLElement {
    return this._element;
  }

  /** The selected time as a Date with today's date and the picked H/M/S. */
  get value(): Date {
    const d = new Date();
    d.setHours(this._hour, this._minute, this._second, 0);
    return d;
  }

  set value(value: Date | string | null) {
    this.setValue(value);
  }

  set format(value: '24h' | '12h') {
    this._clock.format = value;
  }

  get format(): '24h' | '12h' {
    return this._clock.format;
  }

  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(v: boolean) {
    this._disabled = v;
    this._input.disabled = v;
    this._element.classList.toggle('tenilla-disabled', v);
  }

  get precision(): TimePrecision {
    return this._precision;
  }

  setValue(value: Date | string | null): this {
    if (value === null) {
      this._input.value = '';
    } else {
      const parsed = parseTimeValue(value, this._precision);
      this._hour = parsed.hour;
      this._minute = parsed.minute;
      this._second = parsed.second;
      this._input.value = formatTime(this._hour, this._minute, this._second, this._precision);
    }
    if (this._clock) {
      this._clock.update(this._hour, this._minute, this._second);
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
    if (this._clock) {
      this._clock.update(this._hour, this._minute, this._second);
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
  private _onTimeSelected(hour: number, minute: number, second: number): void {
    const oldValue = this.value;
    this._hour = hour;
    this._minute = minute;
    this._second = second;
    this._input.value = formatTime(hour, minute, second, this._precision);
    this.onChange(this.value, oldValue);
  }

  remove(): void {
    document.removeEventListener('click', this._onClickOutside);
    document.removeEventListener('keydown', this._onKeyDown);
    this._element.remove();
    this._clock.destroy();
    this._element = anynull;
    this._input = anynull;
    this._popup = anynull;
    this.onChange = anynull;
    this._onClickOutside = anynull;
    this._onKeyDown = anynull;
    this._clock = anynull;
  }

  /**
   * Create a clock selector element (shared with DateTimePicker).
   * @internal
   */
  static _createClock(
    container: HTMLElement,
    hour: number,
    minute: number,
    second: number,
    format: '24h' | '12h',
    precision: TimePrecision,
    step: number,
    onSelect: (hour: number, minute: number, second: number) => void,
  ): ClockControls {
    const clock = new Clock(hour, minute, second, format, precision, step, onSelect);
    container.child(clock.element);
    return clock;
  }
}

/**
 * Quick-create a TimePicker and return its root element.
 *
 * @param className   Extra class appended to `tenilla-timepicker`.
 * @param label       Floating label text.
 * @param value       Initial time value (Date or HH:MM string).
 * @param format      '24h' or '12h' (default '24h').
 */
export function timePicker(
  className?: string,
  value?: Date | string | null,
  format?: '24h' | '12h',
) {
  return new TimePicker({ customClass: className, value, format });
}

class Clock implements ClockControls {
  /** @internal */
  private _element: HTMLElement;
  /** @internal */
  private _hourGrid: HTMLDivElement;
  /** @internal */
  private _minuteGrid: HTMLDivElement | null;
  /** @internal */
  private _secondGrid: HTMLDivElement | null;
  /** @internal */
  private _precision: TimePrecision;
  /** @internal */
  private _step: number;
  /** @internal */
  private _onSelect: (hour: number, minute: number, second: number) => void;
  /** @internal */
  private _selectedHour: number;
  /** @internal */
  private _selectedMinute: number;
  /** @internal */
  private _selectedSecond: number;
  /** @internal */
  private _format: '24h' | '12h';

  constructor(
    hour: number,
    minute: number,
    second: number,
    format: '24h' | '12h',
    precision: TimePrecision,
    step: number,
    onSelect: (hour: number, minute: number, second: number) => void,
  ) {
    this._format = format;
    this._precision = precision;
    this._step = step;
    this._selectedHour = hour;
    this._selectedMinute = minute;
    this._selectedSecond = second;
    this._onSelect = onSelect;

    this._hourGrid = div('tenilla-clock-grid');
    this._element = div('tenilla-clock').child(
      div('tenilla-clock-section').child(span('tenilla-clock-label', 'Hour'), this._hourGrid),
    );

    if (precision === 'minutes' || precision === 'seconds') {
      this._minuteGrid = div('tenilla-clock-grid');
      this._element.child(
        div('tenilla-clock-section').child(span('tenilla-clock-label', 'Minute'), this._minuteGrid),
      );
    } else {
      this._minuteGrid = null;
    }

    if (precision === 'seconds') {
      this._secondGrid = div('tenilla-clock-grid');
      this._element.child(
        div('tenilla-clock-section').child(span('tenilla-clock-label', 'Second'), this._secondGrid),
      );
    } else {
      this._secondGrid = null;
    }
  }

  get element(): HTMLElement {
    return this._element;
  }

  /** @internal */
  private _renderHours(): void {
    this._hourGrid.innerHTML = '';
    const maxHour = this._format === '12h' ? 12 : 24;
    const startHour = this._format === '12h' ? 1 : 0;

    for (let h = startHour; h < maxHour; h++) {
      const displayHour = h;
      let cls = 'tenilla-clock-cell';
      if (h === this._selectedHour) cls += ' tenilla-selected';

      this._hourGrid.child(
        span(cls, String(h)).on('click', (e: Event) => {
          e.stopPropagation();
          this._selectedHour = displayHour;
          this._renderHours();
          this._onSelect(this._selectedHour, this._selectedMinute, this._selectedSecond);
        }),
      );
    }
  }

  /** @internal */
  private _renderMinutes(): void {
    if (!this._minuteGrid) return;
    this._minuteGrid.innerHTML = '';
    for (let m = 0; m < 60; m += this._step) {
      const displayMinute = m;
      let cls = 'tenilla-clock-cell';
      if (m === this._selectedMinute) cls += ' tenilla-selected';

      this._minuteGrid.child(
        span(cls, _pad(m)).on('click', (e: Event) => {
          e.stopPropagation();
          this._selectedMinute = displayMinute;
          this._renderMinutes();
          this._onSelect(this._selectedHour, this._selectedMinute, this._selectedSecond);
        }),
      );
    }
  }

  /** @internal */
  private _renderSeconds(): void {
    if (!this._secondGrid) return;
    this._secondGrid.innerHTML = '';
    for (let s = 0; s < 60; s += this._step) {
      const displaySecond = s;
      let cls = 'tenilla-clock-cell';
      if (s === this._selectedSecond) cls += ' tenilla-selected';

      this._secondGrid.child(
        span(cls, _pad(s)).on('click', (e: Event) => {
          e.stopPropagation();
          this._selectedSecond = displaySecond;
          this._renderSeconds();
          this._onSelect(this._selectedHour, this._selectedMinute, this._selectedSecond);
        }),
      );
    }
  }

  get format(): '24h' | '12h' {
    return this._format;
  }

  set format(value: '24h' | '12h') {
    if (value !== '24h' && value !== '12h') {
      throw new Error("Invalid format. Use '24h' or '12h'.");
    }
    this._format = value;
    this._renderHours();
  }

  update(h: number, m: number, s: number): void {
    this._selectedHour = h;
    this._selectedMinute = m;
    this._selectedSecond = s;
    this._renderHours();
    this._renderMinutes();
    this._renderSeconds();
  }

  destroy(): void {
    this._element.remove();
    this._element = anynull;
    this._hourGrid = anynull;
    this._minuteGrid = anynull;
    this._secondGrid = anynull;
    this._onSelect = anynull;
  }
}

export interface ClockControls {
  format: '24h' | '12h';
  update: (hour: number, minute: number, second: number) => void;
  destroy: () => void;
}
