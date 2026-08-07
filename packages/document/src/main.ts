// import './styles.css';
import '@tenilla/components/variables.css';
import '@tenilla/components/Button.css';
import '@tenilla/components/BooleanInput.css';
import '@tenilla/components/CheckboxGroup.css';
import '@tenilla/components/DatePicker.css';
import '@tenilla/components/DateTimePicker.css';
import '@tenilla/components/Grid.css';
import '@tenilla/components/Modal.css';
import '@tenilla/components/NumberInput.css';
import '@tenilla/components/Pagination.css';
import '@tenilla/components/RadioGroup.css';
import '@tenilla/components/Select.css';
import '@tenilla/components/SmartForm.css';
import '@tenilla/components/StringInput.css';
import '@tenilla/components/TabPanel.css';
import '@tenilla/components/TextArea.css';
import '@tenilla/components/TimePicker.css';
import '@tenilla/components/Tooltip.css';
import '@tenilla/components/Tree.css';
import '@tenilla/components/TreePanel.css';
import './styles.css';

import { div, h, hAlias } from '@tenilla/core';
import { initHighlighter } from './highlight';
import { btn } from '@tenilla/components/Button';
import { BooleanInput } from '@tenilla/components/BooleanInput';
import { CheckboxGroup } from '@tenilla/components/CheckboxGroup';
import { DatePicker } from '@tenilla/components/DatePicker';
import { DateTimePicker } from '@tenilla/components/DateTimePicker';
import { row, col } from '@tenilla/components/Grid';
import { Modal } from '@tenilla/components/Modal';
import { NumberInput } from '@tenilla/components/NumberInput';
import { Pagination } from '@tenilla/components/Pagination';
import { RadioGroup } from '@tenilla/components/RadioGroup';
import { Select } from '@tenilla/components/Select';
import { SmartForm } from '@tenilla/components/SmartForm';
import { StringInput } from '@tenilla/components/StringInput';
import { TabPanel } from '@tenilla/components/TabPanel';
import { TextArea } from '@tenilla/components/TextArea';
import { TimePicker } from '@tenilla/components/TimePicker';
import { Tooltip } from '@tenilla/components/Tooltip';
import { Tree } from '@tenilla/components/Tree';
import { TreePanel } from '@tenilla/components/TreePanel';

const [button, pre, section, p, h1, h3, h4, span, ul, li, code, a] = hAlias(
  'button,pre,section,p,h1,h3,h4,span,ul,li,code,a',
);

function codeBlock(source: string, lang = 'typescript') {
  return pre(`doc-code`).attr('data-lang', lang).child(code('', source.trim()));
}

async function renderHighlightedCode() {
  const highlighter = await initHighlighter();
  document.querySelectorAll('.doc-code:not([data-highlighted])').forEach((el) => {
    const codeEl = el.querySelector('code');
    if (!codeEl) return;
    const raw = codeEl.textContent || '';
    const lang = el.getAttribute('data-lang') || 'typescript';
    const html = highlighter.codeToHtml(raw, { lang, theme: 'github-dark' });
    el.setAttribute('data-highlighted', 'true');
    el.outerHTML = html;
  });
}

function stack(title: string, description: string, ...children: HTMLElement[]) {
  return div('doc-stack').child(
    h3('doc-section-title', title),
    p('doc-copy', description),
    ...children,
  );
}

function card(
  title: string,
  description: string,
  live: HTMLElement,
  source: string,
  lang = 'typescript',
) {
  return section('doc-card').child(
    div('doc-card-head').child(h3('doc-card-title', title), p('doc-card-copy', description)),
    div('doc-live').child(live),
    codeBlock(source, lang),
  );
}

function createNavbar() {
  return div('doc-navbar').child(
    div('doc-navbar-inner').child(
      a('doc-navbar-brand')
        .attr('href', '#')
        .child(
          span('doc-navbar-logo', 'T'),
          span('doc-navbar-title', 'Tenilla'),
          span('doc-navbar-badge', 'v0.x'),
        ),
      div('doc-navbar-actions').child(
        a('doc-navbar-btn doc-navbar-hide-mobile')
          .attrs({ href: 'https://github.com/aldia/tenilla', target: '_blank' })
          .child(span('doc-navbar-btn-icon', '★'), span('', 'GitHub')),
        btn(
          'doc-navbar-btn',
          document.documentElement.dataset.tenillaTheme === 'dark' ? '☀️ 亮色' : '🌙 暗色',
        ).on('click', (e) => {
          const html = document.documentElement;
          const isDark = html.dataset.tenillaTheme === 'dark';
          const next = isDark ? 'light' : 'dark';
          html.dataset.tenillaTheme = next;
          localStorage.setItem('tenilla-doc-theme', next);
          (e.target as HTMLButtonElement).textContent = isDark ? '🌙 暗色' : '☀️ 亮色';
        }),
      ),
    ),
  );
}

function createHero() {
  return section('hero-shell').child(
    div('hero-surface').child(
      div('hero-copy').child(
        span('eyebrow', 'TENILLA / COMPONENT SHOWCASE'),
        h1('hero-title', '以示例驱动的<br/>Tenilla 组件文档'),
        p(
          'hero-text',
          '这个子包直接运行一个 Vite 站点，把核心使用方式和组件效果放在同一个页面里。左侧标签使用 TabPanel 导航，适合一边看 API 一边看真实行为。',
        ),
        div('hero-actions').child(span('command-chip', 'pnpm add tenilla @tenilla/components')),
      ),
      div('hero-aside').child(
        div('stat-card').child(
          span('stat-label', 'Runtime'),
          span('stat-value', 'Vite + TypeScript'),
        ),
        div('stat-card').child(
          span('stat-label', 'Source Mode'),
          span('stat-value', 'Alias local packages'),
        ),
        div('stat-card').child(span('stat-label', 'Components'), span('stat-value', '18 个组件')),
      ),
    ),
  );
}

