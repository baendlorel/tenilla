import type { Split } from './utils.js';

/**
 * Helper function for creating SVG elements
 * @param tag SVG element tag name
 * @param attr Optional attributes
 */
export function svg<T extends keyof SVGElementTagNameMap>(
  tag: T,
  attr?: Record<string, string>,
): SVGElementTagNameMap[T];
/**
 * Helper function for creating SVG elements
 * @param tag SVG element tag name
 * @param attr Optional attributes
 */
export function svg(tag: string, attr?: Record<string, string>): SVGElement;
export function svg(tag: string, attr: Record<string, string> = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attr)) {
    el.setAttribute(k, v);
  }
  return el;
}

type H<T extends string[]> = {
  [K in keyof T]: T[K] extends keyof SVGElementTagNameMap
    ? (attr?: Record<string, string>) => SVGElementTagNameMap[T[K]]
    : never;
};

type CreatorTuple<S extends string, D extends string = '/'> = H<Split<S, D>>;

export const [
  a,
  circle,
  clipPath,
  defs,
  ellipse,
  filter,
  foreignObject,
  g,
  image,
  line,
  linearGradient,
  marker,
  mask,
  path,
  pattern,
  polygon,
  polyline,
  radialGradient,
  rect,
  stop,
  svgEl,
  symbol,
  text,
  tspan,
  use,
] =
  'a/circle/clipPath/defs/ellipse/filter/foreignObject/g/image/line/linearGradient/marker/mask/path/pattern/polygon/polyline/radialGradient/rect/stop/svg/symbol/text/tspan/use'
    .split('/')
    .map(
      (t) => (attr) => svg(t, attr),
    ) as CreatorTuple<'a/circle/clipPath/defs/ellipse/filter/foreignObject/g/image/line/linearGradient/marker/mask/path/pattern/polygon/polyline/radialGradient/rect/stop/svg/symbol/text/tspan/use'>;
