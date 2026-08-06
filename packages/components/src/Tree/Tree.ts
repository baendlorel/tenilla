import { _noop, div, OnChange, svg, TenillaComponent, TenillaInput } from '@tenilla/core';
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
  name?: string;
  /** Initial tree data */
  data: TreeNodeData[];
  /** Callback when a node is selected */
  onChange?: OnChange<string | number | symbol | null>;
  /** Callback when a node is expanded or collapsed */
  onToggle?: (id: string | number | symbol, expanded: boolean) => void;
}

export class TreeNode extends TenillaComponent {
  /** @internal Create a right-pointing triangle SVG icon */
  private static readonly ToggleIcon = svg('svg', {
    viewBox: '0 0 10 10',
    class: 'tenilla-tree-toggle-icon',
  }).child(svg('path', { d: 'M 3 1 L 8 5 L 3 9 Z' }));

  /** @internal */
  protected _element: HTMLElement;
  /** @internal Cached row element */
  private _row: HTMLElement;
  /** @internal Cached toggle icon element (null for leaf nodes) */
  private _toggle: HTMLElement | null;
  /** @internal Cached children container (null for leaf nodes) */
  private _childrenEl: HTMLElement | null;
  /** @internal The node data */
  private _data: TreeNodeData;
  /** @internal Parent TreeNode, or null if root-level */
  private _parent: TreeNode | null;
  /** @internal Child TreeNode instances */
  private _children: TreeNode[];
  /** @internal Reference back to the owning Tree */
  private _tree: Tree;
  /** @internal Whether the node is expanded */
  private _expanded: boolean;

  constructor(tree: Tree, data: TreeNodeData, parent: TreeNode | null) {
    super();
    this._tree = tree;
    this._data = data;
    this._parent = parent;
    this._children = [];
    this._expanded = data.expanded ?? false;

    const hasChildren = data.children && data.children.length > 0;

    // Build toggle
    let toggleEl: HTMLElement | null = null;

    // Build row
    const row = div('tenilla-tree-node-row')
      .class('tenilla-tree-disabled', data.disabled)
      .on('click', (e: Event) => {
        if (data.disabled) return;
        if (toggleEl && toggleEl.contains(e.target as Node)) {
          this._tree._toggle(this);
        } else {
          this._tree._select(this);
        }
      });

    // Label
    const label = div('tenilla-tree-label', data.label ?? '');

    if (hasChildren) {
      toggleEl = div('tenilla-tree-toggle').child(TreeNode.ToggleIcon.cloneNode(true));
      row.child(toggleEl, label);
    } else {
      row.child(div('tenilla-tree-toggle-placeholder'), label);
    }

    // Node element
    const nodeEl = div('tenilla-tree-node').child(row);

    // Children container
    let childrenEl: HTMLElement | null = null;
    if (hasChildren) {
      childrenEl = div('tenilla-tree-children').class('tenilla-tree-collapsed', !this._expanded);
      nodeEl.child(childrenEl);

      for (const childData of data.children!) {
        const childNode = new TreeNode(tree, childData, this);
        this._children.push(childNode);
        childrenEl!.child(childNode._element);
      }
    }

    // Expanded class
    if (this._expanded && toggleEl) {
      nodeEl.classList.add('tenilla-tree-node-expanded');
    }

    this._element = nodeEl;
    this._row = row;
    // label kept in DOM (via _row), no private ref needed
    this._toggle = toggleEl;
    this._childrenEl = childrenEl;
  }

  get data(): TreeNodeData {
    return this._data;
  }

  get children(): TreeNode[] {
    return this._children;
  }

  get parent(): TreeNode | null {
    return this._parent;
  }

  get expanded(): boolean {
    return this._expanded;
  }

  /* ── tree node operations ───────────────────────────────────────────────── */

  /** Expand this node */
  expand(): void {
    if (!this._childrenEl || !this._toggle) return;
    this._childrenEl.classList.remove('tenilla-tree-collapsed');
    this._element.classList.add('tenilla-tree-node-expanded');
    this._expanded = true;
  }

