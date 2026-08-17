/**
 * Tenilla design-token keys (CSS custom properties without the `--tenilla-` prefix).
 * Generated from `variables.css`.
 */
export interface TenillaVariables {
  // ── Bootstrap palette ──
  primary: string;
  secondary: string;
  success: string;
  danger: string;
  warning: string;
  info: string;
  light: string;
  dark: string;

  // ── Hover / active (light mode) ──
  'primary-hover': string;
  'primary-active': string;
  'secondary-hover': string;
  'secondary-active': string;
  'danger-hover': string;
  'danger-active': string;
  'success-hover': string;
  'success-active': string;
  'warning-hover': string;
  'warning-active': string;
  'info-hover': string;
  'info-active': string;

  // ── Gray scale ──
  white: string;
  black: string;
  'gray-100': string;
  'gray-200': string;
  'gray-300': string;
  'gray-400': string;
  'gray-500': string;
  'gray-600': string;
  'gray-700': string;
  'gray-800': string;
  'gray-900': string;

  // ── Semantic tokens ──
  'color-text': string;
  'color-text-secondary': string;
  'color-text-muted': string;
  'color-text-inverse': string;
  'color-bg': string;
  'color-bg-subtle': string;
  'color-bg-muted': string;
  'color-surface': string;
  'color-surface-hover': string;
  'color-border': string;
  'color-border-light': string;
  'color-overlay': string;
  'color-focus-ring': string;
  'color-shadow': string;

  // ── Border radius ──
  'radius-sm': string;
  radius: string;
  'radius-md': string;
  'radius-lg': string;

  // ── Font ──
  'font-size-sm': string;
  'font-size': string;
  'font-size-lg': string;
  'font-weight': string;

  // ── Transition ──
  'transition-fast': string;
}

/**
 * Apply a partial set of Tenilla design tokens to a target element
 * (defaults to `document.documentElement`).
 *
 * Only the supplied keys are set — unspecified variables keep their
 * current (CSS‑defined) values.
 *
 * @example
 * ```ts
 * import { applyTheme } from '@tenilla/components/styles';
 *
 * applyTheme({
 *   primary: '#7c3aed',
 *   'color-surface': '#1e1e2e',
 *   'radius': '8px',
 * });
 * ```
 */
export function applyTheme(
  variables: Partial<TenillaVariables>,
  target: HTMLElement = document.documentElement,
): void {
  Object.entries(variables).forEach(([key, value]) => {
    if (value !== undefined) {
      target.style.setProperty(`--tenilla-${key}`, value);
    }
  });
}
