import { div, h, option } from '@tenilla/core';
import { input, label, select, textarea } from '../h-alias.js';
import { row, col, type GridColSpan } from '../Grid/Grid.js';
import './SmartForm.css';

interface FormValueMap {
  textarea: string;
  string: string;
  number: number;
  boolean: boolean;
  checkboxes: string[];
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
}

/** A row of the form: entries are laid out side by side, one row per line. */
interface FormRow {
  row: Array<FormEntry | FormEntryTextArea | FormEntrySelect>;
}

type NormalFormType = 'string' | 'number' | 'boolean' | 'checkboxes' | 'radios';

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
  options: Array<{ label: string; value: any }>;
  value?: any;
}

type GenericFormItem =
  | (FormEntry & { el: HTMLDivElement })
  | (FormEntryTextArea & { el: HTMLDivElement })
  | (FormEntrySelect & { el: HTMLDivElement });

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
        const id = 'tenilla-sf-' + SmartForm.index++;
        switch (o.type) {
          case 'string':
            {
              let inputEl: HTMLInputElement;
              rowData.push({
                ...o,
                el: div('tenilla-sf-item').child(
                  label('tenilla-sf-item-label', o.label),
                  (inputEl = input('tenilla-sf-input').attrs({ value: o.value })),
                ),
                get value() {
                  return inputEl.value;
                },
                set value(v: string) {
                  inputEl.value = v;
                },
              });
            }
            break;

          case 'number':
            {
              let inputEl: HTMLInputElement;
              rowData.push({
                ...o,
                el: div('tenilla-sf-item').child(
                  label('tenilla-sf-item-label', o.label),
                  (inputEl = input('tenilla-sf-input').attrs({
                    type: 'number',
                    value: o.value,
                  })),
                ),
                get value() {
                  return inputEl.valueAsNumber;
                },
                set value(v: number) {
                  inputEl.valueAsNumber = v;
                },
              });
            }
            break;

          case 'textarea':
            {
              let inputEl: HTMLTextAreaElement;
              rowData.push({
                ...o,
                el: div('tenilla-sf-item').child(
                  label('tenilla-sf-item-label', o.label),
                  (inputEl = textarea('tenilla-sf-textarea').attr('value', o.value)),
                ),
                get value() {
                  return inputEl.value;
                },
                set value(v: string) {
                  inputEl.value = v;
                },
              });
            }
            break;
          case 'boolean':
            {
              let inputEl: HTMLInputElement;
              rowData.push({
                ...o,
                el: div('tenilla-sf-checkbox-wrapper').child(
                  (inputEl = input().attrs({ type: 'checkbox', id, checked: o.value })),
                  label('tenilla-sf-checkbox-label', o.label).attr('for', id),
                ),
                get value() {
                  return inputEl.checked;
                },
                set value(v: boolean) {
                  inputEl.checked = v;
                },
              });
            }
            break;
          case 'select':
            {
              let value: any = o.value;

              const options: HTMLOptionElement[] = o.options.map((opt, idx) =>
                option(idx, opt.label, value === opt.value).on('click', () => {
                  value = opt.value;
                  options.forEach((v) => (v.selected = false));
                  options[idx].selected = true;
                }),
              );
              rowData.push({
                ...o,
                el: div('tenilla-sf-item').child(
                  label('tenilla-sf-item-label', o.label),
                  select('tenilla-sf-select').child(...options),
                ),
                get value() {
                  return value;
                },
                set value(v: any) {
                  value = v;
                },
              });
            }
            break;

          case 'checkboxes':
            break;
          case 'radios':
            break;

          // TODO 这里要增加三种时间组件
          default:
            // @ts-ignore
            console.warn(`Unsupported form entry type: ${o.type}`);
            break;
        }
      }

      this._element.child(row(...rowData.map((v) => col(v.span ?? 12, v.el))));
    }
  }

  get element(): HTMLDivElement {
    return this._element;
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
