import { _noop, div, type OnChange, TenillaInput, type Validator } from '@tenilla/core';
import { input, label, li, ul } from '../common.js';
import type { SelectOption } from '../Select/Select.js';
import type { SmartForm } from '../SmartForm/SmartForm.js';
import './FilterSelect.css';

export type { SelectOption };

export interface FilterSelectArgs<T = any> {
  name?: string;
  options: readonly SelectOption<T>[];
  /** Currently selected value. Falls back to the first enabled option. */
  value?: T;
  /** Floating label text. Omit to skip the label. */
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  /**
   * Custom filter function.
   * Defaults to case-insensitive prefix match on the option label.
   */
  filter?: (option: SelectOption<T>, query: string) => boolean;
  /** Fires whenever the user picks an option. */
  onChange?: OnChange<T | undefined>;
  /** Custom validator. Return `true` or an error string. */
  validator?: Validator<T | undefined>;
  /** Extra class names appended to the wrapper. */
  customClass?: string;

  /** @internal */
  smartForm?: SmartForm;
}

/** Default filter: case-insensitive prefix match */
function defaultFilter<T>(option: SelectOption<T>, query: string): boolean {
  return option.label.toLowerCase().startsWith(query.toLowerCase());
}

/**
 * A filterable select (combobox / autocomplete).
 *
 * Typing in the input filters the dropdown options in real time.
 * Arrow keys navigate, Enter selects, Escape closes the dropdown.
 *
 * When `required` is true and no value is selected, the component
 * automatically applies the `.tenilla-invalid` class for visual feedback.
 */
export class FilterSelect<T = any> extends TenillaInput {
  protected _element: HTMLDivElement;
  /** @internal */
  private _input: HTMLInputElement;
  /** @internal */
  private _dropdown: HTMLUListElement;
  /** @internal */
  private _visibleItems: HTMLLIElement[] = [];

  private _value: T | undefined;
  private _options: readonly SelectOption<T>[] = [];
  private _filter: (option: SelectOption<T>, query: string) => boolean;
  /** Index of the currently highlighted item in `_visibleItems` */
  private _highlightIndex: number = -1;
  /** Whether the dropdown is open */
  private _open: boolean = false;

  constructor(args: FilterSelectArgs<T>) {
    super(args);
    this._value = args.value;
    this._filter = args.filter ?? defaultFilter;

    // ── Build DOM ──
    this._element = div(`tenilla-filter-select ${args.customClass ?? ''}`);

    // Input
    this._input = input('tenilla-filter-select-input')
      .attrs({
        placeholder: args.placeholder,
        disabled: args.disabled === true,
        autocomplete: 'off',
        spellcheck: false,
      })
      .on('input', () => this._onInput())
      .on('focus', () => this._openDropdown())
      .on('blur', () => {
        // Delay hide so click on item can register
        setTimeout(() => this._closeDropdown(), 150);
      })
      .on('keydown', (e: KeyboardEvent) => this._onKeydown(e));

    // Dropdown list
    this._dropdown = ul('tenilla-filter-select-dropdown').on('mousedown', (e: MouseEvent) => {
      // Prevent blur from firing before click completes
      e.preventDefault();
    });

    this._element.child(
      args.label !== undefined ? label('tenilla-input-label', args.label) : '',
      this._input,
      this._dropdown,
    );

    this.setOptions(args.options);
    this._initErrorEl();
  }

  // ── Public API ──

  get value(): T | undefined {
    return this._value;
  }

  set value(v: T | undefined) {
    if (Object.is(v, this._value)) return;
    this._value = v;
    this._syncInputFromValue();
    this._syncSelection();
  }

  get disabled(): boolean {
    return this._input.disabled;
  }

  set disabled(v: boolean) {
    this._input.disabled = v;
  }

  /** Current text in the input field. */
  get filterText(): string {
    return this._input.value;
  }

  /** Set the input text and re-filter. */
  set filterText(v: string) {
    this._input.value = v ?? '';
    this._filterItems();
  }

  /** Replace the option list. Keeps the current value if it still exists. */
  setOptions(options: readonly SelectOption<T>[]): this {
    this._options = options;
    this._filterItems();
    this.value = this._value; // re-sync
    return this;
  }

  /**
   * Set a specific option to disabled or enabled via value.
   * @param value matched by SameValueZero
   * @param disabled
   */
  setDisabled(value: any, disabled: boolean): this {
    for (const opt of this._options) {
      if (Object.is(opt.value, value)) {
        (opt as any).disabled = disabled;
        break;
      }
    }
    this._filterItems();
    return this;
  }

  remove(): void {
    this._element.remove();
    (this as any)._element = null;
    (this as any)._visibleItems = null;
    (this as any)._input = null;
    (this as any)._dropdown = null;
    (this as any)._options = null;
    this._value = undefined as any;
    (this as any).onChange = null;
  }

  // ── Internals ──

  /** @internal */
  private _onInput(): void {
    this._openDropdown();
    this._filterItems();
  }

