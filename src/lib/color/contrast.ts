/**
 * WCAG 2.1 contrast ratio calculation using culori's wcagContrast utility.
 * All contrast is computed mathematically — never estimated visually.
 */

import { wcagContrast } from 'culori';
import type { OKLCHColor } from './types';

/**
 * Calculate the WCAG 2.1 contrast ratio between two OKLCH colors.
 */
export function contrastRatio(a: OKLCHColor, b: OKLCHColor): number {
  const colorA = { mode: 'oklch' as const, l: a.l, c: a.c, h: a.h };
  const colorB = { mode: 'oklch' as const, l: b.l, c: b.c, h: b.h };
  return wcagContrast(colorA, colorB);
}

export const WHITE: OKLCHColor = { l: 1, c: 0, h: 0 };
export const BLACK: OKLCHColor = { l: 0, c: 0, h: 0 };

/**
 * Returns contrast ratio of a color against white.
 */
export function contrastOnWhite(color: OKLCHColor): number {
  return contrastRatio(color, WHITE);
}

/**
 * Returns contrast ratio of a color against black.
 */
export function contrastOnBlack(color: OKLCHColor): number {
  return contrastRatio(color, BLACK);
}

/**
 * Determine whether white or black text has higher contrast on the given color.
 */
export function preferredText(color: OKLCHColor): 'white' | 'black' {
  return contrastOnBlack(color) >= contrastOnWhite(color) ? 'black' : 'white';
}

export type ContrastLevel = 'AAA' | 'AA' | 'AA-Large' | 'Fail';

/**
 * Badge the contrast ratio per WCAG 2.1:
 * ≥7:1 = AAA, ≥4.5:1 = AA, ≥3:1 = AA-Large, <3:1 = Fail
 */
export function contrastLevel(ratio: number): ContrastLevel {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA-Large';
  return 'Fail';
}
