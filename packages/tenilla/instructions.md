# Tenilla 指南

  你最擅长写这种链式、函数式框架。这就是最适合你的！

## 核心编码规范

### 组件定义模式

所有组件都遵循 `class XXX` 的写法，在构造函数中完成 `this._element` 的定义，使用链式调用构建 DOM：

```ts
class MyComponent extends TenillaComponent {
  private _input: HTMLInputElement;
  private _button: HTMLButtonElement;

  constructor() {
    super();
    // 在构造函数中定义 this._element，使用链式调用
    this._element = div('my-component')
      .child(
        (this._input = h('input', 'form-input')),  // 同时完成创建和赋值
        (this._button = button('btn', '提交')).on('click', () => this.handleSubmit())
      );
  }

  private handleSubmit() {
    // 可以通过 this._input 和 this._button 访问元素
    console.log(this._input.value);
  }

  remove(): void {
    this._element.remove();
  }
}
```

### 关键模式

1. **类组件定义**：使用 `class XXX extends TenillaComponent`
2. **构造函数中完成 DOM 构建**：在 `constructor()` 中完成 `this._element` 的定义
3. **链式调用**：使用 `.child()`, `.on()`, `.attr()` 等链式方法
4. **同时创建和赋值**：`(this.xxx = h())` 同时完成元素创建和成员变量赋值
5. **在 child() 中使用**：赋值表达式可以直接作为 `child()` 的参数

```ts
// ✅ 推荐：同时创建和赋值
this._element = div('container').child(
  (this._header = h('h2', '标题')),
  (this._content = div('content')),
  (this._footer = button('btn', '确认'))
);

// ✅ 推荐：在 child() 中直接赋值表达式
div('wrapper').child(
  this._input = input('text'),
  this._button = button('submit', '提交')
);

// ❌ 避免：分开创建和赋值
const header = h('h2', '标题');
this._header = header;
div('container').child(header);
```

## 安装

```bash
npm install tenilla
npm install @tenilla/components  # UI 组件库
```

## 元素创建

```ts
import { h, hAlias, div, option, checkbox } from 'tenilla';

h('section', 'card');                    // <section class="card">
const [header, main] = hAlias('header,main');
div('my-class', childNode);              // 快捷 div
option('val', 'Label', true);            // 选中项
checkbox('cls', false);                  // 未选中
```

## 链式扩展（所有 DOM 元素可用）

### 核心方法

```ts
div('card')
  .on('click', (e) => {})               // addEventListener
  .tap(el => el.focus())                 // 副作用，返回自身
  .attr('role', 'button')                // setAttribute，null/false 时移除
  .attrs({ 'data-id': '42' })            // 批量设置属性
  .child(span('', 'text'), null, false)  // append，自动跳过 false/null/undefined
  .class('active', true)                 // classList.toggle
  .styleText('display:flex')             // style.cssText
  .styles({ display: 'flex' })           // Object.assign 到 style
  .styleProp('--custom', 'val')          // setProperty
  .styleProps({ '--a': '1' })            // 批量 setProperty
```

### `.child()` 特性

- 接受任意类型参数（`any`），无类型限制
- 自动跳过 `false`、`null`、`undefined`，方便条件渲染：

```ts
div('panel').child(
  showHeader && div('header'),   // showHeader=false 时自动跳过
  div('body'),
  footer ?? null,                // footer 为 null 时自动跳过
)
```

## 事件总线

```ts
import { SimpleEvent } from 'tenilla';

const bus = new SimpleEvent<{ change: [v: number]; reset: [] }>();
bus.on('change', (v) => {});
bus.emit('change', 42);
bus.off('change', handler);
```

## 组件基类

```ts
import { TenillaComponent, TenillaInput } from 'tenilla';
// 所有组件：.element（根 DOM 元素）、.remove()（销毁）
// 输入组件还有：.name、.value(get/set)、.disabled(get/set)、onChange 回调
```

