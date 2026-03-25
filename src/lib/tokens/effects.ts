/**
 * Effects token generation — shadows and glows.
 * All values are CSS box-shadow strings ready to drop into custom properties.
 * Glow values embed opacity directly in the hex alpha channel so they require
 * no light/dark split.
 */

import type { ElevationModel, EffectsTokenMap, DtcgShadowLayer, ShadowValue } from '../color/types';

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

/**
 * Convert a 6-digit hex color to an 8-digit hex with the given opacity (0–1).
 * e.g. '#4f46e5', 0.5  →  '#4f46e580'
 */
function hexWithAlpha(hex: string, alpha: number): string {
  const a = Math.round(clamp01(alpha) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex.slice(0, 7)}${a}`;
}

/** Shorthand for building a single shadow layer. */
function layer(
  color: string,
  offsetX: string,
  offsetY: string,
  blur: string,
  spread: string,
  inset = false,
): DtcgShadowLayer {
  return { color, offsetX, offsetY, blur, spread, inset };
}

/**
 * Build the full EffectsTokenMap for the given elevation model.
 * Shadow values are structured DtcgShadowLayer objects (not CSS strings).
 * Use shadowToCss() from css.ts to convert to box-shadow CSS values.
 *
 * @param model             Elevation personality
 * @param primaryActionHex  Current primary action hex (used for glow tint)
 */
export function generateEffectsTokens(
  model: ElevationModel,
  primaryActionHex: string
): EffectsTokenMap {
  const glowButtonColor = hexWithAlpha(primaryActionHex, 0.45);
  const glowFocusColor = hexWithAlpha(primaryActionHex, 0.35);

  // Pre-typed alias to satisfy TS for 'none' literal
  const none: ShadowValue = 'none';

  switch (model) {
    case 'flat':
      return {
        shadowSm: none,
        shadowMd: none,
        shadowLg: none,
        shadowButton: none,
        glowButton: none,
        glowFocus: none,
      };

    case 'subtle':
      return {
        shadowSm: layer('#0000000f', '0px', '1px', '2px', '0px'),
        shadowMd: [
          layer('#00000014', '0px', '2px', '8px', '0px'),
          layer('#0000000d', '0px', '1px', '2px', '0px'),
        ],
        shadowLg: [
          layer('#0000001a', '0px', '8px', '24px', '0px'),
          layer('#0000000f', '0px', '2px', '6px', '0px'),
        ],
        shadowButton: layer('#0000001f', '0px', '1px', '3px', '0px'),
        glowButton: none,
        glowFocus: none,
      };

    case 'prominent':
      return {
        shadowSm: [
          layer('#0000001f', '0px', '1px', '3px', '0px'),
          layer('#0000001a', '0px', '1px', '2px', '-1px'),
        ],
        shadowMd: [
          layer('#00000024', '0px', '4px', '12px', '-2px'),
          layer('#0000001a', '0px', '2px', '4px', '-1px'),
        ],
        shadowLg: [
          layer('#0000002e', '0px', '16px', '40px', '-4px'),
          layer('#0000001f', '0px', '4px', '10px', '-2px'),
        ],
        shadowButton: [
          layer('#00000033', '0px', '2px', '6px', '0px'),
          layer('#0000001f', '0px', '1px', '2px', '0px'),
        ],
        glowButton: none,
        glowFocus: none,
      };

    case 'glow':
      return {
        shadowSm: [
          layer('#0000001f', '0px', '1px', '3px', '0px'),
          layer('#0000001a', '0px', '1px', '2px', '-1px'),
        ],
        shadowMd: [
          layer('#00000024', '0px', '4px', '12px', '-2px'),
          layer('#0000001a', '0px', '2px', '4px', '-1px'),
        ],
        shadowLg: [
          layer('#0000002e', '0px', '16px', '40px', '-4px'),
          layer('#0000001f', '0px', '4px', '10px', '-2px'),
        ],
        shadowButton: [
          layer('#0000002e', '0px', '2px', '6px', '0px'),
          layer(glowButtonColor, '0px', '0px', '16px', '0px'),
        ],
        glowButton: layer(glowButtonColor, '0px', '0px', '20px', '2px'),
        glowFocus: layer(glowFocusColor, '0px', '0px', '0px', '3px'),
      };
  }
}
