import { div, h, li, option, select, span, ul } from '@tenilla/core';

export interface PaginationOptions {
  /** Current page number */
  currentPage?: number;
  /** Total number of items */
  totalItems?: number;
  /** Number of items per page */
  pageSize?: number;
  /** Whether to show the page size selector */
  showSizer?: boolean;
  /** Pagination container element */
  element: HTMLElement;
  /** Page size selector container element (optional) */
  sizerContainer?: HTMLElement | null;
  /** Callback when page changes */
  onChange?: (page: number) => void;
  /** Callback when page size changes (optional) */
  onSizeChange?: (size: number) => void;
  /** Maximum number of visible page numbers */
  maxVisiblePages?: number;
  /** Available page size options */
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

    // Create wrapper container
    const wrapper = div('pagination-wrapper');

    // Render pagination navigation
    if (totalPages > 1) {
      wrapper.appendChild(this._renderPaginationList());
    }

    // Render page size selector
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

    // Previous page button
    items.push(
      li(`page-item ${this.currentPage === 1 ? 'disabled' : ''}`).appendChild(
        h('a', 'page-link', 'Prev')
          .attr('href', '#')
          .on('click', (e) => {
            e.preventDefault();
            if (this.currentPage > 1) this.changePage(this.currentPage - 1);
          }),
      ),
    );

    // First page
    if (startPage > 1) {
      items.push(this.createPageItem(1, '1'));
      if (startPage > 2) {
        items.push(li('page-item disabled').appendChild(span('page-link', '...')));
      }
    }

    // Middle pages
    for (let i = startPage; i <= endPage; i++) {
      items.push(this.createPageItem(i, i.toString()));
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(li('page-item disabled').appendChild(span('page-link', '...')));
      }
      items.push(this.createPageItem(totalPages, totalPages.toString()));
    }

    // Next page button
    items.push(
      li(`page-item ${this.currentPage === totalPages ? 'disabled' : ''}`).appendChild(
        h('a', 'page-link', 'Next')
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
        .attr('aria-label', 'Items per page')
        .tap((v) => {
          v.on('change', () => this.setPageSize(parseInt(v.value, 10)));
          this.sizeOpts.forEach((size) => {
            const opt = option(
              size.toString(),
              size + ' / page',
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
