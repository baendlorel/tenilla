import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Router } from '../dist/index.mjs';

// Mock window.location and window.history for testing environment
const mockLocation = {
  pathname: '/',
  search: '',
  hash: '',
  origin: 'http://localhost'
};

const mockHistory = {
  state: null,
  pushState: vi.fn(),
  replaceState: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  go: vi.fn()
};

// Store original location
let originalLocation: Location;
const routers: Router[] = [];

function createRouter(options: Omit<ConstructorParameters<typeof Router>[0], 'root'> = {}) {
  const root = document.createElement('main');
  const router = new Router({ root, ...options });
  routers.push(router);
  return router;
}

beforeEach(() => {
  // Store original location
  originalLocation = global.window.location;

  // Reset mock location to default state
  mockLocation.pathname = '/';
  mockLocation.search = '';
  mockLocation.hash = '';
  mockLocation.origin = 'http://localhost';

  // Mock location
  Object.defineProperty(global.window, 'location', {
    value: mockLocation,
    writable: true,
    configurable: true
  });

  // Mock history
  Object.defineProperty(global.window, 'history', {
    value: mockHistory,
    writable: true,
    configurable: true
  });

  // Reset mocks and mock implementations
  vi.clearAllMocks();
  vi.resetAllMocks();
});

afterEach(() => {
  // Restore original location
  Object.defineProperty(global.window, 'location', {
    value: originalLocation,
    writable: true,
    configurable: true
  });
  for (const router of routers.splice(0)) {
    router.stop();
    router.element.remove();
  }
});

describe('Router - Basic Functionality', () => {
  it('should create a router instance', () => {
    const router = createRouter();
    expect(router).toBeInstanceOf(Router);
    expect((router as unknown as { go?: unknown }).go).toBeUndefined();
  });

  it('should create a router with routes', () => {
    const router = createRouter({
      routes: [
        { path: '/', name: 'home', view: vi.fn() },
        { path: '/users/:id', name: 'user', view: vi.fn() }
      ]
    });
    expect(router.current).toBeNull();
  });

  it('should add routes using add method', () => {
    const router = createRouter();
    const view = vi.fn();

    router.add({ path: '/test', name: 'test', view });

    const foundRoute = router.getRouteByName('test');
    expect(foundRoute).toBeDefined();
    expect(foundRoute?.path).toBe('/test');
  });

  it('should find route by name', () => {
    const router = createRouter({
      routes: [
        { path: '/', name: 'home', view: vi.fn() },
        { path: '/users/:id', name: 'user', view: vi.fn() }
      ]
    });

    const homeRoute = router.getRouteByName('home');
    const userRoute = router.getRouteByName('user');
    const notFoundRoute = router.getRouteByName('notfound');

    expect(homeRoute?.path).toBe('/');
    expect(userRoute?.path).toBe('/users/:id');
    expect(notFoundRoute).toBeNull();
  });
});

describe('Router - Route Matching', () => {
  it('should match exact path', () => {
    const view = vi.fn();
    const router = createRouter({
      routes: [
        { path: '/', name: 'home', view }
      ]
    });

    router.start();
    router.push('/');

    expect(view).toHaveBeenCalled();
    expect(router.current?.path).toBe('/');
  });

  it('should match path with parameters', () => {
    const view = vi.fn();
    const router = createRouter({
      routes: [
        { path: '/users/:id', name: 'user', view }
      ]
    });

    mockLocation.pathname = '/users/123';
    router.start();
    router.push('/users/123');

    expect(view).toHaveBeenCalledWith({ id: '123' });
    expect(router.current?.params).toEqual({ id: '123' });
  });

  it('should match path with multiple parameters', () => {
    const view = vi.fn();
    const router = createRouter({
      routes: [
        { path: '/posts/:category/:slug', name: 'post', view }
      ]
    });

    router.start();
    router.push('/posts/tech/my-post');

    expect(view).toHaveBeenCalledWith({ category: 'tech', slug: 'my-post' });
    expect(router.current?.params).toEqual({ category: 'tech', slug: 'my-post' });
  });

  it('should handle routes with basePath', () => {
    const view = vi.fn();
    const router = createRouter({
      base: '/app',
      routes: [
        { path: '/users/:id', name: 'user', view }
      ]
    });

    mockLocation.pathname = '/app/users/123';
    router.start();
    router.push('/users/123');

    expect(view).toHaveBeenCalledWith({ id: '123' });
  });
});

