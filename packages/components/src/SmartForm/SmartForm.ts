import { div } from '@tenilla/core';
import { input, label, textarea } from '../h-alias.js';
import { row, col, type GridColSpan } from '../Grid/Grid.js';
import { Select, type SelectOption } from './Select.js';
import { CheckboxGroup, type CheckboxOption } from './CheckboxGroup.js';
import { RadioGroup, type RadioOption } from './RadioGroup.js';
import './SmartForm.css';

interface FormValueMap {
  textarea: string;
  string: string;
  number: number;
  boolean: boolean;
  checkboxes: any[];
  radios: any;
  select: any;
}

interface EntryBase {
  name: string;
  label: string;

  /**
   * Width in 12-column grid units. Defaults to 12 (full row).
   * Layout is handled by the Grid component.
   */
  span?: GridColSpan;

  /** Fires when the entry value changes through user interaction. */
  onChange?: (value: any, entry: GenericFormItem) => void;
}

/** A row of the form: entries are laid out side by side, one row per line. */
type NormalFormType = 'string' | 'number' | 'boolean';

interface FormEntry<T extends NormalFormType = NormalFormType> extends EntryBase {
  type: T;
  value?: FormValueMap[T];
}

interface FormEntryTextArea extends EntryBase {
  type: 'textarea';
  value?: string;
}

interface FormEntrySelect extends EntryBase {
  type: 'select';
  options: readonly SelectOption[];
  value?: any;
}

interface FormEntryCheckboxGroup extends EntryBase {
  type: 'checkboxes';
  options: readonly CheckboxOption[];
  value?: any[];
}

interface FormEntryRadioGroup extends EntryBase {
  type: 'radios';
  options: readonly RadioOption[];
  value?: any;
}

type FormSchemaEntry =
  | FormEntry
  | FormEntryTextArea
  | FormEntrySelect
  | FormEntryCheckboxGroup
  | FormEntryRadioGroup;

/** A row of the form: entries are laid out side by side, one row per line. */
interface FormRow<TEntry extends FormSchemaEntry = FormSchemaEntry> {
  row: readonly TEntry[];
}

type UnionToIntersection<T> = (T extends unknown ? (value: T) => void : never) extends (
  value: infer TResult,
) => void
  ? TResult
  : never;

type Simplify<T> = { [K in keyof T]: T[K] } & {};

type FormEntryValue<TEntry> = TEntry extends { type: 'string' | 'textarea' }
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
            : never;

type FormCollectEntry<TEntry> = TEntry extends { name: infer TName extends string }
  ? { [K in TName]: FormEntryValue<TEntry> }
  : never;

type FormCollectRow<TRow> = TRow extends { row: readonly (infer TEntry)[] }
  ? FormCollectEntry<TEntry>
  : never;

type FormCollectResult<TRows extends readonly FormRow[]> = Simplify<
  UnionToIntersection<FormCollectRow<TRows[number]>>
>;

type GenericFormItem =
  | (FormEntry & { el: HTMLDivElement })
  | (FormEntryTextArea & { el: HTMLDivElement })
  | (FormEntrySelect & { el: HTMLDivElement })
  | (FormEntryCheckboxGroup & { el: HTMLDivElement })
  | (FormEntryRadioGroup & { el: HTMLDivElement });

export class SmartForm<const TRows extends readonly FormRow[] = readonly FormRow[]> {
  /** @internal */
  private static index: number = 1;

  /** @internal */
  private readonly _element: HTMLDivElement;
  /** @internal */
  private readonly _rows: Array<Array<GenericFormItem>> = [];

  constructor(rows: TRows) {
    this._element = div('tenilla-sf-wrapper');
    this._rows = Array.from({ length: rows.length }, () => []);

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i].row;
      const rowData = this._rows[i];

