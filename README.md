# Tenilla

[![npm version](https://img.shields.io/npm/v/tenilla)](https://www.npmjs.com/package/tenilla)
[![npm downloads](https://img.shields.io/npm/dm/tenilla)](https://www.npmjs.com/package/tenilla)
[![License](https://img.shields.io/npm/l/tenilla)](./LICENCE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8%2B-blue)](https://www.typescriptlang.org/)
[![ESM](https://img.shields.io/badge/module-ESM-brightgreen)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)

> A lightweight DOM manipulation framework for the browser.

Tenilla provides imperative, chainable helpers for creating and managing real DOM elements — no virtual DOM, no reactivity layer, no runtime scheduler. Build UIs with direct DOM control while keeping your code concise and expressive.

## Features

- **Fluent DOM creation** — `h()`, `hAlias()`, `svg()`, `mathml()` with full TypeScript tag-name inference
- **Chainable prototype extensions** — `.on()`, `.attr()`, `.child()`, `.css()`, `.tap()` on every DOM node
- **Pre-built UI components** — Modal, Pagination, Tooltip, SmartForm, TabPanel, DatePicker, TimePicker, DateTimePicker
- **Zero runtime dependencies** — core and components depend only on each other
- **ESM-only, tree-shakable** — ships `.mjs` bundles with `.d.mts` type declarations
- **On-demand component imports** — import only what you use; each component has co-located CSS

## Installation

```bash
# Core DOM helpers (umbrella package)
npm install tenilla

# Or install core directly
npm install @tenilla/core

# Component library (requires @tenilla/core as peer)
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

// hAlias — batch-create typed creators from a comma-separated string
const [header, main, footer] = hAlias('header,main,footer');

// Pre-built helpers
const d = div('my-div');                    // shortcut for h('div', 'my-div')
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

Tenilla extends native DOM prototypes to enable a fluent API:

| Method | Target | Description |
|---|---|---|
| `.on(type, listener, options?)` | `Node` | Chainable `addEventListener` with typed event maps |
| `.tap(fn)` | `Node` | Run a side-effect callback, return `this` |
| `.attr(name, value)` | `Element` | Chainable `setAttribute` |
| `.attrs(record)` | `Element` | Set multiple attributes; `false` values are skipped |
| `.child(...nodes)` | `Element` | Chainable `append` |
| `.cssText(text)` | `HTMLElement` | Set `style.cssText` |
| `.css(styleObj)` | `HTMLElement` | `Object.assign` onto `style` |

```ts
div('card')
  .attr('role', 'article')
  .attrs({ 'data-id': '42', hidden: false })
  .css({ display: 'flex', gap: '12px' })
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

Internal helpers (exported for convenience):

```ts
import { _formatDate, _formatTime, _formatDateTime, _isSameDay, _pad } from 'tenilla';

_formatDate(new Date());      // '2026-08-02'
_formatTime(new Date());      // '14:30'
_pad(5);                       // '05'
_isSameDay(dateA, dateB);     // boolean
```

## Components (`@tenilla/components`)

Each component is imported on-demand via its subpath:

```ts
import { Modal } from '@tenilla/components/Modal';
import '@tenilla/components/Modal.css';
```

### Modal

A dialog component built on `<dialog>` (with a `<div>` overlay fallback).

```ts
import { Modal } from '@tenilla/components/Modal';
import '@tenilla/components/Modal.css';

// Instance usage
const modal = new Modal({
  title: 'Confirm Action',
  body: someElement,
  size: 'lg',             // 'sm' | 'lg' | 'xl' | ''
  backdrop: true,
  keyboard: true,
  confirmText: 'Proceed',
  cancelText: 'Cancel',
  showCancel: true,
  onConfirm: () => {
    /* return false to prevent closing */
  },
  onHidden: () => console.log('closed'),
});

modal.show();
modal.setBody(newBody);
modal.hide();
modal.destroy();

// Static shortcuts
const confirmed: boolean = await Modal.confirm({
  title: 'Delete item?',
  body: 'This action cannot be undone.',
});

await Modal.alert({ title: 'Notice', body: 'Operation complete.' });
```

**FormModal** — a subclass for form-driven workflows:

```ts
import { FormModal } from '@tenilla/components/Modal';

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

const tip = new Tooltip(hostElement, 'Helpful hint', {
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

### SmartForm

Schema-driven form generator with dynamic array fields.

```ts
import { SmartForm } from '@tenilla/components/SmartForm';
import '@tenilla/components/SmartForm.css';

const form = new SmartForm([
  { name: 'username', label: 'Username', type: 'string', flexPercent: 50 },
  { name: 'age',      label: 'Age',      type: 'number', flexPercent: 50 },
  { name: 'bio',      label: 'Bio',      type: 'textarea', flexPercent: 100 },
  { name: 'role',     label: 'Role',     type: 'select',  flexPercent: 50,
    options: ['admin', 'editor', 'viewer'] },
  { name: 'active',   label: 'Active',   type: 'boolean', flexPercent: 50 },
  { name: 'tags',     label: 'Tags',     type: 'string-array', flexPercent: 100 },
]);

form.render(document.getElementById('form-host')!);
const values = form.collect(); // Record<string, any>
form.destroy();
```

Supported field types: `string`, `number`, `boolean`, `textarea`, `select`, `string-array`, `number-array`.

### TabPanel

Tabbed panels with top/left tab positions and theme support.

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

### DatePicker

Popup calendar for date selection.

```ts
import { DatePicker } from '@tenilla/components/DatePicker';
import '@tenilla/components/DatePicker.css';

const picker = new DatePicker({
  value: '2026-08-02',
  placeholder: 'Select a date',
  disabled: false,
  onChange: (date) => console.log(date),
});

document.body.append(picker.element);
picker.setValue(new Date());
picker.open();
picker.close();
picker.destroy();
```

### TimePicker

Popup clock with hour/minute grids, 12h/24h format support.

```ts
import { TimePicker } from '@tenilla/components/TimePicker';
import '@tenilla/components/TimePicker.css';

const picker = new TimePicker({
  value: { hour: 14, minute: 30 },
  format: '24h',            // '24h' | '12h'
  minuteStep: 5,
  placeholder: 'Select time',
  onChange: (date) => console.log(date),
});

document.body.append(picker.element);
picker.setValue('09:15');
picker.open();
picker.close();
picker.destroy();
```

### DateTimePicker

Combined calendar + clock popup.

```ts
import { DateTimePicker } from '@tenilla/components/DateTimePicker';
import '@tenilla/components/DateTimePicker.css';

const picker = new DateTimePicker({
  value: new Date(),
  placeholder: 'Select date & time',
  onChange: (date) => console.log(date),
});

document.body.append(picker.element);
picker.setValue('2026-08-02 14:30');
picker.open();
picker.close();
picker.destroy();
```

## Package Structure

```
tenilla/                          # monorepo root (pnpm workspace)
├── packages/
│   ├── tenilla/                  # umbrella package — re-exports @tenilla/core
│   ├── core/                     # @tenilla/core — DOM helpers, extensions, event bus, SVG/MathML
│   ├── components/               # @tenilla/components — UI component library
│   └── document/                 # @tenilla/document — Vite-powered docs site (private)
├── scripts/                      # build & publish automation
└── types/                        # ambient type declarations
```

| Package | npm | Description |
|---|---|---|
| `tenilla` | [tenilla](https://www.npmjs.com/package/tenilla) | Umbrella package (re-exports `@tenilla/core`) |
| `@tenilla/core` | [@tenilla/core](https://www.npmjs.com/package/@tenilla/core) | Core DOM helpers & prototype extensions |
| `@tenilla/components` | [@tenilla/components](https://www.npmjs.com/package/@tenilla/components) | Pre-built UI components (requires `@tenilla/core`) |

## Development

```bash
# Install dependencies
pnpm install

# Run the documentation site locally
pnpm dev

# Lint
pnpm lint

# Build all packages
pnpm build

# Publish (patch bump)
pnpm pub
```

## Requirements

- **Node.js** 18+
- **pnpm** 9+
- **TypeScript** 5.8+ (for consumers using types)

## License

[MIT](./LICENCE) — Copyright (c) 2026 kasukabe tsumugi
