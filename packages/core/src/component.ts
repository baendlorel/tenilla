/**
 * This is an advise.
 *
 * `@tenilla/components` uses this.
 */
export abstract class TenillaComponent {
  tenilla: true = true;

  protected abstract _element: HTMLElement;
  get element(): HTMLElement {
    return this._element;
  }

  abstract destroy(): void;
}
