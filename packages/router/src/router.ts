import {
  matchPattern,
  extractParams,
  parseQuery,
  stringifyQuery
} from './utils.js';

/**
 * Route handler function type
 */
export type RouteHandler = (params: Record<string, string>) => void;

/**
 * Route configuration options
 */
export interface RouteOptions {
  path: string;              // Route path, e.g. '/users/:id'
  name?: string;             // Optional route name for named routing
  handler: RouteHandler;     // Route handler
}

/**
 * Current route information
 */
export interface RouterInfo {
  path: string;              // Current path
  params: Record<string, string>;   // Route parameters
  query: Record<string, string>;   // Query parameters
  name?: string;             // Route name (if available)
}

/**
 * Navigation guard function type
 */
export interface NavigationGuard {
  (from: RouterInfo, to: RouterInfo, next: (path: string) => void): boolean | void;
}

/**
 * Router configuration options
 */
export interface RouterOptions {
  routes?: RouteOptions[];   // Route configuration array
  basePath?: string;         // Optional base path, e.g. '/app'
  beforeEach?: NavigationGuard;   // Before navigation guard
  afterEach?: (from: RouterInfo, to: RouterInfo) => void;   // After navigation hook
  failed?: (from: RouterInfo, to: RouterInfo) => void;      // Navigation failed hook
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
  private _routes: RouteOptions[] = [];

  // Router configuration
  private _basePath: string = '';
  private _beforeEach?: NavigationGuard;
  private _afterEach?: (from: RouterInfo, to: RouterInfo) => void;
  private _failed?: (from: RouterInfo, to: RouterInfo) => void;

  // Current state
  private _current: RouterInfo | null = null;
  private _isStarted: boolean = false;

  // Event handler for popstate
  private _popStateHandler: ((event: PopStateEvent) => void) | null = null;

  constructor(options?: RouterOptions) {
    if (options) {
      if (options.routes) {
        this._routes = [...options.routes];
      }
      if (options.basePath) {
        this._basePath = options.basePath.replace(/\/$/, ''); // Remove trailing slash
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
    this._routes.push(options);
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
      ...options
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
    return this._routes.find(route => route.name === name) || null;
  }

  /**
   * Resolve route path by name (returns the path pattern, not with params)
   */
  private resolveRouteByName(name: string): string | null {
    const route = this.getRouteByName(name);
    return route ? route.path : null;
  }

  /**
   * Handle current browser location
   */
  private handleCurrentLocation(): void {
    // Strip basePath from pathname for route matching
    let pathname = window.location.pathname;
    if (this._basePath && pathname.startsWith(this._basePath)) {
      pathname = pathname.substring(this._basePath.length);
    }

    const query = parseQuery(window.location.search);
    this.matchAndExecute(pathname, query, false);
  }

  /**
   * Handle initial location without triggering hooks
   */
  private handleInitialLocation(): void {
    // Strip basePath from pathname for route matching
    let pathname = window.location.pathname;
    if (this._basePath && pathname.startsWith(this._basePath)) {
      pathname = pathname.substring(this._basePath.length);
    }

    const query = parseQuery(window.location.search);
    this.matchAndExecute(pathname, query, true);
  }

  /**
   * Find matching route for given path
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
        const next = (nextPath: string) => {
          nextCalled = true;
          this.performNavigation(nextPath, true, true); // next is always muted and replace
        };

        const result = this._beforeEach(from, to, next);

        // If next was called, don't continue with normal navigation
        if (nextCalled) {
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
    if (this._basePath && pathname.startsWith(this._basePath)) {
      pathname = pathname.substring(this._basePath.length);
    }

    const query = parseQuery(window.location.search);
    this.matchAndExecute(pathname, query, muted);
  }

  /**
   * Match route and execute handler
   */
  private matchAndExecute(path: string, query: Record<string, string>, muted: boolean = false): void {
    const routeInfo = this.buildRouterInfo(path, query);
    const matchedRoute = this.findMatchingRoute(path);

    if (matchedRoute) {
      routeInfo.name = matchedRoute.name;
      routeInfo.params = extractParams(matchedRoute.path, path);

      // Execute route handler
      try {
        matchedRoute.handler(routeInfo.params);
      } catch (error) {
        console.error('Error executing route handler:', error);
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
   */
  private buildRouterInfo(path: string, query: Record<string, string>): RouterInfo {
    return {
      path,
      params: {},
      query
    };
  }

  /**
   * Get full path with base path
   */
  private getFullPath(path: string): string {
    if (!this._basePath) return path;

    // Remove base path from path if it exists
    if (path.startsWith(this._basePath)) {
      return path;
    }

    return `${this._basePath}${path}`;
  }
}
