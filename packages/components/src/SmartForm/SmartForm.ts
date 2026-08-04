import { _noop, div, TenillaInput, type UnionMulti, type OnChange } from '@tenilla/core';
import { row, col, type GridColSpan } from '../Grid/Grid.js';
import { StringInput } from '../StringInput/StringInput.js';
import { NumberInput } from '../NumberInput/NumberInput.js';
import { TextArea } from '../TextArea/TextArea.js';
import { BooleanInput } from '../BooleanInput/BooleanInput.js';
import { Select, type SelectOption } from '../Select/Select.js';
import { CheckboxGroup, type CheckboxOption } from '../CheckboxGroup/CheckboxGroup.js';
import { RadioGroup, type RadioOption } from '../RadioGroup/RadioGroup.js';
import { DatePicker } from '../DatePicker/DatePicker.js';
import { TimePicker } from '../TimePicker/TimePicker.js';
import { DateTimePicker } from '../DateTimePicker/DateTimePicker.js';
import '../StringInput/StringInput.css';
import '../NumberInput/NumberInput.css';
import '../TextArea/TextArea.css';
import '../BooleanInput/BooleanInput.css';
import '../Select/Select.css';
import '../CheckboxGroup/CheckboxGroup.css';
import '../RadioGroup/RadioGroup.css';
import '../DatePicker/DatePicker.css';
import '../TimePicker/TimePicker.css';
import '../DateTimePicker/DateTimePicker.css';
import './SmartForm.css';

interface FormValueMap {
  textarea: string;
  string: string;
  number: number;
  boolean: boolean;
  checkboxes: any[];
  radios: any;
  select: any;
  date: Date | null;
  time: Date;
  datetime: Date | null;
}

interface EntryBase {
  name: string;
  label: string;

  /**
   * Width in 12-column grid units. Defaults to 12 (full row).
   * Layout is handled by the Grid component.
   */
  colspan?: GridColSpan;

  /** Fires when the entry value changes through user interaction. */
  onChange?: (value: any) => void;
}

/** A row of the form: entries are laid out side by side, one row per line. */
type NormalFormType = 'string' | 'number' | 'boolean';

interface Entry<T extends NormalFormType = NormalFormType> extends EntryBase {
  type: T;
  value?: FormValueMap[T];
  placeholder?: string;
}

interface EntryTextArea extends EntryBase {
  type: 'textarea';
  value?: string;
  placeholder?: string;
}

interface EntrySelect extends EntryBase {
  type: 'select';
  options: readonly SelectOption[];
  value?: any;
}

interface EntryCheckboxGroup extends EntryBase {
  type: 'checkboxes';
  options: readonly CheckboxOption[];
  value?: any[];
}

interface EntryRadioGroup extends EntryBase {
  type: 'radios';
  options: readonly RadioOption[];
  value?: any;
}

interface EntryDatePicker extends EntryBase {
  type: 'date';
  value?: Date | string | null;
  placeholder?: string;
}

interface EntryTimePicker extends EntryBase {
  type: 'time';
  value?: Date | string | null;
  precision?: 'hours' | 'minutes' | 'seconds';
  step?: number;
  format?: '24h' | '12h';
  placeholder?: string;
}

interface EntryDateTimePicker extends EntryBase {
  type: 'datetime';
  value?: Date | string | null;
  placeholder?: string;
}

type EntrySchema =
  | Entry
  | EntryTextArea
  | EntrySelect
  | EntryCheckboxGroup
  | EntryRadioGroup
  | EntryDatePicker
  | EntryTimePicker
  | EntryDateTimePicker;

/** A row of the form: entries are laid out side by side, one row per line. */
interface FRow<TEntry extends EntrySchema = EntrySchema> {
  row: readonly TEntry[];
}

type UnionToIntersection<T> = (T extends unknown ? (value: T) => void : never) extends (
  value: infer TResult,
) => void
  ? TResult
  : never;

/**
 * This is for better IDE intellisense and type inference.
 */
type Simplify<T> = { [K in keyof T]: T[K] } & {};

type EntryValue<TEntry> = TEntry extends { type: 'string' | 'textarea' }
  ? string
  : TEntry extends { type: 'number' }
    ? number
    : TEntry extends { type: 'boolean' }
      ? boolean
      : TEntry extends { type: 'select'; options: readonly SelectOption[] }
        ? TEntry['options'][number]['value']
        : TEntry extends { type: 'checkboxes'; options: readonly CheckboxOption[] }
          ? Array<TEntry['options'][number]['value']>
          : TEntry extends { type: 'radios'; options: readonly RadioOption[] }
            ? TEntry['options'][number]['value']
            : TEntry extends { type: 'date' }
              ? Date | null
              : TEntry extends { type: 'time' }
                ? Date
                : TEntry extends { type: 'datetime' }
                  ? Date | null
                  : never;

