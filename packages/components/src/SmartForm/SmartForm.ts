import { div } from '@tenilla/core';
import { label } from '../common.js';
import { row, col, type GridColSpan } from '../Grid/Grid.js';
import { StringInput } from '../StringInput/StringInput.js';
import { NumberInput } from '../NumberInput/NumberInput.js';
import { TextArea } from '../TextArea/TextArea.js';
import { BooleanInput } from '../BooleanInput/BooleanInput.js';
import { Select, type SelectOption } from '../Select/Select.js';
import { CheckboxGroup, type CheckboxOption } from '../CheckboxGroup/CheckboxGroup.js';
import { RadioGroup, type RadioOption } from '../RadioGroup/RadioGroup.js';
import '../StringInput/StringInput.css';
import '../NumberInput/NumberInput.css';
import '../TextArea/TextArea.css';
import '../BooleanInput/BooleanInput.css';
import '../Select/Select.css';
import '../CheckboxGroup/CheckboxGroup.css';
import '../RadioGroup/RadioGroup.css';
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

interface EntryComponent {
  readonly element: HTMLElement;
  value: any;
  destroy(): void;
}

interface FormItemBase {
  el: HTMLDivElement;
  rowIndex: number;
  destroy(): void;
}
type GenericFormItem =
  | (FormEntry & FormItemBase)
  | (FormEntryTextArea & FormItemBase)
  | (FormEntrySelect & FormItemBase)
  | (FormEntryCheckboxGroup & FormItemBase)
  | (FormEntryRadioGroup & FormItemBase);

export class SmartForm<const TRows extends readonly FormRow[] = readonly FormRow[]> {
  /** @internal */
  private readonly _element: HTMLDivElement;
  /** @internal */
  private readonly _entries: GenericFormItem[] = [];

  constructor(rows: TRows) {
    this._element = div('tenilla-sf-wrapper');
    this._entries = [];

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i].row;
      const rowData: GenericFormItem[] = [];

      for (let j = 0; j < r.length; j++) {
        const o = r[j];

        let item: GenericFormItem;
        const fire = (v: any) => o.onChange?.(v, item as GenericFormItem);

        // 1. Create the entry component; it owns the value lifecycle.
        let comp: EntryComponent;
        let groupStyle = false;
        switch (o.type) {
          case 'string':
            comp = new StringInput({ value: o.value as string | undefined, onChange: fire });
            break;
          case 'number':
            comp = new NumberInput({ value: o.value as number | undefined, onChange: fire });
            break;
          case 'textarea':
            comp = new TextArea({ value: o.value, onChange: fire });
            break;
          case 'boolean':
            comp = new BooleanInput({
              value: o.value as boolean | undefined,
              label: o.label,
              onChange: fire,
            });
            break;
          case 'select':
            comp = new Select({ options: o.options, value: o.value, onChange: fire });
            break;
          case 'checkboxes':
            comp = new CheckboxGroup({ options: o.options, value: o.value, onChange: fire });
            groupStyle = true;
            break;
          case 'radios':
            comp = new RadioGroup({ options: o.options, value: o.value, onChange: fire });
            groupStyle = true;
            break;
          // TODO 这里要增加三种时间组件
          default:
            // @ts-ignore
            console.warn(`Unsupported form entry type: ${o.type}`);
            continue;
        }

        // 2. Wrap the component uniformly; value/destroy delegate to it.
        item = {
          ...o,
          rowIndex: i,
          el:
            o.type === 'boolean'
              ? div('tenilla-sf-item tenilla-sf-item-boolean').child(comp.element)
              : div(`tenilla-sf-item${groupStyle ? ' tenilla-sf-item-group' : ''}`).child(
                  label('tenilla-sf-item-label', o.label),
                  comp.element,
                ),
          get value() {
            return comp.value;
          },
          set value(v: any) {
            comp.value = v;
          },
          destroy() {
            comp.destroy();

            // @ts-ignore
            item.el = null;
            // @ts-ignore
            item.onChange = null;
            // @ts-ignore
            item.options = null;
            // @ts-ignore
            comp = null;
          },
        };

        rowData.push(item);
      }

      this._entries.push(...rowData);
      this._element.child(row(...rowData.map((v) => col(v.span ?? 12, v.el))));
    }
  }

  get element(): HTMLDivElement {
    return this._element;
  }

  get value(): FormCollectResult<TRows> {
    const result: Record<string, unknown> = {};
    for (let i = 0; i < this._entries.length; i++) {
      result[this._entries[i].name] = this._entries[i].value;
    }
    return result as FormCollectResult<TRows>;
  }

  set value(v: FormCollectResult<TRows>) {
    for (let i = 0; i < this._entries.length; i++) {
      const e = this._entries[i];
      if (e.name in v) {
        e.value = v[e.name as keyof typeof v];
      }
    }
  }

  destroy(): void {
    for (let i = 0; i < this._entries.length; i++) {
      this._entries[i].destroy();
    }
    this._element.remove();
    // nullify
    // @ts-ignore
    this._element = null;
    // @ts-ignore
    this._entries = null;
  }
}
