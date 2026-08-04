import { div, h, option } from '@tenilla/core';
import { li, span, ul, select } from '../common.js';
import './Pagination.css';

export interface PaginationArgs {
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
  /** @internal */
  _currentPage: number;
  /** @internal */
  _totalItems: number;
  /** @internal */
  _pageSize: number;
  /** @internal */
  protected _element: HTMLElement;
  /** @internal */
  _showSizer: boolean;
  /** @internal */
  _onChange: (page: number) => void;
  /** @internal */
  _onSizeChange: (size: number) => void;
  /** @internal */
  _maxVisiblePages: number;
  /** @internal */
  _sizeOpts: number[];

  constructor(args: PaginationArgs) {
    this._currentPage = args.currentPage || 1;
    this._totalItems = args.totalItems || 0;
    this._pageSize = args.pageSize || 10;
    this._element = args.element;
    this._showSizer = args.showSizer !== undefined ? args.showSizer : true;
    this._onChange = args.onChange || (() => {});
    this._onSizeChange = args.onSizeChange || (() => {});
    this._maxVisiblePages = args.maxVisiblePages || 5;
    this._sizeOpts = args.sizeOpts || [10, 20, 50, 100];
  }

  /** @readonly */
  get element(): HTMLElement {
    return this._element;
  }

  /** @readonly */
  get currentPage(): number {
    return this._currentPage;
  }

  /** @readonly */
  get totalItems(): number {
    return this._totalItems;
  }

  /** @readonly */
  get totalPages(): number {
    return Math.ceil(this._totalItems / this._pageSize);
  }

  update(args: Partial<PaginationArgs>): void {
    if (args.currentPage !== undefined) {
      this._currentPage = args.currentPage;
    }
    if (args.totalItems !== undefined) {
      this._totalItems = args.totalItems;
    }
    if (args.pageSize !== undefined) {
      this._pageSize = args.pageSize;
    }
    this.render();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this._currentPage = page;
    this.render();
    this._onChange(page);
  }

  setPageSize(size: number): void {
    if (!this._sizeOpts.includes(size)) {
      console.warn(`Pagination: size ${size} is not in sizeOpts`);
      return;
    }
    this._pageSize = size;
    this._currentPage = 1;
    this.render();
    this._onSizeChange(size);
  }

  /** @internal */
  private createPageItem(page: number, text: string): HTMLLIElement {
    return li(
      `tenilla-page-item ${page === this._currentPage ? 'tenilla-active' : ''}`,
      h('a', 'tenilla-page-link', text)
        .attr('href', '#')
        .on('click', (e: Event) => {
          e.preventDefault();
          this.changePage(page);
        }),
    );
  }

  render(): void {
    if (!this._element) {
      return;
    }
    this._element.innerHTML = '';

    const totalPages = this.totalPages;
    if (totalPages <= 1 && !this._showSizer) {
      return;
    }

    // Create wrapper container
    const wrapper = div('tenilla-pagination-wrapper');

    // Render pagination navigation
    if (totalPages > 1) {
      wrapper.appendChild(this._renderPaginationList());
    }

    // Render page size selector
    if (this._showSizer) {
      wrapper.appendChild(this._renderSizer());
    }

    this._element.appendChild(wrapper);
  }

  /** @internal */
  private _renderPaginationList(): HTMLUListElement {
    const totalPages = this.totalPages;
    const halfVisible = Math.floor(this._maxVisiblePages / 2);
    const startPage = Math.max(1, this._currentPage - halfVisible);
    const endPage = Math.min(totalPages, this._currentPage + halfVisible);

    const items: (Node | string)[] = [];

    // Previous page button
    items.push(
      li(`tenilla-page-item ${this._currentPage === 1 ? 'tenilla-disabled' : ''}`).appendChild(
        h('a', 'tenilla-page-link', 'Prev')
          .attr('href', '#')
          .on('click', (e) => {
            e.preventDefault();
            if (this._currentPage > 1) this.changePage(this._currentPage - 1);
          }),
      ),
    );

    // First page
    if (startPage > 1) {
      items.push(this.createPageItem(1, '1'));
      if (startPage > 2) {
        items.push(
          li('tenilla-page-item tenilla-disabled').appendChild(span('tenilla-page-link', '...')),
        );
      }
    }

    // Middle pages
    for (let i = startPage; i <= endPage; i++) {
      items.push(this.createPageItem(i, i.toString()));
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(
          li('tenilla-page-item tenilla-disabled').appendChild(span('tenilla-page-link', '...')),
        );
      }
      items.push(this.createPageItem(totalPages, totalPages.toString()));
    }

    // Next page button
    items.push(
      li(
        `tenilla-page-item ${this._currentPage === totalPages ? 'tenilla-disabled' : ''}`,
      ).appendChild(
        h('a', 'tenilla-page-link', 'Next')
          .attr('href', '#')
          .on('click', (e: Event) => {
            e.preventDefault();
            if (this._currentPage < totalPages) {
              this.changePage(this._currentPage + 1);
            }
          }),
      ),
    );

    return ul('tenilla-pagination').child(...items);
  }

  /** @internal */
  private _renderSizer(): HTMLDivElement {
    return div('tenilla-page-sizer d-flex align-items-center gap-2').child(
      select('form-select tenilla-page-sizer-select')
        .attr('aria-label', 'Items per page')
        .tap((v) => {
          v.on('change', () => this.setPageSize(parseInt(v.value, 10)));
          this._sizeOpts.forEach((size) => {
            const opt = option(size.toString(), size + ' / page', this._pageSize === size);
            v.appendChild(opt);
          });
        }),
    );
  }

  destroy(): void {
    if (this._element) {
      this._element.innerHTML = '';
      this._element.remove();
    }
    // & nullify
    // @ts-ignore
    this._element = null;
    // @ts-ignore
    this._onChange = null;
    // @ts-ignore
    this._onSizeChange = null;
    // @ts-ignore
    this._sizeOpts = null;
  }
}
