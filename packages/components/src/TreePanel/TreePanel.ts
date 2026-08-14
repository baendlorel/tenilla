import { div, isTenillaComponent, TenillaComponent, type TenillaLike } from '@tenilla/core';
import { Tree } from '../Tree/Tree.js';
import type { TreeNodeData } from '../Tree/Tree.js';
import './TreePanel.css';

export type TreePanelData = {
  /** Lazy body spec — created on activation, destroyed on leave */
  body: (() => HTMLElement) | (() => TenillaLike);
  /** Child nodes for nested navigation */
  children?: TreePanelData[];
  /** Whether the node is disabled */
  disabled?: boolean;
  /** Whether the node is expanded (only applies when has children) */
  expanded?: boolean;
} & (
  | { id: string | number | symbol; title?: string | number | symbol }
  | { title: string | number | symbol; id?: string | number | symbol }
);

export interface TreePanelOptions {
  /** Tree data */
  data: TreePanelData[];
  /** Initially active node id */
  activeId?: string | number | symbol | null;
  /** Indent per nesting level (CSS padding value, e.g. "20px") */
  indent?: string;
  /** Toggle arrow position: 'left' (default) | 'right' */
  togglePosition?: 'left' | 'right';
  /** Callback when active node changes */
  onChange?: (id: string | number | symbol) => void;
}

/** @internal Normalized tree node with guaranteed id and title. */
interface _Normalized {
  id: string | number | symbol;
  title: string | number | symbol;
  body: (() => HTMLElement) | (() => TenillaLike);
  children?: _Normalized[];
  disabled?: boolean;
  expanded?: boolean;
}

export class TreePanel extends TenillaComponent {
  /** @internal */
  protected _element: HTMLElement;
  /** @internal */
  private _tree: Tree;
  /** @internal */
  private _contentArea: HTMLElement;
  /** @internal */
  private _dataMap: Map<string | number | symbol, _Normalized>;
  /** @internal */
  private _onChange: ((id: string | number | symbol) => void) | null;

  /** @internal Currently-displayed body content */
  private _current: TenillaLike | HTMLElement | null = null;

  constructor(options: TreePanelOptions) {
    super();

    const { data, activeId, indent, togglePosition, onChange } = options;

    this._dataMap = new Map();
    this._onChange = onChange ?? null;

    // Build id → data lookup and convert to Tree data
    const normalized = this._normalize(data);
    this._indexData(normalized);
    const convertedData = this._convertToTreeData(normalized);

    // Content area (right side)
    this._contentArea = div('tenilla-tree-panel-content');

    // Internal Tree (left side navigation)
    let initializing = true;

    this._tree = new Tree({
      data: convertedData,
      indent,
      togglePosition: togglePosition ?? 'left',
      onChange: (id) => {
        if (id == null) return;
        this._showContent(id);
        if (!initializing && this._onChange) {
          this._onChange(id);
        }
      },
      onToggle: (id) => {
        this._tree.value = id;
      },
    });

    // Container
    this._element = div('tenilla-tree-panel').child(
      div('tenilla-tree-panel-nav').child(this._tree.element),
      this._contentArea,
    );

    // Set initial active node
    if (activeId) {
      this._tree.value = activeId;
    } else if (normalized.length > 0) {
      this._tree.value = normalized[0].id!;
    }

    initializing = false;
  }

  get element(): HTMLElement {
    return this._element;
  }

  /** Currently selected node id */
  get value(): string | number | symbol | null {
    return this._tree.value;
  }

  /** Programmatically select a node */
  set value(id: string | number | symbol) {
    this._tree.value = id;
  }

  /** @internal Normalize data — fill id from title, and title from id */
  private _normalize(data: TreePanelData[]): _Normalized[] {
    return data.map((item: TreePanelData): _Normalized => {
      if (!item.id && !item.title) {
        throw new Error('TreePanelData must have at least an id or a title');
      }

      return {
        ...item,
        id: item.id ?? item.title,
        title: item.title ?? item.id,
        children: item.children ? this._normalize(item.children) : undefined,
      } as _Normalized;
    });
  }

  /** @internal Build id → data lookup recursively */
  private _indexData(data: _Normalized[]): void {
    data.forEach((item) => {
      this._dataMap.set(item.id, item);
      if (item.children) {
        this._indexData(item.children);
      }
    });
  }

  /** @internal Convert TreePanelData[] to TreeNodeData[] for the internal Tree */
  private _convertToTreeData(data: _Normalized[]): TreeNodeData[] {
    return data.map((item) => ({
      id: item.id,
      label: String(item.title),
      children: item.children ? this._convertToTreeData(item.children) : undefined,
      disabled: item.disabled,
      expanded: item.expanded,
    }));
  }

  /** @internal Resolve the body for a node, mount it, and destroy the previous one. */
  private _showContent(id: string | number | symbol): void {
    this._current = null;

    this._contentArea.innerHTML = '';

    const item = this._dataMap.get(id);
    if (!item) {
      return;
    }

    this._current = item.body();
    if (isTenillaComponent(this._current)) {
      this._contentArea.child(this._current.element);
    } else {
      this._contentArea.child(this._current);
    }
  }

  /** Destroy the panel and clean up */
  remove(): void {
    this._tree.remove();
    this._current?.remove();

    this._current = null;
    this._dataMap.clear();
    this._element.remove();
    this._element = anynull;
    this._tree = anynull;
    this._contentArea = anynull;
    this._dataMap = anynull;
    this._onChange = anynull;
  }
}