function createQuickStartTab() {
  const featureList = ul('doc-list').child(
    li('', '直接引入 @tenilla/core 的 DOM helper，无需额外运行时包装。'),
    li('', '组件示例全部是可交互的，不是静态截图。'),
    li('', 'Vite 通过本地 alias 指向源码，文档包不依赖先构建 dist。'),
  );

  return div('doc-tab-page').child(
    stack(
      '使用方式',
      '文档站本身就是最直接的集成示例。下面两段代码分别展示依赖声明和最小渲染方式。',
      div('doc-grid doc-grid-2').child(
        card(
          '安装到 workspace',
          '示例包只在自己内部安装 Vite，核心包仍然走 workspace 依赖。',
          div('doc-note').child(
            span('badge', 'workspace'),
            p('doc-copy', '适合把文档站和组件源码一起维护。'),
          ),
          `{
  "dependencies": {
    "@tenilla/core": "workspace:^*",
    "@tenilla/components": "workspace:^*"
  },
  "devDependencies": {
    "vite": "^7"
  }
}`,
          'json',
        ),
        card(
          '最小渲染',
          'Tenilla 的核心思路是直接生产真实 DOM，再手动组织行为。',
          div('doc-note').child(featureList),
          `import { hAlias } from '@tenilla/core';

const [button] = hAlias('button');

document.body.append(
  button('doc-button', 'Click me').on('click', () => {
    console.log('Tenilla works');
  }),
);`,
        ),
      ),
    ),
  );
}

function createTabPanelTab() {
  const nestedPanel = new TabPanel({
    position: 'left',
    theme: 'success',
    activeId: 'overview',
  });

  nestedPanel.add({
    id: 'overview',
    title: 'Overview',
    body: stack(
      '布局能力',
      '支持顶部和左侧两种布局；标签内容直接接收 HTMLElement。',
      div('doc-pills').child(
        span('badge', 'position: top | left'),
        span('badge', 'theme aware'),
        span('badge', 'size aware'),
      ),
    ),
  });
  nestedPanel.add({
    id: 'flow',
    title: 'Flow',
    body: stack(
      '交互方式',
      '创建实例后依次 add tab，必要时再 setActive / setDisabled / remove。',
      codeBlock(`const panel = new TabPanel({ position: 'left', theme: 'success' });
panel.add({ id: 'api', title: 'API', body: apiEl });
panel.add({ id: 'demo', title: 'Demo', body: demoEl });
panel.setActive('demo');`),
    ),
  });
  nestedPanel.add({
    id: 'fit',
    title: 'Fit',
    body: stack(
      '适合的场景',
      '文档分栏、工具面板、多视图切换都适合直接用它，不需要额外状态层。',
      div('doc-note strong').child('当前页面本身就由一个 TabPanel 驱动。'),
    ),
  });

  return div('doc-tab-page').child(
    stack(
      'TabPanel',
      '这个组件是文档页的导航骨架，所以单独做一页展示配置方式和嵌套效果。',
      card(
        '嵌套示例',
        '左侧布局更适合做文档目录或多段说明。',
        div('doc-embedded-panel').child(nestedPanel.element),
        `const panel = new TabPanel({
  position: 'left',
  activeId: 'overview',
  theme: 'success',
});

panel.add({ id: 'overview', title: 'Overview', body: overviewEl });
panel.add({ id: 'flow', title: 'Flow', body: flowEl });`,
      ),
    ),
  );
}

function createModalTab() {
  const log = p('doc-console', '最近动作：尚未触发');
  const live = div('doc-action-row').child(
    button('doc-button', 'Open modal').on('click', () => {
      new Modal({
        title: 'Publish draft',
        body: div('modal-inline-copy').child(
          h('strong', '', 'Tenilla Modal'),
          p('', '适合确认、二次输入或承载自定义表单内容。'),
        ),
        confirmText: 'Publish',
        cancelText: 'Keep editing',
        onConfirm: () => {
          log.textContent = '最近动作：点击了 Publish';
        },
        onCancel: () => {
          log.textContent = '最近动作：保留草稿';
        },
      }).show();
    }),
    button('doc-button ghost', 'Static confirm').on('click', async () => {
      const result = await Modal.confirm({
        title: 'Delete item?',
        body: 'This action is only for demo and will not remove real data.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
      });
      log.textContent = `最近动作：confirm 返回 ${String(result)}`;
    }),
    button('doc-button ghost', 'Static alert').on('click', async () => {
      await Modal.alert({
        title: 'Build completed',
        body: 'A static alert can be enough for low-stakes feedback.',
      });
      log.textContent = '最近动作：alert 已关闭';
    }),
    log,
  );

  return div('doc-tab-page').child(
    stack(
      'Modal',
      '支持实例化用法和静态 confirm/alert。文档里优先演示最常见的确认流。',
      card(
        '交互示例',
        '点击按钮会打开真实弹窗，结果会写回下方日志。',
        live,
        `const modal = new Modal({
  title: 'Publish draft',
  body: bodyEl,
  confirmText: 'Publish',
  cancelText: 'Keep editing',
  onConfirm: () => console.log('confirmed'),
});

modal.show();

const result = await Modal.confirm({
  title: 'Delete item?',
  body: 'This action is only for demo.',
});`,
      ),
    ),
  );
}

