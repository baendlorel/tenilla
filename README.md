# Tenilla

[![npm version](https://img.shields.io/npm/v/tenilla)](https://www.npmjs.com/package/tenilla)
[![npm downloads](https://img.shields.io/npm/dm/tenilla)](https://www.npmjs.com/package/tenilla)
[![License](https://img.shields.io/npm/l/tenilla)](./LICENCE)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0%2B-blue)](https://www.typescriptlang.org/)
[![ESM](https://img.shields.io/badge/module-ESM-brightgreen)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)

> 一个轻量级浏览器 DOM 操作框架。

Tenilla 通过命令式的链式 API 直接操作真实 DOM — 无虚拟 DOM、无响应式层、无运行时调度器。在保持代码简洁的同时，让你对 DOM 拥有完全控制权。

## 特性

- **Fluent DOM 创建** — `h()`、`hAlias()`、`svg()`、`mathml()` 带完整的 TypeScript 标签名类型推导
- **链式原型扩展** — 在任意 DOM 节点上调用 `.on()`、`.attr()`、`.child()`、`.css()`、`.tap()`
- **预置 UI 组件** — 18 个组件：Modal、Pagination、Tooltip、SmartForm、TabPanel、DatePicker、TimePicker、DateTimePicker、Tree、TreePanel、Grid、Button、StringInput、NumberInput、TextArea、BooleanInput、Select、CheckboxGroup、RadioGroup
- **零运行时依赖** — core 和 components 仅依赖于彼此
- **纯 ESM，支持 tree-shaking** — 输出 `.mjs` 产物，附带 `.d.mts` 类型声明
- **按需导入组件** — 每个组件有独立子路径和配套 CSS

## 安装

```bash
# 核心 DOM 工具（伞包）
npm install tenilla

# 或直接安装 core
npm install @tenilla/core

# 组件库（需要 @tenilla/core 作为 peer 依赖）
npm install @tenilla/components
```

> **注意：** Tenilla 以 ESM 分发。你的项目应使用 `"type": "module"` 或兼容的打包工具。

## 快速开始

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

## 核心 API (`tenilla` / `@tenilla/core`)

### 元素创建

```ts
import { h, hAlias, div, option, checkbox } from 'tenilla';

// 使用 h() 创建元素
const el = h('section', 'card');            // <section class="card">
const withChild = h('div', 'wrapper', h('p', '', 'Hello'));

// hAlias — 从逗号分隔字符串批量创建类型化的创建器
const [header, main, footer] = hAlias('header,main,footer');

// 预置快捷创建器
const d = div('my-div');                    // 等价于 h('div', 'my-div')
const opt = option('val', 'Label', true);   // <option value="val" selected>Label</option>
const cb = checkbox('cb-class', false);     // <input type="checkbox" class="cb-class">
```

### SVG & MathML

```ts
import { svg, svgAlias, mathml, mathMLAlias } from 'tenilla';

const circle = svg('circle', { cx: '50', cy: '50', r: '40' });
const [rect, path] = svgAlias('rect,path');

const mi = mathml('mi', {}); // MathML 元素
```

### 链式 DOM 扩展

Tenilla 扩展了原生 DOM 原型以实现流畅的链式 API：

| 方法 | 目标 | 描述 |
|---|---|---|
| `.on(type, listener, options?)` | `Node` | 链式 `addEventListener`，带类型事件映射 |
| `.tap(fn)` | `Node` | 执行副作用回调，返回 `this` |
| `.attr(name, value)` | `Element` | 链式 `setAttribute`；`undefined \| null \| false` 时移除属性 |
| `.attrs(record)` | `Element` | 批量设置属性；`false` 值跳过 |
| `.child(...nodes)` | `Element` | 链式 `append` |
| `.class(className, toggle?)` | `Element` | 链式 `classList.toggle` |
| `.classes(classNames)` | `Element` | 设置 `className` |
| `.styleText(text)` | `Element` | 设置 `style.cssText` |
| `.styles(styleObj)` | `Element` | `Object.assign` 到 `style` |
| `.styleProp(name, value)` | `Element` | 设置单个 CSS 属性 |
| `.styleProps(record)` | `Element` | 批量设置 CSS 属性 |

```ts
div('card')
  .attr('role', 'article')
  .attrs({ 'data-id': '42', hidden: false })
  .styles({ display: 'flex', gap: '12px' })
  .child(h('h2', 'title', 'Card Title'))
  .on('click', (e) => console.log(e));
```

### 事件总线

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

### 日期工具

```ts
import { _formatDate, _formatTime, _formatDateTime, _isSameDay, _pad } from 'tenilla';

_formatDate(new Date());      // '2026-08-02'
_formatTime(14, 30);         // '14:30'
_pad(5);                      // '05'
_isSameDay(dateA, dateB);     // boolean
```

### 组件基类

```ts
import { TenillaComponent, TenillaInput } from 'tenilla';

// 所有组件继承 TenillaComponent，提供 element 和 destroy()
abstract class TenillaComponent {
  get element(): HTMLElement;
  abstract destroy(): void;
}

// 输入型组件继承 TenillaInput，增加 name、value、disabled、onChange
abstract class TenillaInput extends TenillaComponent {
  abstract name: string;
  abstract get value(): any;
  abstract set value(v: any);
  abstract get disabled(): boolean;
  abstract set disabled(v: boolean);
}
```

## 组件 (`@tenilla/components`)

每个组件通过子路径按需导入：

```ts
import { Modal } from '@tenilla/components/Modal';
import '@tenilla/components/Modal.css';
```

### 表单输入组件

基础输入组件，可独立于 SmartForm 使用：

```ts
import { StringInput } from '@tenilla/components/StringInput';
import { NumberInput } from '@tenilla/components/NumberInput';
import { TextArea } from '@tenilla/components/TextArea';
import { BooleanInput } from '@tenilla/components/BooleanInput';

const name = new StringInput({ label: '用户名', placeholder: '请输入...', onChange: v => console.log(v) });
const age = new NumberInput({ label: '年龄', value: 18, onChange: v => console.log(v) });
const bio = new TextArea({ label: '简介', placeholder: '请描述...', onChange: v => console.log(v) });
const active = new BooleanInput({ label: '启用', value: true, onChange: v => console.log(v) });
```

### 选择组件

```ts
import { Select } from '@tenilla/components/Select';
import { CheckboxGroup } from '@tenilla/components/CheckboxGroup';
import { RadioGroup } from '@tenilla/components/RadioGroup';

const sel = new Select({ name: 'fruit', label: '选择水果', value: 'apple', options: [...] });
sel.setOptions([...]);           // 替换选项列表
sel.setDisabled('durian', true); // 禁用单项
sel.disabled = true;             // 禁用整组

const cg = new CheckboxGroup({ name: 'features', label: '选择功能', value: ['grid'], options: [...] });
cg.checkAll();                   // 全选
cg.clear();                      // 清空
cg.setOptions([...]);            // 替换选项列表

const rg = new RadioGroup({ name: 'theme', label: '主题选择', value: 'auto', options: [...] });
```

### SmartForm

基于 schema 的表单生成器，支持动态数组字段：

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

支持的字段类型：`string`、`number`、`boolean`、`textarea`、`select`、`string-array`、`number-array`。

### Modal

基于 `<dialog>` 的弹窗组件（带 `<div>` 遮罩层降级）。

```ts
import { Modal, FormModal } from '@tenilla/components/Modal';
import '@tenilla/components/Modal.css';

const modal = new Modal({
  title: '确认操作',
  body: someElement,
  size: 'lg',             // 'sm' | 'lg' | 'xl' | ''
  backdrop: true,
  keyboard: true,
  confirmText: '确定',
  cancelText: '取消',
  showCancel: true,
  onConfirm: () => { /* 返回 false 阻止关闭 */ },
  onHidden: () => console.log('closed'),
});

modal.show();
modal.setBody(newBody);
modal.hide();
modal.destroy();

// 静态快捷方法
const confirmed: boolean = await Modal.confirm({ title: '删除？', body: '此操作不可撤销。' });
await Modal.alert({ title: '提示', body: '操作完成。' });

// FormModal — 表单工作流专用子类
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

方向性悬停提示，支持 Bootstrap 兼容的变体。

```ts
import { Tooltip } from '@tenilla/components/Tooltip';
import '@tenilla/components/Tooltip.css';

const tip = new Tooltip(hostElement, '提示信息', {
  direction: 'top',       // 'top' | 'bottom' | 'left' | 'right'
  variant: 'info',        // 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark'
  delay: 200,
  customClass: 'my-tip',
});

tip.setContent('更新的文本');
tip.setDirection('bottom');
tip.setVariant('danger');
tip.destroy();
```

### TabPanel

支持顶部/左侧标签位置和主题的标签面板。

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

tabs.add({ id: 'tab-1', title: '概览', body: overviewEl });
tabs.add({ id: 'tab-2', title: '设置', body: settingsEl, closable: true });
tabs.setActive('tab-2');
tabs.setDisabled('tab-1', true);
tabs.setVisible('tab-2', false);
tabs.remove('tab-2');
tabs.clear();
tabs.destroy();
```

### Grid

12 列栅格系统。

```ts
import { container, row, col } from '@tenilla/components/Grid';
import '@tenilla/components/Grid.css';

const layout = container().child(
  row().child(
    col(6).child(h('div', 'card', '左栏')),
    col(6).child(h('div', 'card', '右栏')),
  ),
);
```

### Button

```ts
import { btn } from '@tenilla/components/Button';
import '@tenilla/components/Button.css';

const b = btn('primary', '点击我');
// 变体: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark'
```

### 日期时间选择器

```ts
import { DatePicker } from '@tenilla/components/DatePicker';
import { TimePicker } from '@tenilla/components/TimePicker';
import { DateTimePicker } from '@tenilla/components/DateTimePicker';

// 日期选择器
const dp = new DatePicker({ value: '2026-08-02', placeholder: '选择日期', onChange: d => console.log(d) });
dp.setValue(new Date());

// 时间选择器
const tp = new TimePicker({ value: { hour: 14, minute: 30 }, format: '24h', minuteStep: 5, onChange: d => console.log(d) });

// 日期时间选择器
const dtp = new DateTimePicker({ value: new Date(), placeholder: '选择日期时间', onChange: d => console.log(d) });
```

### Tree

可折叠展开的树形控件。

```ts
import { Tree } from '@tenilla/components/Tree';
import '@tenilla/components/Tree.css';

const tree = new Tree({
  data: [
    { id: '1', label: '节点 1' },
    { id: '2', label: '节点 2', expanded: true, children: [
      { id: '2-1', label: '子节点 1' },
    ]},
    { id: '3', label: '禁用节点', disabled: true },
  ],
  indent: '24px',           // 每级缩进
  togglePosition: 'right',  // 箭头位置: 'left' | 'right'
  onChange: (id, oldId) => console.log('选中', id),
  onToggle: (id, expanded) => console.log(id, expanded ? '展开' : '折叠'),
});

tree.expandAll();
tree.collapseAll();
tree.add({ id: 'new', label: '新节点' });
tree.add({ id: 'child', label: '子节点' }, 'parent-id');
tree.remove('3');
tree.destroy();
```

### TreePanel

左侧 Tree 导航 + 右侧内容区的布局组件，body 使用懒加载函数。

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
    { title: 'Section 1', body: () => div('', '内容 1') },
    { title: 'Section 2', body: () => div('', '内容 2') },
  ],
  indent: '20px',
  togglePosition: 'left',  // 或 'right'
  activeId: 'Section 1',
  onChange: (id) => console.log('选中', id),
});

panel.value = 'Section 2'; // 切换到指定项
panel.destroy();
```

## 包结构

```
tenilla/                          # monorepo 根目录 (pnpm workspace)
├── packages/
│   ├── tenilla/                  # 伞包 — 重新导出 @tenilla/core
│   ├── core/                     # @tenilla/core — DOM 工具、原型扩展、事件总线、SVG/MathML
│   ├── components/               # @tenilla/components — UI 组件库（18 个组件）
│   └── document/                 # @tenilla/document — Vite 驱动的文档站点（私有）
├── scripts/                      # 构建和发布自动化
└── types/                        # 环境类型声明
```

| 包 | npm | 描述 |
|---|---|---|
| `tenilla` | [tenilla](https://www.npmjs.com/package/tenilla) | 伞包（重新导出 `@tenilla/core`） |
| `@tenilla/core` | [@tenilla/core](https://www.npmjs.com/package/@tenilla/core) | 核心 DOM 工具和原型扩展 |
| `@tenilla/components` | [@tenilla/components](https://www.npmjs.com/package/@tenilla/components) | 预置 UI 组件（需要 `@tenilla/core` 作为 peer 依赖） |

### 组件完整列表（18 个）

| 组件 | 子路径 | 描述 |
|---|---|---|
| **Modal** | `@tenilla/components/Modal` | 弹窗（含 FormModal、静态 confirm/alert） |
| **Pagination** | `@tenilla/components/Pagination` | 分页 |
| **Tooltip** | `@tenilla/components/Tooltip` | 方向性悬停提示 |
| **SmartForm** | `@tenilla/components/SmartForm` | Schema 驱动的表单生成器 |
| **TabPanel** | `@tenilla/components/TabPanel` | 标签面板 |
| **DatePicker** | `@tenilla/components/DatePicker` | 日期选择器 |
| **TimePicker** | `@tenilla/components/TimePicker` | 时间选择器 |
| **DateTimePicker** | `@tenilla/components/DateTimePicker` | 日期时间选择器 |
| **Grid** | `@tenilla/components/Grid` | 12 列栅格系统 |
| **Button** | `@tenilla/components/Button` | 按钮 |
| **StringInput** | `@tenilla/components/StringInput` | 文本输入 |
| **NumberInput** | `@tenilla/components/NumberInput` | 数字输入 |
| **TextArea** | `@tenilla/components/TextArea` | 多行文本 |
| **BooleanInput** | `@tenilla/components/BooleanInput` | 开关（复选框） |
| **Select** | `@tenilla/components/Select` | 下拉选择器 |
| **CheckboxGroup** | `@tenilla/components/CheckboxGroup` | 多选组 |
| **RadioGroup** | `@tenilla/components/RadioGroup` | 单选组 |
| **Tree** | `@tenilla/components/Tree` | 树形控件 |
| **TreePanel** | `@tenilla/components/TreePanel` | 左侧树导航 + 右侧内容区 |

## 开发

```bash
# 安装依赖
pnpm install

# 本地运行文档站点
pnpm dev

# 代码检查
pnpm lint

# 构建所有包
pnpm build

# 发布（patch 版本）
pnpm pub

# 发布（minor / major 版本）
pnpm pubminor
pnpm pubmajor
```

## 构建要求

- **Node.js** 18+
- **pnpm** 9+
- **TypeScript** 6.0+（供使用类型的消费者）

## 许可证

[MIT](./LICENCE) — Copyright (c) 2026 kasukabe tsumugi