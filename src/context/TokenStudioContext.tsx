import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import type { TokenStudioState, TokenStudioAction } from './reducer';
import { tokenStudioReducer, initialState, DEFAULT_PRIMARY_COLOR } from './reducer';
import { parseColor } from '../lib/color/parse';
import { generateAllScales } from '../lib/color/generate';
import { deriveSemanticTokens } from '../lib/color/semantic';
import { generateCssTokenString, injectCssTokens } from '../lib/color/css';
import { generateDtcgTokenString } from '../lib/color/dtcg';
import { generateShapeTokens } from '../lib/tokens/shape';
import { generateEffectsTokens } from '../lib/tokens/effects';
import type { ColorFormat, ThemeConfig, ThemePreset, ComponentTokenSlots } from '../lib/color/types';
import { THEME_PRESET_CONFIGS } from '../lib/color/types';

// ─── Context shape ─────────────────────────────────────────────────────────────

interface TokenStudioContextValue {
  state: TokenStudioState;
  dispatch: React.Dispatch<TokenStudioAction>;
  handleColorInput: (raw: string) => void;
  handleBrandColorInput: (raw: string) => void;
  handleThemeConfig: (config: ThemeConfig) => void;
  handlePresetSelect: (preset: ThemePreset) => void;
  handleComponentOverride: (key: string, slots: ComponentTokenSlots) => void;
}

const TokenStudioContext = createContext<TokenStudioContextValue | null>(null);

// ─── Provider ──────────────────────────────────────────────────────────────────

export function TokenStudioProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(tokenStudioReducer, initialState);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Always-current state ref so callbacks don't close over stale state
  const stateRef = useRef(state);
  stateRef.current = state;

  /** Generate a palette from a primary OKLCH color + optional brand + ThemeConfig. */
  const generatePalette = useCallback((
    primaryColor: typeof DEFAULT_PRIMARY_COLOR,
    themeConfig: ThemeConfig,
    brandColor?: typeof DEFAULT_PRIMARY_COLOR | null
  ) => {
    const scales = generateAllScales(primaryColor, themeConfig, brandColor ?? undefined);
    const semanticTokens = deriveSemanticTokens(scales, themeConfig);
    const shapeTokens = generateShapeTokens(themeConfig.buttonShape);
    const effectsTokens = generateEffectsTokens(
      themeConfig.elevationModel,
      semanticTokens.primaryAction.default.light.hex
    );
    const paletteBase = { ...scales, semanticTokens, shapeTokens, effectsTokens, themeConfig };
    const cssTokenString = generateCssTokenString(paletteBase);
    const dtcgTokenString = generateDtcgTokenString(paletteBase);
    const palette = { ...paletteBase, cssTokenString, dtcgTokenString };

    dispatch({ type: 'SET_PALETTE', payload: palette });
    injectCssTokens(paletteBase);
  }, []);

  /** Handle primary color input: parse immediately, debounce palette regen by 100ms. */
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
          generatePalette(captured, stateRef.current.themeConfig, stateRef.current.brandColorOKLCH);
        }, 100);
      }
    },
    [generatePalette]
  );

  /** Handle optional brand color input: debounced regen. */
  const handleBrandColorInput = useCallback(
    (raw: string) => {
      const result = parseColor(raw);
      const color = result.ok ? result.color : null;

      dispatch({
        type: 'SET_BRAND_INPUT',
        payload: { raw, color, valid: result.ok },
      });

      const primaryColor = stateRef.current.primaryColorOKLCH;
      if (primaryColor) {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          generatePalette(primaryColor, stateRef.current.themeConfig, result.ok ? color : stateRef.current.brandColorOKLCH);
        }, 100);
      }
    },
    [generatePalette]
  );

  /** Handle theme config changes: update state then immediately regenerate. */
  const handleThemeConfig = useCallback(
    (config: ThemeConfig) => {
      dispatch({ type: 'SET_THEME_CONFIG', payload: config });
      const primary = stateRef.current.primaryColorOKLCH;
      if (primary) {
        generatePalette(primary, config, stateRef.current.brandColorOKLCH);
      }
    },
    [generatePalette]
  );

  /** Select a named preset: merges preset defaults into current config, then regens. */
  const handlePresetSelect = useCallback(
    (preset: ThemePreset) => {
      const presetAxes = THEME_PRESET_CONFIGS[preset];
      const config: ThemeConfig = { ...stateRef.current.themeConfig, themePreset: preset, ...presetAxes };
      dispatch({ type: 'SET_THEME_CONFIG', payload: config });
      const primary = stateRef.current.primaryColorOKLCH;
      if (primary) {
        generatePalette(primary, config, stateRef.current.brandColorOKLCH);
      }
    },
    [generatePalette]
  );

  /** Store a component token-slot override (keyed by "type-variant-size"). */
  const handleComponentOverride = useCallback(
    (key: string, slots: ComponentTokenSlots) => {
      dispatch({ type: 'SET_COMPONENT_OVERRIDE', payload: { key, slots } });
    },
    []
  );

  // Generate initial palette on mount from the default primary color
  useEffect(() => {
    generatePalette(DEFAULT_PRIMARY_COLOR, initialState.themeConfig, null);
  }, [generatePalette]);

  return (
    <TokenStudioContext.Provider value={{ state, dispatch, handleColorInput, handleBrandColorInput, handleThemeConfig, handlePresetSelect, handleComponentOverride }}>
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