function createPaginationTab() {
  let currentPage = 1;
  let pageSize = 8;
  const totalItems = 128;
  const summary = p('doc-copy strong', '');
  const list = div('doc-records');
  const host = div('doc-pagination-host');

  function renderRecords() {
    const start = (currentPage - 1) * pageSize;
    const end = Math.min(totalItems, start + pageSize);
    summary.textContent = `Showing ${start + 1}-${end} of ${totalItems}`;
    list.innerHTML = '';
    for (let index = start + 1; index <= end; index += 1) {
      list.child(
        div('record-row').child(
          span('record-index', String(index)),
          span('', `Example item ${index}`),
        ),
      );
    }
  }

  const pager = new Pagination({
    currentPage,
    totalItems,
    pageSize,
    maxVisiblePages: 7,
    showSizer: true,
    sizeOpts: [4, 8, 12, 16],
    element: host,
    onChange: (page) => {
      currentPage = page;
      renderRecords();
    },
    onSizeChange: (size) => {
      pageSize = size;
      currentPage = 1;
      renderRecords();
    },
  });

  pager.render();
  renderRecords();

  return div('doc-tab-page').child(
    stack(
      'Pagination',
      '分页组件把页码逻辑和页尺寸切换封装起来，宿主只需要同步自己的数据渲染。',
      card(
        '数据列表示例',
        '切换页码或 page size 时，会同步刷新上面的列表。',
        div('doc-stack compact').child(summary, list, host),
        `const pager = new Pagination({
  currentPage: 1,
  totalItems: 128,
  pageSize: 8,
  showSizer: true,
  sizeOpts: [4, 8, 12, 16],
  element: host,
  onChange: (page) => render(page, pageSize),
  onSizeChange: (size) => render(1, size),
});

pager.render();`,
      ),
    ),
  );
}

function createSmartFormTab() {
  const form = new SmartForm([
    {
      row: [
        {
          name: 'title',
          label: 'Article title',
          type: 'string',
          colspan: 6,
          value: 'Hello Tenilla',
          placeholder: 'Enter title...',
        },
        { name: 'priority', label: 'Priority', type: 'number', colspan: 3, value: 3 },
        {
          name: 'category',
          label: 'Category',
          type: 'select',
          colspan: 3,
          value: 'guide',
          options: [
            { label: 'Guide', value: 'guide' },
            { label: 'Demo', value: 'demo' },
            { label: 'Pattern', value: 'pattern' },
          ],
        },
      ],
    },
    {
      row: [
        { name: 'published', label: 'Published', type: 'boolean', colspan: 3, value: true },
        {
          name: 'summary',
          label: 'Summary',
          type: 'textarea',
          colspan: 9,
          value: 'Document the component with a live example.',
          placeholder: 'Write a short summary...',
        },
      ],
    },
    {
      row: [
        {
          name: 'tags',
          label: 'Tags',
          type: 'checkboxes',
          colspan: 6,
          value: ['tenilla'],
          options: [
            { label: 'Tenilla', value: 'tenilla' },
            { label: 'Docs', value: 'docs' },
            { label: 'Guide', value: 'guide' },
          ],
        },
        {
          name: 'difficulty',
          label: 'Difficulty',
          type: 'radios',
          colspan: 6,
          value: 'easy',
          options: [
            { label: 'Easy', value: 'easy' },
            { label: 'Normal', value: 'normal' },
            { label: 'Hard', value: 'hard' },
          ],
        },
      ],
    },
    {
      row: [
        {
          name: 'publishDate',
          label: 'Publish date',
          type: 'date',
          colspan: 4,
          placeholder: 'Pick a date',
        },
        {
          name: 'publishTime',
          label: 'Publish time',
          type: 'time',
          colspan: 4,
          format: '24h',
          step: 5,
          placeholder: 'Pick a time',
        },
        {
          name: 'deadline',
          label: 'Deadline',
          type: 'datetime',
          colspan: 4,
          placeholder: 'Pick date & time',
        },
      ],
    },
  ]);

  const host = div('doc-form-host').child(form.element);
  const result = pre('doc-console');
  result.textContent = JSON.stringify(form.value, null, 2);

  const controls = div('doc-action-row').child(
    button('doc-button', 'Collect data').on('click', () => {
      result.textContent = JSON.stringify(form.value, null, 2);
    }),
    button('doc-button ghost', 'Show in modal').on('click', () => {
      const payload = JSON.stringify(form.value, null, 2);
      new Modal({
        title: 'Collected payload',
        body: pre('doc-console').child(payload),
        confirmText: 'Close',
        showCancel: false,
      }).show();
    }),
  );

  return div('doc-tab-page').child(
    stack(
      'SmartForm',
      '它更像一个快速拼装器，适合后台工具、配置页和需要快速验证结构的表单场景。',
      card(
        '表单收集示例',
        '点击按钮读取当前值，下方 JSON 会实时替换。',
        div('doc-stack compact').child(host, controls, result),
        `const form = new SmartForm([
  { row: [
    { name: 'title', label: 'Title', type: 'string', colspan: 4, placeholder: '...' },
    { name: 'priority', label: 'Priority', type: 'number', colspan: 2 },
    { name: 'category', label: 'Category', type: 'select', colspan: 3,
      options: [{ label: 'Guide', value: 'guide' }] },
    { name: 'published', label: 'Published', type: 'boolean', colspan: 3 },
  ] },
  { row: [
    { name: 'summary', label: 'Summary', type: 'textarea', colspan: 6 },
    { name: 'tags', label: 'Tags', type: 'checkboxes', colspan: 6,
      options: [{ label: 'Tenilla', value: 'tenilla' }] },
  ] },
  { row: [
    { name: 'difficulty', label: 'Difficulty', type: 'radios', colspan: 4,
      options: [{ label: 'Easy', value: 'easy' }] },
    { name: 'publishDate', label: 'Date', type: 'date', colspan: 4 },
    { name: 'publishTime', label: 'Time', type: 'time', colspan: 4 },
  ] },
  { row: [
    { name: 'deadline', label: 'Deadline', type: 'datetime', colspan: 12 },
  ] },
]);

host.appendChild(form.element);
const payload = form.value;`,
      ),
    ),
  );
}