## 组件（`@tenilla/components`）

每个组件独立子路径导入：
```ts
import { Modal } from '@tenilla/components/Modal';
import '@tenilla/components/Modal.css';
```

### 自定义组件写法示例

遵循核心编码规范创建自定义组件：

```ts
import { TenillaComponent, div, h, button } from '@tenilla/core';

class UserCard extends TenillaComponent {
  private _nameEl: HTMLElement;
  private _emailEl: HTMLElement;
  private _editBtn: HTMLButtonElement;
  private _deleteBtn: HTMLButtonElement;

  constructor(data: { name: string; email: string }) {
    super();
    
    // 在构造函数中使用链式调用定义 this._element
    this._element = div('user-card')
      .child(
        (this._nameEl = h('h3', 'user-name', data.name)),
        (this._emailEl = div('user-email', data.email)),
        div('user-actions').child(
          (this._editBtn = button('btn-secondary btn-sm', '编辑')
            .on('click', () => this.handleEdit())),
          (this._deleteBtn = button('btn-danger btn-sm', '删除')
            .on('click', () => this.handleDelete()))
        )
      );
  }

  private handleEdit() {
    console.log('编辑用户:', this._nameEl.textContent);
  }

  private handleDelete() {
    console.log('删除用户:', this._emailEl.textContent);
  }

  // 更新数据的方法
  updateName(name: string) {
    this._nameEl.textContent = name;
  }

  remove(): void {
    this._element.remove();
  }
}

// 使用自定义组件
const card = new UserCard({ name: '张三', email: 'zhangsan@example.com' });
document.body.appendChild(card.element);
card.updateName('李四');
```

### 表单输入

```ts
new StringInput({ label: '用户名', placeholder: '请输入', onChange: v => {} });
new NumberInput({ label: '数量', value: 42, onChange: v => {} });
new TextArea({ label: '备注', placeholder: '请填写', onChange: v => {} });
new BooleanInput({ label: '启用', value: true, onChange: v => {} });
```

### 选择组件

```ts
new Select({ name: 'fruit', label: '水果', value: 'apple', options: [{ label: '苹果', value: 'apple' }], onChange: v => {} });
sel.setOptions([...]); sel.setDisabled('apple', true); sel.disabled = true;

new CheckboxGroup({ name: 'f', label: '功能', value: ['grid'], options: [{ label: 'Grid', value: 'grid' }], onChange: v => {} });
cg.checkAll(); cg.clear(); cg.setOptions([...]);

new RadioGroup({ name: 't', label: '主题', value: 'auto', options: [{ label: '自动', value: 'auto' }], onChange: v => {} });
```

### SmartForm（schema 驱动 + 多字段联合校验）