type CollectedEntry<TEntry> = TEntry extends { name: infer TName extends string }
  ? { [K in TName]: EntryValue<TEntry> }
  : never;

type CollectedRow<TRow> = TRow extends { row: readonly (infer TEntry)[] }
  ? CollectedEntry<TEntry>
  : never;

type CollectedResult<TRows extends readonly FRow[]> = Simplify<
  UnionToIntersection<CollectedRow<TRows[number]>>
>;

export class SmartForm<const TRows extends readonly FRow[] = readonly FRow[]> extends TenillaInput {
  // not used
  name = '';

  /** @internal */
  protected _element: HTMLDivElement;
  /** @internal */
  private _inputs: TenillaInput[] = [];

  /** @internal */
  protected onChange: OnChange;

  private _value: any;

  constructor(rows: TRows, onChange?: (value: CollectedResult<TRows>) => void);
  constructor(rows: TRows, _onChange: (value: CollectedResult<TRows>) => void = _noop) {
    super();
    this._element = div('tenilla-sf-wrapper');
    this._inputs = [];
    this.onChange = () => {
      if (_onChange !== _noop) {
        _onChange(this.value);
      }
    };

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i].row;
      const rowEl = row();

      for (let j = 0; j < r.length; j++) {
        const {
          onChange: onChangeInComponent = _noop,
          colspan = 12,
          name,
          value,
          type,
          label,

          // special
          options,
          placeholder,
          precision,
          step,
          format,
        } = r[j] as UnionMulti<
          [
            Entry,
            EntryTextArea,
            EntrySelect,
            EntryCheckboxGroup,
            EntryRadioGroup,
            EntryDatePicker,
            EntryTimePicker,
            EntryDateTimePicker,
          ]
        >;

        const onChange =
          this.onChange === _noop
            ? onChangeInComponent
            : (v: any) => {
                onChangeInComponent(v);
                this.onChange(null, null);
              };

        // 1. Create the entry component; it owns the value lifecycle.
        let component: TenillaInput;
        switch (type) {
          case 'string':
            component = new StringInput({ name, value, placeholder, onChange });
            break;
          case 'number':
            component = new NumberInput({ name, value, onChange });
            break;
          case 'textarea':
            component = new TextArea({ name, value, placeholder, onChange });
            break;
          case 'boolean':
            component = new BooleanInput({ name, value, label, onChange });
            break;
          case 'select':
            component = new Select({ name, options, value, onChange });
            break;
          case 'checkboxes':
            component = new CheckboxGroup({ name, options, value, onChange });
            break;
          case 'radios':
            component = new RadioGroup({ name, options, value, onChange });
            break;
          case 'date':
            component = new DatePicker({ name, value, placeholder, onChange });
            break;
          case 'time':
            component = new TimePicker({
              name,
              value,
              precision,
              step,
              format,
              placeholder,
              onChange,
            });
            break;
          case 'datetime':
            component = new DateTimePicker({ name, value, placeholder, onChange });
            break;
          default:
            const _: never = type;
            throw new Error(`Unsupported form entry type: ${type}`);
        }

        rowEl.child(col(colspan, component.element));
        this._inputs.push(component);
      }
      this._element.child(rowEl);
    }

    // !check duplicated names
    const had = new Set<string>();
    const dup: string[] = [];
    for (let i = 0; i < this._inputs.length; i++) {
      const name = this._inputs[i].name;
      if (had.has(name)) {
        dup.push(name);
      } else {
        had.add(name);
      }
    }
    if (dup.length > 0) {
      throw new Error(`Duplicate entry names found in SmartForm: ${dup.join(', ')}`);
    }
  }

  get element(): HTMLDivElement {
    return this._element;
  }

  get value(): CollectedResult<TRows> {
    const result: Record<string, unknown> = {};
    for (let i = 0; i < this._inputs.length; i++) {
      result[this._inputs[i].name] = this._inputs[i].value;
    }
    return result as CollectedResult<TRows>;
  }

  set value(v: CollectedResult<TRows>) {
    for (let i = 0; i < this._inputs.length; i++) {
      const e = this._inputs[i];
      if (e.name in v) {
        e.value = v[e.name as keyof typeof v];
      }
    }
  }

  get disabled(): boolean {
    console.warn('SmartForm.disabled setter is not allowed; set each entry individually instead.');
    return false;
  }

  set disabled(_: boolean) {
    console.warn('SmartForm.disabled setter is not allowed; set each entry individually instead.');
  }

  destroy(): void {
    for (let i = 0; i < this._inputs.length; i++) {
      this._inputs[i].destroy();
    }
    this._inputs.length = 0;

    this._element.remove();
    this._element = anynull;
    this._inputs = anynull;
  }
}