function createPickersTab() {
  const dateLog = p('doc-console', '尚未选择日期');
  const datePicker = new DatePicker({
    placeholder: 'Pick a date',
    onChange: (date) => {
      dateLog.textContent = date ? `选中：${date.toLocaleDateString()}` : '已清空';
    },
  });

  const timeLog = p('doc-console', '尚未选择时间');
  const timePicker = new TimePicker({
    placeholder: 'Pick a time',
    format: '24h',
    step: 5,
    onChange: (date) => {
      timeLog.textContent = `选中：${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    },
  });

  const dateTimeLog = p('doc-console', '尚未选择日期时间');
  const dateTimePicker = new DateTimePicker({
    placeholder: 'Pick a date & time',
    onChange: (date) => {
      dateTimeLog.textContent = date ? `选中：${date.toLocaleString()}` : '已清空';
    },
  });

  return div('doc-tab-page').child(
    stack(
      'Pickers',
      '三个时间相关的选择器，分别面向日期、时间、日期时间。共享同一套弹层与主题。',
      card(
        'DatePicker',
        '点击输入框弹出日历，支持键盘导航与点击外部关闭。',
        div('doc-stack compact').child(datePicker.element, dateLog),
        `const picker = new DatePicker({
  placeholder: 'Pick a date',
  onChange: (date) => console.log(date),
});

host.appendChild(picker.element);`,
      ),
      card(
        'TimePicker',
        '24 小时制 + 5 分钟步进。12 小时制只需把 format 改成 "12h"。',
        div('doc-stack compact').child(timePicker.element, timeLog),
        `const picker = new TimePicker({
  format: '24h',
  step: 5,
  onChange: (date) => console.log(date.getHours(), date.getMinutes()),
});

host.appendChild(picker.element);`,
      ),
      card(
        'DateTimePicker',
        '组合日期与时间，一次选择完整时间点。',
        div('doc-stack compact').child(dateTimePicker.element, dateTimeLog),
        `const picker = new DateTimePicker({
  placeholder: 'Pick a date & time',
  onChange: (date) => console.log(date),
});

host.appendChild(picker.element);`,
      ),
    ),
  );
}

function createTooltipTab() {
  const topButton = button('doc-button', 'Top tooltip');
  const rightButton = button('doc-button ghost', 'Right tooltip');
  const bottomButton = button('doc-button ghost', 'Bottom tooltip');
  const leftButton = button('doc-button ghost', 'Left tooltip');

  new Tooltip(topButton, 'Hover state, concise message.', { direction: 'top', variant: 'dark' });
  new Tooltip(rightButton, 'Great for compact action hints.', {
    direction: 'right',
    variant: 'info',
  });
  new Tooltip(bottomButton, 'Can carry short guidance without layout shift.', {
    direction: 'bottom',
    variant: 'success',
  });
  new Tooltip(leftButton, 'Directional placement is explicit.', {
    direction: 'left',
    variant: 'warning',
  });

  return div('doc-tab-page').child(
    stack(
      'Tooltip',
      '用法非常直接：把宿主元素和内容传进去即可，方向和视觉风格通过 options 控制。',
      card(
        '方向与变体',
        '把鼠标悬停到按钮上，观察不同方向和颜色变体。',
        div('doc-action-row wrap').child(topButton, rightButton, bottomButton, leftButton),
        `const host = button('doc-button', 'Hover me');

new Tooltip(host, 'Directional helper text', {
  direction: 'right',
  variant: 'info',
});`,
      ),
    ),
  );
}

function createGridTab() {
  const demo = div('doc-stack compact').child(
    div('doc-copy', 'row() + col(4) × 3 — 三等分布局'),
    row().child(
      col(4, div('record-row').child(span('record-index', '1'), span('', 'Column 4'))),
      col(4, div('record-row').child(span('record-index', '2'), span('', 'Column 4'))),
      col(4, div('record-row').child(span('record-index', '3'), span('', 'Column 4'))),
    ),
    div('doc-copy', 'row() + col(6) + col(6) — 两栏布局'),
    row().child(
      col(6, div('record-row').child(span('record-index', 'A'), span('', 'Left half'))),
      col(6, div('record-row').child(span('record-index', 'B'), span('', 'Right half'))),
    ),
    div('doc-copy', 'row() + col(3) + col(9) — 侧边栏 + 主体'),
    row().child(
      col(3, div('record-row').child(span('record-index', 'S'), span('', 'Sidebar'))),
      col(9, div('record-row').child(span('record-index', 'M'), span('', 'Main content area'))),
    ),
    div('doc-copy', 'row() + col(12) — 通栏'),
    row().child(
      col(12, div('record-row').child(span('record-index', 'F'), span('', 'Full width row'))),
    ),
  );

  return div('doc-tab-page').child(
    stack(
      'Grid',
      '基于 12 列系统的栅格布局，通过 row() 和 col() 函数组合。SmartForm 内部也使用它来组织表单字段。',
      card(
        '布局组合',
        'col(span) 的 span 是 1-12 的整数，表示占 12 列中的几列。',
        demo,
        `import { row, col } from '@tenilla/components/Grid';

// 三等分
row().child(
  col(4, leftEl),
  col(4, centerEl),
  col(4, rightEl),
);

// 左 3 右 9
row().child(
  col(3, sidebarEl),
  col(9, mainEl),
);

// 通栏
row().child(col(12, fullWidthEl));`,
      ),
    ),
  );
}

function createCheckboxRadioTab() {
  // --- CheckboxGroup standalone ---
  const cgLog = p('doc-console', '尚未选择');
  const cg = new CheckboxGroup({
    name: 'features',
    label: '选择功能',
    value: ['grid'],
    options: [
      { label: 'Grid 栅格', value: 'grid' },
      { label: 'Modal 弹窗', value: 'modal' },
      { label: 'Tooltip 提示', value: 'tooltip' },
      { label: 'Pagination 分页', value: 'pagination' },
    ],
    onChange: (v) => {
      cgLog.textContent = v.length ? `已选：${v.join(', ')}` : '未选择任何项';
    },
  });

  const cgControls = div('doc-action-row').child(
    button('doc-button', 'checkAll()').on('click', () => cg.checkAll()),
    button('doc-button ghost', 'clear()').on('click', () => cg.clear()),
    button('doc-button ghost', 'setOptions').on('click', () => {
      cg.setOptions([
        { label: 'Grid 栅格', value: 'grid' },
        { label: 'Select 选择', value: 'select', disabled: true },
        { label: '新增项', value: 'new-item' },
      ]);
    }),
    button('doc-button ghost', 'disabled on/off').on('click', (e) => {
      cg.disabled = !cg.disabled;
      (e.target as HTMLButtonElement).textContent = cg.disabled ? 'disabled on' : 'disabled off';
    }),
  );

  // --- RadioGroup standalone ---
  const rgLog = p('doc-console', '尚未选择');
  const rg = new RadioGroup({
    name: 'theme',
    label: '主题选择',
    value: 'auto',
    options: [
      { label: '跟随系统', value: 'auto' },
      { label: '浅色', value: 'light' },
      { label: '深色', value: 'dark', disabled: true },
    ],
    onChange: (v) => {
      rgLog.textContent = `已选：${v}`;
    },
  });

  const rgControls = div('doc-action-row').child(
    button('doc-button', 'setOptions').on('click', () => {
      rg.setOptions([
        { label: '跟随系统', value: 'auto' },
        { label: '浅色', value: 'light' },
        { label: '深色', value: 'dark' },
        { label: '高对比度', value: 'high-contrast' },
      ]);
    }),
    button('doc-button ghost', 'disabled on/off').on('click', (e) => {
      rg.disabled = !rg.disabled;
      (e.target as HTMLButtonElement).textContent = rg.disabled ? 'disabled on' : 'disabled off';
    }),
  );

  return div('doc-tab-page').child(
    stack(
      'CheckboxGroup & RadioGroup',
      '两个组可独立使用，不依赖 SmartForm。支持 disabled 全组禁用、单项 setDisabled、动态 setOptions 替换选项列表。',
      card(
        'CheckboxGroup',
        '多选组，支持 checkAll()、clear()、setOptions() 和 disabled 切换。',
        div('doc-stack compact').child(cg.element, cgControls, cgLog),
        `const cg = new CheckboxGroup({
  name: 'features',
  label: '选择功能',
  value: ['grid'],
  options: [
    { label: 'Grid 栅格', value: 'grid' },
    { label: 'Modal 弹窗', value: 'modal' },
  ],
  onChange: (v) => console.log(v),
});

cg.checkAll();          // 全选
cg.clear();             // 清空
cg.setOptions([...]);   // 替换选项列表
cg.disabled = true;     // 禁用整组
cg.setDisabled('grid', true); // 禁用单项`,
      ),
      card(
        'RadioGroup',
        '单选组，支持 setOptions()、disabled 和 setDisabled()。',
        div('doc-stack compact').child(rg.element, rgControls, rgLog),
        `const rg = new RadioGroup({
  name: 'theme',
  label: '主题选择',
  value: 'auto',
  options: [
    { label: '跟随系统', value: 'auto' },
    { label: '浅色', value: 'light' },
  ],
  onChange: (v) => console.log(v),
});

rg.setOptions([...]);    // 替换选项列表
rg.disabled = true;      // 禁用整组
rg.setDisabled('dark', true); // 禁用单项`,
      ),
    ),
  );
}

