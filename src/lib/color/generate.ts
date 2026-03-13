/**
 * Core palette generation algorithm.
 * All logic is pure deterministic math in OKLCH.
 * Uses `culori` for gamut clipping and HEX conversion.
 */

import { formatHex, clampChroma } from 'culori';
import type {
  OKLCHColor,
  ColorScale,
  ScaleStop,
  SCALE_STOPS as _stops,
} from './types';
import { SCALE_STOPS } from './types';
import { contrastOnBlack, contrastOnWhite, preferredText } from './contrast';

// ─── Internal helpers ──────────────────────────────────────────────────────

/**
 * Build an OKLCHColor and clamp it into the sRGB gamut via culori.
 */
function makeColor(l: number, c: number, h: number): OKLCHColor {
  const clamped = clampChroma(
    { mode: 'oklch', l: Math.max(0, Math.min(1, l)), c: Math.max(0, c), h },
    'oklch',
    'srgb'
  ) as { mode: string; l?: number; c?: number; h?: number } | undefined;
  return {
    l: clamped?.l ?? l,
    c: clamped?.c ?? 0,
    h: clamped?.h ?? h,
  };
}

/**
 * Convert an OKLCHColor to HEX for storage in ResolvedColor.
 */
function toHex(color: OKLCHColor): string {
  return (
    formatHex({ mode: 'oklch', l: color.l, c: color.c, h: color.h }) ??
    '#000000'
  );
}

/**
 * Build a ResolvedColor from an OKLCHColor.
 */
function resolve(color: OKLCHColor) {
  const onWhite = contrastOnWhite(color);
  const onBlack = contrastOnBlack(color);
  return {
    oklch: color,
    hex: toHex(color),
    contrastOnWhite: onWhite,
    contrastOnBlack: onBlack,
    preferredTextColor: preferredText(color) as 'white' | 'black',
  };
}

// ─── Scale lightness targets ───────────────────────────────────────────────

/**
 * Map a scale stop to a target lightness value in OKLCH (0–1).
 *
 * 500 = base (~0.55-ish average, but we'll use the anchor).
 * 50 → very light (~0.975), 950 → very dark (~0.13).
 */
const LIGHTNESS_MAP: Record<ScaleStop, number> = {
  50: 0.975,
  100: 0.945,
  200: 0.895,
  300: 0.820,
  400: 0.720,
  500: 0.600, // anchor; overridden with actual color for brand scale
  600: 0.500,
  700: 0.400,
  800: 0.300,
  900: 0.220,
  950: 0.140,
};

/**
 * Chroma fraction relative to the base chroma for each stop.
 * Lighter stops have lower chroma, darker stops taper off too.
 */
const CHROMA_FRACTION: Record<ScaleStop, number> = {
  50: 0.08,
  100: 0.14,
  200: 0.25,
  300: 0.45,
  400: 0.72,
  500: 1.00,
  600: 0.95,
  700: 0.85,
  800: 0.70,
  900: 0.55,
  950: 0.40,
};

/**
 * Generate a full 11-stop color scale anchored at a given OKLCH base color.
 * The 500 stop is anchored to the base color's actual lightness (but can be
 * overridden with anchorStop if the base maps to a different stop number).
 */
export function generateScale(baseColor: OKLCHColor): ColorScale {
  const baseC = baseColor.c;
  const h = baseColor.h;

  const scale = {} as ColorScale;
  for (const stop of SCALE_STOPS) {
    const l = LIGHTNESS_MAP[stop];
    const c = baseC * CHROMA_FRACTION[stop];
    scale[stop] = resolve(makeColor(l, c, h));
  }
  return scale;
}

/**
 * Generate the neutral scale: very low chroma, hue tinted toward brand.
 */
export function generateNeutralScale(brandHue: number): ColorScale {
  const h = brandHue;
  const MAX_CHROMA = 0.025;

  const scale = {} as ColorScale;
  for (const stop of SCALE_STOPS) {
    const l = LIGHTNESS_MAP[stop];
    // Progressive neutral tint: more expressive in mid-tones
    const chromaFraction = CHROMA_FRACTION[stop];
    const c = MAX_CHROMA * Math.min(chromaFraction, 1);
    scale[stop] = resolve(makeColor(l, c, h));
  }
  return scale;
}

/**
 * Returns the primary brand "personality":
 * - chromaLevel: low / medium / high
 * - lightnessLevel: light / mid / dark
 */
function brandPersonality(brand: OKLCHColor) {
  const chromaLevel =
    brand.c < 0.08 ? 'low' : brand.c < 0.18 ? 'medium' : 'high';
  const lightnessLevel =
    brand.l > 0.75 ? 'light' : brand.l < 0.45 ? 'dark' : 'mid';
  return { chromaLevel, lightnessLevel };
}

/**
 * Generate the PRIMARY scale — always blue-indigo (H ~260°–285°).
 * Chroma is harmonized with the brand personality.
 */
export function generatePrimaryScale(brand: OKLCHColor): ColorScale {
  const { chromaLevel } = brandPersonality(brand);

  // Primary hue locked to blue-indigo region
  const primaryHue = 272;

  // Harmonize chroma with brand personality
  const baseChroma =
    chromaLevel === 'low' ? 0.18 : chromaLevel === 'medium' ? 0.22 : 0.26;

  return generateScale({ l: LIGHTNESS_MAP[500], c: baseChroma, h: primaryHue });
}

/**
 * Generate a semantic scale (success/info/warning/error) with a fixed hue
 * and chroma harmonized to brand personality.
 */
export function generateSemanticScale(
  hue: number,
  brand: OKLCHColor
): ColorScale {
  const { chromaLevel } = brandPersonality(brand);
  const baseChroma =
    chromaLevel === 'low' ? 0.14 : chromaLevel === 'medium' ? 0.18 : 0.22;

  return generateScale({ l: LIGHTNESS_MAP[500], c: baseChroma, h: hue });
}

// Fixed hues for semantic scales
export const SEMANTIC_HUES = {
  success: 145,
  info: 250,
  warning: 85,
  error: 25,
} as const;

/**
 * Top-level function: generate ALL raw scales for a given brand color.
 */
export function generateAllScales(brandColor: OKLCHColor) {
  return {
    brand: generateScale(brandColor),
    primary: generatePrimaryScale(brandColor),
    neutral: generateNeutralScale(brandColor.h),
    success: generateSemanticScale(SEMANTIC_HUES.success, brandColor),
    info: generateSemanticScale(SEMANTIC_HUES.info, brandColor),
    warning: generateSemanticScale(SEMANTIC_HUES.warning, brandColor),
    error: generateSemanticScale(SEMANTIC_HUES.error, brandColor),
  };
}
