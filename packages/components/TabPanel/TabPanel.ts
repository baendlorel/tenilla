export interface TabData {
  /** 唯一 id */
  id: string | number | symbol;
  /** 标签标题 */
  title: string;
  /** 标签内容元素 */
  body: HTMLElement;
  /** tab的按钮元素 */
  button: HTMLButtonElement;
  /** 是否可关闭 */
  closable: boolean;
}

export interface TabOptions {
  /** 唯一 id */
  id: string | number | symbol;
  /** 标题 */
  title: string;
  /** 内容，会显示在panel里 */
  body: HTMLElement | { element: HTMLElement };
  /** 是否可关闭 */
  closable?: boolean;
}

export interface TabPanelOptions {
  /** 标签位置：'top' 或 'left' */
  position?: 'top' | 'left';
  /** 初始激活的标签 ID */
  activeId?: string | number | symbol | null;
  /** 标签切换回调函数 */
  onChange?: (id: string | number | symbol, tab: TabData) => void;
  /** 主题颜色 */
  theme?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  /** 尺寸 */
  size?: 'small' | 'normal' | 'large';
  /** 是否显示边框 */
  bordered?: boolean;
}

export class TabPanel {
  element: HTMLElement;
  header: HTMLElement;
  body: HTMLElement;
  tabs: TabData[] = [];
  activeId: string | number | symbol | null = null;
  private _onChange: ((id: string | number | symbol, tab: TabData) => void) | null = null;

  constructor(options: TabPanelOptions = {}) {
    const {
      position = 'top',
      activeId = null,
      onChange = null,
      theme = 'default',
      size = 'normal',
      bordered = true,
    } = options;

    this.activeId = activeId;
    this._onChange = onChange;

    // 创建结构
    this.element = div(
      `tab-panel tab-panel-${position} tab-panel-theme-${theme} tab-panel-size-${size}`,
    );

    if (bordered) {
      this.element.classList.add('tab-panel-bordered');
    }

    const wrapper = div(position === 'left' ? 'tab-panel-left-wrapper' : '');
    this.header = div('tab-panel-header').attr('role', 'tablist');
    this.body = div('tab-panel-content');

    wrapper.child(this.header, this.body);
    this.element.child(wrapper);
  }

  private _create(opts: TabOptions): TabData {
    const { id, title, body, closable = false } = opts;

    return {
      id,
      title,
      body: div('tab-pane')
        .attr('role', 'tabpanel')
        .child((body as { element: HTMLElement })?.element ?? body),
      button: button('tab-btn')
        .attr('role', 'tab')
        .on('click', () => this.setActive(id))
        .tap((e: any) => {
          if (closable) {
            e.appendChild(
              span('tab-close-btn', '×').on('click', (ev: Event) => {
                ev.stopPropagation();
                this.remove(id);
              }),
            );
          }
        })
        .child(span('tab-title', title)),
      closable,
    };
  }

  add(opts: TabOptions): string {
    const newTab = this._create(opts);
    this.tabs.push(newTab);
    this.header.child(newTab.button);
    this.body.child(newTab.body);

    if (this.tabs.length === 1) {
      this.setActive(this.tabs[0].id);
    }

    return newTab.title;
  }

  update(opts: TabOptions): boolean {
    const i = this.tabs.findIndex((v) => v.id === opts.id);
    if (i === -1) {
      return false;
    }

    // 完全替换为新的
    const a = this.tabs[i];
    const b = this._create(opts);
    this.tabs[i] = b;

    a.body.replaceWith(b.body);
    a.button.replaceWith(b.button);

    if (this.activeId === a.title) {
      this.activeId = b.title;
    }

    return true;
  }

  remove(id: string | number | symbol): void {
    const i = this.tabs.findIndex((v) => v.id === id);
    if (i === -1) {
      return;
    }

    this.tabs[i].button.remove();
    this.tabs[i].body.remove();
    this.tabs.splice(i, 1);
    this.setActive(this.tabs[0]?.id ?? null);
  }

  setActive(id: string | number | symbol): boolean {
    // 先清空激活样式
    this.tabs.forEach((t) => {
      t.body.classList.remove('active');
      t.body.classList.remove('animating');
      t.button.classList.remove('active');
    });

    const t = this.tabs.find((v) => v.id === id);
    if (!t || (t.button as any).disabled) {
      // 如果找不到匹配的就算了
      this.activeId = null;
      return false;
    }

    // 添加动画类，隐藏溢出
    this.body.classList.add('animating');
    t.body.classList.add('animating');

    t.button.classList.add('active');
    t.body.classList.add('active');

    // 动画结束后移除 animating 类
    setTimeout(() => {
      this.body.classList.remove('animating');
      t.body.classList.remove('animating');
    }, 300);

    const old = this.activeId;
    this.activeId = id;

    if (this._onChange && old !== id) {
      this._onChange(id, this.tabs.find((v) => v.id === id)!);
    }

    return true;
  }

  setDisabled(id: string | number | symbol, disabled: boolean): boolean {
    const t = this.tabs.find((v) => v.id === id);
    if (!t) {
      return false;
    }

    if (disabled) {
      t.button.classList.add('tab-btn-disabled');
    } else {
      t.button.classList.remove('tab-btn-disabled');
    }
    (t.button as any).disabled = disabled;
    return true;
  }

  setVisible(id: string | number | symbol, visible: boolean): boolean {
    const t = this.tabs.find((v) => v.id === id);
    if (!t) {
      return false;
    }
    t.button.style.display = visible ? '' : 'none';
    return true;
  }

  clear(): void {
    this.tabs.forEach((t) => {
      t.body.remove();
      t.button.remove();
    });

    this.tabs = [];
    this.header.innerHTML = '';
    this.body.innerHTML = '';
    this.activeId = null;
  }

  destroy(): void {
    this.clear();
    this.element.remove();
  }
}

export default TabPanel;
