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
interface FormRow {
  row: Array<FormEntry | FormEntryTextArea | FormEntrySelect | FormEntryGroup>;
}

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
  options: SelectOption[];
  value?: any;
}

interface FormEntryGroup extends EntryBase {
  type: 'checkboxes' | 'radios';
  options: CheckboxOption[] | RadioOption[];
  value?: any;
}

type GenericFormItem =
  | (FormEntry & { el: HTMLDivElement })
  | (FormEntryTextArea & { el: HTMLDivElement })
  | (FormEntrySelect & { el: HTMLDivElement })
  | (FormEntryGroup & { el: HTMLDivElement });

export class SmartForm {
  /** @internal */
  private static index: number = 1;

  /** @internal */
  private readonly _element: HTMLDivElement;
  /** @internal */
  private readonly _rows: Array<Array<GenericFormItem>> = [];

  constructor(rows: FormRow[]) {
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
                el: div('tenilla-sf-item').child(
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

  collect(): Record<string, any> {
    const result: Record<string, any> = {};
    for (const row of this._rows) {
      for (const input of row) {
        result[input.name] = input.value;
      }
    }
    return result;
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
