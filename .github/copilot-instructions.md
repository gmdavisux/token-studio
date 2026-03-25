# Token Studio — Copilot Instructions

This is a **React + TypeScript design token generator** that takes a brand color (and a set of personality axes) and produces a complete design library: color scales, semantic tokens, shape tokens, and effects/shadow tokens, exported as both **CSS custom properties** (for live preview) and **W3C DTCG JSON** (for design tooling interop).

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 19, Vite 8 |
| Language | TypeScript 5.9 (strict) |
| Styling | Tailwind CSS v4 (utility classes + CSS custom properties) |
| Color math | [culori](https://culorijs.org/) — `clampChroma`, `formatHex`; color space: **OKLCH** |
| State | React `useReducer` + Context (`TokenStudioContext`) |
| Build | `tsc -b && vite build` |

---

## Repository Layout

```
src/
  lib/
    color/           # Pure color-math pipeline (no React)
      types.ts       # All shared types + interfaces (single source of truth)
      generate.ts    # Raw scale generation (OKLCH math)
      semantic.ts    # Semantic token derivation from raw scales
      contrast.ts    # WCAG contrast utilities
      css.ts         # CSS custom property string generation + live DOM injection
      dtcg.ts        # DTCG JSON generation (design-tool interop export)
      parse.ts       # Color string parser (hex / rgb / hsl / oklch → OKLCHColor)
    tokens/          # Non-color token generators (pure functions)
      shape.ts       # Border-radius tokens (ButtonShape → ShapeTokenMap)
      effects.ts     # Shadow / glow tokens (ElevationModel → EffectsTokenMap)
  context/
    reducer.ts           # TokenStudioState, TokenStudioAction, tokenStudioReducer
    TokenStudioContext.tsx  # Provider: wires all generators, exposes handleColorInput + handleThemeConfig
  components/
    ColorInput.tsx       # Brand color text input
    PaletteDisplay.tsx   # Top-level palette viewer
    ScaleRow.tsx         # One named scale rendered as a row of swatches
    SwatchCell.tsx       # Individual stop swatch
    ContrastBadge.tsx    # WCAG contrast ratio badge
    SemanticTokenGroup.tsx  # Renders a semantic token group (light/dark)
    CSSExport.tsx        # Multi-format export panel (CSS + DTCG JSON) with copy
    ThemeControls.tsx    # All personality-axis controls (segmented controls)
    ThemePanel.tsx       # Slide-in drawer that hosts ThemeControls
  App.tsx              # Root layout: header (ColorInput + Customize button) + PaletteDisplay + ThemePanel
```

---

## Core Data Model

### Canonical color: `OKLCHColor`
All internal color math uses OKLCH (`{ l: 0–1, c: 0–0.4+, h: 0–360 }`). User input is parsed into this format and never stored as hex internally.

### Generation pipeline (pure, no side-effects except `injectCssTokens`)
```
brandColor + ThemeConfig
  → generateAllScales()          → { brand, primary, neutral, success, info, warning, error }
  → deriveSemanticTokens()       → SemanticTokenMap
  → generateShapeTokens()        → ShapeTokenMap
  → generateEffectsTokens()      → EffectsTokenMap
  → generateCssTokenString()     → cssTokenString
  → generateDtcgTokenString()    → dtcgTokenString
  → injectCssTokens()            → live DOM CSS custom properties
```
Each stage is a **pure function** (except `injectCssTokens` which mutates `document.documentElement`). They can be called and tested independently.

### `ThemeConfig` — the personality axes
```ts
interface ThemeConfig {
  primaryActionSource: 'chromatic' | 'achromatic' | 'brand-direct' | 'custom-hue';
  primaryCustomHue?: number;   // 0–360, only used when source = 'custom-hue'
  vibrancy: 'muted' | 'natural' | 'vivid';
  buttonShape: 'sharp' | 'rounded' | 'pill';
  elevationModel: 'flat' | 'subtle' | 'prominent' | 'glow';
}
```
`DEFAULT_THEME_CONFIG` is exported from `types.ts`. Always add new axes here first, then thread them through the pipeline.

### `GeneratedPalette` — the full output object
```ts
interface GeneratedPalette {
  brand, primary, neutral, success, info, warning, error: ColorScale;
  semanticTokens: SemanticTokenMap;
  shapeTokens: ShapeTokenMap;
  effectsTokens: EffectsTokenMap;
  themeConfig: ThemeConfig;
  cssTokenString: string;   // full :root { } block
  dtcgTokenString: string;  // DTCG JSON export string
}
```
`css.ts` and `dtcg.ts` receive `Omit<GeneratedPalette, 'cssTokenString' | 'dtcgTokenString'>` so export strings are never circular.

---

## State Management

`TokenStudioState` (in `reducer.ts`) holds:
- `rawInput` / `inputFormat` / `brandColorOKLCH` / `isInputValid`
- `palette: GeneratedPalette | null`
- `isGenerating: boolean`
- `themeConfig: ThemeConfig`

Actions: `SET_INPUT`, `SET_PALETTE`, `SET_GENERATING`, `SET_THEME_CONFIG`.

`TokenStudioContext` exposes two mutation helpers:
- `handleColorInput(raw: string)` — parses input immediately, debounces palette regeneration by 100ms
- `handleThemeConfig(config: ThemeConfig)` — updates state + immediately regenerates (no debounce)

A `stateRef` is kept in sync with current state so callbacks never close over stale `themeConfig` or `brandColorOKLCH`.

---

## CSS Token Naming Conventions

| Category | Pattern | Example |
|---|---|---|
| Raw scales | `--color-{scale}-{stop}` | `--color-brand-500` |
| Action states | `--color-{primary\|brand}-action-{state}` | `--color-primary-action-hover` |
| Backgrounds | `--color-bg-{role}` | `--color-bg-surface` |
| Borders | `--color-border-{role}` | `--color-border-focus` |
| Alert tokens | `--color-{status}-{role}` | `--color-error-text` |
| Shape | `--radius-{size}` | `--radius-button`, `--radius-card` |
| Elevation | `--shadow-{size}`, `--glow-{target}` | `--shadow-md`, `--glow-button` |

All tokens are emitted in a single `:root { }` block followed by a `@media (prefers-color-scheme: dark)` override block. Shape and glow tokens are not light/dark split (they are mode-independent).

---

## W3C Design Tokens Community Group (DTCG) Specification

### What it is
The [W3C DTCG format spec](https://design-tokens.github.io/community-group/format/) defines a **JSON interchange format** for design tokens that tools like Figma, Style Dictionary, and Theo can consume. It is separate from — and complementary to — CSS custom properties. The CSS output is for live browser preview; the DTCG JSON is for design tooling interop.

### Token structure
Every token in DTCG JSON is an object with `$value`, `$type`, and optionally `$description` and `$extensions`:
```json
{
  "color": {
    "primary": {
      "600": {
        "$type": "color",
        "$value": "#4f46e5",
        "$description": "Primary action default (light mode)"
      }
    }
  }
}
```
Groups are plain nested objects (no `$` prefix). The path separator in references is `.`, not `-`.

### DTCG type → value format mapping

| DTCG `$type` | Value format | Example |
|---|---|---|
| `color` | `"#rrggbb"` or `"#rrggbbAA"` | `"#4f46e5"` |
| `dimension` | Number + CSS unit string | `"8px"`, `"1rem"` |
| `shadow` | Object or array of objects | see below |
| `fontFamily` | String or string array | `"Inter"` |
| `fontWeight` | Number or keyword | `700` |
| `duration` | Number + unit | `"200ms"` |
| `cubicBezier` | Array of 4 numbers | `[0.4, 0, 0.2, 1]` |

**Shadow composite type** — this is the most important structural constraint:
```json
{
  "$type": "shadow",
  "$value": {
    "color": "#00000026",
    "offsetX": "0px",
    "offsetY": "2px",
    "blur": "8px",
    "spread": "0px",
    "inset": false
  }
}
```
Multiple shadow layers use an **array** of those objects.

**Alias references** — semantic tokens reference primitive tokens instead of duplicating values:
```json
{
  "semantic": {
    "action": {
      "default": { "$value": "{color.primary.600}" }
    }
  }
}
```

### Current compliance status

| Area | Status | Notes |
|---|---|---|
| Color `$value` format | ✅ | Hex strings match the spec |
| Dimension `$value` format | ✅ | `"8px"` etc. match the spec |
| Shadow token structure | ✅ | `EffectsTokenMap` uses structured `ShadowValue` / `DtcgShadowLayer` |
| DTCG JSON export | ✅ | `generateDtcgTokenString()` emits DTCG JSON |
| Semantic alias references | 🟡 | Alias refs are emitted when semantic hex matches a primitive stop; unmatched values remain hex |
| `$type` wrappers | ✅ | Color, dimension, and shadow tokens emit `$type` + `$value` |
| `$description` wrappers | ℹ️ Optional | Not emitted currently; can be added later for richer docs |

### Current implementation notes

**1. Effects tokens are stored as structured shadow objects (not CSS strings)**

This is the only generator that requires an internal representation change. Define a new type in `types.ts`:
```ts
export interface DtcgShadowLayer {
  color: string;     // #rrggbbAA hex
  offsetX: string;   // CSS dimension, e.g. "0px"
  offsetY: string;
  blur: string;
  spread: string;
  inset: boolean;
}

// A token value is either no shadow, one layer, or multiple layers
export type ShadowValue = 'none' | DtcgShadowLayer | DtcgShadowLayer[];
```
`EffectsTokenMap` uses `ShadowValue` instead of `string`.

In `css.ts`, `shadowToCss(v: ShadowValue): string` converts `ShadowValue → box-shadow CSS string` for live CSS output and runtime injection.

In `dtcg.ts`, structured shadow objects are serialized directly as DTCG `shadow` values.

**2. `src/lib/color/dtcg.ts` provides the pure DTCG export function**
```ts
export function generateDtcgTokenString(palette: Omit<GeneratedPalette, 'cssTokenString' | 'dtcgTokenString'>): string
```
Serializes `GeneratedPalette` to a DTCG-compliant JSON string. Current behavior:
- Raw scale stops → `color.{scale}.{stop}` with `$type: "color"`, `$value: hex`
- Semantic tokens → `{ light, dark }` color tokens, with alias references when possible
- Shape tokens → `radius.{name}` with `$type: "dimension"`
- Shadow tokens → `shadow.{name}` with `$type: "shadow"`, `$value: DtcgShadowLayer | DtcgShadowLayer[]`
- Glow tokens → `shadow.{name}` with `$type: "shadow"` using the 8-digit color hex

**3. `dtcgTokenString: string` is part of `GeneratedPalette`**

Parallel to `cssTokenString`. Generated in `TokenStudioContext.tsx` alongside the CSS string.

**4. `CSSExport` includes a DTCG JSON export tab**

Switches between CSS and DTCG views. The copy button copies whichever is active.

### Future DTCG enhancements

- Add optional `$description` metadata for key semantic tokens.
- Expand alias mapping for semantically derived values that do not exactly match primitive stops.
- Add additional export formats (for example, Style Dictionary-ready grouped JSON) alongside CSS and DTCG.

### DTCG JSON path → CSS custom property mapping

| DTCG path | CSS custom property |
|---|---|
| `color.primary.600` | `--color-primary-600` |
| `color.primary.action.default` | `--color-primary-action-default` |
| `color.bg.surface` | `--color-bg-surface` |
| `radius.button` | `--radius-button` |
| `shadow.md` | `--shadow-md` |
| `shadow.glow-button` | `--glow-button` |

The mapping rule: DTCG `.` → CSS `-`, prepend `--`.

---

## Extending the App

### Adding a new personality axis
1. Add the type and extend `ThemeConfig` in `src/lib/color/types.ts`
2. Update `DEFAULT_THEME_CONFIG` in `types.ts`
3. Thread the new value through whichever generator(s) need it (`generate.ts`, `semantic.ts`, `shape.ts`, `effects.ts`)
4. If it produces new CSS variables, add them to `generateCssTokenString()` and `injectCssTokens()` in `css.ts`
5. Add a segmented control (or other input) to `ThemeControls.tsx`
6. No changes needed to `reducer.ts` or `TokenStudioContext.tsx` — `SET_THEME_CONFIG` is generic

### Adding a new token category (e.g. typography)
1. Define `TypographyTokenMap` in `types.ts`
2. Add a `typographyTokens: TypographyTokenMap` field to `GeneratedPalette`
3. Create `src/lib/tokens/typography.ts` exporting `generateTypographyTokens(config)`
4. Call it in `TokenStudioContext.tsx` inside `generatePalette()`
5. Emit `--font-*` and `--text-*` custom props in `css.ts`
6. Emit the DTCG-typed tokens in `dtcg.ts` (once implemented) with the correct `$type` per value
7. Add controls to `ThemeControls.tsx`

### Adding a new semantic token group
1. Add a key and role type to `SemanticTokenMap` in `types.ts`
2. Implement `buildXxxTokens()` in `semantic.ts`
3. Call it in `deriveSemanticTokens()` in `semantic.ts`
4. Emit the CSS vars in `css.ts` (both light `:root` block and dark `@media` block)

---

## Key Constraints and Decisions

- **OKLCH everywhere internally.** Never store or compute in hex, RGB, or HSL. Convert at the boundary only (`toHex` in `generate.ts`, `oklchToHex` in `parse.ts`).
- **All generators are pure functions.** Do not add side-effects to `generate.ts`, `semantic.ts`, `shape.ts`, or `effects.ts`. Only `css.ts:injectCssTokens` may touch the DOM.
- **`types.ts` is the single source of truth** for all interfaces. Add types there first, not inline in component files.
- **Glow values use 8-digit hex** (`#rrggbbAA`) so opacity is encoded without needing `rgba()` or a light/dark split. The `hexWithAlpha(hex, alpha)` helper in `effects.ts` handles this.
- **Shadow tokens must become structured `DtcgShadowLayer` objects** before the DTCG export is implemented. Do not introduce more CSS string shadow values — new shadow tokens should use `ShadowValue` (structured) from the start, with `css.ts` deriving the CSS string via `shadowToCss()`.
- **No external state library.** The `useReducer` + Context pattern is sufficient; do not introduce Redux, Zustand, etc.
- **Tailwind for layout/spacing; CSS custom properties for theme colors.** Never hardcode color hex values in component JSX — always reference `var(--color-*)` tokens. Provide a fallback hex as the second argument for SSR safety.
- **`ThemeConfig` on state, not palette.** `themeConfig` is stored on `TokenStudioState` and included in `GeneratedPalette` for reference, but it is the state version that drives regeneration.
- **Two export formats: CSS custom properties and DTCG JSON.** CSS is the live preview format; DTCG JSON is the design tooling interchange format. Both are derived from the same `GeneratedPalette`. Never conflate them.
- **Export architecture is multi-format.** Treat CSS and DTCG as first-class outputs; future native/export formats should be additive and selected in the export UI, not substituted for one another.
- **Keep this file in sync with consequential changes.** Any PR/task that changes architecture, token schema, generation pipeline, public token naming, export formats, or extension recipes must update this `copilot-instructions.md` in the same change set.
- **Build command: `npm run build`** (`tsc -b && vite build`). This must pass clean after every change. Pre-existing lint failures exist in `ScaleRow.tsx`, `SemanticTokenGroup.tsx`, `TokenStudioContext.tsx`, and `generate.ts` — do not treat those as regressions.

---

## Maintenance Rule

After consequential development changes, update this document before considering the task complete.

### When updates are required

- New/changed types in `types.ts` that affect generation or export.
- New generator modules or pipeline stages.
- Changes to token naming conventions or output structure.
- Changes to export formats, export UI behavior, or copy semantics.
- Changes to extension recipes or project-level architectural constraints.

### Minimum update checklist

1. Update the relevant architecture section(s) in this file.
2. Update any affected examples, signatures, or status tables.
3. Ensure “Current compliance status” reflects the real implementation state (not planned state).
4. Run `npm run build` and keep instructions consistent with the verified code path.
