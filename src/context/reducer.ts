import type { ColorFormat, GeneratedPalette, OKLCHColor } from '../lib/color/types';

// ─── State ────────────────────────────────────────────────────────────────────

export interface TokenStudioState {
  rawInput: string;
  inputFormat: ColorFormat;
  brandColorOKLCH: OKLCHColor | null;
  isInputValid: boolean;
  palette: GeneratedPalette | null;
  isGenerating: boolean;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export type TokenStudioAction =
  | { type: 'SET_INPUT'; payload: { raw: string; format: ColorFormat; color: OKLCHColor | null; valid: boolean } }
  | { type: 'SET_PALETTE'; payload: GeneratedPalette }
  | { type: 'SET_GENERATING'; payload: boolean };

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
        brandColorOKLCH: action.payload.color,
        isInputValid: action.payload.valid,
      };
    case 'SET_PALETTE':
      return { ...state, palette: action.payload, isGenerating: false };
    case 'SET_GENERATING':
      return { ...state, isGenerating: action.payload };
    default:
      return state;
  }
}

// ─── Default seed color: neutral gray ────────────────────────────────────────

export const DEFAULT_BRAND_COLOR: OKLCHColor = { l: 0.6, c: 0.01, h: 260 };
export const DEFAULT_RAW_INPUT = 'oklch(0.6 0.01 260)';

export const initialState: TokenStudioState = {
  rawInput: DEFAULT_RAW_INPUT,
  inputFormat: 'oklch',
  brandColorOKLCH: DEFAULT_BRAND_COLOR,
  isInputValid: true,
  palette: null,
  isGenerating: false,
};
