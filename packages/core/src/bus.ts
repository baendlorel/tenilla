export class SimpleEvent<T extends Record<string, (...args: unknown[]) => unknown>> {
  /** @internal */
  private readonly _map = new Map();

  on<K extends keyof T>(name: K, fn: T[K]) {
    const e = this._map.get(name);
    if (e) {
      e.push(fn);
      return;
    }
    this._map.set(name, [fn]);
  }

  off<K extends keyof T>(name: K, fn: T[K]) {
    if (!fn) {
      this._map.delete(name);
      return;
    }

    const e = this._map.get(name);
    if (!e) {
      return;
    }

    const i = e.findIndex((v) => v === fn);
    if (i !== -1) {
      e.splice(i, 1);
    }
  }

  emit<K extends keyof T>(name: K, ...args) {
    this._map.get(name)?.forEach((v) => v(...args));
  }
}
