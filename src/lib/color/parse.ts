/**
 * Input parsing: accepts HEX, RGB, HSL, OKLCH strings → OKLCH canonical form
 * Uses `culori` for all color space conversions.
 */

import { parse as culoriParse, oklch as toOklch, formatHex } from 'culori';
import type { OKLCHColor, ColorFormat, ParseResult } from './types';

/**
 * Detect the likely format of a color string before parsing.
 */
export function detectFormat(input: string): ColorFormat {
  const s = input.trim().toLowerCase();
  if (s.startsWith('#') || /^[0-9a-f]{3,8}$/.test(s)) return 'hex';
  if (s.startsWith('rgb(') || s.startsWith('rgba(')) return 'rgb';
  if (s.startsWith('hsl(') || s.startsWith('hsla(')) return 'hsl';
  if (s.startsWith('oklch(')) return 'oklch';
  return 'unknown';
}

/**
 * Parse any supported color format to OKLCH.
 * Returns a discriminated union: { ok: true, color, format } | { ok: false, error }
 */
export function parseColor(input: string): ParseResult {
  if (!input || !input.trim()) {
    return { ok: false, error: 'Empty input' };
  }

  const trimmed = input.trim();
  const format = detectFormat(trimmed);

  try {
    const parsed = culoriParse(trimmed);
    if (!parsed) {
      return { ok: false, error: 'Unrecognized color format' };
    }

    const oklch = toOklch(parsed);
    if (!oklch || typeof oklch.l !== 'number') {
      return { ok: false, error: 'Could not convert to OKLCH' };
    }

    // culori can return undefined hue for achromatic colors; normalize to 0
    const color: OKLCHColor = {
      l: oklch.l ?? 0,
      c: oklch.c ?? 0,
      h: oklch.h ?? 0,
    };

    return {
      ok: true,
      color,
      format: format === 'unknown' ? 'hex' : format,
    };
  } catch {
    return { ok: false, error: 'Parse error' };
  }
}

/**
 * Convert an OKLCHColor back to a HEX string for display.
 */
export function oklchToHex(color: OKLCHColor): string {
  const hex = formatHex({ mode: 'oklch', l: color.l, c: color.c, h: color.h });
  return hex ?? '#000000';
}

/**
 * Format an OKLCHColor as an oklch() CSS string.
 */
export function formatOklch(color: OKLCHColor): string {
  return `oklch(${color.l.toFixed(3)} ${color.c.toFixed(3)} ${color.h.toFixed(1)})`;
}