  /** Collapse this node */
  collapse(): void {
    if (!this._childrenEl || !this._toggle) return;
    this._childrenEl.classList.add('tenilla-tree-collapsed');
    this._element.classList.remove('tenilla-tree-node-expanded');
    this._expanded = false;
  }

  /** Toggle expand/collapse */
  toggle(): void {
    if (this._expanded) {
      this.collapse();
    } else {
      this.expand();
    }
  }

  /** Select this node (visual only — call Tree.select for full logic) */
  _select(): void {
    this._row.classList.add('tenilla-tree-selected');
  }

  /** Deselect this node */
  _deselect(): void {
    this._row.classList.remove('tenilla-tree-selected');
  }

  /** @internal Mark disabled state */
  _setDisabled(disabled: boolean): void {
    this._data.disabled = disabled;
    this._row.class('tenilla-tree-disabled', disabled);
  }

  /** Add a child node */
  add(data: TreeNodeData): TreeNode {
    // Ensure children container exists
    if (!this._childrenEl) {
      this._childrenEl = div('tenilla-tree-children');
      this._element.child(this._childrenEl);

      // Replace placeholder with toggle
      const placeholder = this._row.querySelector('.tenilla-tree-toggle-placeholder');
      if (placeholder) {
        const toggle = div('tenilla-tree-toggle').child(TreeNode.ToggleIcon.cloneNode(true));
        placeholder.replaceWith(toggle);
        this._toggle = toggle;

        // Re-bind click handler for the new toggle
        this._row.on('click', (e: Event) => {
          if (this._data.disabled) return;
          if (this._toggle && this._toggle.contains(e.target as Node)) {
            this._tree._toggle(this);
          } else {
            this._tree._select(this);
          }
        });
      }

      // Ensure children array exists in data
      if (!this._data.children) {
        this._data.children = [];
      }
    }

    const node = new TreeNode(this._tree, data, this);
    this._children.push(node);
    this._data.children!.push(data);
    this._childrenEl!.child(node._element);
    return node;
  }

  /** Remove a child node by TreeNode reference */
  remove(child: TreeNode): void {
    const idx = this._children.indexOf(child);
    if (idx === -1) return;

    this._children.splice(idx, 1);
    this._data.children!.splice(idx, 1);
    child.destroy();
  }

  /** Destroy this node and all descendants */
  destroy(): void {
    // Destroy children first
    for (const child of this._children) {
      child.destroy();
    }
    this._children = anynull;

    this._element.remove();
    this._element = anynull;
    this._row = anynull;
    this._toggle = anynull;
    this._childrenEl = anynull;
    this._data = anynull;
    this._parent = anynull;
    this._tree = anynull;
  }
}

export class Tree extends TenillaInput {
  name: string;

  /** @internal */
  protected _element: HTMLElement;
  /** @internal */
  private _rootNodes: TreeNode[];
  /** @internal id → TreeNode lookup */
  private _nodeMap: Map<string | number | symbol, TreeNode>;
  /** @internal */
  private _selectedId: string | number | symbol | null;
  /** @internal */
  private _selectedNode: TreeNode | null;

  protected onToggle: (id: string | number | symbol, expanded: boolean) => void;

  protected onChange: OnChange<string | number | symbol | null>;

  constructor(options: TreeOptions = { data: [] }) {
    super();
    this.name = options.name ?? '';
    this._element = div('tenilla-tree');
    this._rootNodes = [];
    this._nodeMap = new Map();
    this._selectedId = null;
    this._selectedNode = null;
    this.onChange = options.onChange ?? _noop;
    this.onToggle = options.onToggle ?? _noop;

    if (options.data) {
      this._set(options.data);
    }
  }

  get rootNodes(): TreeNode[] {
    return this._rootNodes;
  }

  /* ── internal ────────────────────────────────────────────────────────────── */

