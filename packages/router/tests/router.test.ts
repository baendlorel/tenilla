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
});

describe('Router - Basic Functionality', () => {
  it('should create a router instance', () => {
    const router = new Router();
    expect(router).toBeInstanceOf(Router);
  });

  it('should create a router with routes', () => {
    const router = new Router({
      routes: [
        { path: '/', name: 'home', handler: vi.fn() },
        { path: '/users/:id', name: 'user', handler: vi.fn() }
      ]
    });
    expect(router.current).toBeNull();
  });

  it('should add routes using add method', () => {
    const router = new Router();
    const handler = vi.fn();

    router.add({ path: '/test', name: 'test', handler });

    const foundRoute = router.getRouteByName('test');
    expect(foundRoute).toBeDefined();
    expect(foundRoute?.path).toBe('/test');
  });

  it('should find route by name', () => {
    const router = new Router({
      routes: [
        { path: '/', name: 'home', handler: vi.fn() },
        { path: '/users/:id', name: 'user', handler: vi.fn() }
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
    const handler = vi.fn();
    const router = new Router({
      routes: [
        { path: '/', name: 'home', handler }
      ]
    });

    router.start();
    router.go('/');

    expect(handler).toHaveBeenCalled();
    expect(router.current?.path).toBe('/');
  });

  it('should match path with parameters', () => {
    const handler = vi.fn();
    const router = new Router({
      routes: [
        { path: '/users/:id', name: 'user', handler }
      ]
    });

    mockLocation.pathname = '/users/123';
    router.start();
    router.go('/users/123');

    expect(handler).toHaveBeenCalledWith({ id: '123' });
    expect(router.current?.params).toEqual({ id: '123' });
  });

  it('should match path with multiple parameters', () => {
    const handler = vi.fn();
    const router = new Router({
      routes: [
        { path: '/posts/:category/:slug', name: 'post', handler }
      ]
    });

    router.start();
    router.go('/posts/tech/my-post');

    expect(handler).toHaveBeenCalledWith({ category: 'tech', slug: 'my-post' });
    expect(router.current?.params).toEqual({ category: 'tech', slug: 'my-post' });
  });

  it('should handle routes with basePath', () => {
    const handler = vi.fn();
    const router = new Router({
      basePath: '/app',
      routes: [
        { path: '/users/:id', name: 'user', handler }
      ]
    });

    mockLocation.pathname = '/app/users/123';
    router.start();
    router.go('/users/123');

    expect(handler).toHaveBeenCalledWith({ id: '123' });
  });
});

describe('Router - Named Navigation', () => {
  it('should navigate by route name', () => {
    const handler = vi.fn();
    const router = new Router({
      routes: [
        { path: '/users/:id', name: 'user', handler }
      ]
    });

    router.start();
    router.go({ name: 'user' });

    expect(mockHistory.pushState).toHaveBeenCalled();
    expect(handler).toHaveBeenCalled();
  });

  it('should handle missing route name gracefully', () => {
    const router = new Router({
      routes: [
        { path: '/', name: 'home', handler: vi.fn() }
      ]
    });

    // Reset location to root for clean test state
    mockLocation.pathname = '/';
    router.start();

    // This should not throw error
    router.go({ name: 'nonexistent' });

    // Should still be at home since navigation didn't happen
    expect(router.current?.path).toBe('/');
  });
});

describe('Router - Navigation Guards', () => {
  it('should call beforeEach guard', () => {
    const beforeEach = vi.fn().mockReturnValue(true);
    const handler = vi.fn();
    const router = new Router({
      routes: [
        { path: '/users/:id', name: 'user', handler }
      ],
      beforeEach
    });

    router.start();
    router.go('/users/123');

    expect(beforeEach).toHaveBeenCalled();
  });

  it('should call afterEach guard on successful navigation', () => {
    const afterEach = vi.fn();
    const handler = vi.fn();
    const router = new Router({
      routes: [
        { path: '/users/:id', name: 'user', handler }
      ],
      afterEach
    });

    router.start();
    router.go('/users/123');

    expect(afterEach).toHaveBeenCalled();
    expect(handler).toHaveBeenCalled();
  });

  it('should cancel navigation when beforeEach returns false', () => {
    const beforeEach = vi.fn().mockReturnValue(false);
    const handler = vi.fn();
    const router = new Router({
      routes: [
        { path: '/admin', name: 'admin', handler }
      ],
      beforeEach,
      failed: vi.fn()
    });

    router.start();
    router.go('/admin');

    expect(beforeEach).toHaveBeenCalled();
    expect(handler).not.toHaveBeenCalled();
    expect(router.current?.path).not.toBe('/admin');
  });

  it('should call failed guard when navigation is canceled', () => {
    const failed = vi.fn();
    const beforeEach = vi.fn().mockReturnValue(false);
    const handler = vi.fn();
    const router = new Router({
      routes: [
        { path: '/admin', name: 'admin', handler }
      ],
      beforeEach,
      failed
    });

    router.start();
    router.go('/admin');

    expect(failed).toHaveBeenCalled();
    expect(handler).not.toHaveBeenCalled();
  });

  it('should call next for silent navigation in beforeEach', () => {
    const beforeEach = vi.fn((_from, _to, next) => {
      next('/login');
      return false;
    });

    const adminHandler = vi.fn();
    const loginHandler = vi.fn();
    const router = new Router({
      routes: [
        { path: '/admin', name: 'admin', handler: adminHandler },
        { path: '/login', name: 'login', handler: loginHandler }
      ],
      beforeEach
    });

    router.start();
    router.go('/admin');

    // Should navigate to login instead
    expect(loginHandler).toHaveBeenCalled();
    expect(adminHandler).not.toHaveBeenCalled();
  });
});

describe('Router - Muted Navigation', () => {
  it('should skip all hooks with muted navigation', () => {
    const beforeEach = vi.fn();
    const afterEach = vi.fn();
    const handler = vi.fn();
    const router = new Router({
      routes: [
        { path: '/users/:id', name: 'user', handler }
      ],
      beforeEach,
      afterEach
    });

    router.start();
    router.go('/users/123', { muted: true });

    expect(beforeEach).not.toHaveBeenCalled();
    expect(afterEach).not.toHaveBeenCalled();
    expect(handler).toHaveBeenCalled();
  });

  it('should perform muted navigation with replace', () => {
    const handler = vi.fn();
    const router = new Router({
      routes: [
        { path: '/users/:id', name: 'user', handler }
      ]
    });

    router.start();
    router.go('/users/456', { muted: true, replace: true });

    expect(mockHistory.replaceState).toHaveBeenCalled();
    expect(handler).toHaveBeenCalled();
  });
});

describe('Router - History API', () => {
  it('should use pushState by default', () => {
    const handler = vi.fn();
    const router = new Router({
      routes: [
        { path: '/users/:id', name: 'user', handler }
      ]
    });

    router.start();
    router.go('/users/123');

    expect(mockHistory.pushState).toHaveBeenCalled();
    expect(mockHistory.replaceState).not.toHaveBeenCalled();
  });

  it('should use replaceState when replace option is true', () => {
    const handler = vi.fn();
    const router = new Router({
      routes: [
        { path: '/users/:id', name: 'user', handler }
      ]
    });

    router.start();
    router.go('/users/123', { replace: true });

    expect(mockHistory.replaceState).toHaveBeenCalled();
    expect(mockHistory.pushState).not.toHaveBeenCalled();
  });

  it('should handle browser back/forward navigation', () => {
    const handler = vi.fn();
    const router = new Router({
      routes: [
        { path: '/users/:id', name: 'user', handler }
      ]
    });

    // Set initial location to match a route
    mockLocation.pathname = '/users/123';
    router.start();

    // Now simulate popstate event to a different user
    mockLocation.pathname = '/users/456';
    window.dispatchEvent(new PopStateEvent('popstate'));

    expect(handler).toHaveBeenCalled();
  });
});

describe('Router - Lifecycle', () => {
  it('should start and stop router', () => {
    const router = new Router({
      routes: [
        { path: '/', name: 'home', handler: vi.fn() }
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
    const handler = vi.fn();
    const router = new Router({
      routes: [
        { path: '/users/:id', name: 'user', handler }
      ]
    });

    // Reset location for this test
    mockLocation.pathname = '/';
    router.start();
    router.go('/users/123');
    expect(handler).toHaveBeenCalledTimes(1);

    router.stop();
    router.start();
    router.go('/users/456');
    expect(handler).toHaveBeenCalledTimes(2);
  });
});

describe('Router - Chainable API', () => {
  it('should support method chaining', () => {
    const handler = vi.fn();
    const router = new Router()
      .add({ path: '/', name: 'home', handler })
      .add({ path: '/users/:id', name: 'user', handler })
      .start();

    expect(router.getRouteByName('home')).toBeDefined();
    expect(router.getRouteByName('user')).toBeDefined();
  });

  it('should chain go method', () => {
    const handler = vi.fn();
    const router = new Router({
      routes: [
        { path: '/users/:id', name: 'user', handler }
      ]
    });

    // Reset location for this test
    mockLocation.pathname = '/';
    router.start()
      .go('/users/123')
      .go('/users/456');

    expect(handler).toHaveBeenCalledTimes(2);
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

    const router = new Router({
      routes: [
        { path: '/admin', name: 'admin', handler: adminHandler },
        { path: '/login', name: 'login', handler: loginHandler },
        { path: '/', name: 'home', handler: homeHandler }
      ],
      beforeEach
    });

    router.start();

    // Try to access admin while not authenticated
    router.go('/admin');

    expect(adminHandler).not.toHaveBeenCalled();
    expect(loginHandler).toHaveBeenCalled();

    // Access home page (should work)
    router.go('/');
    expect(homeHandler).toHaveBeenCalled();
  });

  it('should maintain navigation history', () => {
    const handler = vi.fn();
    const router = new Router({
      routes: [
        { path: '/users/:id', name: 'user', handler }
      ]
    });

    // Reset location for this test
    mockLocation.pathname = '/';
    router.start();

    router.go('/users/1');
    router.go('/users/2');
    router.go('/users/3');

    expect(mockHistory.pushState).toHaveBeenCalledTimes(3);
    expect(handler).toHaveBeenCalledTimes(3);
  });

  it('should handle route not found', () => {
    const handler = vi.fn();
    const router = new Router({
      routes: [
        { path: '/users/:id', name: 'user', handler }
      ]
    });

    // Reset location for this test
    mockLocation.pathname = '/';
    router.start();

    // Navigate to route that doesn't exist
    router.go('/nonexistent');

    // Handler should not be called
    expect(handler).not.toHaveBeenCalled();
  });
});
