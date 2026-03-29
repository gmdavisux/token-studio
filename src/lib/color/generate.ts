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
  ThemeConfig,
  SCALE_STOPS as _stops,
} from './types';
import { SCALE_STOPS, DEFAULT_THEME_CONFIG } from './types';
import { contrastOnBlack, contrastOnWhite, preferredText } from './contrast';

/** Chroma multipliers for each vibrancy level. */
const VIBRANCY_MULTIPLIER: Record<ThemeConfig['vibrancy'], number> = {
  monochrome: 0.05,
  pastel: 0.3,
  muted: 0.6,
  natural: 1.0,
  vivid: 1.5,
};

// ─── Internal helpers ──────────────────────────────────────────────────────

/**
 * Build an OKLCHColor and clamp it into the sRGB gamut via culori.
 */
function makeColor(l: number, c: number, h: number): OKLCHColor {
  let clampedL = l;
  let clampedC = c;
  let clampedH = h;

  try {
    const result = clampChroma(
      { mode: 'oklch', l: Math.max(0, Math.min(1, l)), c: Math.max(0, c), h },
      'oklch',
      'srgb'
    ) as { mode: string; l?: number; c?: number; h?: number } | null | undefined;

    if (result != null) {
      clampedL = result.l ?? l;
      clampedC = result.c ?? c;
      clampedH = result.h ?? h;
    }
  } catch {
    // fallback to input values if culori fails
    clampedL = l;
    clampedC = c;
    clampedH = h;
  }

  return { l: clampedL, c: clampedC, h: clampedH };
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

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

/**
 * Keep the scale shape from LIGHTNESS_MAP but center it around the chosen
 * brand lightness at stop 500.
 */
function lightnessForStop(stop: ScaleStop, baseLightness: number): number {
  if (stop === 500) return clamp01(baseLightness);
  const deltaFrom500 = LIGHTNESS_MAP[stop] - LIGHTNESS_MAP[500];
  return clamp01(baseLightness + deltaFrom500);
}

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
 * chromaMultiplier scales every stop's chroma (1.0 = natural, 0.6 = muted, 1.5 = vivid).
 */
export function generateScale(baseColor: OKLCHColor, chromaMultiplier = 1.0): ColorScale {
  const baseC = baseColor.c;
  const baseL = baseColor.l;
  const h = baseColor.h;

  const scale = {} as ColorScale;
  for (const stop of SCALE_STOPS) {
    const l = lightnessForStop(stop, baseL);
    const c = baseC * CHROMA_FRACTION[stop] * chromaMultiplier;
    scale[stop] = resolve(makeColor(l, c, h));
  }
  return scale;
}

/**
 * Generate the neutral scale: very low chroma, hue tinted toward the primary
 * (or brand hue when provided — brand tints the neutral palette).
 */
export function generateNeutralScale(primaryHue: number, brandHue?: number): ColorScale {
  const h = brandHue ?? primaryHue;
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
 * Returns the personality of the primary color:
 * - chromaLevel: low / medium / high
 * - lightnessLevel: light / mid / dark
 */
function primaryPersonality(primary: OKLCHColor) {
  const chromaLevel =
    primary.c < 0.08 ? 'low' : primary.c < 0.18 ? 'medium' : 'high';
  const lightnessLevel =
    primary.l > 0.75 ? 'light' : primary.l < 0.45 ? 'dark' : 'mid';
  return { chromaLevel, lightnessLevel };
}

/**
 * Generate a semantic scale (success/info/warning/error) with a fixed hue
 * and chroma harmonized to primary color personality.
 */
export function generateSemanticScale(
  hue: number,
  primary: OKLCHColor,
  chromaMultiplier = 1.0
): ColorScale {
  const { chromaLevel } = primaryPersonality(primary);
  const baseChroma =
    chromaLevel === 'low' ? 0.14 : chromaLevel === 'medium' ? 0.18 : 0.22;

  return generateScale({ l: LIGHTNESS_MAP[500], c: baseChroma, h: hue }, chromaMultiplier);
}

// Fixed hues for semantic scales
export const SEMANTIC_HUES = {
  success: 145,
  info: 250,
  warning: 70,
  error: 25,
} as const;

/**
 * Top-level function: generate ALL raw scales for a given primary color and ThemeConfig.
 * Pass an optional brandColor to include a brand reference scale and tint the neutral.
 */
export function generateAllScales(
  primaryColor: OKLCHColor,
  config: ThemeConfig = DEFAULT_THEME_CONFIG,
  brandColor?: OKLCHColor
) {
  const chromaMultiplier = VIBRANCY_MULTIPLIER[config.vibrancy];
  return {
    ...(brandColor ? { brand: generateScale(brandColor, chromaMultiplier) } : {}),
    primary: generateScale(primaryColor, chromaMultiplier),
    neutral: generateNeutralScale(primaryColor.h, brandColor?.h),
    success: generateSemanticScale(SEMANTIC_HUES.success, primaryColor, chromaMultiplier),
    info: generateSemanticScale(SEMANTIC_HUES.info, primaryColor, chromaMultiplier),
    warning: generateSemanticScale(SEMANTIC_HUES.warning, primaryColor, chromaMultiplier),
    error: generateSemanticScale(SEMANTIC_HUES.error, primaryColor, chromaMultiplier),
  };
}