describe('Router - Named Navigation', () => {
  it('should navigate by route name', () => {
    const view = vi.fn();
    const router = createRouter({
      routes: [
        { path: '/users/:id', name: 'user', view }
      ]
    });

    router.start();
    router.push({ name: 'user' });

    expect(mockHistory.pushState).toHaveBeenCalled();
    expect(view).toHaveBeenCalled();
  });

  it('should handle missing route name gracefully', () => {
    const router = createRouter({
      routes: [
        { path: '/', name: 'home', view: vi.fn() }
      ]
    });

    // Reset location to root for clean test state
    mockLocation.pathname = '/';
    router.start();

    // This should not throw error
    router.push({ name: 'nonexistent' });

    // Should still be at home since navigation didn't happen
    expect(router.current?.path).toBe('/');
  });
});

describe('Router - Navigation Guards', () => {
  it('should call beforeEach guard', () => {
    const beforeEach = vi.fn().mockReturnValue(true);
    const view = vi.fn();
    const router = createRouter({
      routes: [
        { path: '/users/:id', name: 'user', view }
      ],
      beforeEach
    });

    router.start();
    router.push('/users/123');

    expect(beforeEach).toHaveBeenCalled();
  });

  it('should call afterEach guard on successful navigation', () => {
    const afterEach = vi.fn();
    const view = vi.fn();
    const router = createRouter({
      routes: [
        { path: '/users/:id', name: 'user', view }
      ],
      afterEach
    });

    router.start();
    router.push('/users/123');

    expect(afterEach).toHaveBeenCalled();
    expect(view).toHaveBeenCalled();
  });

  it('should cancel navigation when beforeEach returns false', () => {
    const beforeEach = vi.fn().mockReturnValue(false);
    const view = vi.fn();
    const router = createRouter({
      routes: [
        { path: '/admin', name: 'admin', view }
      ],
      beforeEach,
      failed: vi.fn()
    });

    router.start();
    router.push('/admin');

    expect(beforeEach).toHaveBeenCalled();
    expect(view).not.toHaveBeenCalled();
    expect(router.current?.path).not.toBe('/admin');
  });

  it('should call failed guard when navigation is canceled', () => {
    const failed = vi.fn();
    const beforeEach = vi.fn().mockReturnValue(false);
    const view = vi.fn();
    const router = createRouter({
      routes: [
        { path: '/admin', name: 'admin', view }
      ],
      beforeEach,
      failed
    });

    router.start();
    router.push('/admin');

    expect(failed).toHaveBeenCalled();
    expect(view).not.toHaveBeenCalled();
  });

  it('should call next for silent navigation in beforeEach', () => {
    const beforeEach = vi.fn((_from, _to, next) => {
      next('/login');
      return false;
    });

    const adminHandler = vi.fn();
    const loginHandler = vi.fn();
    const router = createRouter({
      routes: [
        { path: '/admin', name: 'admin', view: adminHandler },
        { path: '/login', name: 'login', view: loginHandler }
      ],
      beforeEach
    });

    router.start();
    router.push('/admin');

    // Should navigate to login instead
    expect(loginHandler).toHaveBeenCalled();
    expect(adminHandler).not.toHaveBeenCalled();
  });

  it('should allow navigation when next is called without arguments', () => {
    const beforeEach = vi.fn((_from, _to, next) => {
      // Call next without arguments to allow navigation
      next();
    });

    // Use a proper factory function
    const adminView = vi.fn((params) => {
      // Mock factory function
      return document.createElement('div');
    });

    const router = createRouter({
      routes: [
        { path: '/admin', name: 'admin', view: adminView }
      ],
      beforeEach
    });

    router.start();
    router.push('/admin');

    // Should proceed with navigation since next() was called without args
    expect(adminView).toHaveBeenCalled();
    expect(router.current?.path).toBe('/admin');
  });

  it('should include route meta in RouterInfo', () => {
    const capturedTo: any[] = [];
    const capturedFrom: any[] = [];
    const beforeEach = vi.fn((_from, to) => {
      capturedFrom.push(_from);
      capturedTo.push(to);
      return true; // Allow navigation
    });

    const adminView = vi.fn((params) => {
      return document.createElement('div');
    });

    const router = createRouter({
      routes: [
        {
          path: '/admin',
          name: 'admin',
          view: adminView,
          meta: { requiresAuth: true, role: 'admin', title: 'Admin Panel' }
        }
      ],
      beforeEach
    });

    router.start();
    router.push('/admin');

    // Should have captured the to parameter with meta
    expect(capturedTo.length).toBe(1);
    expect(capturedTo[0].path).toBe('/admin');
    expect(capturedTo[0].meta).toEqual({
      requiresAuth: true,
      role: 'admin',
      title: 'Admin Panel'
    });

    // Current route should also have meta
    expect(router.current?.meta).toEqual({
      requiresAuth: true,
      role: 'admin',
      title: 'Admin Panel'
    });

    // From should exist (because start() already handled initial route)
    expect(capturedFrom[0]).not.toBeNull();
  });

  it('should provide from parameter for subsequent navigations', () => {
    const capturedNavigations: Array<{ from: any; to: any }> = [];
    const beforeEach = vi.fn((_from, to) => {
      capturedNavigations.push({ from: _from, to });
      return true;
    });

    const homeView = vi.fn(() => document.createElement('div'));
    const adminView = vi.fn(() => document.createElement('div'));

    const router = createRouter({
      routes: [
        { path: '/', name: 'home', view: homeView, meta: { title: 'Home' } },
        { path: '/admin', name: 'admin', view: adminView, meta: { title: 'Admin' } }
      ],
      beforeEach
    });

    router.start();
    router.push('/');

    // First navigation after start(): from should exist (start already handled initial route)
    expect(capturedNavigations[0].from).not.toBeNull();
    expect(capturedNavigations[0].to.path).toBe('/');

    router.push('/admin');

    // Second navigation: from should be the previous route
    expect(capturedNavigations[1].from).not.toBeNull();
    expect(capturedNavigations[1].from?.path).toBe('/');
    expect(capturedNavigations[1].from?.meta).toEqual({ title: 'Home' });
    expect(capturedNavigations[1].to.path).toBe('/admin');
    expect(capturedNavigations[1].to.meta).toEqual({ title: 'Admin' });
  });

  it('should have null from for manual navigation without prior start', () => {
    const beforeEach = vi.fn();
    const adminView = vi.fn(() => document.createElement('div'));
    const router = createRouter({
      routes: [{ path: '/admin', name: 'admin', view: adminView }],
      beforeEach
    });

    router.push('/admin');

    expect(beforeEach.mock.calls[0][0]).toBeNull();
  });
});

