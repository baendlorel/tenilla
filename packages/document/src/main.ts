import './styles.css';
import '@tenilla/components/Modal.css';
import '@tenilla/components/Pagination.css';
import '@tenilla/components/SmartForm.css';
import '@tenilla/components/TabPanel.css';
import '@tenilla/components/Tooltip.css';

import { div, h, hAlias } from '@tenilla/core';
import { Modal } from '@tenilla/components/Modal';
import { Pagination } from '@tenilla/components/Pagination';
import { SmartForm } from '@tenilla/components/SmartForm';
import { TabPanel } from '@tenilla/components/TabPanel';
import { Tooltip } from '@tenilla/components/Tooltip';

const [button, pre, section, p, h1, h2, h3, span, ul, li, code] = hAlias(
  'button,pre,section,p,h1,h2,h3,span,ul,li,code',
);

function codeBlock(source: string) {
  return pre('doc-code').child(code('', source.trim()));
}

function stack(title: string, description: string, ...children: HTMLElement[]) {
  return div('doc-stack').child(
    h3('doc-section-title', title),
    p('doc-copy', description),
    ...children,
  );
}

function card(title: string, description: string, live: HTMLElement, source: string) {
  return section('doc-card').child(
    div('doc-card-head').child(h3('doc-card-title', title), p('doc-card-copy', description)),
    div('doc-live').child(live),
    codeBlock(source),
  );
}

function createHero() {
  return section('hero-shell').child(
    div('hero-surface').child(
      div('hero-copy').child(
        span('eyebrow', 'TENILLA / DOCUMENT'),
        h1('hero-title', '以示例驱动的 Tenilla 组件文档'),
        p(
          'hero-text',
          '这个子包直接运行一个 Vite 站点，把核心使用方式和组件效果放在同一个页面里。顶部标签使用 TabPanel 分类，适合一边看 API 一边看真实行为。',
        ),
        div('hero-actions').child(
          span('command-chip', 'pnpm install'),
          span('command-chip', 'pnpm --filter @tenilla/document dev'),
          span('command-chip', 'pnpm --filter @tenilla/document build'),
        ),
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
        div('stat-card').child(
          span('stat-label', 'Showcase'),
          span('stat-value', 'Core + 5 components'),
        ),
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
      name: 'title',
      label: 'Article title',
      type: 'string',
      flexPercent: 50,
      value: 'Hello Tenilla',
    },
    { name: 'priority', label: 'Priority', type: 'number', flexPercent: 25, value: 3 },
    {
      name: 'category',
      label: 'Category',
      type: 'select',
      flexPercent: 25,
      value: 'guide',
      options: [
        { label: 'Guide', value: 'guide' },
        { label: 'Demo', value: 'demo' },
        { label: 'Pattern', value: 'pattern' },
      ],
    },
    { name: 'published', label: 'Published', type: 'boolean', flexPercent: 25, value: true },
    {
      name: 'summary',
      label: 'Summary',
      type: 'textarea',
      flexPercent: 75,
      value: 'Document the component with a live example.',
    },
    {
      name: 'tags',
      label: 'Tags',
      type: 'string-array',
      flexPercent: 50,
      value: ['tenilla', 'docs'],
    },
    { name: 'scores', label: 'Scores', type: 'number-array', flexPercent: 50, value: [95, 88] },
  ]);

  const host = div('doc-form-host');
  form.render(host);
  const result = pre('doc-console');
  result.textContent = JSON.stringify(form.collect(), null, 2);

  const controls = div('doc-action-row').child(
    button('doc-button', 'Collect data').on('click', () => {
      result.textContent = JSON.stringify(form.collect(), null, 2);
    }),
    button('doc-button ghost', 'Show in modal').on('click', () => {
      const payload = JSON.stringify(form.collect(), null, 2);
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
  { name: 'title', label: 'Article title', type: 'string', flexPercent: 50 },
  { name: 'summary', label: 'Summary', type: 'textarea', flexPercent: 50 },
  { name: 'published', label: 'Published', type: 'boolean', flexPercent: 25 },
]);

form.render(host);
const payload = form.collect();`,
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

function createShell() {
  const shell = div('page-shell').child(createHero());
  const panel = new TabPanel({
    activeId: 'quick-start',
    theme: 'primary',
    size: 'normal',
    bordered: true,
  });

  panel.add({ id: 'quick-start', title: 'Quick Start', body: createQuickStartTab() });
  panel.add({ id: 'tab-panel', title: 'TabPanel', body: createTabPanelTab() });
  panel.add({ id: 'modal', title: 'Modal', body: createModalTab() });
  panel.add({ id: 'pagination', title: 'Pagination', body: createPaginationTab() });
  panel.add({ id: 'smart-form', title: 'SmartForm', body: createSmartFormTab() });
  panel.add({ id: 'tooltip', title: 'Tooltip', body: createTooltipTab() });

  shell.child(section('panel-shell').child(panel.element));
  return shell;
}

const app = document.getElementById('app');

if (!app) {
  throw new Error('App root not found');
}

app.appendChild(createShell());
