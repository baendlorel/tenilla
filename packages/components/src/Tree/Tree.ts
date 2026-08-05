import { div, svg } from '@tenilla/core';
import './Tree.css';

export interface TreeNodeData {
  /** Unique id */
  id: string | number | symbol;
  /** Node label — text string or HTMLElement */
  label: string | HTMLElement;
  /** Child nodes */
  children?: TreeNodeData[];
  /** Whether the node is disabled */
  disabled?: boolean;
  /** Whether the node is expanded (only applies when has children) */
  expanded?: boolean;
}

export interface TreeOptions {
  /** Initial tree data */
  data: TreeNodeData[];
  /** Callback when a node is selected */
  onSelect?: (id: string | number | symbol, node: TreeNodeData) => void;
  /** Callback when a node is expanded or collapsed */
  onToggle?: (id: string | number | symbol, node: TreeNodeData, expanded: boolean) => void;
}

/** @internal Create a right-pointing triangle SVG icon */
function _toggleIcon(): SVGSVGElement {
  return svg('svg', { viewBox: '0 0 10 10', class: 'tenilla-tree-toggle-icon' }).child(
    svg('path', { d: 'M 3 1 L 8 5 L 3 9 Z' }),
  );
}

/** @internal */
interface _NodeEntry {
  data: TreeNodeData;
  element: HTMLElement; // .tenilla-tree-node
  row: HTMLElement; // .tenilla-tree-node-row
  childrenEl: HTMLElement | null; // .tenilla-tree-children
  toggle: HTMLElement | null; // .tenilla-tree-toggle or null for leaf
}

export class Tree {
  /** @internal */
  protected _element: HTMLElement;
  /** @internal */
  private _nodeMap: Map<string | number | symbol, _NodeEntry> = new Map();
  /** @internal */
  private _selectedId: string | number | symbol | null = null;
  /** @internal */
  private _onSelect: ((id: string | number | symbol, node: TreeNodeData) => void) | null = null;
  /** @internal */
  private _onToggle:
    | ((id: string | number | symbol, node: TreeNodeData, expanded: boolean) => void)
    | null = null;

  constructor(options: TreeOptions = { data: [] }) {
    this._element = div('tenilla-tree');
    this._onSelect = options.onSelect ?? null;
    this._onToggle = options.onToggle ?? null;

    if (options.data) {
      this._setData(options.data);
    }
  }

  get element(): HTMLElement {
    return this._element;
  }

  /** @internal */
  private _setData(data: TreeNodeData[]): void {
    this.clear();
    for (const node of data) {
      this._appendNode(node, this._element);
    }
  }

  /** @internal */
  // FIXME 什么乱七八糟的，重写！
  private _appendNode(data: TreeNodeData, parent: HTMLElement): HTMLElement {
    const hasChildren = data.children && data.children.length > 0;
    const isExpanded = data.expanded ?? false;

    let toggleEl: HTMLElement | null = null;

    const nodeEl = div('tenilla-tree-node').child(
      div('tenilla-tree-node-row')
        .class('tenilla-tree-disabled', data.disabled)
        .on('click', (e: Event) => {
          if (data.disabled) {
            return;
          }
          // ?? 这里是toggleel.contains吗，怎么感觉反了
          if (toggleEl && toggleEl.contains(e.target as Node)) {
            this._toggleNode(data.id);
          } else {
            this._selectNode(data.id);
          }
        })
        .child(
          hasChildren
            ? (toggleEl = div('tenilla-tree-toggle').child(_toggleIcon()))
            : div('tenilla-tree-toggle-placeholder'),
          div('tenilla-tree-label', data.label ?? ''),
        ),
    );

    // Children container
    let childrenEl: HTMLElement | null = null;
    if (hasChildren) {
      childrenEl = div('tenilla-tree-children').class('tenilla-tree-collapsed', !isExpanded);
      nodeEl.child(childrenEl);

      // Recursively add children
      for (const child of data.children!) {
        this._appendNode(child, childrenEl!);
      }
    }

    // Store entries
    const entry: _NodeEntry = {
      data,
      element: nodeEl,
      row,
      childrenEl,
      toggle: toggleEl,
    };
    this._nodeMap.set(data.id, entry);

    // Mark expanded class on the node
    if (isExpanded && toggleEl) {
      nodeEl.classList.add('tenilla-tree-node-expanded');
    }

    parent.child(nodeEl);
    return nodeEl;
  }

  /** @internal */
  private _selectNode(id: string | number | symbol): void {
    const entry = this._nodeMap.get(id);
    if (!entry || entry.data.disabled) return;

    // Deselect previous
    if (this._selectedId !== null) {
      const prev = this._nodeMap.get(this._selectedId);
      if (prev) {
        prev.row.classList.remove('tenilla-tree-selected');
      }
    }

    this._selectedId = id;
    entry.row.classList.add('tenilla-tree-selected');

    if (this._onSelect) {
      this._onSelect(id, entry.data);
    }
  }

