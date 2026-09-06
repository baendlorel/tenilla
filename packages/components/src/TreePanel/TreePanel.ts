import { div, isTenillaComponent, TenillaComponent, type TenillaLike } from '@tenilla/core';
import { Tree } from '../Tree/Tree.js';
import type { TreeNodeData } from '../Tree/Tree.js';
import './TreePanel.css';

export type TreePanelData = {
  /** Unique id */
  id: string;
  /** Node title */
  title?: string | HTMLElement | TenillaLike;
  /** Lazy body spec — created on activation, destroyed on leave */
  body: (() => HTMLElement) | (() => TenillaLike);
  /** Child nodes for nested navigation */
  children?: TreePanelData[];
  /** Whether the node is disabled */
  disabled?: boolean;
  /** Whether the node is expanded (only applies when has children) */
  expanded?: boolean;
};

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

export class TreePanel extends TenillaComponent {
  /** @internal */
  protected _element: HTMLElement;
  /** @internal */
  private _tree: Tree;
  /** @internal */
  private _contentArea: HTMLElement;
  /** @internal */
  private _dataMap: Map<string, TreePanelData>;
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
    this._indexData(data);
    const convertedData = this._convertToTreeData(data);

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
    } else if (data.length > 0) {
      this._tree.value = data[0].id;
    }

    initializing = false;
  }

  /** Currently selected node id */
  get value(): string | number | symbol | null {
    return this._tree.value;
  }

  /** Programmatically select a node */
  set value(id: string | number | symbol) {
    this._tree.value = id;
  }

  /** @internal Build id → data lookup recursively */
  private _indexData(data: TreePanelData[]): void {
    data.forEach((item) => {
      this._dataMap.set(item.id, item);
      if (item.children) {
        this._indexData(item.children);
      }
    });
  }

  /** @internal Convert TreePanelData[] to TreeNodeData[] for the internal Tree */
  private _convertToTreeData(data: TreePanelData[]): TreeNodeData[] {
    return data.map((item) => ({
      id: item.id,
      label:
        typeof item.title === 'object' && 'element' in item.title
          ? item.title.element
          : (item.title as string | HTMLElement),
      children: item.children ? this._convertToTreeData(item.children) : undefined,
      disabled: item.disabled,
      expanded: item.expanded,
    }));
  }

  /** @internal Resolve the body for a node, mount it, and destroy the previous one. */
  private _showContent(id: string): void {
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
