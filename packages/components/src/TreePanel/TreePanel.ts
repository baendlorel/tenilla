import { div } from '@tenilla/core';
import { Tree } from '../Tree/Tree.js';
import type { TreeNodeData } from '../Tree/Tree.js';
import './TreePanel.css';

export interface TreePanelData {
  /** Unique id */
  id: string | number | symbol;
  /** Display title in the tree */
  title: string;
  /** Lazy content factory — called when the node is selected */
  body: () => HTMLElement | { element: HTMLElement };
  /** Child nodes for nested navigation */
  children?: TreePanelData[];
  /** Whether the node is disabled */
  disabled?: boolean;
  /** Whether the node is expanded (only applies when has children) */
  expanded?: boolean;
}

export interface TreePanelOptions {
  /** Tree data */
  data: TreePanelData[];
  /** Initially active node id */
  activeId?: string | number | symbol | null;
  /** Indent per nesting level (CSS padding value, e.g. "20px") */
  indent?: string;
  /** Callback when active node changes */
  onChange?: (id: string | number | symbol) => void;
}

export class TreePanel {
  /** @internal */
  private _element: HTMLElement;
  /** @internal */
  private _tree: Tree;
  /** @internal */
  private _contentArea: HTMLElement;
  /** @internal */
  private _contentCache: Map<string | number | symbol, HTMLElement>;
  /** @internal */
  private _dataMap: Map<string | number | symbol, TreePanelData>;
  /** @internal */
  private _onChange: ((id: string | number | symbol) => void) | null;

  constructor(options: TreePanelOptions) {
    const { data, activeId, indent, onChange } = options;

    this._contentCache = new Map();
    this._dataMap = new Map();
    this._onChange = onChange ?? null;

    // Build id → data lookup
    this._indexData(data);

    // Content area (right side)
    this._contentArea = div('tenilla-tree-panel-content');

    // Convert TreePanelData → TreeNodeData for internal Tree
    const convertedData = this._convertToTreeData(data);

    // Internal Tree (left side navigation)
    // Use a flag to suppress the initial onChange callback
    let initializing = true;

    this._tree = new Tree({
      data: convertedData,
      indent,
      togglePosition: 'left',
      onChange: (id) => {
        if (id == null) return;
        this._showContent(id);
        if (!initializing && this._onChange) {
          this._onChange(id);
        }
      },
      onToggle: (id) => {
        // When a non-leaf node is clicked (toggle), also select it
        // so parent nodes with body content can be shown
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

  /** @internal Build id → data lookup recursively */
  private _indexData(data: TreePanelData[]): void {
    for (const item of data) {
      this._dataMap.set(item.id, item);
      if (item.children) {
        this._indexData(item.children);
      }
    }
  }

  /** @internal Convert TreePanelData[] to TreeNodeData[] for the internal Tree */
  private _convertToTreeData(data: TreePanelData[]): TreeNodeData[] {
    return data.map((item) => ({
      id: item.id,
      label: item.title,
      children: item.children ? this._convertToTreeData(item.children) : undefined,
      disabled: item.disabled,
      expanded: item.expanded,
    }));
  }

  /** @internal Lazy-load and display content for a node */
  private _showContent(id: string | number | symbol): void {
    this._contentArea.innerHTML = '';

    let content = this._contentCache.get(id);
    if (!content) {
      const item = this._dataMap.get(id);
      if (!item) return;
      const raw = item.body();
      content = (raw as { element: HTMLElement })?.element ?? (raw as HTMLElement);
      this._contentCache.set(id, content);
    }

    this._contentArea.appendChild(content);
  }

  /** Destroy the panel and clean up */
  destroy(): void {
    this._tree.destroy();
    this._contentCache.clear();
    this._dataMap.clear();
    this._element.remove();
    this._element = anynull;
    this._tree = anynull;
    this._contentArea = anynull;
    this._contentCache = anynull;
    this._dataMap = anynull;
    this._onChange = anynull;
  }
}