function createSelectTab() {
  const log = p('doc-console', '尚未选择');
  const sel = new Select({
    name: 'fruit',
    label: '选择水果',
    value: 'apple',
    options: [
      { label: '苹果', value: 'apple' },
      { label: '香蕉', value: 'banana' },
      { label: '樱桃', value: 'cherry' },
      { label: '榴莲（缺货）', value: 'durian', disabled: true },
    ],
    onChange: (v) => {
      log.textContent = v ? `已选：${v}` : '未选择';
    },
  });

  const controls = div('doc-action-row').child(
    button('doc-button', 'setOptions').on('click', () => {
      sel.setOptions([
        { label: '葡萄', value: 'grape' },
        { label: '蜜瓜', value: 'melon' },
        { label: '橙子', value: 'orange' },
      ]);
    }),
    button('doc-button ghost', 'setDisabled').on('click', () => {
      sel.setDisabled('melon', true);
    }),
    button('doc-button ghost', 'disabled on/off').on('click', (e) => {
      sel.disabled = !sel.disabled;
      (e.target as HTMLButtonElement).textContent = sel.disabled ? 'disabled on' : 'disabled off';
    }),
  );

  return div('doc-tab-page').child(
    stack(
      'Select',
      '下拉选择器，独立于 SmartForm 使用。支持动态 setOptions、单项 setDisabled 和全局 disabled。',
      card(
        '动态选项',
        '点击按钮替换选项列表、禁用单项或切换整组禁用状态。',
        div('doc-stack compact').child(sel.element, controls, log),
        `const sel = new Select({
  name: 'fruit',
  label: '选择水果',
  value: 'apple',
  options: [
    { label: '苹果', value: 'apple' },
    { label: '香蕉', value: 'banana' },
    { label: '榴莲（缺货）', value: 'durian', disabled: true },
  ],
  onChange: (v) => console.log(v),
});

sel.setOptions([...]);         // 替换选项列表
sel.setDisabled('durian', true); // 禁用单项
sel.disabled = true;           // 禁用整组`,
      ),
    ),
  );
}

