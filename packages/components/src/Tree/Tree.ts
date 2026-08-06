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
  /** Whether the whole tree is disabled */
  disabled?: boolean;
  /** Left indent per nesting level. Any CSS padding value, e.g. "24px" "1.5rem". Default "20px" */
  indent?: string;
  /** Toggle arrow position: 'left' (default) | 'right' */
  togglePosition?: 'left' | 'right';
  /** Callback when a node is selected */
  onChange?: OnChange<string | number | symbol | null>;
  /** Callback when a node is expanded or collapsed */
  onToggle?: (id: string | number | symbol, expanded: boolean) => void;
}

export class TreeNode extends TenillaComponent {
  /** @internal Create a chevron SVG icon */
  private static readonly ToggleIcon = svg('svg', {
    viewBox: '0 0 12 12',
    class: 'tenilla-tree-toggle-icon',
  }).child(svg('path', { d: 'M 4.5 2 L 8.5 6 L 4.5 10' }));

  /** @internal */
  protected _element: HTMLElement;
  /** @internal Whether this node is disabled */
  private _id: string | number | symbol;
  /** @internal Cached row element */
  private _row: HTMLElement;
  /** @internal Cached toggle icon element (null for leaf nodes) */
  private _toggle: HTMLElement;

  /** @internal Reference back to the owning Tree */
  private _root: Tree;
  /** @internal Parent TreeNode, or null if root-level */
  private _parent: TreeNode | null;
  /** @internal */
  private _childrenEl: HTMLElement;
  /** @internal Inner wrapper for animation */
  private _childrenInner: HTMLElement;

  /** @internal Whether the node is expanded */
  private _expanded: boolean;
  /** @internal Whether this node is disabled */
  private _disabled: boolean;
  /** @internal Child TreeNode instances */
  private _children: TreeNode[];
  /** @internal Nesting depth (0 = root) */
  private _depth: number;

  constructor(root: Tree, data: TreeNodeData, parent: TreeNode | null) {
    super();
    this._root = root;
    this._id = data.id;
    this._parent = parent;
    this._children = [];
    this._expanded = data.expanded ?? false;
    this._disabled = data.disabled ?? false;
    this._depth = parent ? parent._depth + 1 : 0;

    const hasChildren = data.children && data.children.length > 0;

    // Build toggle
    this._toggle = this._createToggle(hasChildren);

    // Build row
    this._row = div('tenilla-tree-node-row')
      .class('tenilla-tree-disabled', this._disabled)
      .on('click', () => {
        if (this._root.disabled || this._disabled) {
          return;
        }
        if (this._children.length) {
          this._root._toggle(this);
        } else {
          this._root._select(this);
        }
      })
      .child(this._toggle, div('tenilla-tree-label', data.label ?? ''));

    // Node element
    this._element = div('tenilla-tree-node');
    this._element.style.setProperty('--tenilla-tree-depth', String(this._depth));

    if (this._expanded) {
      this._element.setAttribute('data-expanded', '');
    }

    // Children container
    this._childrenEl = div('tenilla-tree-children');
    this._childrenInner = div('tenilla-tree-children-inner');

    data.children?.forEach((c) => {
      const n = new TreeNode(root, c, this);
      this._children.push(n);
      this._childrenInner.child(n._element);
    });

    this._childrenEl.child(this._childrenInner);
    this._element.child(this._row, this._childrenEl);
  }

  get children(): TreeNode[] {
    return this._children;
  }

  get id(): string | number | symbol {
    return this._id;
  }

  get parent(): TreeNode | null {
    return this._parent;
  }

  get expanded(): boolean {
    return this._expanded;
  }

  /**
   * Combined true if this node is disabled or if the tree is disabled.
   */
  get disabled(): boolean {
    return this._disabled || this._root.disabled;
  }

  set disabled(v: boolean) {
    this._disabled = v;
    this._row.class('tenilla-tree-disabled', v);
  }

