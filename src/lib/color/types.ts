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
  | 'primary'
  | 'neutral'
  | 'success'
  | 'info'
  | 'warning'
  | 'error';

export const SCALE_NAMES: ScaleName[] = [
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
  /** Present only when an optional brand color is supplied. */
  brandAction?: Record<ActionState, SemanticToken>;

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

// ─── Theme Config ─────────────────────────────────────────────────────────────

/**
 * How saturated / vivid the generated scales are.
 * Applied as a multiplier on CHROMA_FRACTION in scale generation.
 * - monochrome: near-zero chroma, achromatic appearance
 * - pastel:     very low chroma, soft / washed-out look
 * - muted:      reduced chroma, subdued look
 * - natural:    standard chroma, balanced look
 * - vivid:      boosted chroma, saturated look
 */
export type Vibrancy = 'monochrome' | 'pastel' | 'muted' | 'natural' | 'vivid';

/**
 * Named theme preset that bundles vibrancy + shape + elevation into a quick-start.
 */
export type ThemePreset = 'default' | 'classic' | 'muted' | 'vivid' | 'pastel' | 'monochrome';

export const THEME_PRESET_CONFIGS: Record<
  ThemePreset,
  Pick<ThemeConfig, 'vibrancy' | 'buttonShape' | 'elevationModel'>
> = {
  default:     { vibrancy: 'natural',    buttonShape: 'rounded', elevationModel: 'subtle' },
  classic:     { vibrancy: 'natural',    buttonShape: 'rounded', elevationModel: 'subtle' },
  muted:       { vibrancy: 'muted',      buttonShape: 'rounded', elevationModel: 'flat' },
  vivid:       { vibrancy: 'vivid',      buttonShape: 'pill',    elevationModel: 'glow' },
  pastel:      { vibrancy: 'pastel',     buttonShape: 'pill',    elevationModel: 'flat' },
  monochrome:  { vibrancy: 'monochrome', buttonShape: 'sharp',   elevationModel: 'subtle' },
};

// ─── Shape Tokens ─────────────────────────────────────────────────────────────

/**
 * Visual shape family for interactive UI elements.
 * - sharp:   very small radii, angular look
 * - rounded: moderate radii, friendly look
 * - pill:    fully rounded buttons, modern/bubbly look
 */
export type ButtonShape = 'sharp' | 'rounded' | 'pill';

export interface ShapeTokenMap {
  /** Border-radius for buttons (the defining shape token). */
  radiusButton: string;
  /** Extra-small radius — inputs, tags, badges. */
  radiusXs: string;
  /** Small radius — chips, small cards. */
  radiusSm: string;
  /** Medium radius — dialogs, dropdowns, panels. */
  radiusMd: string;
  /** Large radius — modals, sheets. */
  radiusLg: string;
  /** Card / container radius. */
  radiusCard: string;
}

// ─── DTCG Shadow Types ────────────────────────────────────────────────────────

/**
 * Structured representation of a single CSS box-shadow layer.
 * Matches the W3C DTCG `shadow` composite type.
 * `color` should be 8-digit hex (#rrggbbAA) for opacity encoding.
 */
export interface DtcgShadowLayer {
  color: string;    // #rrggbbAA hex
  offsetX: string;  // CSS dimension, e.g. "0px"
  offsetY: string;
  blur: string;
  spread: string;
  inset: boolean;
}

/**
 * A shadow token value: no shadow, a single layer, or multiple layers.
 * Maps to DTCG shadow `$value`: `[]` for none, object or array for shadows.
 */
export type ShadowValue = 'none' | DtcgShadowLayer | DtcgShadowLayer[];

// ─── Effects Tokens ───────────────────────────────────────────────────────────

/**
 * Visual elevation / shadow model.
 * - flat:      no shadows or glows
 * - subtle:    light ambient shadows, no color
 * - prominent: deeper shadows, stronger depth cues
 * - glow:      prominent shadows + colored glow on buttons and focus rings
 */
export type ElevationModel = 'flat' | 'subtle' | 'prominent' | 'glow';

export interface EffectsTokenMap {
  /** Micro shadow — inputs, chips. */
  shadowSm: ShadowValue;
  /** Default card / panel shadow. */
  shadowMd: ShadowValue;
  /** Modal / overlay shadow. */
  shadowLg: ShadowValue;
  /** Shadow specifically for primary button. */
  shadowButton: ShadowValue;
  /** Colored glow for primary button (glow model only; 'none' otherwise). */
  glowButton: ShadowValue;
  /** Focus ring glow (glow model only; falls back to solid border otherwise). */
  glowFocus: ShadowValue;
}

export interface ThemeConfig {
  themePreset: ThemePreset;
  vibrancy: Vibrancy;
  buttonShape: ButtonShape;
  elevationModel: ElevationModel;
}

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  themePreset: 'default',
  vibrancy: 'natural',
  buttonShape: 'rounded',
  elevationModel: 'subtle',
};

// ─── Component Override Types ─────────────────────────────────────────────────

/** Size variant for component preview. */
export type ComponentSize = 'sm' | 'md' | 'lg';

/** Semantic variant for component preview. */
export type ComponentVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

/**
 * Override slots for a specific component instance.
 * Empty/missing slots fall back to the generated token value.
 * Accepts any valid CSS color string (hex, oklch, rgb, etc.).
 */
export interface ComponentTokenSlots {
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  radius?: string;
  shadow?: string;
}

/**
 * Map of component overrides keyed by "{componentType}-{variant}-{size}".
 * Example key: "button-primary-md"
 * Stored in state (not ThemeConfig) so generation stays pure.
 */
export type ComponentOverrideMap = Record<string, ComponentTokenSlots>;

// ─── Generated Palette ────────────────────────────────────────────────────────

export interface GeneratedPalette {
  /** Present only when an optional brand color was supplied. */
  brand?: ColorScale;
  primary: ColorScale;
  neutral: ColorScale;
  success: ColorScale;
  info: ColorScale;
  warning: ColorScale;
  error: ColorScale;
  semanticTokens: SemanticTokenMap;
  shapeTokens: ShapeTokenMap;
  effectsTokens: EffectsTokenMap;
  themeConfig: ThemeConfig;
  cssTokenString: string;
  dtcgTokenString: string;
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