function createThemeTab() {
  const swatches: Array<{ label: string; var: string; css: string }> = [
    { label: 'Primary', var: '--tenilla-primary', css: 'var(--tenilla-primary)' },
    { label: 'Secondary', var: '--tenilla-secondary', css: 'var(--tenilla-secondary)' },
    { label: 'Success', var: '--tenilla-success', css: 'var(--tenilla-success)' },
    { label: 'Danger', var: '--tenilla-danger', css: 'var(--tenilla-danger)' },
    { label: 'Warning', var: '--tenilla-warning', css: 'var(--tenilla-warning)' },
    { label: 'Info', var: '--tenilla-info', css: 'var(--tenilla-info)' },
    { label: 'Light', var: '--tenilla-light', css: 'var(--tenilla-light)' },
    { label: 'Dark', var: '--tenilla-dark', css: 'var(--tenilla-dark)' },
    { label: 'Text', var: '--tenilla-color-text', css: 'var(--tenilla-color-text)' },
    {
      label: 'Text Secondary',
      var: '--tenilla-color-text-secondary',
      css: 'var(--tenilla-color-text-secondary)',
    },
    {
      label: 'Text Muted',
      var: '--tenilla-color-text-muted',
      css: 'var(--tenilla-color-text-muted)',
    },
    { label: 'Bg', var: '--tenilla-color-bg', css: 'var(--tenilla-color-bg)' },
    { label: 'Bg Subtle', var: '--tenilla-color-bg-subtle', css: 'var(--tenilla-color-bg-subtle)' },
    { label: 'Surface', var: '--tenilla-color-surface', css: 'var(--tenilla-color-surface)' },
    { label: 'Border', var: '--tenilla-color-border', css: 'var(--tenilla-color-border)' },
    { label: 'Overlay', var: '--tenilla-color-overlay', css: 'var(--tenilla-color-overlay)' },
    { label: 'Gray 100', var: '--tenilla-gray-100', css: 'var(--tenilla-gray-100)' },
    { label: 'Gray 300', var: '--tenilla-gray-300', css: 'var(--tenilla-gray-300)' },
    { label: 'Gray 500', var: '--tenilla-gray-500', css: 'var(--tenilla-gray-500)' },
    { label: 'Gray 700', var: '--tenilla-gray-700', css: 'var(--tenilla-gray-700)' },
    { label: 'Gray 900', var: '--tenilla-gray-900', css: 'var(--tenilla-gray-900)' },
  ];

  const items = swatches.map((s) => {
    const swatch = div('', '').styles({
      width: '32px',
      height: '32px',
      borderRadius: 'var(--tenilla-radius, 6px)',
      background: s.css,
      border: '1px solid var(--tenilla-color-border, #dee2e6)',
      flexShrink: '0',
    });
    return div('record-row').child(
      swatch,
      div('').child(
        h('strong', 'doc-copy', s.label),
        div('', ''),
        (span('', 'font-family: var(--font-mono, monospace)').styles({
          fontSize: '12px',
          color: 'var(--tenilla-color-text-muted, #adb5bd)',
        }).textContent = s.var),
      ),
    );
  });

  const palette = div('doc-stack compact').child(...items);

  return div('doc-tab-page').child(
    stack(
      '主题色板',
      `所有设计令牌基于 Bootstrap 5 色系，通过 CSS 自定义属性（--tenilla-*）定义。
      亮色和暗色模式分别有独立的色值，可通过系统偏好或手动切换。`,
      card(
        '颜色变量总览',
        '切换页面顶部的亮暗按钮，观察色板跟随变化。',
        palette,
        `/* 使用方式 */
.element {
  color: var(--tenilla-primary);
  background: var(--tenilla-color-bg-subtle);
  border: 1px solid var(--tenilla-color-border);
}

/* 手动切换暗色 */
document.documentElement.dataset.tenillaTheme = 'dark';`,
        'css',
      ),
    ),
  );
}
function createTreeTab() {
  const tree = new Tree({
    data: [
      {
        id: '1',
        label: 'item 1',
      },
      {
        id: '2',
        label: 'item 2',
        expanded: true,
        children: [
          { id: '2-1', label: 'subitem 1' },
          { id: '2-2', label: 'subitem 2' },
        ],
      },
      {
        id: '3',
        label: 'item 3',
        children: [
          {
            id: '3-1',
            label: 'subitem 1',
            children: [{ id: '3-1-1', label: 'subsubitem' }],
          },
        ],
      },
      { id: '4', label: 'item 4 (disabled)', disabled: true },
    ],
    indent: '24px', // 每级缩进
    togglePosition: 'right', // 箭头在右侧
    onChange: (id) => {
      log.textContent = `选中：${String(id)}`;
    },
    onToggle: (id, expanded) => {
      log.textContent = `${String(id)} ${expanded ? '展开' : '折叠'}`;
    },
  });

  const log = p('doc-console', '点击节点查看');
  const controls = div('doc-action-row').child(
    button('doc-button', 'expandAll').on('click', () => tree.expandAll()),
    button('doc-button ghost', 'collapseAll').on('click', () => tree.collapseAll()),
    button('doc-button ghost', 'add 随机节点').on('click', () => {
      const id = Date.now();
      tree.add({ id, label: `新节点 ${id}` });
    }),
    button('doc-button ghost', 'add 子节点到 item 3').on('click', () => {
      const id = Date.now();
      tree.add({ id, label: `子节点 ${id}` }, '3');
    }),
    button('doc-button ghost', '移除 item 3').on('click', () => tree.remove('3')),
  );

  return div('doc-tab-page').child(
    stack(
      'Tree',
      '可折叠展开的树形控件，支持动态增删节点、展开/折叠全部、选中回调。',
      card(
        '交互示例',
        '点击小三角展开/折叠，点击标签选中。',
        div('doc-stack compact').child(tree.element, controls, log),
        `const tree = new Tree({
  data: [
    { id: '1', label: 'item 1' },
    { id: '2', label: 'item 2', expanded: true,
      children: [
        { id: '2-1', label: 'subitem 1' },
        { id: '2-2', label: 'subitem 2' },
      ],
    },
    { id: '3', label: 'item 3',
      children: [{
        id: '3-1', label: 'subitem 1',
        children: [{ id: '3-1-1', label: 'subsubitem' }],
      }],
    },
  ],
  indent: "24px",
  togglePosition: "right",  // 箭头在右侧
  onChange: (id, oldId) => console.log('选中', id),
  onToggle: (id, expanded) => console.log(id, expanded ? '展开' : '折叠'),
});

tree.expandAll();
tree.collapseAll();
tree.add({ id: 'new', label: '新节点' });
tree.add({ id: 'child', label: '子节点' }, '1');
tree.remove('3');
tree.destroy();`,
      ),
    ),
  );
}