  /** Expand this node */
  expand(): void {
    if (this._root.disabled || this._disabled || !this._childrenEl) {
      return;
    }
    this._element.setAttribute('data-expanded', '');
    this._expanded = true;
  }

  /** Collapse this node */
  collapse(): void {
    if (this._root.disabled || this._disabled || !this._childrenEl) {
      return;
    }
    this._element.removeAttribute('data-expanded');
    this._expanded = false;
  }

  /** Toggle expand/collapse */
  toggle(): void {
    if (this._root.disabled || this._disabled) {
      return;
    }
    if (this._expanded) {
      this.collapse();
    } else {
      this.expand();
    }
  }

  /** @internal  */
  private _createToggle(hasChildren: unknown): HTMLElement {
    return hasChildren
      ? div('tenilla-tree-toggle').child(TreeNode.ToggleIcon.cloneNode(true))
      : div('tenilla-tree-toggle-placeholder');
  }

  /** @internal Select this node (visual only — call Tree.select for full logic) */
  _select(): void {
    this._row.classList.add('tenilla-tree-selected');
  }

  /** @internal Deselect this node */
  _deselect(): void {
    this._row.classList.remove('tenilla-tree-selected');
  }

  /** Add a child node */
  add(data: TreeNodeData): TreeNode {
    // Ensure children container exists
    if (!this._childrenEl) {
      this._element.child(
        (this._childrenEl = div('tenilla-tree-children').child(
          (this._childrenInner = div('tenilla-tree-children-inner')),
        )),
      );

      // Replace placeholder with toggle
      const placeholder = this._row.querySelector('.tenilla-tree-toggle-placeholder');
      if (placeholder) {
        this._toggle = div('tenilla-tree-toggle').child(TreeNode.ToggleIcon.cloneNode(true));
        placeholder.replaceWith(this._toggle);

        // Re-bind click handler for the new toggle
        this._row.on('click', (e: Event) => {
          if (this._root.disabled || this._disabled) return;
          if (this._toggle && this._toggle.contains(e.target as Node)) {
            this._root._toggle(this);
          } else {
            this._root._select(this);
          }
        });
      }
    }

    const node = new TreeNode(this._root, data, this);
    this._children.push(node);
    this._childrenInner!.child(node._element);
    return node;
  }

  /**
   * Remove a child node by TreeNode reference
   * @param child If not provided, removes itself.
   */
  remove(child?: TreeNode): void {
    if (child) {
      const idx = this._children.indexOf(child);
      if (idx === -1) {
        return;
      }

      this._children.splice(idx, 1);
      child.destroy();
    } else {
      if (this.parent) {
        this.parent.remove(this);
      } else {
        // Root-level node
        const idx = this._root._rootNodes.indexOf(this);
        if (idx !== -1) {
          this._root._rootNodes.splice(idx, 1);
          this.destroy();
        }
      }
    }
  }

  /** Destroy this node and all descendants */
  destroy(): void {
    // Destroy children first
    this._children.forEach((child) => child.destroy());
    this._children = anynull;

    this._element.remove();
    this._element = anynull;
    this._row = anynull;
    this._toggle = anynull;
    this._childrenEl = anynull;
    this._childrenInner = anynull;
    this._parent = anynull;
    this._root = anynull;
  }
}

export class Tree extends TenillaInput {
  name: string;

  /** @internal */
  protected _element: HTMLElement;
  /** @internal */
  _rootNodes: TreeNode[];
  /** @internal id → TreeNode lookup */
  private _nodeMap: Map<string | number | symbol, TreeNode>;
  /** @internal */
  private _selected: TreeNode | null;
  /** @internal Whether the whole tree is disabled */
  private _disabled: boolean;
  /** @internal Arrow position */
  private _togglePosition: 'left' | 'right';

  protected onToggle: (id: string | number | symbol, expanded: boolean) => void;

  protected onChange: OnChange<string | number | symbol | null>;

