export class SimpleEvent<T extends Record<string, (...args: unknown[]) => unknown>> {
  private readonly events = new Map();

  on<K extends keyof T>(name: K, fn: T[K]) {
    const e = this.events.get(name);
    if (e) {
      e.push(fn);
      return;
    }
    this.events.set(name, [fn]);
  }

  off<K extends keyof T>(name: K, fn: T[K]) {
    if (!fn) {
      this.events.delete(name);
      return;
    }

    const e = this.events.get(name);
    if (!e) {
      return;
    }

    const i = e.findIndex((v) => v === fn);
    if (i !== -1) {
      e.splice(i, 1);
    }
  }

  emit<K extends keyof T>(name: K, ...args) {
    this.events.get(name)?.forEach((v) => v(...args));
  }
}
