import { div, h, input, button } from '@tenilla/shared';

interface ValueMap {
  textarea: string;
  string: string;
  number: number;
  boolean: boolean;
  'string-array': string[];
  'number-array': number[];
  select: any;
}

interface FormEntry<
  T extends 'string' | 'number' | 'boolean' | 'string-array' | 'number-array' =
    | 'string'
    | 'number'
    | 'boolean'
    | 'string-array'
    | 'number-array',
> {
  name: string;
  label: string;
  type: T;

  /**
   * This component's width percentage per row
   */
  flexPercent: number;
  value?: ValueMap[T];
}

interface FormEntryTextArea {
  name: string;
  label: string;
  type: 'textarea';

  /**
   * This component's width percentage per row
   */
  flexPercent: number;
  value?: string;
}

interface FormEntrySelect {
  name: string;
  label: string;
  type: 'select';
  options: Array<{ label: string; value: any }>;
  /**
   * This component's width percentage per row
   */
  flexPercent: number;
  value?: any;
}

export class SmartForm {
  static index: number = 1;

  private _inputs: Array<
    | (FormEntry & { input: HTMLInputElement; el: HTMLDivElement })
    | (FormEntryTextArea & { input: HTMLTextAreaElement; el: HTMLDivElement })
    | (FormEntrySelect & { input: HTMLSelectElement; el: HTMLDivElement })
  > = [];

  constructor(options: Array<FormEntry | FormEntryTextArea | FormEntrySelect>) {
    for (let i = 0; i < options.length; i++) {
      const o = options[i];
      const id = 'tht-smart-form-' + SmartForm.index++;
      switch (o.type) {
        case 'string':
          {
            const wrapperEl = div('smart-form-item');
            const labelEl = h('label', 'smart-form-item-label', o.label).attr('for', id);
            const inputEl = input('smart-form-input').attr('type', 'text').attr('id', id);
            if (o.value !== undefined) inputEl.value = String(o.value);
            wrapperEl.child(labelEl, inputEl);
            this._inputs.push({
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
            const wrapperEl = div('smart-form-item');
            const labelEl = h('label', 'smart-form-item-label', o.label).attr('for', id);
            const inputEl = input('smart-form-input').attr('type', 'number').attr('id', id);
            if (o.value !== undefined) inputEl.valueAsNumber = o.value as number;
            wrapperEl.child(labelEl, inputEl);
            this._inputs.push({
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
            const wrapperEl = div('smart-form-item');
            const labelEl = h('label', 'smart-form-item-label', o.label).attr('for', id);
            const textareaEl = h('textarea', 'smart-form-textarea').attr('id', id);
            if (o.value !== undefined) textareaEl.value = o.value;
            wrapperEl.child(labelEl, textareaEl);
            this._inputs.push({
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
            const wrapperEl = div('smart-form-item');
            const labelEl = h('label', 'smart-form-item-label', o.label).attr('for', id);
            const selectEl = h('select', 'smart-form-select').attr('id', id);
            const optionEls = o.options.map((opt) =>
              h('option', '', opt.label).attr('value', opt.value),
            );
            selectEl.child(...optionEls);
            if (o.value !== undefined) selectEl.value = o.value;
            wrapperEl.child(labelEl, selectEl);
            this._inputs.push({
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
            const wrapperEl = div('smart-form-checkbox-wrapper');
            const inputEl = input().attr('type', 'checkbox').attr('id', id);
            if (o.value !== undefined) inputEl.checked = o.value as boolean;
            const labelEl = h('label', 'smart-form-checkbox-label', o.label).attr('for', id);
            wrapperEl.child(inputEl, labelEl);
            this._inputs.push({
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
            const containerEl = div('smart-form-item');
            const labelEl = h('label', 'smart-form-array-label', o.label);
            const innerWrapper = div('smart-form-array-wrapper');
            const itemsEl = div('smart-form-array-items');
            const addBtnEl = button('btn btn-primary smart-form-add-btn', '+ Add');
            const items: HTMLInputElement[] = [];
            const refreshItems = () => {
              itemsEl.innerHTML = '';
              for (const item of items) {
                const itemRow = div('smart-form-array-item');
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
            this._inputs.push({
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
            const containerEl = div('smart-form-item');
            const labelEl = h('label', 'smart-form-array-label', o.label);
            const innerWrapper = div('smart-form-array-wrapper');
            const itemsEl = div('smart-form-array-items');
            const addBtnEl = button('btn btn-primary smart-form-add-btn', '+ Add');
            const items: HTMLInputElement[] = [];
            const refreshItems = () => {
              itemsEl.innerHTML = '';
              for (const item of items) {
                const itemRow = div('smart-form-array-item');
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
            this._inputs.push({
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

        default:
          break;
      }
    }
  }

  collect(): Record<string, any> {
    const result: Record<string, any> = {};
    for (const input of this._inputs) {
      result[input.name] = input.value;
    }
    return result;
  }

  render(container: HTMLElement): void {
    container.classList.add('smart-form-wrapper');
    for (const input of this._inputs) {
      const row = div('').attr('style', `flex: 0 0 ${input.flexPercent}%`);
      row.child(input.el);
      container.child(row);
    }
  }
}

