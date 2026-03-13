/**
 * Semantic token derivation.
 * Takes raw ColorScales and derives the full SemanticTokenMap.
 * Kept as a separate pure pipeline from scale generation so individual
 * overrides can re-derive semantics without re-running scale generation.
 */

import type {
  ColorScale,
  SemanticTokenMap,
  SemanticToken,
  ActionState,
  AlertToken,
  BackgroundToken,
  BorderToken,
  ResolvedColor,
} from './types';
import { contrastOnBlack, contrastOnWhite, preferredText } from './contrast';
import type { OKLCHColor } from './types';
import { oklchToHex } from './parse';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeToken(id: string, label: string, light: ResolvedColor, dark: ResolvedColor): SemanticToken {
  return { id, label, light, dark };
}

/** Build a ResolvedColor from a plain OKLCH triplet (for white/black). */
function resolveStatic(l: number, c: number, h: number): ResolvedColor {
  const oklch: OKLCHColor = { l, c, h };
  const hex = oklchToHex(oklch);
  const onWhite = contrastOnWhite(oklch);
  const onBlack = contrastOnBlack(oklch);
  return {
    oklch,
    hex,
    contrastOnWhite: onWhite,
    contrastOnBlack: onBlack,
    preferredTextColor: preferredText(oklch),
  };
}

const WHITE_COLOR: ResolvedColor = resolveStatic(1, 0, 0);

// ─── Action State Tokens ──────────────────────────────────────────────────────

function buildActionTokens(
  scaleName: string,
  scale: ColorScale,
  neutral: ColorScale
): Record<ActionState, SemanticToken> {
  return {
    default: makeToken(
      `${scaleName}-action-default`,
      'Default',
      scale[600],
      scale[400]
    ),
    hover: makeToken(
      `${scaleName}-action-hover`,
      'Hover',
      scale[700],
      scale[300]
    ),
    pressed: makeToken(
      `${scaleName}-action-pressed`,
      'Pressed',
      scale[800],
      scale[200]
    ),
    disabled: makeToken(
      `${scaleName}-action-disabled`,
      'Disabled',
      neutral[300],
      neutral[700]
    ),
    disabledText: makeToken(
      `${scaleName}-action-disabled-text`,
      'Disabled Text',
      neutral[500],
      neutral[500]
    ),
  };
}

// ─── Alert Tokens ─────────────────────────────────────────────────────────────

function buildAlertTokens(
  scaleName: string,
  scale: ColorScale
): Record<AlertToken, SemanticToken> {
  return {
    bg: makeToken(`${scaleName}-bg`, 'Background', scale[50], scale[950]),
    border: makeToken(`${scaleName}-border`, 'Border', scale[200], scale[800]),
    text: makeToken(`${scaleName}-text`, 'Text', scale[700], scale[300]),
    icon: makeToken(`${scaleName}-icon`, 'Icon', scale[500], scale[400]),
    action: makeToken(`${scaleName}-action`, 'Action', scale[600], scale[400]),
  };
}

// ─── Background Tokens ────────────────────────────────────────────────────────

function buildBackgroundTokens(
  neutral: ColorScale
): Record<BackgroundToken, SemanticToken> {
  return {
    base: makeToken('bg-base', 'Base', neutral[50], neutral[950]),
    surface: makeToken('bg-surface', 'Surface', WHITE_COLOR, neutral[900]),
    elevated: makeToken('bg-elevated', 'Elevated', WHITE_COLOR, neutral[800]),
    sunken: makeToken('bg-sunken', 'Sunken', neutral[100], neutral[950]),
    sunkenDeep: makeToken('bg-sunken-deep', 'Sunken Deep', neutral[200], neutral[950]),
  };
}

// ─── Border Tokens ────────────────────────────────────────────────────────────

function buildBorderTokens(
  neutral: ColorScale,
  primary: ColorScale,
  success: ColorScale,
  info: ColorScale,
  warning: ColorScale,
  error: ColorScale
): Record<BorderToken, SemanticToken> {
  return {
    subtle: makeToken('border-subtle', 'Subtle', neutral[200], neutral[800]),
    default: makeToken('border-default', 'Default', neutral[300], neutral[700]),
    strong: makeToken('border-strong', 'Strong', neutral[400], neutral[600]),
    focus: makeToken('border-focus', 'Focus', primary[500], primary[400]),
    success: makeToken('border-success', 'Success', success[200], success[800]),
    info: makeToken('border-info', 'Info', info[200], info[800]),
    warning: makeToken('border-warning', 'Warning', warning[200], warning[800]),
    error: makeToken('border-error', 'Error', error[200], error[800]),
  };
}

// ─── Top-level derivation ─────────────────────────────────────────────────────

export function deriveSemanticTokens(scales: {
  brand: ColorScale;
  primary: ColorScale;
  neutral: ColorScale;
  success: ColorScale;
  info: ColorScale;
  warning: ColorScale;
  error: ColorScale;
}): SemanticTokenMap {
  return {
    primaryAction: buildActionTokens('primary', scales.primary, scales.neutral),
    brandAction: buildActionTokens('brand', scales.brand, scales.neutral),
    success: buildAlertTokens('success', scales.success),
    info: buildAlertTokens('info', scales.info),
    warning: buildAlertTokens('warning', scales.warning),
    error: buildAlertTokens('error', scales.error),
    backgrounds: buildBackgroundTokens(scales.neutral),
    borders: buildBorderTokens(
      scales.neutral,
      scales.primary,
      scales.success,
      scales.info,
      scales.warning,
      scales.error
    ),
  };
}
