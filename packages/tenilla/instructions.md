# Tenilla 使用指南（AI 用）

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

```ts
div('card')
  .on('click', (e) => {})               // addEventListener
  .tap(el => el.focus())                 // 副作用，返回自身
  .attr('role', 'button')                // setAttribute，null/false 时移除
  .attrs({ 'data-id': '42' })            // 批量设置属性
  .child(span('', 'text'))               // append
  .class('active', true)                 // classList.toggle
  .styleText('display:flex')             // style.cssText
  .styles({ display: 'flex' })           // Object.assign 到 style
  .styleProp('--custom', 'val')          // setProperty
  .styleProps({ '--a': '1' })            // 批量 setProperty
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
// 所有组件：.element（根 DOM 元素）、.destroy()（销毁）
// 输入组件还有：.name、.value(get/set)、.disabled(get/set)、onChange 回调
```

## 组件（`@tenilla/components`）

每个组件独立子路径导入：
```ts
import { Modal } from '@tenilla/components/Modal';
import '@tenilla/components/Modal.css';
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

### SmartForm（schema 驱动）

```ts
new SmartForm([
  { name: 'username', label: '用户名', type: 'string', flexPercent: 50 },
  { name: 'age', type: 'number', flexPercent: 50 },
  { name: 'bio', type: 'textarea', flexPercent: 100 },
  { name: 'role', type: 'select', options: ['admin', 'editor'], flexPercent: 50 },
  { name: 'active', type: 'boolean', flexPercent: 50 },
  { name: 'tags', type: 'string-array', flexPercent: 100 },
]);
form.render(hostEl);
form.collect();  // => Record<string, any>
```

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

### Grid

```ts
container().child(row().child(col(6).child(div('', '左')), col(6).child(div('', '右'))));
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
- 根元素用 `.element`，销毁用 `.destroy()`
- 输入组件有 `.value`(get/set)、`.disabled`(get/set)、`.name`
- CSS 独立导入：`import '@tenilla/components/X.css'`