```ts
const form = new SmartForm([
  { row: [
    { name: 'title', label: '标题', type: 'string', colspan: 8, placeholder: '请输入标题...',
      validator: (value: string) => {
        if (!value || value.trim().length === 0) {
          return '标题不能为空';
        }
        if (value.length < 5) {
          return '标题至少需要5个字符';
        }
        // 跨字段校验：高优先级项目需要更长标题
        const priority = form.get('priority');
        if (priority >= 8 && value.length < 10) {
          return '高优先级项目标题至少需要10个字符';
        }
        return true;
      },
    },
    { name: 'priority', label: '优先级', type: 'number', colspan: 4, value: 3,
      validator: (value: number) => {
        if (value < 1 || value > 10) {
          return '优先级必须在1-10之间';
        }
        // 跨字段校验：Pattern 类文章优先级不能太低
        const category = form.get('category');
        if (category === 'pattern' && value < 5) {
          return 'Pattern 类文章优先级至少为5';
        }
        return undefined;
      },
    },
  ]},
  { row: [
    { name: 'category', label: '分类', type: 'select', colspan: 6,
      options: [
        { label: '指南', value: 'guide' },
        { label: '示例', value: 'demo' },
        { label: '模式', value: 'pattern' },
      ],
      validator: (value: string) => {
        if (!value) return '请选择分类';
        return true;
      },
    },
    { name: 'published', label: '已发布', type: 'boolean', colspan: 6, value: true },
  ]},
  { row: [
    { name: 'publishDate', label: '发布日期', type: 'date', colspan: 6,
      validator: (value: Date | null) => {
        if (!value) return '发布日期不能为空';
        return true;
      },
    },
    { name: 'deadline', label: '截止日期', type: 'datetime', colspan: 6,
      validator: (value: Date | null) => {
        if (!value) return '截止日期不能为空';
        // 跨字段校验：截止日期必须晚于发布日期
        const publishDate = form.get('publishDate');
        if (publishDate && value <= new Date(publishDate)) {
          return '截止日期必须晚于发布日期';
        }
        return true;
      },
    },
  ]},
]);

document.getElementById('form-host')!.appendChild(form.element);

// 获取表单值（完全类型推断）
const values = form.value;

// 整体校验
const result = form.validate();
if (result === true) {
  console.log('校验通过！', values);
} else {
  console.error('校验失败：', result);
}
```

**关键特性：**
- **多字段联合校验**：在任何 validator 中用 `form.get('字段名')` 获取其他字段值
- **Grid 布局**：每个字段用 `colspan`（1-12）控制宽度
- **类型安全**：根据 schema 自动推断表单值类型
- **丰富字段类型**：`string`、`number`、`boolean`、`textarea`、`select`、`filter-select`、`checkboxes`、`radios`、`date`、`time`、`datetime`

### Modal

```ts
new Modal({ title: '确认', body: el, size: 'lg', backdrop: true, keyboard: true, showCancel: true, confirmText: '确定', onConfirm: () => { /* 返回 false 阻止关闭 */ }, onHidden: () => {} });
modal.show(); modal.hide(); modal.setBody(newEl);

Modal.confirm({ title: '删除？', body: '不可撤销' }); // Promise<boolean>
Modal.alert({ title: '提示', body: '完成' });          // Promise<void>

new FormModal<MyData>({ /* 同上 */ });
fm.setData(data); fm.getData();
```

### Tooltip

```ts
new Tooltip(hostEl, '内容', { direction: 'top', variant: 'info', delay: 200 });
tip.setContent('新内容'); tip.setDirection('bottom'); tip.setVariant('danger');
```

### TabPanel

```ts
new TabPanel({ position: 'top', theme: 'primary', size: 'normal', bordered: true, activeId: 't1', onChange: id => {} });
tabs.add({ id: 't1', title: '概览', body: el, closable: true });
tabs.setActive('t2'); tabs.setDisabled('t1', true); tabs.setVisible('t2', false); tabs.remove('t1'); tabs.clear();
```

### 日期时间选择器

```ts
new DatePicker({ value: '2026-08-02', placeholder: '选日期', onChange: d => {} });
dp.setValue(new Date()); dp.open(); dp.close();

new TimePicker({ value: { hour: 14, minute: 30 }, format: '24h', minuteStep: 5, onChange: d => {} });

new DateTimePicker({ value: new Date(), placeholder: '选日期时间', onChange: d => {} });
```

### Grid（推荐用于布局）

Grid 组件使用 12 列网格系统，是构建响应式布局的首选方式：

```ts
import { container, row, col } from '@tenilla/components';
import '@tenilla/components/Grid/Grid.css';

// 创建网格容器（可自定义行间距和列间距）
container({ rowGap: '20px', colGap: '24px' })
  .child(
    row().child(
      col(6, div('', '左半边')),
      col(6, div('', '右半边'))
    )
  );

// 基本用法 - 3列布局
container().child(
  row().child(
    col(4, '列1'),
    col(4, '列2'), 
    col(4, '列3')
  )
);

// 嵌套网格
container().child(
  row().child(
    col(8, 
      row().child(
        col(6, '子行左'),
        col(6, '子行右')
      )
    ),
    col(4, '侧边栏')
  )
);

// 使用不同列宽（1-12）
col(12, '全宽');   // 100%
col(6, '半宽');    // 50%
col(4, '三分之一'); // 33.33%
col(3, '四分之一'); // 25%
col(2, '六分之一'); // 16.66%
col(1, '十二分之一'); // 8.33%
```

