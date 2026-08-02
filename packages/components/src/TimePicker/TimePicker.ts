import { _formatTime, _pad, div } from '@tenilla/core';
import { input, span } from '../h-alias.js';
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

export interface ClockControls {
  update: (hour: number, minute: number) => void;
  destroy: () => void;
}

export class TimePicker {
  /** @internal */
  private _element: HTMLElement;
  /** @internal */
  private _input: HTMLInputElement;
  /** @internal */
  private _popup: HTMLElement;
  /** @internal */
  private _hour: number;
  /** @internal */
  private _minute: number;
  /** @internal */
  private _isOpen: boolean = false;
  /** @internal */
  private _format: '24h' | '12h';
  /** @internal */
  private _minuteStep: number;
  /** @internal */
  private _onChange: (hour: number, minute: number) => void;
  /** @internal */
  private _clockControls: ClockControls | null = null;
  /** @internal */
  private _onDocClick: (e: Event) => void;
  /** @internal */
  private _onKeyDown: (e: Event) => void;

  constructor(options: TimePickerOptions = {}) {
    this._onChange = options.onChange ?? (() => {});
    const customClass = options.customClass || '';
    const placeholder = options.placeholder || 'Select time';
    const disabled = options.disabled || false;
    this._format = options.format || '24h';
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

    this._element = div(`tenilla-timepicker ${customClass}`);

    this._input = input('tenilla-timepicker-input')
      .attr('type', 'text')
      .attr('placeholder', placeholder)
      .attr('readonly', '');

    this._input.value = _formatTime(this._hour, this._minute);
    if (disabled) {
      (this._input as any).disabled = true;
      this._element.classList.add('tenilla-disabled');
    }

    const icon = span('tenilla-timepicker-icon', '🕐');

    this._element.child(this._input, icon);

    this._popup = div('tenilla-timepicker-popup');
    this._clockControls = TimePicker._createClock(
      this._popup,
      this._hour,
      this._minute,
      this._format,
      this._minuteStep,
      (h, m) => this._onTimeSelected(h, m),
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

  get value(): { hour: number; minute: number } {
    return { hour: this._hour, minute: this._minute };
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
    if (this._clockControls) {
      this._clockControls.update(this._hour, this._minute);
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
    if (this._clockControls) {
      this._clockControls.update(this._hour, this._minute);
    }
  }

  close(): void {
    if (!this._isOpen) return;
    this._isOpen = false;
    this._popup.classList.remove('tenilla-open');
  }

  /** @internal */
  private _onTimeSelected(hour: number, minute: number): void {
    this._hour = hour;
    this._minute = minute;
    this._input.value = _formatTime(hour, minute);
    this.close();
    this._onChange(hour, minute);
  }

  destroy(): void {
    if (this._clockControls) {
      this._clockControls.destroy();
    }
    document.removeEventListener('click', this._onDocClick);
    document.removeEventListener('keydown', this._onKeyDown);
    this._element.remove();
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
    const clock = div('tenilla-clock');

    const hourSection = div('tenilla-clock-section');
    const minuteSection = div('tenilla-clock-section');

    const hourLabel = span('tenilla-clock-label', 'Hour');
    const minuteLabel = span('tenilla-clock-label', 'Minute');

    const hourGrid = div('tenilla-clock-grid');
    const minuteGrid = div('tenilla-clock-grid');

    let selectedHour = hour;
    let selectedMinute = minute;

    function renderHours(): void {
      hourGrid.innerHTML = '';
      const maxHour = format === '12h' ? 12 : 24;
      const startHour = format === '12h' ? 1 : 0;

      for (let h = startHour; h < maxHour; h++) {
        const displayHour = h;
        let cls = 'tenilla-clock-cell';
        if (h === selectedHour) cls += ' tenilla-selected';

        hourGrid.child(
          span(cls, String(h)).on('click', (e: Event) => {
            e.stopPropagation();
            selectedHour = displayHour;
            renderHours();
            onSelect(selectedHour, selectedMinute);
          }),
        );
      }
    }

    function renderMinutes(): void {
      minuteGrid.innerHTML = '';
      for (let m = 0; m < 60; m += minuteStep) {
        const displayMinute = m;
        let cls = 'tenilla-clock-cell';
        if (m === selectedMinute) cls += ' tenilla-selected';

        minuteGrid.child(
          span(cls, _pad(m)).on('click', (e: Event) => {
            e.stopPropagation();
            selectedMinute = displayMinute;
            renderMinutes();
            onSelect(selectedHour, selectedMinute);
          }),
        );
      }
    }

    renderHours();
    renderMinutes();

    hourSection.child(hourLabel, hourGrid);
    minuteSection.child(minuteLabel, minuteGrid);
    clock.child(hourSection, minuteSection);
    container.child(clock);

    return {
      update(h: number, m: number) {
        selectedHour = h;
        selectedMinute = m;
        renderHours();
        renderMinutes();
      },
      destroy() {
        container.innerHTML = '';
      },
    };
  }
}
