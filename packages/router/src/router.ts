import { TenillaLike } from '@tenilla/core';
import { matchPattern, extractParams, parseQuery, stringifyQuery } from './utils.js';

/**
 * Route view type - can be a class constructor or a factory function
 * - Class constructor: extends HTMLElement or implements TenillaLike
 * - Factory function: returns HTMLElement or TenillaLike
 */
export type RouteView =
  | (new () => HTMLElement)
  | (new () => TenillaLike)
  | ((params: Record<string, string>) => HTMLElement)
  | ((params: Record<string, string>) => TenillaLike);

/**
 * Route configuration options
 */
export interface RouteOptions {
  path: string; // Route path, e.g. '/users/:id'
  name?: string; // Optional route name for named routing
  view: RouteView; // Route view - class constructor or factory function
  meta?: any; // Optional metadata for the route
}

/**
 * Current route information
 */
export interface RouterInfo {
  path: string; // Current path
  params: Record<string, string>; // Route parameters
  query: Record<string, string>; // Query parameters
  name?: string; // Route name (if available)
}

/**
 * Navigation target for next() function
 */
export type NavigationTarget = string | { name: string } | undefined;

/**
 * Navigation guard function type
 */
export interface NavigationGuard {
  (from: RouterInfo, to: RouterInfo, next: (target?: NavigationTarget) => void): boolean | void;
}

/**
 * Router configuration options
 */
export interface RouterOptions {
  routes?: RouteOptions[]; // Route configuration array
  base?: string; // Optional base path, e.g. '/app'
  beforeEach?: NavigationGuard; // Before navigation guard
  afterEach?: (from: RouterInfo, to: RouterInfo) => void; // After navigation hook
  failed?: (from: RouterInfo, to: RouterInfo) => void; // Navigation failed hook
}

/**
 * Minimal synchronous router for Tenilla
 *
 * Provides client-side routing with:
 * - Route pattern matching and parameter extraction
 * - History API navigation (pushState/replaceState)
 * - Navigation guards (beforeEach, afterEach, failed)
 * - Named routing support
 * - Query parameter parsing
 * - Muted navigation (skip hooks)
 */
export class Router {
  // Route storage
  /** @internal */
  private _routes: RouteOptions[] = [];

  // Router configuration
  /** @internal */
  private _base: string = '';
  /** @internal */
  private _beforeEach?: NavigationGuard;
  /** @internal */
  private _afterEach?: (from: RouterInfo, to: RouterInfo) => void;
  /** @internal */
  private _failed?: (from: RouterInfo, to: RouterInfo) => void;

  // Current state
  /** @internal */
  private _current: RouterInfo | null = null;
  /** @internal */
  private _isStarted: boolean = false;

  // Event handler for popstate
  private _popStateHandler: ((event: PopStateEvent) => void) | null = null;

  constructor(options?: RouterOptions) {
    if (options) {
      if (options.routes) {
        // Normalize routes - ensure meta always exists (at least as empty object)
        this._routes = options.routes.map((route) => ({
          ...route,
          meta: route.meta ?? {},
        }));
      }
      if (options.base) {
        this._base = options.base.replace(/\/$/, ''); // Remove trailing slash
      }
      this._beforeEach = options.beforeEach;
      this._afterEach = options.afterEach;
      this._failed = options.failed;
    }
  }

  /**
   * Register a new route
   */
  add(options: RouteOptions): this {
    // Normalize route - ensure meta always exists (at least as empty object)
    const normalizedRoute: RouteOptions = {
      ...options,
      meta: options.meta ?? {},
    };
    this._routes.push(normalizedRoute);
    return this;
  }

  /**
   * Navigate to a path
   * @param target - Path string or { name: string } object for named routing
   * @param options - Navigation options
   */
  go(target: string | { name: string }, options?: { replace?: boolean; muted?: boolean }): this {
    const path = typeof target === 'string' ? target : this.resolveRouteByName(target.name);
    if (!path) {
      console.error(`Route not found: ${typeof target === 'string' ? target : target.name}`);
      // Don't perform navigation if route name not found
      return this;
    }

    const opts = {
      replace: false,
      muted: false,
      ...options,
    };

    // Muted navigation - skip all hooks
    if (opts.muted) {
      this.performNavigation(path, opts.replace, true);
      return this;
    }

    // Normal navigation with hooks
    this.performNavigationWithHooks(path, opts.replace);
    return this;
  }

  /**
   * Start the router and begin listening to navigation events
   */
  start(): this {
    if (this._isStarted) return this;

    this._isStarted = true;

    // Listen for browser navigation first (before handling initial route)
    this._popStateHandler = () => {
      this.handleCurrentLocation();
    };
    window.addEventListener('popstate', this._popStateHandler);

    // Handle initial route (without triggering hooks)
    this.handleInitialLocation();

    return this;
  }

  /**
   * Stop the router and remove event listeners
   */
  stop(): this {
    if (!this._isStarted) return this;

    this._isStarted = false;

    if (this._popStateHandler) {
      window.removeEventListener('popstate', this._popStateHandler);
      this._popStateHandler = null;
    }

    return this;
  }

  /**
   * Get current route information
   */
  get current(): RouterInfo | null {
    return this._current;
  }

  /**
   * Find route by name
   */
  getRouteByName(name: string): RouteOptions | null {
    return this._routes.find((route) => route.name === name) || null;
  }