  constructor(options: TreeOptions = { data: [] }) {
    super();
    this.name = options.name ?? '';
    this._element = div('tenilla-tree');
    this._rootNodes = [];
    this._nodeMap = new Map();
    this._selected = null;
    this._disabled = options.disabled ?? false;
    this._togglePosition = options.togglePosition ?? 'left';
    this.onChange = options.onChange ?? _noop;
    this.onToggle = options.onToggle ?? _noop;

    // Set indent via CSS variable — default "20px"
    this._element.style.setProperty('--tenilla-tree-indent', options.indent ?? '20px');

    // Set toggle position
    if (this._togglePosition === 'right') {
      this._element.dataset.togglePosition = 'right';
    }

    this._set(options.data);
  }

  get rootNodes(): TreeNode[] {
    return this._rootNodes;
  }

  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(v: boolean) {
    this._disabled = v;
    this._element.class('tenilla-tree-disabled', v);
  }

  // # private
  /** @internal */
  private _set(data: TreeNodeData[]): void {
    this.clear();
    data.forEach((v) => this._append(v));
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
    if (this._disabled) {
      return;
    }
    node.toggle();
    this.onToggle(node.id, node.expanded);
  }

  /** @internal Called by TreeNode when a row click happens (not toggle) */
  _select(node: TreeNode): void {
    if (this._disabled) {
      return;
    }

    // Deselect previous
    if (this._selected && this._selected !== node) {
      this._selected._deselect();
    }

    const old = this._selected ? this._selected.id : null;
    this._selected = node;
    node._select();

    this.onChange(node.id, old);
  }

  // # public
  /** Add a new tree node. If `parentId` is provided, append as child of that parent. */
  add(data: TreeNodeData, parentId?: string | number | symbol): TreeNode {
    let node: TreeNode;

    if (parentId !== undefined) {
      const parent = this._nodeMap.get(parentId);
      if (!parent) {
        throw new Error(`Parent node "${String(parentId)}" not found`);
      }
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

    if (this._selected && this._selected.id === id) {
      this._selected = null;
    }
  }

  /** Expand a node by id */
  expand(id: string | number | symbol): void {
    if (this._disabled) return;
    this._nodeMap.get(id)?.expand();
  }

  /** Collapse a node by id */
  collapse(id: string | number | symbol): void {
    if (this._disabled) return;
    this._nodeMap.get(id)?.collapse();
  }

  /** Toggle expand/collapse for a node by id */
  toggle(id: string | number | symbol): void {
    if (this._disabled) return;
    this._nodeMap.get(id)?.toggle();
  }

  /** Select a node by id */
  set value(id: string | number | symbol) {
    if (this._disabled) return;
    const node = this._nodeMap.get(id);
    if (node) {
      this._select(node);
    }
  }

  /** Get the currently selected node id, or null */
  get value(): string | number | symbol | null {
    return this._selected ? this._selected?.id : null;
  }

  /** Get the TreeNode instance by id */
  get(id: string | number | symbol): TreeNode | undefined {
    return this._nodeMap.get(id);
  }

  /** Expand all nodes recursively */
  expandAll(): void {
    if (this._disabled) {
      return;
    }
    this._nodeMap.forEach((node) => node.expand());
  }

  /** Collapse all nodes */
  collapseAll(): void {
    if (this._disabled) {
      return;
    }
    this._nodeMap.forEach((node) => node.collapse());
  }

  /** Remove all nodes */
  clear(): void {
    this._rootNodes.forEach((node) => node.destroy());
    this._rootNodes = [];
    this._nodeMap.clear();
    this._element.innerHTML = '';
    this._selected = null;
  }

  /** Destroy the tree and clean up */
  destroy(): void {
    this.clear();
    this._element.remove();
    this._element = anynull;
    this._rootNodes = anynull;
    this._nodeMap = anynull;
    this._selected = anynull;
    this.onChange = anynull;
    this.onToggle = anynull;
  }
}