  /** @internal */
  private _onKeydown(e: KeyboardEvent): void {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this._highlightNext(1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        this._highlightNext(-1);
        break;
      case 'Enter':
        e.preventDefault();
        if (this._open && this._highlightIndex >= 0) {
          const item = this._visibleItems[this._highlightIndex];
          if (item && !item.classList.contains('disabled')) {
            this._selectValue((item as any).__value);
          }
        }
        break;
      case 'Escape':
        e.preventDefault();
        this._closeDropdown();
        break;
    }
  }

  /** @internal */
  private _openDropdown(): void {
    if (this._open || this.disabled) return;
    this._open = true;
    this._dropdown.classList.add('open');
  }

  /** @internal */
  private _closeDropdown(): void {
    if (!this._open) return;
    this._open = false;
    this._highlightIndex = -1;
    this._dropdown.classList.remove('open');
  }

  /** @internal Rebuild the dropdown from `_options` based on current filter text. */
  private _filterItems(): void {
    const query = this._input.value;
    const filtered = this._options.filter((opt) => this._filter(opt, query));

    this._dropdown.innerHTML = '';
    this._visibleItems = [];

    if (filtered.length === 0) {
      const empty = li('tenilla-filter-select-empty');
      empty.textContent = '无匹配选项';
      this._dropdown.child(empty);
      return;
    }

    // Highlight matching substring in labels
    const lowerQuery = query.toLowerCase();
    for (const opt of filtered) {
      const item = li(`tenilla-filter-select-item${opt.disabled ? ' disabled' : ''}`);
      item.dataset.value = String(opt.value);

      // Highlight the matching part
      if (query) {
        const idx = opt.label.toLowerCase().indexOf(lowerQuery);
        if (idx >= 0) {
          const before = opt.label.slice(0, idx);
          const match = opt.label.slice(idx, idx + query.length);
          const after = opt.label.slice(idx + query.length);
          item.innerHTML = `${before}<mark>${match}</mark>${after}`;
        } else {
          item.textContent = opt.label;
        }
      } else {
        item.textContent = opt.label;
      }

      // Click to select
      item.addEventListener('mousedown', () => {
        if (!opt.disabled) {
          this._selectValue(opt.value);
        }
      });

      this._dropdown.child(item);

      // Store for value lookup
      (item as any).__value = opt.value;
      this._visibleItems.push(item);
    }

    // Reset highlight
    this._highlightIndex = -1;
  }

  /** @internal Move highlight up/down through visible items (skipping disabled). */
  private _highlightNext(direction: 1 | -1): void {
    const visible = this._visibleItems.filter((el) => !el.classList.contains('disabled'));
    if (visible.length === 0) return;

    // Remove current highlight
    if (this._highlightIndex >= 0 && this._visibleItems[this._highlightIndex]) {
      this._visibleItems[this._highlightIndex].classList.remove('highlighted');
    }

    let idx = visible.indexOf(this._visibleItems[this._highlightIndex]);
    if (idx < 0) idx = direction > 0 ? -1 : visible.length;

    idx += direction;
    if (idx < 0) idx = visible.length - 1;
    if (idx >= visible.length) idx = 0;

    this._highlightIndex = this._visibleItems.indexOf(visible[idx]);
    if (this._highlightIndex >= 0) {
      visible[idx].classList.add('highlighted');
      visible[idx].scrollIntoView({ block: 'nearest' });
    }
  }

  /** @internal Select a value, update input text, fire onChange. */
  private _selectValue(v: T): void {
    if (Object.is(v, this._value)) return;
    const old = this._value;
    this._value = v;
    this._syncInputFromValue();
    this._syncSelection();
    this._closeDropdown();
    this.onChange(this._value, old);
  }

  /** @internal Set input text from the currently selected option's label. */
  private _syncInputFromValue(): void {
    if (this._value === undefined) {
      this._input.value = '';
      return;
    }
    for (const opt of this._options) {
      if (Object.is(opt.value, this._value)) {
        this._input.value = opt.label;
        return;
      }
    }
    this._input.value = '';
  }

  /** @internal Mark the selected item in the dropdown. */
  private _syncSelection(): void {
    const items = this._dropdown.querySelectorAll('.tenilla-filter-select-item');
    items.forEach((el) => el.classList.remove('selected'));
    if (this._value === undefined) return;
    for (const el of this._visibleItems) {
      if (Object.is((el as any).__value, this._value)) {
        el.classList.add('selected');
        break;
      }
    }
  }
}

/**
 * Quick-create a FilterSelect and return its root element.
 *
 * @param className   Extra class appended to `tenilla-filter-select`.
 * @param label       Floating label text.
 * @param options     Option list (required).
 * @param value       Initially selected value.
 */
export function filterSelect<T = any>(
  className?: string,
  options?: readonly SelectOption<T>[],
  value?: T,
) {
  return new FilterSelect<T>({
    customClass: className,
    options: options ?? [],
    value,
  });
}