  /** @internal */
  private _set(data: TreeNodeData[]): void {
    this.clear();
    for (const nodeData of data) {
      this._append(nodeData);
    }
  }

  /** @internal Create a root-level TreeNode */
  private _append(data: TreeNodeData): TreeNode {
    const node = new TreeNode(this, data, null);
    this._rootNodes.push(node);
    this._nodeMap.set(data.id, node);
    this._element.child(node.element);
    return node;
  }

  /** @internal Called by TreeNode when a toggle click happens */
  _toggle(node: TreeNode): void {
    if (!node.data.disabled) {
      node.toggle();
      this.onToggle(node.data.id, node.expanded);
    }
  }

  /** @internal Called by TreeNode when a row click happens (not toggle) */
  _select(node: TreeNode): void {
    if (node.data.disabled) return;

    // Deselect previous
    if (this._selectedNode && this._selectedNode !== node) {
      this._selectedNode._deselect();
    }

    const old = this._selectedId;
    this._selectedId = node.data.id;
    this._selectedNode = node;
    node._select();

    this.onChange(node.data.id, old);
  }

  /* ── public API ──────────────────────────────────────────────────────────── */

  /** Add a new tree node. If `parentId` is provided, append as child of that parent. */
  add(data: TreeNodeData, parentId?: string | number | symbol): TreeNode {
    let node: TreeNode;

    if (parentId !== undefined) {
      const parent = this._nodeMap.get(parentId);
      if (!parent) throw new Error(`Parent node "${String(parentId)}" not found`);
      node = parent.add(data);
    } else {
      node = this._append(data);
    }

    this._nodeMap.set(data.id, node);
    return node;
  }

  /** Remove a node by id */
  remove(id: string | number | symbol): void {
    const node = this._nodeMap.get(id);
    if (!node) {
      return;
    }

    // Remove from parent's children
    if (node.parent) {
      node.parent.remove(node);
    } else {
      // Root-level node
      const idx = this._rootNodes.indexOf(node);
      if (idx !== -1) {
        this._rootNodes.splice(idx, 1);
        node.destroy();
      }
    }

    this._nodeMap.delete(id);

    if (this._selectedId === id) {
      this._selectedId = null;
      this._selectedNode = null;
    }
  }

  /** Expand a node by id */
  expand(id: string | number | symbol): void {
    this._nodeMap.get(id)?.expand();
  }

  /** Collapse a node by id */
  collapse(id: string | number | symbol): void {
    this._nodeMap.get(id)?.collapse();
  }

  /** Toggle expand/collapse for a node by id */
  toggle(id: string | number | symbol): void {
    this._nodeMap.get(id)?.toggle();
  }

  /** Select a node by id */
  set value(id: string | number | symbol) {
    const node = this._nodeMap.get(id);
    if (node) {
      this._select(node);
    }
  }

  /** Get the currently selected node id, or null */
  get value(): string | number | symbol | null {
    return this._selectedId;
  }

  /** Get the TreeNode instance by id */
  get(id: string | number | symbol): TreeNode | undefined {
    return this._nodeMap.get(id);
  }

  /** Expand all nodes recursively */
  expandAll(): void {
    this._nodeMap.forEach((node) => node.expand());
  }

  /** Collapse all nodes */
  collapseAll(): void {
    this._nodeMap.forEach((node) => node.collapse());
  }

  /** Remove all nodes */
  clear(): void {
    this._rootNodes.forEach((node) => node.destroy());
    this._rootNodes = [];
    this._nodeMap.clear();
    this._element.innerHTML = '';
    this._selectedId = null;
    this._selectedNode = null;
  }

  /** Destroy the tree and clean up */
  destroy(): void {
    this.clear();
    this._element.remove();
    this._element = anynull;
    this._rootNodes = anynull;
    this._nodeMap = anynull;
    this._selectedNode = anynull;
    this.onChange = anynull;
    this.onToggle = anynull;
  }
}
