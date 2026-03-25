/**
 * W3C Design Tokens Community Group (DTCG) JSON export.
 * Serializes a GeneratedPalette to DTCG-compliant JSON.
 *
 * Token path → CSS custom property mapping:
 *   color.{scale}.{stop}           →  --color-{scale}-{stop}
 *   color.{scale}.action.{state}   →  --color-{scale}-action-{state}
 *   color.bg.{role}                →  --color-bg-{role}
 *   color.border.{role}            →  --color-border-{role}
 *   color.{status}.{role}          →  --color-{status}-{role}
 *   radius.{name}                  →  --radius-{name}
 *   shadow.{name}                  →  --shadow-{name} / --glow-{name}
 *
 * Semantic tokens include light/dark sub-keys for mode awareness.
 * Where a semantic hex matches a palette scale stop, the $value uses an
 * alias reference ({color.primary.600}) instead of a raw hex string.
 */

import type {
  GeneratedPalette,
  ColorScale,
  SemanticToken,
  ShadowValue,
  ScaleName,
} from './types';
import { SCALE_STOPS, SCALE_NAMES } from './types';

// ─── Internal DTCG token types ────────────────────────────────────────────────

type DtcgColorToken = { $type: 'color'; $value: string };
type DtcgDimensionToken = { $type: 'dimension'; $value: string };
type DtcgShadowToken = { $type: 'shadow'; $value: unknown };
type DtcgToken = DtcgColorToken | DtcgDimensionToken | DtcgShadowToken;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DtcgGroup = Record<string, DtcgToken | any>;

type BaseInput = Omit<GeneratedPalette, 'cssTokenString' | 'dtcgTokenString'>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns a DTCG alias ref like `{color.primary.600}` if hex matches a scale stop. */
function findRef(
  hex: string,
  scaleMap: Record<ScaleName, ColorScale>,
  brandScale?: ColorScale
): string | null {
  if (brandScale) {
    for (const stop of SCALE_STOPS) {
      if (brandScale[stop].hex === hex) return `{color.brand.${stop}}`;
    }
  }
  for (const name of SCALE_NAMES) {
    const scale = scaleMap[name];
    for (const stop of SCALE_STOPS) {
      if (scale[stop].hex === hex) return `{color.${name}.${stop}}`;
    }
  }
  return null;
}

function colorToken(value: string): DtcgColorToken {
  return { $type: 'color', $value: value };
}

function dimToken(value: string): DtcgDimensionToken {
  return { $type: 'dimension', $value: value };
}

function shadowToken(v: ShadowValue): DtcgShadowToken {
  // DTCG shadow type: [] represents no shadow layers (equivalent to CSS 'none')
  if (v === 'none') return { $type: 'shadow', $value: [] };
  return { $type: 'shadow', $value: v };
}

/** Build scale stop tokens: { "50": colorToken, "100": colorToken, ... } */
function scaleStops(scale: ColorScale): Record<string, DtcgColorToken> {
  const result: Record<string, DtcgColorToken> = {};
  for (const stop of SCALE_STOPS) {
    result[String(stop)] = colorToken(scale[stop].hex);
  }
  return result;
}

/**
 * Build a { light, dark } sub-group for a SemanticToken.
 * Uses alias references where the hex matches a known scale stop.
 */
function modeGroup(
  token: SemanticToken,
  resolve: (hex: string) => string,
): Record<string, DtcgColorToken> {
  return {
    light: colorToken(resolve(token.light.hex)),
    dark: colorToken(resolve(token.dark.hex)),
  };
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function generateDtcgTokenString(palette: BaseInput): string {
  const {
    brand, primary, neutral, success, info, warning, error,
    semanticTokens: st, shapeTokens: sh, effectsTokens: ef,
  } = palette;

  const scaleMap: Record<ScaleName, ColorScale> = {
    primary, neutral, success, info, warning, error,
  };
  const resolve = (hex: string): string => findRef(hex, scaleMap, brand) ?? hex;
  const mode = (token: SemanticToken): DtcgGroup => modeGroup(token, resolve);

  const dtcg: DtcgGroup = {
    color: {
      ...(brand ? {
        brand: {
          ...scaleStops(brand),
          ...(st.brandAction ? {
            action: {
              default: mode(st.brandAction.default),
              hover: mode(st.brandAction.hover),
              pressed: mode(st.brandAction.pressed),
              disabled: mode(st.brandAction.disabled),
              disabledText: mode(st.brandAction.disabledText),
            },
          } : {}),
        },
      } : {}),
      primary: {
        ...scaleStops(primary),
        action: {
          default: mode(st.primaryAction.default),
          hover: mode(st.primaryAction.hover),
          pressed: mode(st.primaryAction.pressed),
          disabled: mode(st.primaryAction.disabled),
          disabledText: mode(st.primaryAction.disabledText),
        },
      },
      neutral: scaleStops(neutral),
      success: {
        ...scaleStops(success),
        bg: mode(st.success.bg),
        border: mode(st.success.border),
        text: mode(st.success.text),
        icon: mode(st.success.icon),
        action: mode(st.success.action),
      },
      info: {
        ...scaleStops(info),
        bg: mode(st.info.bg),
        border: mode(st.info.border),
        text: mode(st.info.text),
        icon: mode(st.info.icon),
        action: mode(st.info.action),
      },
      warning: {
        ...scaleStops(warning),
        bg: mode(st.warning.bg),
        border: mode(st.warning.border),
        text: mode(st.warning.text),
        icon: mode(st.warning.icon),
        action: mode(st.warning.action),
      },
      error: {
        ...scaleStops(error),
        bg: mode(st.error.bg),
        border: mode(st.error.border),
        text: mode(st.error.text),
        icon: mode(st.error.icon),
        action: mode(st.error.action),
      },
      bg: {
        base: mode(st.backgrounds.base),
        surface: mode(st.backgrounds.surface),
        elevated: mode(st.backgrounds.elevated),
        sunken: mode(st.backgrounds.sunken),
        sunkenDeep: mode(st.backgrounds.sunkenDeep),
      },
      border: {
        subtle: mode(st.borders.subtle),
        default: mode(st.borders.default),
        strong: mode(st.borders.strong),
        focus: mode(st.borders.focus),
        success: mode(st.borders.success),
        info: mode(st.borders.info),
        warning: mode(st.borders.warning),
        error: mode(st.borders.error),
      },
    },
    radius: {
      button: dimToken(sh.radiusButton),
      xs: dimToken(sh.radiusXs),
      sm: dimToken(sh.radiusSm),
      md: dimToken(sh.radiusMd),
      lg: dimToken(sh.radiusLg),
      card: dimToken(sh.radiusCard),
    },
    shadow: {
      sm: shadowToken(ef.shadowSm),
      md: shadowToken(ef.shadowMd),
      lg: shadowToken(ef.shadowLg),
      button: shadowToken(ef.shadowButton),
      'glow-button': shadowToken(ef.glowButton),
      'glow-focus': shadowToken(ef.glowFocus),
    },
  };

  return JSON.stringify(dtcg, null, 2);
}