function createTreePanelTab() {
  const panel = new TreePanel({
    indent: '20px',
    data: [
      {
        id: 'getting-started',
        title: '快速开始',
        body: () => div('doc-stack compact').child(
          h3('doc-section-title', 'TreePanel'),
          p('doc-copy', 'TreePanel 是一个左侧用 Tree 导航 + 右侧内容区的布局组件，适合文档导航或配置面板。内容通过懒加载函数 body 生成，只在切换节点时调用。'),
        ),
        children: [
          {
            id: 'install',
            title: '安装',
            body: () => div('doc-note strong').child('pnpm install @tenilla/components'),
          },
          {
            id: 'usage',
            title: '用法',
            body: () => div('doc-stack compact').child(
              p('doc-copy', '创建 TreePanel 实例，传入 tree 数据和懒加载 body 函数即可。'),
              codeBlock(`const panel = new TreePanel({
  data: [
    {
      id: '1',
      title: 'Section 1',
      body: () => div('', 'Content 1'),
      children: [
        { id: '1-1', title: 'Sub 1', body: () => div('', 'Sub Content 1') },
      ],
    },
    {
      id: '2',
      title: 'Section 2',
      body: () => div('', 'Content 2'),
    },
  ],
  activeId: '1',
  onChange: (id) => console.log('active:', id),
});

host.appendChild(panel.element);`),
            ),
          },
        ],
      },
      {
        id: 'components',
        title: '组件总览',
        body: () => div('doc-stack compact').child(
          p('doc-copy', 'Tenilla 共有 18 个组件，涵盖表单、导航、布局、反馈等类别。'),
          div('doc-grid doc-grid-2').child(
            div('doc-input-card').child(
              h4('doc-input-card-title', '🎯 表单类'),
              div('doc-input-card-demo').child(
                p('doc-copy', 'StringInput, NumberInput, TextArea, BooleanInput, Select, CheckboxGroup, RadioGroup, DatePicker, TimePicker, DateTimePicker, SmartForm'),
              ),
            ),
            div('doc-input-card').child(
              h4('doc-input-card-title', '🧩 导航与布局'),
              div('doc-input-card-demo').child(
                p('doc-copy', 'TabPanel, TreePanel, Tree, Grid, Pagination'),
              ),
            ),
            div('doc-input-card').child(
              h4('doc-input-card-title', '💬 反馈与交互'),
              div('doc-input-card-demo').child(
                p('doc-copy', 'Modal, Tooltip, Button'),
              ),
            ),
          ),
        ),
        children: [
          {
            id: 'forms',
            title: '表单组件',
            body: () => div('doc-note').child(p('doc-copy', '所有表单组件都支持 label、disabled、onChange 等基础 API，可独立使用也可在 SmartForm 中组合。')),
          },
          {
            id: 'navigation',
            title: '导航组件',
            body: () => div('doc-note').child(p('doc-copy', 'TabPanel 和 TreePanel 都提供左右结构的导航布局，TreePanel 支持树形嵌套导航。')),
          },
        ],
      },
      {
        id: 'api',
        title: 'API 参考',
        body: () => codeBlock(`interface TreePanelData {
  id: string | number | symbol;
  title: string;
  body: () => HTMLElement | { element: HTMLElement };
  children?: TreePanelData[];
}

interface TreePanelOptions {
  data: TreePanelData[];
  activeId?: string | number | symbol;
  indent?: string;
  onChange?: (id: string | number | symbol) => void;
}

// Usage
const panel = new TreePanel({ data, activeId: '1' });
panel.value = '2';                // 切换选中
const id = panel.value;           // 获取当前选中
panel.destroy();                  // 销毁`),
      },
    ],
    onChange: (_id) => {
      // console.log('active:', _id);
    },
  });

  return div('doc-tab-page').child(
    stack(
      'TreePanel 展示',
      '左侧树形导航 + 右侧内容面板，body 使用懒加载函数。点击节点切换内容，展开/折叠树形结构。',
      card(
        '交互示例',
        '点击左侧导航切换右侧内容，树形嵌套可展开/折叠。',
        div('doc-stack compact').child(
          panel.element,
        ),
        `import { TreePanel } from '@tenilla/components/TreePanel';

const panel = new TreePanel({
  data: [
    {
      id: '1',
      title: 'Section 1',
      body: () => div('', 'Content 1'),
      children: [
        { id: '1-1', title: 'Sub 1', body: () => div('', 'Sub Content 1') },
      ],
    },
    {
      id: '2',
      title: 'Section 2',
      body: () => div('', 'Content 2'),
    },
  ],
  activeId: '1',
});`,
      ),
    ),
  );
}

