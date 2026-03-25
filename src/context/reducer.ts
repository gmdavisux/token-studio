import type { ColorFormat, GeneratedPalette, OKLCHColor, ThemeConfig, ComponentOverrideMap, ComponentTokenSlots } from '../lib/color/types';
import { DEFAULT_THEME_CONFIG } from '../lib/color/types';

// ─── State ────────────────────────────────────────────────────────────────────

export interface TokenStudioState {
  // Primary color (drives the action/button scale)
  rawInput: string;
  inputFormat: ColorFormat;
  primaryColorOKLCH: OKLCHColor | null;
  isInputValid: boolean;
  // Optional brand / logo color (tints neutrals)
  brandRawInput: string;
  brandColorOKLCH: OKLCHColor | null;
  brandIsValid: boolean;
  palette: GeneratedPalette | null;
  isGenerating: boolean;
  themeConfig: ThemeConfig;
  componentOverrides: ComponentOverrideMap;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export type TokenStudioAction =
  | { type: 'SET_INPUT'; payload: { raw: string; format: ColorFormat; color: OKLCHColor | null; valid: boolean } }
  | { type: 'SET_BRAND_INPUT'; payload: { raw: string; color: OKLCHColor | null; valid: boolean } }
  | { type: 'SET_PALETTE'; payload: GeneratedPalette }
  | { type: 'SET_GENERATING'; payload: boolean }
  | { type: 'SET_THEME_CONFIG'; payload: ThemeConfig }
  | { type: 'SET_COMPONENT_OVERRIDE'; payload: { key: string; slots: ComponentTokenSlots } };

// ─── Reducer ──────────────────────────────────────────────────────────────────

export function tokenStudioReducer(
  state: TokenStudioState,
  action: TokenStudioAction
): TokenStudioState {
  switch (action.type) {
    case 'SET_INPUT':
      return {
        ...state,
        rawInput: action.payload.raw,
        inputFormat: action.payload.format,
        primaryColorOKLCH: action.payload.color,
        isInputValid: action.payload.valid,
      };
    case 'SET_BRAND_INPUT':
      return {
        ...state,
        brandRawInput: action.payload.raw,
        brandColorOKLCH: action.payload.color,
        brandIsValid: action.payload.valid,
      };
    case 'SET_PALETTE':
      return { ...state, palette: action.payload, isGenerating: false };
    case 'SET_GENERATING':
      return { ...state, isGenerating: action.payload };
    case 'SET_THEME_CONFIG':
      return { ...state, themeConfig: action.payload };
    case 'SET_COMPONENT_OVERRIDE':
      return {
        ...state,
        componentOverrides: {
          ...state.componentOverrides,
          [action.payload.key]: action.payload.slots,
        },
      };
    default:
      return state;
  }
}

// ─── Default seed color: vivid indigo primary ─────────────────────────────────

export const DEFAULT_PRIMARY_COLOR: OKLCHColor = { l: 0.55, c: 0.22, h: 272 };
export const DEFAULT_RAW_INPUT = 'oklch(0.55 0.22 272)';

export const initialState: TokenStudioState = {
  rawInput: DEFAULT_RAW_INPUT,
  inputFormat: 'oklch',
  primaryColorOKLCH: DEFAULT_PRIMARY_COLOR,
  isInputValid: true,
  brandRawInput: '',
  brandColorOKLCH: null,
  brandIsValid: false,
  palette: null,
  isGenerating: false,
  themeConfig: DEFAULT_THEME_CONFIG,
  componentOverrides: {},
};
