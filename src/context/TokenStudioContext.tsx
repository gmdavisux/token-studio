import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import type { TokenStudioState, TokenStudioAction } from './reducer';
import { tokenStudioReducer, initialState, DEFAULT_BRAND_COLOR } from './reducer';
import { parseColor } from '../lib/color/parse';
import { generateAllScales } from '../lib/color/generate';
import { deriveSemanticTokens } from '../lib/color/semantic';
import { generateCssTokenString, injectCssTokens } from '../lib/color/css';
import type { ColorFormat } from '../lib/color/types';

// ─── Context shape ─────────────────────────────────────────────────────────────

interface TokenStudioContextValue {
  state: TokenStudioState;
  dispatch: React.Dispatch<TokenStudioAction>;
  handleColorInput: (raw: string) => void;
}

const TokenStudioContext = createContext<TokenStudioContextValue | null>(null);

// ─── Provider ──────────────────────────────────────────────────────────────────

export function TokenStudioProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(tokenStudioReducer, initialState);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Generate a palette from an OKLCH color and push it to state. */
  const generatePalette = useCallback((color: typeof DEFAULT_BRAND_COLOR) => {
    const scales = generateAllScales(color);
    const semanticTokens = deriveSemanticTokens(scales);
    const paletteWithoutCss = { ...scales, semanticTokens };
    const cssTokenString = generateCssTokenString(paletteWithoutCss);
    const palette = { ...paletteWithoutCss, cssTokenString };

    dispatch({ type: 'SET_PALETTE', payload: palette });
    injectCssTokens(paletteWithoutCss);
  }, []);

  /** Handle raw color input: parse immediately, debounce palette regen by 100ms. */
  const handleColorInput = useCallback(
    (raw: string) => {
      const result = parseColor(raw);
      const color = result.ok ? result.color : null;
      const format: ColorFormat = result.ok ? result.format : 'unknown';

      dispatch({
        type: 'SET_INPUT',
        payload: { raw, format, color, valid: result.ok },
      });

      if (result.ok && result.color) {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        const captured = result.color;
        debounceRef.current = setTimeout(() => {
          generatePalette(captured);
        }, 100);
      }
    },
    [generatePalette]
  );

  // Generate initial palette on mount from the default seed color
  useEffect(() => {
    generatePalette(DEFAULT_BRAND_COLOR);
  }, [generatePalette]);

  return (
    <TokenStudioContext.Provider value={{ state, dispatch, handleColorInput }}>
      {children}
    </TokenStudioContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useTokenStudio() {
  const ctx = useContext(TokenStudioContext);
  if (!ctx) throw new Error('useTokenStudio must be used within TokenStudioProvider');
  return ctx;
}