  /**
   * Resolve route path by name (returns the path pattern, not with params)
   * @internal
   */
  private resolveRouteByName(name: string): string | null {
    const route = this.getRouteByName(name);
    return route ? route.path : null;
  }

  /**
   * Handle current browser location
   * @internal
   */
  private handleCurrentLocation(): void {
    // Strip basePath from pathname for route matching
    let pathname = window.location.pathname;
    if (this._base && pathname.startsWith(this._base)) {
      pathname = pathname.substring(this._base.length);
    }

    const query = parseQuery(window.location.search);
    this.matchAndExecute(pathname, query, false);
  }

  /**
   * Handle initial location without triggering hooks
   * @internal
   */
  private handleInitialLocation(): void {
    // Strip basePath from pathname for route matching
    let pathname = window.location.pathname;
    if (this._base && pathname.startsWith(this._base)) {
      pathname = pathname.substring(this._base.length);
    }

    const query = parseQuery(window.location.search);
    this.matchAndExecute(pathname, query, true);
  }

  /**
   * Find matching route for given path
   * @internal
   */
  private findMatchingRoute(path: string): RouteOptions | null {
    // Don't strip basePath here - path should already be normalized
    for (const route of this._routes) {
      if (matchPattern(route.path, path)) {
        return route;
      }
    }
    return null;
  }

  /**
   * Perform navigation with hooks
   * @internal
   */
  private performNavigationWithHooks(path: string, replace: boolean): void {
    const fullPath = this.getFullPath(path);
    const query = parseQuery(window.location.search);

    // Build current and target route info
    const from = this._current || { path: '', params: {}, query: {} };
    const to = this.buildRouterInfo(fullPath, query);

    // Execute beforeEach guard
    if (this._beforeEach) {
      try {
        let nextCalled = false;
        let nextAllowed = false; // Track if navigation is explicitly allowed

        const next = (target?: NavigationTarget) => {
          nextCalled = true;

          // If no target provided, confirm navigation (equivalent to return true)
          if (target === undefined) {
            nextAllowed = true;
            return;
          }

          // If target provided, perform redirect
          const path = typeof target === 'string' ? target : this.resolveRouteByName(target.name);
          if (path) {
            this.performNavigation(path, true, true); // next is always muted and replace
          }
        };

        const result = this._beforeEach(from, to, next);

        // If next was called with redirect target, don't continue with normal navigation
        if (nextCalled && !nextAllowed) {
          return;
        }

        // If guard returns false, cancel navigation
        if (result === false) {
          if (this._failed) {
            this._failed(from, to);
          }
          return;
        }
      } catch (error) {
        console.error('Error in beforeEach guard:', error);
        if (this._failed) {
          this._failed(from, to);
        }
        return;
      }
    }

    // Perform the navigation
    this.performNavigation(fullPath, replace, false);
  }

  /**
   * Perform the actual navigation using History API
   * @internal
   */
  private performNavigation(path: string, replace: boolean, muted: boolean = false): void {
    const url = this.getFullPath(path);

    if (replace) {
      window.history.replaceState(null, '', url);
    } else {
      window.history.pushState(null, '', url);
    }

    // Handle the new location - strip basePath for matching
    let pathname = path;
    if (this._base && pathname.startsWith(this._base)) {
      pathname = pathname.substring(this._base.length);
    }

    const query = parseQuery(window.location.search);
    this.matchAndExecute(pathname, query, muted);
  }

  /**
   * Match route and execute handler
   * @internal
   */
  private matchAndExecute(
    path: string,
    query: Record<string, string>,
    muted: boolean = false,
  ): void {
    const routeInfo = this.buildRouterInfo(path, query);
    const matchedRoute = this.findMatchingRoute(path);

    if (matchedRoute) {
      routeInfo.name = matchedRoute.name;
      routeInfo.params = extractParams(matchedRoute.path, path);

      // Execute route view
      try {
        const view = matchedRoute.view;

        // Use runtime check to determine if it's a class or function
        // Classes have a prototype property, plain functions typically don't (or have Object.prototype)
        if (
          typeof view === 'function' &&
          'prototype' in view &&
          view.prototype.constructor === view
        ) {
          // It's a class constructor - instantiate it
          (view as any)(routeInfo.params);
        } else {
          // It's a factory function - call it
          (view as (params: Record<string, string>) => HTMLElement | TenillaLike)(routeInfo.params);
        }
      } catch (error) {
        console.error('Error executing route view:', error);
      }
    }

    // Update current state
    const from = this._current || { path: '', params: {}, query: {} };
    this._current = routeInfo;

    // Execute afterEach hook (skip if muted)
    if (!muted && this._afterEach) {
      try {
        this._afterEach(from, routeInfo);
      } catch (error) {
        console.error('Error in afterEach hook:', error);
      }
    }
  }

  /**
   * Build router info from path and query
   * @internal
   */
  private buildRouterInfo(path: string, query: Record<string, string>): RouterInfo {
    return {
      path,
      params: {},
      query,
    };
  }

  /**
   * Get full path with base path
   * @internal
   */
  private getFullPath(path: string): string {
    if (!this._base) {
      return path;
    }

    // Remove base path from path if it exists
    if (path.startsWith(this._base)) {
      return path;
    }

    return `${this._base}${path}`;
  }
}
