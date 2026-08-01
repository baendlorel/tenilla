import { div, h, li, option, select, span, ul } from '@tenilla/shared';

export interface PaginationOptions {
  /** 当前页码 */
  currentPage?: number;
  /** 总记录数 */
  totalItems?: number;
  /** 每页显示的记录数 */
  pageSize?: number;
  /** 是否显示选择每页多少个 */
  showSizer?: boolean;
  /** 分页容器元素 */
  element: HTMLElement;
  /** 每页条目数选择器容器元素（可选） */
  sizerContainer?: HTMLElement | null;
  /** 页码变化时的回调函数 */
  onChange?: (page: number) => void;
  /** 每页条目数变化时的回调函数（可选） */
  onSizeChange?: (size: number) => void;
  /** 最多显示的页码数量 */
  maxVisiblePages?: number;
  /** 可选的条目数列表 */
  sizeOpts?: number[];
}

export class Pagination {
  paginationList: HTMLUListElement | null = null;
  sizerElement: HTMLDivElement | null = null;

  currentPage: number;
  totalItems: number;
  pageSize: number;
  element: HTMLElement;
  showSizer: boolean;
  onChange: (page: number) => void;
  onSizeChange: (size: number) => void;
  maxVisiblePages: number;
  sizeOpts: number[];

  constructor(options: PaginationOptions) {
    this.currentPage = options.currentPage || 1;
    this.totalItems = options.totalItems || 0;
    this.pageSize = options.pageSize || 10;
    this.element = options.element;
    this.showSizer = options.showSizer !== undefined ? options.showSizer : true;
    this.onChange = options.onChange || (() => {});
    this.onSizeChange = options.onSizeChange || (() => {});
    this.maxVisiblePages = options.maxVisiblePages || 5;
    this.sizeOpts = options.sizeOpts || [10, 20, 50, 100];
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  update(options: Partial<PaginationOptions>): void {
    if (options.currentPage !== undefined) {
      this.currentPage = options.currentPage;
    }
    if (options.totalItems !== undefined) {
      this.totalItems = options.totalItems;
    }
    if (options.pageSize !== undefined) {
      this.pageSize = options.pageSize;
    }
    this.render();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    this.render();
    this.onChange(page);
  }

  setPageSize(size: number): void {
    if (!this.sizeOpts.includes(size)) {
      console.warn(`Pagination: size ${size} is not in sizeOpts`);
      return;
    }
    this.pageSize = size;
    this.currentPage = 1;
    this.render();
    this.onSizeChange(size);
  }

  private createPageItem(page: number, text: string): HTMLLIElement {
    return li(
      `page-item ${page === this.currentPage ? 'active' : ''}`,
      h('a', 'page-link', text)
        .attr('href', '#')
        .on('click', (e: Event) => {
          e.preventDefault();
          this.changePage(page);
        }),
    );
  }

  render(): void {
    if (!this.element) {
      return;
    }
    this.element.innerHTML = '';

    const totalPages = this.totalPages;
    if (totalPages <= 1 && !this.showSizer) {
      return;
    }

    // 创建包装容器
    const wrapper = div('pagination-wrapper');

    // 渲染分页导航
    if (totalPages > 1) {
      wrapper.appendChild(this._renderPaginationList());
    }

    // 渲染每页条目数选择器
    if (this.showSizer) {
      wrapper.appendChild(this._renderSizer());
    }

    this.element.appendChild(wrapper);
  }

  private _renderPaginationList(): HTMLUListElement {
    const totalPages = this.totalPages;
    const halfVisible = Math.floor(this.maxVisiblePages / 2);
    const startPage = Math.max(1, this.currentPage - halfVisible);
    const endPage = Math.min(totalPages, this.currentPage + halfVisible);

    const items: (Node | string)[] = [];

    // 上一页按钮
    items.push(
      li(`page-item ${this.currentPage === 1 ? 'disabled' : ''}`).appendChild(
        h('a', 'page-link', '上一页')
          .attr('href', '#')
          .on('click', (e) => {
            e.preventDefault();
            if (this.currentPage > 1) this.changePage(this.currentPage - 1);
          }),
      ),
    );

    // 第一页
    if (startPage > 1) {
      items.push(this.createPageItem(1, '1'));
      if (startPage > 2) {
        items.push(li('page-item disabled').appendChild(span('page-link', '...')));
      }
    }

    // 中间页码
    for (let i = startPage; i <= endPage; i++) {
      items.push(this.createPageItem(i, i.toString()));
    }

    // 最后一页
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(li('page-item disabled').appendChild(span('page-link', '...')));
      }
      items.push(this.createPageItem(totalPages, totalPages.toString()));
    }

    // 下一页按钮
    items.push(
      li(`page-item ${this.currentPage === totalPages ? 'disabled' : ''}`).appendChild(
        h('a', 'page-link', '下一页')
          .attr('href', '#')
          .on('click', (e: Event) => {
            e.preventDefault();
            if (this.currentPage < totalPages) {
              this.changePage(this.currentPage + 1);
            }
          }),
      ),
    );

    return ul('pagination').child(...items);
  }

  private _renderSizer(): HTMLDivElement {
    return div('page-sizer d-flex align-items-center gap-2').child(
      select('form-select page-sizer-select')
        .attr('aria-label', '每页显示条目数')
        .tap((v) => {
          v.on('change', () => this.setPageSize(parseInt(v.value, 10)));
          this.sizeOpts.forEach((size) => {
            const opt = option(
              size.toString(),
              size + '条/页',
              this.pageSize === size ? size : undefined,
            );
            v.appendChild(opt);
          });
        }),
    );
  }

  destroy(): void {
    if (this.element) {
      this.element.innerHTML = '';
    }
    this.paginationList = null;
    this.sizerElement = null;
  }
}

export default Pagination;
