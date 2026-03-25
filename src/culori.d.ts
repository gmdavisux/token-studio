/**
 * Minimal ambient type declarations for culori v4.
 * Only the functions used in this project are typed.
 */
declare module 'culori' {
  export interface ColorOklch {
    mode: 'oklch';
    l: number;
    c: number;
    h: number;
    alpha?: number;
  }

  export interface ColorRgb {
    mode: 'rgb';
    r: number;
    g: number;
    b: number;
    alpha?: number;
  }

  // Generic "any color object" that culori works with
  export type AnyColor = { mode: string; [key: string]: number | string | undefined };

  /** Parse any CSS color string to a culori color object (or undefined if invalid). */
  export function parse(color: string): AnyColor | undefined;

  /** Convert any color to OKLCH color space. */
  export function oklch(color: AnyColor | undefined): ColorOklch;

  /** Convert any culori color object to sRGB hex (#rrggbb). Returns undefined if out-of-gamut before clamping. */
  export function formatHex(color: AnyColor): string | undefined;

  /** Convert any culori color object to an sRGB rgb()/rgba() string. */
  export function formatRgb(color: AnyColor): string | undefined;

  /** Convert any culori color object to an hsl()/hsla() string. */
  export function formatHsl(color: AnyColor): string | undefined;

  /**
   * Clamp a color to fit within the target gamut.
   * @param color - Source color
   * @param space - Color space of the source (e.g. 'oklch')
   * @param gamut - Target gamut (e.g. 'srgb')
   */
  export function clampChroma(color: AnyColor, space?: string, gamut?: string): AnyColor | undefined;

  /**
   * Calculate the WCAG 2.1 contrast ratio between two colors.
   */
  export function wcagContrast(a: AnyColor | ColorOklch, b: AnyColor | ColorOklch): number;
}