describe('Router - Push Params', () => {
  it('should pass params to the route view, current route, hooks, and history state', () => {
    const view = vi.fn(() => document.createElement('div'));
    const beforeEach = vi.fn();
    const afterEach = vi.fn();
    const router = createRouter({
      routes: [{ path: '/users/:id', name: 'user', view }],
      beforeEach,
      afterEach
    });
    const params = { source: 'list', user: { role: 'admin' } };

    router.start().push('/users/42', params);

    const expectedParams = { ...params, id: '42' };
    expect(view).toHaveBeenCalledWith(expectedParams);
    expect(router.current?.params).toEqual(expectedParams);
    expect(beforeEach.mock.calls[0][1].params).toEqual(expectedParams);
    expect(afterEach.mock.calls[0][1].params).toEqual(expectedParams);
    expect(mockHistory.pushState).toHaveBeenCalledWith(params, '', '/users/42');
  });

  it('should pass params when navigating by route name', () => {
    const view = vi.fn(() => document.createElement('div'));
    const router = createRouter({
      routes: [{ path: '/detail', name: 'detail', view }]
    });

    router.start().push({ name: 'detail' }, { itemId: 7 });

    expect(view).toHaveBeenCalledWith({ itemId: 7 });
    expect(router.current?.params).toEqual({ itemId: 7 });
  });

  it('should restore params from popstate history', () => {
    const view = vi.fn(() => document.createElement('div'));
    const router = createRouter({
      routes: [{ path: '/users/:id', view }]
    });

    router.start();
    mockLocation.pathname = '/users/9';
    window.dispatchEvent(new PopStateEvent('popstate', { state: { source: 'history' } }));

    expect(view).toHaveBeenLastCalledWith({ source: 'history', id: '9' });
    expect(router.current?.params).toEqual({ source: 'history', id: '9' });
  });
});

