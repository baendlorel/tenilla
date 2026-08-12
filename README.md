# Tenilla

[![npm version](https://img.shields.io/npm/v/tenilla)](https://www.npmjs.com/package/tenilla)
[![npm downloads](https://img.shields.io/npm/dm/tenilla)](https://www.npmjs.com/package/tenilla)
[![License](https://img.shields.io/npm/l/tenilla)](./LICENCE)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0%2B-blue)](https://www.typescriptlang.org/)
[![ESM](https://img.shields.io/badge/module-ESM-brightgreen)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)

> A lightweight browser DOM manipulation framework.

Tenilla manipulates the real DOM directly through a fluent chainable API — no virtual DOM, no reactive layer, no runtime scheduler. It gives you full control over the DOM while keeping your code clean and concise.

## Features

- **Fluent DOM creation** — `h()`, `hAlias()`, `svg()`, `mathml()` with full TypeScript tag name type inference
- **Chainable prototype extensions** — `.on()`, `.attr()`, `.child()`, `.css()`, `.tap()` on any DOM node
- **Built-in UI components** — 18 components: Modal, Pagination, Tooltip, SmartForm, TabPanel, DatePicker, TimePicker, DateTimePicker, Tree, TreePanel, Grid, Button, StringInput, NumberInput, TextArea, BooleanInput, Select, CheckboxGroup, RadioGroup
- **Zero runtime dependencies** — core and components depend only on each other
- **Pure ESM with tree-shaking support** — outputs `.mjs` artifacts with `.d.mts` type declarations
- **Import on demand** — each component has its own sub-path and accompanying CSS

## Installation

```bash
# Core DOM utilities (umbrella package)
npm install tenilla

# Or install core directly
npm install @tenilla/core

# Component library (requires @tenilla/core as a peer dependency)
npm install @tenilla/components
```

> **Note:** Tenilla is distributed as ESM. Your project should use `"type": "module"` or a compatible bundler.

## Quick Start

```ts
import { hAlias } from 'tenilla';

const [div, button, span] = hAlias('div,button,span');

document.body.append(
  div('container')
    .child(
      span('greeting', 'Hello, Tenilla!'),
      button('btn', 'Click me')
        .attr('type', 'button')
        .css({ padding: '8px 16px', cursor: 'pointer' })
        .on('click', () => alert('It works!')),
    ),
);
```

## Core API (`tenilla` / `@tenilla/core`)

### Element Creation

```ts
import { h, hAlias, div, option, checkbox } from 'tenilla';

// Create elements with h()
const el = h('section', 'card');            // <section class="card">
const withChild = h('div', 'wrapper', h('p', '', 'Hello'));

// hAlias — batch create typed creators from a comma-separated string
const [header, main, footer] = hAlias('header,main,footer');

// Built-in shortcut creators
const d = div('my-div');                    // equivalent to h('div', 'my-div')
const opt = option('val', 'Label', true);   // <option value="val" selected>Label</option>
const cb = checkbox('cb-class', false);     // <input type="checkbox" class="cb-class">
```

### SVG & MathML

```ts
import { svg, svgAlias, mathml, mathMLAlias } from 'tenilla';

const circle = svg('circle', { cx: '50', cy: '50', r: '40' });
const [rect, path] = svgAlias('rect,path');

const mi = mathml('mi', {}); // MathML element
```

### Chainable DOM Extensions

Tenilla extends native DOM prototypes for a fluent chainable API:

| Method | Target | Description |
|---|---|---|
| `.on(type, listener, options?)` | `Node` | Chainable `addEventListener` with typed event map |
| `.tap(fn)` | `Node` | Execute a side-effect callback, returns `this` |
| `.attr(name, value)` | `Element` | Chainable `setAttribute`; `undefined \| null \| false` removes the attribute |
| `.attrs(record)` | `Element` | Batch set attributes; `false` values are skipped |
| `.child(...nodes)` | `Element` | Chainable `append` |
| `.class(className, toggle?)` | `Element` | Chainable `classList.toggle` |
| `.classes(classNames)` | `Element` | Set `className` |
| `.styleText(text)` | `Element` | Set `style.cssText` |
| `.styles(styleObj)` | `Element` | `Object.assign` to `style` |
| `.styleProp(name, value)` | `Element` | Set a single CSS property |
| `.styleProps(record)` | `Element` | Batch set CSS properties |

```ts
div('card')
  .attr('role', 'article')
  .attrs({ 'data-id': '42', hidden: false })
  .styles({ display: 'flex', gap: '12px' })
  .child(h('h2', 'title', 'Card Title'))
  .on('click', (e) => console.log(e));
```

### Event Bus

```ts
import { SimpleEvent } from 'tenilla';

interface Events {
  change: [value: number];
  reset: [];
}

const bus = new SimpleEvent<Events>();

const handler = (v: number) => console.log(v);
bus.on('change', handler);
bus.emit('change', 42);
bus.off('change', handler);
```

### Date Utilities

```ts
import { _formatDate, _formatTime, _formatDateTime, _isSameDay, _pad } from 'tenilla';

_formatDate(new Date());      // '2026-08-02'
_formatTime(14, 30);         // '14:30'
_pad(5);                      // '05'
_isSameDay(dateA, dateB);     // boolean
```

### Component Base Classes

```ts
import { TenillaComponent, TenillaInput } from 'tenilla';

// All components extend TenillaComponent, providing element and destroy()
abstract class TenillaComponent {
  get element(): HTMLElement;
  abstract destroy(): void;
}

// Input components extend TenillaInput, adding name, value, disabled, onChange
abstract class TenillaInput extends TenillaComponent {
  abstract name: string;
  abstract get value(): any;
  abstract set value(v: any);
  abstract get disabled(): boolean;
  abstract set disabled(v: boolean);
}
```

## Components (`@tenilla/components`)

Each component is imported on demand via its sub-path:

```ts
import { Modal } from '@tenilla/components/Modal';
import '@tenilla/components/Modal.css';
```

### Form Input Components

Basic input components, usable independently of SmartForm:

```ts
import { StringInput } from '@tenilla/components/StringInput';
import { NumberInput } from '@tenilla/components/NumberInput';
import { TextArea } from '@tenilla/components/TextArea';
import { BooleanInput } from '@tenilla/components/BooleanInput';

const name = new StringInput({ label: 'Username', placeholder: 'Enter...', onChange: v => console.log(v) });
const age = new NumberInput({ label: 'Age', value: 18, onChange: v => console.log(v) });
const bio = new TextArea({ label: 'Bio', placeholder: 'Describe...', onChange: v => console.log(v) });
const active = new BooleanInput({ label: 'Active', value: true, onChange: v => console.log(v) });
```

### Selection Components

```ts
import { Select } from '@tenilla/components/Select';
import { CheckboxGroup } from '@tenilla/components/CheckboxGroup';
import { RadioGroup } from '@tenilla/components/RadioGroup';

const sel = new Select({ name: 'fruit', label: 'Select Fruit', value: 'apple', options: [...] });
sel.setOptions([...]);           // Replace options list
sel.setDisabled('durian', true); // Disable a single option
sel.disabled = true;             // Disable the entire control

const cg = new CheckboxGroup({ name: 'features', label: 'Select Features', value: ['grid'], options: [...] });
cg.checkAll();                   // Select all
cg.clear();                      // Clear all
cg.setOptions([...]);            // Replace options list

const rg = new RadioGroup({ name: 'theme', label: 'Theme', value: 'auto', options: [...] });
```

### SmartForm

Schema-driven form builder with support for dynamic array fields:

```ts
import { SmartForm } from '@tenilla/components/SmartForm';
import '@tenilla/components/SmartForm.css';

const form = new SmartForm([
  { name: 'username', label: 'Username', type: 'string', flexPercent: 50 },
  { name: 'age',      label: 'Age',      type: 'number', flexPercent: 50 },
  { name: 'bio',      label: 'Bio',      type: 'textarea', flexPercent: 100 },
  { name: 'role',     label: 'Role',     type: 'select',  flexPercent: 50, options: ['admin', 'editor'] },
  { name: 'active',   label: 'Active',   type: 'boolean', flexPercent: 50 },
  { name: 'tags',     label: 'Tags',     type: 'string-array', flexPercent: 100 },
]);

form.render(document.getElementById('form-host')!);
const values = form.collect(); // Record<string, any>
form.destroy();
```

Supported field types: `string`, `number`, `boolean`, `textarea`, `select`, `string-array`, `number-array`.

### Modal

Dialog-based modal component (with `<div>` backdrop fallback).

```ts
import { Modal, FormModal } from '@tenilla/components/Modal';
import '@tenilla/components/Modal.css';

const modal = new Modal({
  title: 'Confirm Action',
  body: someElement,
  size: 'lg',             // 'sm' | 'lg' | 'xl' | ''
  backdrop: true,
  keyboard: true,
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  showCancel: true,
  onConfirm: () => { /* return false to prevent closing */ },
  onHidden: () => console.log('closed'),
});

modal.show();
modal.setBody(newBody);
modal.hide();
modal.destroy();

// Static convenience methods
const confirmed: boolean = await Modal.confirm({ title: 'Delete?', body: 'This action cannot be undone.' });
await Modal.alert({ title: 'Notice', body: 'Operation completed.' });

// FormModal — specialized subclass for form workflows
const fm = new FormModal<MyData>({ /* ... */ });
fm.setData(initialData);
const data = fm.getData();
```

### Pagination

```ts
import { Pagination } from '@tenilla/components/Pagination';
import '@tenilla/components/Pagination.css';

const pager = new Pagination({
  element: document.getElementById('pager')!,
  currentPage: 1,
  totalItems: 200,
  pageSize: 20,
  showSizer: true,
  sizeOpts: [10, 20, 50],
  maxVisiblePages: 5,
  onChange: (page) => console.log('page', page),
  onSizeChange: (size) => console.log('size', size),
});

pager.changePage(3);
pager.update({ totalItems: 500 });
pager.destroy();
```

### Tooltip

Directional hover tooltip with Bootstrap-compatible variants.

```ts
import { Tooltip } from '@tenilla/components/Tooltip';
import '@tenilla/components/Tooltip.css';

const tip = new Tooltip(hostElement, 'Tooltip text', {
  direction: 'top',       // 'top' | 'bottom' | 'left' | 'right'
  variant: 'info',        // 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark'
  delay: 200,
  customClass: 'my-tip',
});

tip.setContent('Updated text');
tip.setDirection('bottom');
tip.setVariant('danger');
tip.destroy();
```

### TabPanel

Tab panel with top/left tab positions and theming.

```ts
import { TabPanel } from '@tenilla/components/TabPanel';
import '@tenilla/components/TabPanel.css';

const tabs = new TabPanel({
  position: 'top',          // 'top' | 'left'
  theme: 'primary',         // 'default' | 'primary' | 'success' | 'warning' | 'danger'
  size: 'normal',           // 'small' | 'normal' | 'large'
  bordered: true,
  activeId: 'tab-1',
  onChange: (id) => console.log('active:', id),
});

tabs.add({ id: 'tab-1', title: 'Overview', body: overviewEl });
tabs.add({ id: 'tab-2', title: 'Settings', body: settingsEl, closable: true });
tabs.setActive('tab-2');
tabs.setDisabled('tab-1', true);
tabs.setVisible('tab-2', false);
tabs.remove('tab-2');
tabs.clear();
tabs.destroy();
```

### Grid

12-column grid system.

```ts
import { container, row, col } from '@tenilla/components/Grid';
import '@tenilla/components/Grid.css';

const layout = container().child(
  row().child(
    col(6).child(h('div', 'card', 'Left Column')),
    col(6).child(h('div', 'card', 'Right Column')),
  ),
);
```

### Button

```ts
import { btn } from '@tenilla/components/Button';
import '@tenilla/components/Button.css';

const b = btn('primary', 'Click Me');
// Variants: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark'
```

### Date & Time Pickers

```ts
import { DatePicker } from '@tenilla/components/DatePicker';
import { TimePicker } from '@tenilla/components/TimePicker';
import { DateTimePicker } from '@tenilla/components/DateTimePicker';

// Date picker
const dp = new DatePicker({ value: '2026-08-02', placeholder: 'Select date', onChange: d => console.log(d) });
dp.setValue(new Date());

// Time picker
const tp = new TimePicker({ value: { hour: 14, minute: 30 }, format: '24h', minuteStep: 5, onChange: d => console.log(d) });

// Date-time picker
const dtp = new DateTimePicker({ value: new Date(), placeholder: 'Select date & time', onChange: d => console.log(d) });
```

### Tree

Collapsible tree control.

```ts
import { Tree } from '@tenilla/components/Tree';
import '@tenilla/components/Tree.css';

const tree = new Tree({
  data: [
    { id: '1', label: 'Node 1' },
    { id: '2', label: 'Node 2', expanded: true, children: [
      { id: '2-1', label: 'Child 1' },
    ]},
    { id: '3', label: 'Disabled Node', disabled: true },
  ],
  indent: '24px',           // Indent per level
  togglePosition: 'right',  // Arrow position: 'left' | 'right'
  onChange: (id, oldId) => console.log('selected', id),
  onToggle: (id, expanded) => console.log(id, expanded ? 'expanded' : 'collapsed'),
});

tree.expandAll();
tree.collapseAll();
tree.add({ id: 'new', label: 'New Node' });
tree.add({ id: 'child', label: 'Child Node' }, 'parent-id');
tree.remove('3');
tree.destroy();
```

### TreePanel

Layout component with a left Tree navigation and a right content area; body uses a lazy-loading function.

```ts
import { TreePanel } from '@tenilla/components/TreePanel';
import '@tenilla/components/TreePanel.css';

interface TreePanelData {
  id?: string | number | symbol;
  title?: string | number | symbol;
  body: () => HTMLElement;
  children?: TreePanelData[];
  disabled?: boolean;
  expanded?: boolean;
}

const panel = new TreePanel({
  data: [
    { title: 'Section 1', body: () => div('', 'Content 1') },
    { title: 'Section 2', body: () => div('', 'Content 2') },
  ],
  indent: '20px',
  togglePosition: 'left',  // or 'right'
  activeId: 'Section 1',
  onChange: (id) => console.log('selected', id),
});

panel.value = 'Section 2'; // Switch to a given item
panel.destroy();
```

## Package Structure

```
tenilla/                          # Monorepo root (pnpm workspace)
├── packages/
│   ├── tenilla/                  # Umbrella package — re-exports @tenilla/core
│   ├── core/                     # @tenilla/core — DOM utilities, prototype extensions, event bus, SVG/MathML
│   ├── components/               # @tenilla/components — UI component library (18 components)
│   └── document/                 # @tenilla/document — Vite-powered documentation site (private)
├── scripts/                      # Build and release automation
└── types/                        # Ambient type declarations
```

| Package | npm | Description |
|---|---|---|
| `tenilla` | [tenilla](https://www.npmjs.com/package/tenilla) | Umbrella package (re-exports `@tenilla/core`) |
| `@tenilla/core` | [@tenilla/core](https://www.npmjs.com/package/@tenilla/core) | Core DOM utilities and prototype extensions |
| `@tenilla/components` | [@tenilla/components](https://www.npmjs.com/package/@tenilla/components) | Built-in UI components (requires `@tenilla/core` as peer dependency) |

### Full Component List (18)

| Component | Sub-path | Description |
|---|---|---|
| **Modal** | `@tenilla/components/Modal` | Modal dialog (includes FormModal, static confirm/alert) |
| **Pagination** | `@tenilla/components/Pagination` | Pagination control |
| **Tooltip** | `@tenilla/components/Tooltip` | Directional hover tooltip |
| **SmartForm** | `@tenilla/components/SmartForm` | Schema-driven form builder |
| **TabPanel** | `@tenilla/components/TabPanel` | Tab panel |
| **DatePicker** | `@tenilla/components/DatePicker` | Date picker |
| **TimePicker** | `@tenilla/components/TimePicker` | Time picker |
| **DateTimePicker** | `@tenilla/components/DateTimePicker` | Date-time picker |
| **Grid** | `@tenilla/components/Grid` | 12-column grid system |
| **Button** | `@tenilla/components/Button` | Button |
| **StringInput** | `@tenilla/components/StringInput` | Text input |
| **NumberInput** | `@tenilla/components/NumberInput` | Number input |
| **TextArea** | `@tenilla/components/TextArea` | Multi-line textarea |
| **BooleanInput** | `@tenilla/components/BooleanInput` | Toggle (checkbox) |
| **Select** | `@tenilla/components/Select` | Dropdown selector |
| **CheckboxGroup** | `@tenilla/components/CheckboxGroup` | Multi-select group |
| **RadioGroup** | `@tenilla/components/RadioGroup` | Radio group |
| **Tree** | `@tenilla/components/Tree` | Tree control |
| **TreePanel** | `@tenilla/components/TreePanel` | Left tree nav + right content area |

## Development

```bash
# Install dependencies
pnpm install

# Run documentation site locally
pnpm dev

# Lint
pnpm lint

# Build all packages
pnpm build

# Release (patch version)
pnpm pub

# Release (minor / major version)
pnpm pubminor
pnpm pubmajor
```

## Build Requirements

- **Node.js** 18+
- **pnpm** 9+
- **TypeScript** 6.0+ (for consumers using types)

## License

[MIT](./LICENCE) — Copyright (c) 2026 kasukabe tsumugi