      for (const o of r) {
        const fire = (v: any) => o.onChange?.(v, item as GenericFormItem);
        let item: GenericFormItem;

        switch (o.type) {
          case 'string':
            {
              const inputEl = input('tenilla-sf-input')
                .attrs({ value: o.value })
                .on('input', () => fire(inputEl.value));
              item = {
                ...o,
                el: div('tenilla-sf-item').child(label('tenilla-sf-item-label', o.label), inputEl),
                get value() {
                  return inputEl.value;
                },
                set value(v: string) {
                  inputEl.value = v;
                },
              };
            }
            break;

          case 'number':
            {
              const inputEl = input('tenilla-sf-input')
                .attrs({ type: 'number', value: o.value })
                .on('input', () => fire(inputEl.valueAsNumber));
              item = {
                ...o,
                el: div('tenilla-sf-item').child(label('tenilla-sf-item-label', o.label), inputEl),
                get value() {
                  return inputEl.valueAsNumber;
                },
                set value(v: number) {
                  inputEl.valueAsNumber = v;
                },
              };
            }
            break;

          case 'textarea':
            {
              const inputEl = textarea('tenilla-sf-textarea')
                .attr('value', o.value)
                .on('input', () => fire(inputEl.value));
              item = {
                ...o,
                el: div('tenilla-sf-item').child(label('tenilla-sf-item-label', o.label), inputEl),
                get value() {
                  return inputEl.value;
                },
                set value(v: string) {
                  inputEl.value = v;
                },
              };
            }
            break;

          case 'boolean':
            {
              const id = 'tenilla-sf-' + SmartForm.index++;
              const inputEl = input()
                .attrs({ type: 'checkbox', id, checked: o.value })
                .on('change', () => fire(inputEl.checked));
              item = {
                ...o,
                el: div('tenilla-sf-checkbox-wrapper').child(
                  inputEl,
                  label('tenilla-sf-checkbox-label', o.label).attr('for', id),
                ),
                get value() {
                  return inputEl.checked;
                },
                set value(v: boolean) {
                  inputEl.checked = v;
                },
              };
            }
            break;

          case 'select':
            {
              const comp = new Select({ options: o.options, value: o.value, onChange: fire });
              item = {
                ...o,
                el: div('tenilla-sf-item').child(
                  label('tenilla-sf-item-label', o.label),
                  comp.element,
                ),
                get value() {
                  return comp.value;
                },
                set value(v: any) {
                  comp.value = v;
                },
              };
            }
            break;

          case 'checkboxes':
            {
              const comp = new CheckboxGroup({
                options: o.options,
                value: o.value,
                onChange: fire,
              });
              item = {
                ...o,
                el: div('tenilla-sf-item tenilla-sf-item-group').child(
                  label('tenilla-sf-item-label', o.label),
                  comp.element,
                ),
                get value() {
                  return comp.value;
                },
                set value(v: any[]) {
                  comp.value = v;
                },
              };
            }
            break;

          case 'radios':
            {
              const comp = new RadioGroup({ options: o.options, value: o.value, onChange: fire });
              item = {
                ...o,
                el: div('tenilla-sf-item tenilla-sf-item-group').child(
                  label('tenilla-sf-item-label', o.label),
                  comp.element,
                ),
                get value() {
                  return comp.value;
                },
                set value(v: any) {
                  comp.value = v;
                },
              };
            }
            break;

          // TODO 这里要增加三种时间组件
          default:
            // @ts-ignore
            console.warn(`Unsupported form entry type: ${o.type}`);
            continue;
        }

        rowData.push(item);
      }

      this._element.child(row(...rowData.map((v) => col(v.span ?? 12, v.el))));
    }
  }

  get element(): HTMLDivElement {
    return this._element;
  }

  /** Find an entry by its `name`. */
  entry(name: string): GenericFormItem | undefined {
    for (const row of this._rows) {
      for (const item of row) {
        if (item.name === name) return item;
      }
    }
    return undefined;
  }

  collect(): FormCollectResult<TRows> {
    const result: Record<string, unknown> = {};
    for (const row of this._rows) {
      for (const input of row) {
        result[input.name] = input.value;
      }
    }
    return result as FormCollectResult<TRows>;
  }

  destroy(): void {
    for (const row of this._rows) {
      for (const input of row) {
        input.el.remove();
      }
    }
    this._element.remove();
    // nullify
    // @ts-ignore
    this._element = null;
    // @ts-ignore
    this._rows = null;
  }
}
