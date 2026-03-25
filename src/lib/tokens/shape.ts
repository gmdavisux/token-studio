/**
 * Shape token generation.
 * Maps a ButtonShape personality to a full set of border-radius CSS values.
 */

import type { ButtonShape, ShapeTokenMap } from '../color/types';

/**
 * Returns a complete ShapeTokenMap for the given button shape personality.
 *
 * Token semantics:
 *   radiusButton — buttons, primary interactive elements
 *   radiusXs     — inputs, tags, badges
 *   radiusSm     — chips, small cards
 *   radiusMd     — dropdowns, panels, popovers
 *   radiusLg     — modals, sheets, large containers
 *   radiusCard   — content cards
 */
export function generateShapeTokens(shape: ButtonShape): ShapeTokenMap {
  switch (shape) {
    case 'sharp':
      return {
        radiusButton: '2px',
        radiusXs: '2px',
        radiusSm: '2px',
        radiusMd: '4px',
        radiusLg: '6px',
        radiusCard: '4px',
      };
    case 'pill':
      return {
        radiusButton: '9999px',
        radiusXs: '4px',
        radiusSm: '8px',
        radiusMd: '12px',
        radiusLg: '16px',
        radiusCard: '12px',
      };
    case 'rounded':
    default:
      return {
        radiusButton: '8px',
        radiusXs: '4px',
        radiusSm: '6px',
        radiusMd: '8px',
        radiusLg: '12px',
        radiusCard: '8px',
      };
  }
}