describe('Router - History API', () => {
  it('should use pushState by default', () => {
    const view = vi.fn();
    const router = createRouter({
      routes: [
        { path: '/users/:id', name: 'user', view }
      ]
    });

    router.start();
    router.push('/users/123');

    expect(mockHistory.pushState).toHaveBeenCalled();
    expect(mockHistory.replaceState).not.toHaveBeenCalled();
  });

  it('should handle browser back/forward navigation', () => {
    const view = vi.fn();
    const router = createRouter({
      routes: [
        { path: '/users/:id', name: 'user', view }
      ]
    });

    // Set initial location to match a route
    mockLocation.pathname = '/users/123';
    router.start();

    // Now simulate popstate event to a different user
    mockLocation.pathname = '/users/456';
    window.dispatchEvent(new PopStateEvent('popstate'));

    expect(view).toHaveBeenCalled();
  });
});

describe('Router - Lifecycle', () => {
  it('should start and stop router', () => {
    const router = createRouter({
      routes: [
        { path: '/', name: 'home', view: vi.fn() }
      ]
    });

    // Start router
    const startedRouter = router.start();
    expect(startedRouter).toBe(router);

    // Stop router
    const stoppedRouter = router.stop();
    expect(stoppedRouter).toBe(router);

    // Should not error when starting/stopping multiple times
    router.start();
    router.start();
    router.stop();
    router.stop();
  });

  it('should handle multiple start/stop cycles', () => {
    const view = vi.fn();
    const router = createRouter({
      routes: [
        { path: '/users/:id', name: 'user', view }
      ]
    });

    // Reset location for this test
    mockLocation.pathname = '/';
    router.start();
    router.push('/users/123');
    expect(view).toHaveBeenCalledTimes(1);

    router.stop();
    router.start();
    router.push('/users/456');
    expect(view).toHaveBeenCalledTimes(2);
  });
});

describe('Router - Chainable API', () => {
  it('should support method chaining', () => {
    const view = vi.fn();
    const router = createRouter()
      .add({ path: '/', name: 'home', view })
      .add({ path: '/users/:id', name: 'user', view })
      .start();

    expect(router.getRouteByName('home')).toBeDefined();
    expect(router.getRouteByName('user')).toBeDefined();
  });

  it('should chain push method', () => {
    const view = vi.fn();
    const router = createRouter({
      routes: [
        { path: '/users/:id', name: 'user', view }
      ]
    });

    // Reset location for this test
    mockLocation.pathname = '/';
    router.start()
      .push('/users/123')
      .push('/users/456');

    expect(view).toHaveBeenCalledTimes(2);
  });
});

describe('Router - Complex Scenarios', () => {
  it('should handle authentication guard', () => {
    let isAuthenticated = false;
    const beforeEach = vi.fn((_from, to, next) => {
      if (to.path.startsWith('/admin') && !isAuthenticated) {
        next('/login');
        return false;
      }
      return true;
    });

    const adminHandler = vi.fn();
    const loginHandler = vi.fn();
    const homeHandler = vi.fn();

    const router = createRouter({
      routes: [
        { path: '/admin', name: 'admin', view: adminHandler },
        { path: '/login', name: 'login', view: loginHandler },
        { path: '/', name: 'home', view: homeHandler }
      ],
      beforeEach
    });

    router.start();

    // Try to access admin while not authenticated
    router.push('/admin');

    expect(adminHandler).not.toHaveBeenCalled();
    expect(loginHandler).toHaveBeenCalled();

    // Access home page (should work)
    router.push('/');
    expect(homeHandler).toHaveBeenCalled();
  });

  it('should maintain navigation history', () => {
    const view = vi.fn();
    const router = createRouter({
      routes: [
        { path: '/users/:id', name: 'user', view }
      ]
    });

    // Reset location for this test
    mockLocation.pathname = '/';
    router.start();

    router.push('/users/1');
    router.push('/users/2');
    router.push('/users/3');

    expect(mockHistory.pushState).toHaveBeenCalledTimes(3);
    expect(view).toHaveBeenCalledTimes(3);
  });

  it('should handle route not found', () => {
    const view = vi.fn();
    const router = createRouter({
      routes: [
        { path: '/users/:id', name: 'user', view }
      ]
    });

    // Reset location for this test
    mockLocation.pathname = '/';
    router.start();

    // Navigate to route that doesn't exist
    router.push('/nonexistent');

    // Handler should not be called
    expect(view).not.toHaveBeenCalled();
  });
});