function createFormInputsTab() {
  const stringLog = p('doc-console', '尚未输入');
  const stringInput = new StringInput({
    label: '用户名',
    placeholder: '请输入用户名...',
    onChange: (v) => {
      stringLog.textContent = `输入：${v}`;
    },
  });

  const numberLog = p('doc-console', '尚未输入');
  const numberInput = new NumberInput({
    label: '数量',
    value: 42,
    onChange: (v) => {
      numberLog.textContent = `当前值：${v}`;
    },
  });

  const textAreaLog = p('doc-console', '尚未输入');
  const textArea = new TextArea({
    label: '备注',
    placeholder: '请输入备注内容...',
    onChange: (v) => {
      textAreaLog.textContent = `输入：${v.slice(0, 30)}${v.length > 30 ? '...' : ''}`;
    },
  });

  const boolLog = p('doc-console', '尚未操作');
  const boolInput = new BooleanInput({
    label: '启用通知',
    value: true,
    onChange: (v) => {
      boolLog.textContent = `开关状态：${v ? '开启' : '关闭'}`;
    },
  });

  return div('doc-tab-page').child(
    stack(
      'Input',
      'StringInput、NumberInput、TextArea、BooleanInput 四个基础表单输入组件，可独立于 SmartForm 使用。每个组件都支持 label、disabled 和 onChange。',
      card(
        '独立输入示例',
        '每个组件单独使用，带有实时反馈日志。',
        div('doc-inputs-grid').child(
          div('doc-input-card').child(
            h4('doc-input-card-title', 'StringInput'),
            div('doc-input-card-demo').child(stringInput.element, stringLog),
          ),
          div('doc-input-card').child(
            h4('doc-input-card-title', 'NumberInput'),
            div('doc-input-card-demo').child(numberInput.element, numberLog),
          ),
          div('doc-input-card').child(
            h4('doc-input-card-title', 'TextArea'),
            div('doc-input-card-demo').child(textArea.element, textAreaLog),
          ),
          div('doc-input-card').child(
            h4('doc-input-card-title', 'BooleanInput'),
            div('doc-input-card-demo').child(boolInput.element, boolLog),
          ),
        ),
        `import { StringInput, NumberInput, TextArea, BooleanInput } from '@tenilla/components';

const stringInput = new StringInput({
  label: '用户名',
  placeholder: '请输入...',
  onChange: (v) => console.log(v),
});

const numberInput = new NumberInput({
  label: '数量',
  value: 42,
  onChange: (v) => console.log(v),
});

const textArea = new TextArea({
  label: '备注',
  placeholder: '请输入内容...',
  onChange: (v) => console.log(v),
});

const boolInput = new BooleanInput({
  label: '启用通知',
  value: true,
  onChange: (v) => console.log(v),
});`,
      ),
    ),
  );
}

function createShell() {
  const shell = div('page-shell').child(
    createHero(),
    section('panel-shell').child(
      new TreePanel({
        indent: '20px',
        data: [
          {
            id: 'quick-start',
            title: 'Quick Start',
            body: createQuickStartTab,
          },
          {
            id: 'form',
            title: 'Form',
            expanded: true,
            body: () => div('doc-tab-page').child(
              p('doc-copy', 'Form 包含所有表单类组件，请从左侧展开选择。'),
            ),
            children: [
              {
                id: 'inputs',
                title: 'Input',
                body: createFormInputsTab,
              },
              {
                id: 'smart-form',
                title: 'SmartForm',
                body: createSmartFormTab,
              },
              {
                id: 'pickers',
                title: 'Pickers',
                body: createPickersTab,
              },
              {
                id: 'checkbox-radio',
                title: 'Checkbox & Radio',
                body: createCheckboxRadioTab,
              },
              {
                id: 'select',
                title: 'Select',
                body: createSelectTab,
              },
            ],
          },
          {
            id: 'tab-panel',
            title: 'TabPanel',
            body: createTabPanelTab,
          },
          {
            id: 'grid',
            title: 'Grid',
            body: createGridTab,
          },
          {
            id: 'modal',
            title: 'Modal',
            body: createModalTab,
          },
          {
            id: 'pagination',
            title: 'Pagination',
            body: createPaginationTab,
          },
          {
            id: 'tooltip',
            title: 'Tooltip',
            body: createTooltipTab,
          },
          {
            id: 'tree',
            title: 'Tree',
            body: createTreeTab,
          },
          {
            id: 'tree-panel',
            title: 'TreePanel',
            body: createTreePanelTab,
          },
          {
            id: 'theme',
            title: 'Theme',
            body: createThemeTab,
          },
        ],
        activeId: 'quick-start',
      }).element,
    ),
  );

  return shell;
}

const app = document.getElementById('app');

if (!app) {
  throw new Error('App root not found');
}

app.appendChild(createNavbar());
app.appendChild(createShell());

// Highlight code blocks after initial render
initHighlighter().then(() => {
  renderHighlightedCode();

  // Re-highlight when new code blocks appear (e.g., tab switching triggers lazy render)
  const shell = document.querySelector('.panel-shell');
  if (shell) {
    const observer = new MutationObserver(() => {
      renderHighlightedCode();
    });
    observer.observe(shell, { childList: true, subtree: true });
  }
});