  /** @internal */
  private _toggleNode(id: string | number | symbol): void {
    const entry = this._nodeMap.get(id);
    if (!entry || !entry.childrenEl || !entry.toggle) return;

    const isCollapsed = entry.childrenEl.classList.contains('tenilla-tree-collapsed');
    const nowExpanded = isCollapsed;

    if (isCollapsed) {
      entry.childrenEl.classList.remove('tenilla-tree-collapsed');
      entry.element.classList.add('tenilla-tree-node-expanded');
    } else {
      entry.childrenEl.classList.add('tenilla-tree-collapsed');
      entry.element.classList.remove('tenilla-tree-node-expanded');
    }

    if (this._onToggle) {
      this._onToggle(id, entry.data, nowExpanded);
    }
  }

  /**
   * Add a new tree node into the tree.
   *
   * If `parentId` is provided, the node is appended as a child of that parent.
   * If the parent is a leaf (no children yet), it becomes a branch with a toggle.
   * If `parentId` is omitted, the node is appended to the root.
   */
  add(data: TreeNodeData, parentId?: string | number | symbol): void {
    if (parentId !== undefined) {
      const parent = this._nodeMap.get(parentId);
      if (!parent) return;

      // Ensure parent has a children container
      if (!parent.childrenEl) {
        // Convert leaf to branch: add toggle and children container
        const childrenEl = div('tenilla-tree-children');
        parent.element.child(childrenEl);
        parent.childrenEl = childrenEl;

        // Replace placeholder with toggle icon
        const placeholder = parent.row.querySelector('.tenilla-tree-toggle-placeholder');
        if (placeholder) {
          const toggle = div('tenilla-tree-toggle').child(_toggleIcon());
          placeholder.replaceWith(toggle);
          parent.toggle = toggle;
        }

        // Update data
        parent.data.children = parent.data.children || [];
      }

      parent.data.children!.push(data);
      this._appendNode(data, parent.childrenEl!);
    } else {
      this._appendNode(data, this._element);
    }
  }

  /**
   * Remove a node by its id.
   */
  remove(id: string | number | symbol): void {
    const entry = this._nodeMap.get(id);
    if (!entry) return;

    // Remove children first
    if (entry.data.children) {
      for (const child of [...entry.data.children]) {
        this.remove(child.id);
      }
    }

    entry.element.remove();
    this._nodeMap.delete(id);

    if (this._selectedId === id) {
      this._selectedId = null;
    }
  }

  /**
   * Expand a node by id.
   */
  expand(id: string | number | symbol): void {
    const entry = this._nodeMap.get(id);
    if (!entry || !entry.childrenEl || !entry.toggle) return;

    entry.childrenEl.classList.remove('tenilla-tree-collapsed');
    entry.element.classList.add('tenilla-tree-node-expanded');
  }

  /**
   * Collapse a node by id.
   */
  collapse(id: string | number | symbol): void {
    const entry = this._nodeMap.get(id);
    if (!entry || !entry.childrenEl || !entry.toggle) return;

    entry.childrenEl.classList.add('tenilla-tree-collapsed');
    entry.element.classList.remove('tenilla-tree-node-expanded');
  }

  /**
   * Toggle expand/collapse for a node.
   */
  toggle(id: string | number | symbol): void {
    this._toggleNode(id);
  }

  /**
   * Select a node by id.
   */
  select(id: string | number | symbol): void {
    this._selectNode(id);
  }

  /**
   * Get the currently selected node id, or null.
   */
  getSelected(): string | number | symbol | null {
    return this._selectedId;
  }

  /**
   * Get the node data by id.
   */
  getNode(id: string | number | symbol): TreeNodeData | undefined {
    return this._nodeMap.get(id)?.data;
  }

  /**
   * Expand all nodes recursively.
   */
  expandAll(): void {
    for (const [, entry] of this._nodeMap) {
      if (entry.childrenEl) {
        entry.childrenEl.classList.remove('tenilla-tree-collapsed');
        entry.element.classList.add('tenilla-tree-node-expanded');
      }
    }
  }

  /**
   * Collapse all nodes.
   */
  collapseAll(): void {
    for (const [, entry] of this._nodeMap) {
      if (entry.childrenEl) {
        entry.childrenEl.classList.add('tenilla-tree-collapsed');
        entry.element.classList.remove('tenilla-tree-node-expanded');
      }
    }
  }

  /**
   * Remove all nodes.
   */
  clear(): void {
    this._nodeMap.clear();
    this._element.innerHTML = '';
    this._selectedId = null;
  }

  /**
   * Destroy the tree and clean up.
   */
  destroy(): void {
    this.clear();
    this._element.remove();
    this._element = anynull;
    this._nodeMap = anynull;
    this._onSelect = anynull;
    this._onToggle = anynull;
  }
}
