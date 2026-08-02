import { div, h } from '@tenilla/core';
import { input, button } from '../h-alias.js';
import { row, col, type GridColSpan } from '../Grid/Grid.js';
import './SmartForm.css';

interface ValueMap {
  textarea: string;
  string: string;
  number: number;
  boolean: boolean;
  'string-array': string[];
  'number-array': number[];
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

interface FormEntry<
  T extends 'string' | 'number' | 'boolean' | 'string-array' | 'number-array' =
    | 'string'
    | 'number'
    | 'boolean'
    | 'string-array'
    | 'number-array',
> extends EntryBase {
  type: T;
  value?: ValueMap[T];
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
  | (FormEntry & { input: HTMLInputElement; el: HTMLDivElement })
  | (FormEntryTextArea & { input: HTMLTextAreaElement; el: HTMLDivElement })
  | (FormEntrySelect & { input: HTMLSelectElement; el: HTMLDivElement });

export class SmartForm {
  /** @internal */
  private static index: number = 1;

  /** @internal */
  private readonly _element: HTMLDivElement;
  /** @internal */
  private readonly _rows: Array<Array<GenericFormItem>> = [];

  constructor(rows: FormRow[]) {
    this._element = div('tenilla-smart-form-wrapper');
    this._rows = Array.from({ length: rows.length }, () => []);

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i].row;
      const rowData = this._rows[i];
      for (const o of r) {
        const id = 'tenilla-smart-form-' + SmartForm.index++;
        switch (o.type) {
          case 'string':
            {
              const wrapperEl = div('tenilla-smart-form-item');
              const labelEl = h('label', 'tenilla-smart-form-item-label', o.label).attr('for', id);
              const inputEl = input('tenilla-smart-form-input').attr('type', 'text').attr('id', id);
              if (o.value !== undefined) inputEl.value = String(o.value);
              wrapperEl.child(labelEl, inputEl);
              rowData.push({
                ...o,
                el: wrapperEl,
                input: inputEl,
                get value() {
                  return (this.input as HTMLInputElement).value;
                },
                set value(v: string) {
                  (this.input as HTMLInputElement).value = v ?? '';
                },
              });
            }
            break;

          case 'number':
            {
              const wrapperEl = div('tenilla-smart-form-item');
              const labelEl = h('label', 'tenilla-smart-form-item-label', o.label).attr('for', id);
              const inputEl = input('tenilla-smart-form-input')
                .attr('type', 'number')
                .attr('id', id);
              if (o.value !== undefined) inputEl.valueAsNumber = o.value as number;
              wrapperEl.child(labelEl, inputEl);
              rowData.push({
                ...o,
                el: wrapperEl,
                input: inputEl,
                get value() {
                  return (this.input as HTMLInputElement).valueAsNumber;
                },
                set value(v: number) {
                  (this.input as HTMLInputElement).valueAsNumber = v ?? 0;
                },
              });
            }
            break;

          case 'textarea':
            {
              const wrapperEl = div('tenilla-smart-form-item');
              const labelEl = h('label', 'tenilla-smart-form-item-label', o.label).attr('for', id);
              const textareaEl = h('textarea', 'tenilla-smart-form-textarea').attr('id', id);
              if (o.value !== undefined) textareaEl.value = o.value;
              wrapperEl.child(labelEl, textareaEl);
              rowData.push({
                ...o,
                el: wrapperEl,
                input: textareaEl,
                get value() {
                  return (this.input as HTMLTextAreaElement).value;
                },
                set value(v: string) {
                  (this.input as HTMLTextAreaElement).value = v ?? '';
                },
              });
            }
            break;

          case 'select':
            {
              const wrapperEl = div('tenilla-smart-form-item');
              const labelEl = h('label', 'tenilla-smart-form-item-label', o.label).attr('for', id);
              const selectEl = h('select', 'tenilla-smart-form-select').attr('id', id);
              const optionEls = o.options.map((opt) =>
                h('option', '', opt.label).attr('value', opt.value),
              );
              selectEl.child(...optionEls);
              if (o.value !== undefined) selectEl.value = o.value;
              wrapperEl.child(labelEl, selectEl);
              rowData.push({
                ...o,
                el: wrapperEl,
                input: selectEl,
                get value() {
                  return (this.input as HTMLSelectElement).value;
                },
                set value(v: any) {
                  (this.input as HTMLSelectElement).value = v ?? '';
                },
              });
            }
            break;

          case 'boolean':
            {
              const wrapperEl = div('tenilla-smart-form-checkbox-wrapper');
              const inputEl = input().attr('type', 'checkbox').attr('id', id);
              if (o.value !== undefined) inputEl.checked = o.value as boolean;
              const labelEl = h('label', 'tenilla-smart-form-checkbox-label', o.label).attr(
                'for',
                id,
              );
              wrapperEl.child(inputEl, labelEl);
              rowData.push({
                ...o,
                el: wrapperEl,
                input: inputEl,
                get value() {
                  return (this.input as HTMLInputElement).checked;
                },
                set value(v: boolean) {
                  (this.input as HTMLInputElement).checked = v;
                },
              });
            }
            break;

          case 'string-array':
            {
              const containerEl = div('tenilla-smart-form-item');
              const labelEl = h('label', 'tenilla-smart-form-array-label', o.label);
              const innerWrapper = div('tenilla-smart-form-array-wrapper');
              const itemsEl = div('tenilla-smart-form-array-items');
              const addBtnEl = button('btn btn-primary tenilla-smart-form-add-btn', '+ Add');
              const items: HTMLInputElement[] = [];
              const refreshItems = () => {
                itemsEl.innerHTML = '';
                for (const item of items) {
                  const itemRow = div('tenilla-smart-form-array-item');
                  const itemEl = input().attr('type', 'text');
                  itemEl.value = (item as HTMLInputElement).value;
                  const removeBtnEl = button('btn btn-danger btn-sm', '×');
                  removeBtnEl.on('click', () => {
                    const idx = items.indexOf(item);
                    if (idx > -1) items.splice(idx, 1);
                    refreshItems();
                  });
                  itemRow.child(itemEl, removeBtnEl);
                  itemsEl.child(itemRow);
                }
              };
              addBtnEl.on('click', () => {
                const newItem = input().attr('type', 'text');
                items.push(newItem);
                refreshItems();
              });
              innerWrapper.child(itemsEl, addBtnEl);
              containerEl.child(labelEl, innerWrapper);
              if (o.value !== undefined && Array.isArray(o.value)) {
                for (const val of o.value) {
                  const item = input().attr('type', 'text');
                  item.value = String(val);
                  items.push(item);
                }
              }
              refreshItems();
              rowData.push({
                ...o,
                el: containerEl,
                input: null as any,
                get value() {
                  return items.map((item) => item.value);
                },
                set value(v: string[]) {
                  items.length = 0;
                  if (Array.isArray(v)) {
                    for (const val of v) {
                      const item = input().attr('type', 'text');
                      item.value = String(val);
                      items.push(item);
                    }
                  }
                  refreshItems();
                },
              });
            }
            break;

          case 'number-array':
            {
              const containerEl = div('tenilla-smart-form-item');
              const labelEl = h('label', 'tenilla-smart-form-array-label', o.label);
              const innerWrapper = div('tenilla-smart-form-array-wrapper');
              const itemsEl = div('tenilla-smart-form-array-items');
              const addBtnEl = button('btn btn-primary tenilla-smart-form-add-btn', '+ Add');
              const items: HTMLInputElement[] = [];
              const refreshItems = () => {
                itemsEl.innerHTML = '';
                for (const item of items) {
                  const itemRow = div('tenilla-smart-form-array-item');
                  const itemEl = input().attr('type', 'number');
                  itemEl.valueAsNumber = Number((item as HTMLInputElement).value);
                  const removeBtnEl = button('btn btn-danger btn-sm', '×');
                  removeBtnEl.on('click', () => {
                    const idx = items.indexOf(item);
                    if (idx > -1) items.splice(idx, 1);
                    refreshItems();
                  });
                  itemRow.child(itemEl, removeBtnEl);
                  itemsEl.child(itemRow);
                }
              };
              addBtnEl.on('click', () => {
                const newItem = input().attr('type', 'number');
                items.push(newItem);
                refreshItems();
              });
              innerWrapper.child(itemsEl, addBtnEl);
              containerEl.child(labelEl, innerWrapper);
              if (o.value !== undefined && Array.isArray(o.value)) {
                for (const val of o.value) {
                  const item = input().attr('type', 'number');
                  item.valueAsNumber = Number(val);
                  items.push(item);
                }
              }
              refreshItems();
              rowData.push({
                ...o,
                el: containerEl,
                input: null as any,
                get value() {
                  return items.map((item) => item.valueAsNumber);
                },
                set value(v: number[]) {
                  items.length = 0;
                  if (Array.isArray(v)) {
                    for (const val of v) {
                      const item = input().attr('type', 'number');
                      item.valueAsNumber = Number(val);
                      items.push(item);
                    }
                  }
                  refreshItems();
                },
              });
            }
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