### Button

```ts
btn('primary', '点击'); // variant: primary/secondary/success/danger/warning/info/light/dark
```

### Pagination

```ts
new Pagination({ element: hostEl, currentPage: 1, totalItems: 200, pageSize: 20, showSizer: true, sizeOpts: [10, 20, 50], maxVisiblePages: 5, onChange: p => {}, onSizeChange: s => {} });
pager.changePage(3); pager.update({ totalItems: 500 });
```

### Tree

```ts
new Tree({
  data: [{ id: '1', label: '节点', expanded: true, disabled: false, children: [{ id: '1-1', label: '子节点' }] }],
  indent: '24px', togglePosition: 'left', onChange: (id, oldId) => {}, onToggle: (id, expanded) => {},
});
tree.expandAll(); tree.collapseAll(); tree.add({ id: 'new', label: '新节点' }, 'parent-id'); tree.remove('1');
```

### TreePanel（左侧树导航 + 右侧内容区）

```ts
new TreePanel({
  data: [{ title: '入门', body: () => div('', '内容') }], // body 是懒加载函数
  indent: '20px', togglePosition: 'left', activeId: '入门', onChange: (id) => {},
});
panel.value = '其他'; // 切换选中项
```

## 主题定制

### applyTheme 函数

使用 `applyTheme` 函数可以动态修改 Tenilla 的设计令牌（Design Tokens）：

```ts
import { applyTheme } from '@tenilla/components/styles';

// 修改主题颜色
applyTheme({
  primary: '#7c3aed',          // 主色调
  'color-surface': '#1e1e2e',  // 表面颜色
  radius: '8px',                // 圆角大小
  'row-gap': '20px',           // 行间距
});

// 仅覆盖指定变量，其他变量保持默认值
applyTheme({
  'primary-hover': '#8b5cf6',
  'primary-active': '#6d28d9',
});

// 可指定目标元素（默认为 document.documentElement）
applyTheme({
  danger: '#ef4444',
}, someContainerElement);
```

**可用的设计令牌：**

- **颜色**：`primary`, `secondary`, `success`, `danger`, `warning`, `info`, `light`, `dark`
- **悬停/激活状态**：`primary-hover`, `primary-active`, `danger-hover`, `danger-active` 等
- **灰度**：`white`, `black`, `gray-100` 到 `gray-900`
- **语义颜色**：`color-text`, `color-bg`, `color-surface`, `color-border` 等
- **圆角**：`radius-sm`, `radius`, `radius-md`, `radius-lg`
- **字体**：`font-size-sm`, `font-size`, `font-size-lg`, `font-weight`
- **间距**：`col-gap`, `col-pad`, `row-gap`
- **过渡**：`transition-fast`

## 日期工具

```ts
import { _formatDate, _formatTime, _formatDateTime, _isSameDay, _pad } from 'tenilla';

_formatDate(new Date());      // '2026-08-07'
_formatTime(14, 30);         // '14:30'
_formatDateTime(new Date());  // '2026-08-07 14:30'
_isSameDay(a, b);            // boolean
_pad(5);                     // '05'
```

## 关键约定

- 所有组件 `new X({...})` 构造，传入 options 对象
- 根元素用 `.element`，销毁用 `.remove()`
- 输入组件有 `.value`(get/set)、`.disabled`(get/set)、`.name`
- CSS 独立导入：`import '@tenilla/components/X.css'`