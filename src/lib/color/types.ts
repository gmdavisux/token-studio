// ─── Color Format ────────────────────────────────────────────────────────────

export type ColorFormat = 'hex' | 'rgb' | 'hsl' | 'oklch' | 'unknown';

// ─── OKLCH Canonical Color ────────────────────────────────────────────────────

export interface OKLCHColor {
  l: number; // 0–1
  c: number; // 0–0.4+
  h: number; // 0–360
}

// ─── Scale Stops ─────────────────────────────────────────────────────────────

export type ScaleStop = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;
export const SCALE_STOPS: ScaleStop[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

// ─── Resolved Color ───────────────────────────────────────────────────────────

export interface ResolvedColor {
  oklch: OKLCHColor;
  hex: string;
  contrastOnWhite: number;
  contrastOnBlack: number;
  preferredTextColor: 'white' | 'black';
}

// ─── Color Scale ──────────────────────────────────────────────────────────────

export type ColorScale = Record<ScaleStop, ResolvedColor>;

// ─── Scale Names ─────────────────────────────────────────────────────────────

export type ScaleName =
  | 'brand'
  | 'primary'
  | 'neutral'
  | 'success'
  | 'info'
  | 'warning'
  | 'error';

export const SCALE_NAMES: ScaleName[] = [
  'brand',
  'primary',
  'neutral',
  'success',
  'info',
  'warning',
  'error',
];

// ─── Semantic Token Value ─────────────────────────────────────────────────────

export interface SemanticToken {
  id: string;
  label: string;
  light: ResolvedColor;
  dark: ResolvedColor;
}

// ─── Semantic Token Map ───────────────────────────────────────────────────────

export interface SemanticTokenMap {
  // Action states for interactive scales
  primaryAction: Record<ActionState, SemanticToken>;
  brandAction: Record<ActionState, SemanticToken>;

  // Alert / status tokens
  success: Record<AlertToken, SemanticToken>;
  info: Record<AlertToken, SemanticToken>;
  warning: Record<AlertToken, SemanticToken>;
  error: Record<AlertToken, SemanticToken>;

  // Backgrounds
  backgrounds: Record<BackgroundToken, SemanticToken>;

  // Borders
  borders: Record<BorderToken, SemanticToken>;
}

export type ActionState =
  | 'default'
  | 'hover'
  | 'pressed'
  | 'disabled'
  | 'disabledText';

export type AlertToken = 'bg' | 'border' | 'text' | 'icon' | 'action';

export type BackgroundToken = 'base' | 'surface' | 'elevated' | 'sunken' | 'sunkenDeep';

export type BorderToken =
  | 'subtle'
  | 'default'
  | 'strong'
  | 'focus'
  | 'success'
  | 'info'
  | 'warning'
  | 'error';

// ─── Generated Palette ────────────────────────────────────────────────────────

export interface GeneratedPalette {
  brand: ColorScale;
  primary: ColorScale;
  neutral: ColorScale;
  success: ColorScale;
  info: ColorScale;
  warning: ColorScale;
  error: ColorScale;
  semanticTokens: SemanticTokenMap;
  cssTokenString: string;
}

// ─── Parse Result ─────────────────────────────────────────────────────────────

export type ParseResult =
  | {
      ok: true;
      color: OKLCHColor;
      format: ColorFormat;
    }
  | {
      ok: false;
      error: string;
    };
