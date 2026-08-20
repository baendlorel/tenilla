export class SimpleEvent<T extends Record<string, (...args: any[]) => any>> {
  /** @internal */
  private readonly m = new Map();

  on<K extends keyof T>(name: K, fn: T[K]) {
    const e = this.m.get(name);
    if (e) {
      e.push(fn);
      return;
    }
    this.m.set(name, [fn]);
  }

  off<K extends keyof T>(name: K, fn: T[K]) {
    if (!fn) {
      this.m.delete(name);
      return;
    }

    const e = this.m.get(name);
    if (!e) {
      return;
    }

    const i = e.findIndex((v) => v === fn);
    if (i !== -1) {
      e.splice(i, 1);
    }
  }

  emit<K extends keyof T>(name: K, ...args) {
    this.m.get(name)?.forEach((v) => v(...args));
  }
}
