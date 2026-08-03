import { _formatTime, _pad, div } from '@tenilla/core';
import { input, span, TenillaInput } from '../common.js';
import './TimePicker.css';

export interface TimePickerOptions {
  /** Initial time value (Date object, HH:MM string, or {hour, minute}) */
  value?: Date | string | { hour: number; minute: number } | null;
  /** Time format: '24h' or '12h' */
  format?: '24h' | '12h';
  /** Step interval for minutes */
  minuteStep?: number;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the picker is disabled */
  disabled?: boolean;
  /** Callback when time is selected */
  onChange?: (hour: number, minute: number) => void;
  /** Custom CSS class */
  customClass?: string;
}

export class TimePicker extends TenillaInput {
  /** @internal */
  protected readonly _element: HTMLElement;
  /** @internal */
  private readonly _input: HTMLInputElement;
  /** @internal */
  private readonly _popup: HTMLElement;
  /** @internal */
  private _hour: number;
  /** @internal */
  private _minute: number;
  /** @internal */
  private _isOpen: boolean = false;
  /** @internal */
  private _minuteStep: number;
  /** @internal */
  private _onChange: (hour: number, minute: number) => void;
  /** @internal */
  private _clock: ClockControls;
  /** @internal */
  private _onClickOutside: (e: Event) => void;
  /** @internal */
  private _onKeyDown: (e: KeyboardEvent) => void;

  /** @internal */
  private _disabled: boolean = false;

  constructor(options: TimePickerOptions = {}) {
    super();
    this._onChange = options.onChange ?? (() => {});
    this._disabled = options.disabled || false;
    this._minuteStep = options.minuteStep || 1;

    if (options.value) {
      if (options.value instanceof Date) {
        this._hour = options.value.getHours();
        this._minute = options.value.getMinutes();
      } else if (typeof options.value === 'string') {
        const [h, m] = options.value.split(':').map(Number);
        this._hour = h;
        this._minute = m;
      } else {
        this._hour = options.value.hour;
        this._minute = options.value.minute;
      }
    } else {
      const now = new Date();
      this._hour = now.getHours();
      this._minute = now.getMinutes();
    }

    this._element = div(
      `tenilla-timepicker ${options.customClass ?? ''} ${this._disabled ? 'tenilla-disabled' : ''}`,
    ).child(
      (this._input = input('tenilla-timepicker-input')
        .attrs({
          placeholder: options.placeholder,
          readonly: true,
          value: _formatTime(this._hour, this._minute),
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
      options.format || '24h',
      this._minuteStep,
      (h, m) => this._onTimeSelected(h, m),
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

  get value(): { hour: number; minute: number } {
    return { hour: this._hour, minute: this._minute };
  }

  set value(value: Date | string | { hour: number; minute: number } | null) {
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

  setValue(value: Date | string | { hour: number; minute: number } | null): this {
    if (value === null) {
      this._input.value = '';
    } else {
      if (value instanceof Date) {
        this._hour = value.getHours();
        this._minute = value.getMinutes();
      } else if (typeof value === 'string') {
        const [h, m] = value.split(':').map(Number);
        this._hour = h;
        this._minute = m;
      } else {
        this._hour = value.hour;
        this._minute = value.minute;
      }
      this._input.value = _formatTime(this._hour, this._minute);
    }
    if (this._clock) {
      this._clock.update(this._hour, this._minute);
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
      this._clock.update(this._hour, this._minute);
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
  private _onTimeSelected(hour: number, minute: number): void {
    this._hour = hour;
    this._minute = minute;
    this._input.value = _formatTime(hour, minute);
    this._onChange(hour, minute);
  }

  destroy(): void {
    document.removeEventListener('click', this._onClickOutside);
    document.removeEventListener('keydown', this._onKeyDown);
    this._element.remove();
    this._clock.destroy();
    // nullify
    // @ts-ignore
    this._element = null;
    // @ts-ignore
    this._input = null;
    // @ts-ignore
    this._popup = null;
    // @ts-ignore
    this._onChange = null;
    // @ts-ignore
    this._onClickOutside = null;
    // @ts-ignore
    this._onKeyDown = null;
    // @ts-ignore
    this._clock = null;
  }

  /**
   * Create a clock selector element (shared with DateTimePicker).
   * @internal
   */
  static _createClock(
    container: HTMLElement,
    hour: number,
    minute: number,
    format: '24h' | '12h',
    minuteStep: number,
    onSelect: (hour: number, minute: number) => void,
  ): ClockControls {
    const clock = new Clock(hour, minute, format, minuteStep, onSelect);
    container.child(clock.element);
    return clock;
  }
}

class Clock implements ClockControls {
  /** @internal */
  private readonly _element: HTMLElement;
  /** @internal */
  private readonly _hourGrid: HTMLDivElement;
  /** @internal */
  private readonly _minuteGrid: HTMLDivElement;
  /** @internal */
  private readonly _minuteStep: number;
  /** @internal */
  private readonly _onSelect: (hour: number, minute: number) => void;
  /** @internal */
  private _selectedHour: number;
  /** @internal */
  private _selectedMinute: number;
  /** @internal */
  private _format: '24h' | '12h';

  constructor(
    hour: number,
    minute: number,
    format: '24h' | '12h',
    minuteStep: number,
    onSelect: (hour: number, minute: number) => void,
  ) {
    this._format = format;
    this._selectedHour = hour;
    this._selectedMinute = minute;
    this._minuteStep = minuteStep;
    this._onSelect = onSelect;

    this._element = div('tenilla-clock').child(
      div('tenilla-clock-section').child(
        span('tenilla-clock-label', 'Hour'),
        (this._hourGrid = div('tenilla-clock-grid')),
      ),
      div('tenilla-clock-section').child(
        span('tenilla-clock-label', 'Minute'),
        (this._minuteGrid = div('tenilla-clock-grid')),
      ),
    );
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
          this._onSelect(this._selectedHour, this._selectedMinute);
        }),
      );
    }
  }

  /** @internal */
  private _renderMinutes(): void {
    this._minuteGrid.innerHTML = '';
    for (let m = 0; m < 60; m += this._minuteStep) {
      const displayMinute = m;
      let cls = 'tenilla-clock-cell';
      if (m === this._selectedMinute) cls += ' tenilla-selected';

      this._minuteGrid.child(
        span(cls, _pad(m)).on('click', (e: Event) => {
          e.stopPropagation();
          this._selectedMinute = displayMinute;
          this._renderMinutes();
          this._onSelect(this._selectedHour, this._selectedMinute);
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

  update(h: number, m: number) {
    this._selectedHour = h;
    this._selectedMinute = m;
    this._renderHours();
    this._renderMinutes();
  }

  destroy() {
    this._element.remove();
    // @ts-ignore
    this._element = null;
    // @ts-ignore
    this._hourGrid = null;
    // @ts-ignore
    this._minuteGrid = null;
    // @ts-ignore
    this._onSelect = null;
  }
}

export interface ClockControls {
  format: '24h' | '12h';
  update: (hour: number, minute: number) => void;
  destroy: () => void;
}
