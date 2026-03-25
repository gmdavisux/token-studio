# Plan: Primary-First Layered Design System Generator

## TL;DR
Transform Token Studio from a brand-color-driven palette generator into a **layered design system generator with progressive specificity**. The main input becomes "primary color" (directly drives action/button scale). An optional "brand color" influences neutral tint only. Named theme presets (classic, muted, vivid, pastel, monochrome) bundle vibrancy + shape + elevation as quick-starts, with per-axis dials still accessible. Component preview adds size (sm/md/lg), semantic (primary/secondary/danger/ghost), and dark-mode variants. A new `ComponentInspector` lets users override individual token slots per component.

---

## User decisions
- **Color harmony**: personality-driven auto (semantic chroma harmonized to primary personality)
- **Theme layer**: presets + dials (preset sets defaults, dials remain editable below)
- **Component overrides**: token-slot overrides (named slots: bg, border, text, radius, shadow)
- **Brand color role**: neutral tint + semantic harmony (brand hue tints neutrals; same as current brand behavior, re-framed)
- **App flow**: single-page with sections (no wizard)
- **Variants**: size sm/md/lg + semantic primary/secondary/danger/ghost + dark mode toggle
- **Components in scope**: buttons + inputs + alerts (existing set)

---

## Phase 1 — Data model foundation
*`types.ts` and `reducer.ts` — must complete first; all phases depend on these.*

### 1. `src/lib/color/types.ts`
- **Remove** `PrimaryActionSource` type and `primaryActionSource`/`primaryCustomHue` from `ThemeConfig`
- **Expand** `Vibrancy` union: `'monochrome' | 'pastel' | 'muted' | 'natural' | 'vivid'`
  - pastel ≈ 0.3× chroma, monochrome ≈ 0.05×
- **Add** `ThemePreset = 'default' | 'classic' | 'muted' | 'vivid' | 'pastel' | 'monochrome'`
- **Add** `THEME_PRESET_CONFIGS: Record<ThemePreset, Pick<ThemeConfig, 'vibrancy' | 'buttonShape' | 'elevationModel'>>`:
  - `default` / `classic`: natural + rounded + subtle
  - `muted`: muted + rounded + flat
  - `vivid`: vivid + pill + glow
  - `pastel`: pastel + pill + flat
  - `monochrome`: monochrome + sharp + subtle
- **Add** `themePreset: ThemePreset` to `ThemeConfig`; update `DEFAULT_THEME_CONFIG`
- **Add** `ComponentSize = 'sm' | 'md' | 'lg'`
- **Add** `ComponentVariant = 'primary' | 'secondary' | 'danger' | 'ghost'`
- **Add** `ComponentTokenSlots = { backgroundColor?: string; borderColor?: string; textColor?: string; radius?: string; shadow?: string }`
- **Add** `ComponentOverrideMap = Record<string, ComponentTokenSlots>` (key format: `"button-primary-md"`)
- **Update** `ScaleName` / `SCALE_NAMES`: remove `'brand'`; make `brand?: ColorScale` optional in `GeneratedPalette`
- Make `brandAction` in `SemanticTokenMap` optional

### 2. `src/context/reducer.ts`
- Rename `brandColorOKLCH` → `primaryColorOKLCH` in `TokenStudioState`
- Add `brandColorOKLCH: OKLCHColor | null`, `brandRawInput: string`, `brandIsValid: boolean`
- Add `componentOverrides: ComponentOverrideMap` to state (separate from `ThemeConfig`)
- Add `SET_BRAND_INPUT` action: `{ type: 'SET_BRAND_INPUT'; payload: { raw: string; color: OKLCHColor | null; valid: boolean } }`
- Add `SET_COMPONENT_OVERRIDE` action: `{ type: 'SET_COMPONENT_OVERRIDE'; payload: { key: string; slots: ComponentTokenSlots } }`
- Update `DEFAULT_PRIMARY_COLOR` (rename from `DEFAULT_BRAND_COLOR`) → `oklch(0.55 0.22 272)`

---

## Phase 2 — Generation pipeline refactor
*Depends on Phase 1.*

### 3. `src/lib/color/generate.ts`
- Rename parameter `brandColor` → `primaryColor` throughout
- Simplify `generatePrimaryScale` → `generateScale(primaryColor, chromaMultiplier)` (no `PrimaryActionSource` switch)
- Add `monochrome: 0.05` and `pastel: 0.3` to `VIBRANCY_MULTIPLIER`
- Update `generateNeutralScale(primaryHue, brandHue?)` — use `brandHue` for hue tint when provided
- Update `generateAllScales(primaryColor, themeConfig, brandColor?)` — `brand` scale conditional on `brandColor`

### 4. `src/lib/color/semantic.ts`
- Rename `brandColor` → `primaryColor` in `deriveSemanticTokens` and helpers
- Make `brandAction` derivation conditional on brand scale being present

### 5. `src/lib/tokens/shape.ts`, `src/lib/tokens/effects.ts`
- No functional changes; ensure no remaining references to `primaryActionSource`

### 6. `src/lib/color/css.ts`
- Remove `--color-brand-*` from mandatory token block; emit conditionally when `palette.brand` present
- Remove `brandAction` vars from mandatory block; emit conditionally when `palette.semanticTokens.brandAction` present

### 7. `src/lib/color/dtcg.ts`
- Emit `color.brand.*` DTCG group only when `palette.brand` is present

---

## Phase 3 — Context plumbing
*Depends on Phases 1–2.*

### 8. `src/context/TokenStudioContext.tsx`
- Add `handleBrandColorInput(raw: string)`: parses → dispatches `SET_BRAND_INPUT` → debounced regen
- Add `handlePresetSelect(preset: ThemePreset)`: merges `THEME_PRESET_CONFIGS[preset]` into `ThemeConfig` → dispatch → regen
- Add `handleComponentOverride(key: string, slots: ComponentTokenSlots)`: dispatches `SET_COMPONENT_OVERRIDE`
- Update `generatePalette(primaryColor, themeConfig, brandColor?)` to pass brand through to `generateAllScales`
- Update `stateRef` to include `brandColorOKLCH` to avoid stale closure
- Expose all new handlers in `TokenStudioContextValue`

---

## Phase 4 — Component preview enhancements
*Depends on Phase 1 types + Phase 3 context.*

### 9. `src/components/ComponentPreview.tsx`
- Add local `previewMode: 'light' | 'dark'` state with sun/moon toggle button
- Add size tabs (sm/md/lg) — drives padding/font-size/radius on mock components
- Expand `MockButtons` to show all 4 semantic variants (primary/secondary/danger/ghost) in the active size
- Add "selected component" state: clicking a mock component surfaces `ComponentInspector`
- Read `componentOverrides` from context; apply override slots as inline styles

---

## Phase 5 — UI restructure
*Depends on Phase 3.*

### 10. `src/components/ColorInput.tsx`
- Refactor to props-driven: `label`, `value`, `isValid`, `format`, `onChange`, `hint?`, `optional?`
- Remove direct `useTokenStudio()` call; let `App.tsx` wire it up

### 11. `src/App.tsx`
- Add optional brand color input below primary (with hint: "Tints neutrals toward your logo color")
- Restructure into three scroll sections:
  1. **Color Setup** (`#color-setup`): primary + brand inputs → palette scales
  2. **Design System** (`#design-system`): preset bar → component preview → per-axis dials
  3. **Export** (`#export`): existing `CSSExport` panel
- Remove "Customize" slide-in button (controls move inline)
- Update header copy: "Enter your **primary color**…"

### 12. `src/components/ThemeControls.tsx`
- Add preset card row at the top: 6 clickable cards (default/classic/muted/vivid/pastel/monochrome), each with a color swatch and name
- Remove Primary Action Source segmented control (eliminated)
- Keep vibrancy / buttonShape / elevationModel dials below as "advanced" controls
- Highlight active preset card based on `themeConfig.themePreset`

### 13. `src/components/ThemePanel.tsx`
- Repurpose as an inline collapsible "Advanced" section (no longer a slide-in drawer)

### 14. New `src/components/ComponentInspector.tsx`
- Rendered when a component is selected in the preview
- Header: component name + active variant + active size
- Lists 5 token slots (background, border, text, radius, shadow):
  - Shows current resolved hex + CSS var name
  - Free-form text input for override value (accepts hex, oklch, CSS keywords)
  - Empty/cleared = use generated value
- On change: calls `handleComponentOverride(key, slots)` from context
- Per-slot reset button

### 15. `src/components/PaletteDisplay.tsx`
- Update scale list to `['primary', 'neutral', 'success', 'info', 'warning', 'error']`
- Add conditional `brand` scale row when `palette.brand` is present
- Make "Brand" action states group conditional on `palette.semanticTokens.brandAction`

### 16. `src/components/SideNav.tsx`
- Update `NAV_ITEMS` / `ALL_IDS` to new section anchors: `color-setup`, `design-system`, `export`

---

## Phase 6 — Build verification + docs

### 17. `npm run build`
- `tsc -b && vite build` must pass clean
- Fix TypeScript errors from optional `brand?` and removed `PrimaryActionSource`

### 18. `.github/copilot-instructions.md`
- Update repo layout (add `ComponentInspector.tsx`)
- Update Core Data Model: new `ThemeConfig`, removed `PrimaryActionSource`, new `Vibrancy` values, `ComponentOverrideMap`
- Update Generation Pipeline section
- Update CSS Token Naming (brand vars now conditional)
- Update "Extending the App" recipes

---

## Relevant files

**Modified:**
- `src/lib/color/types.ts`
- `src/context/reducer.ts`
- `src/context/TokenStudioContext.tsx`
- `src/lib/color/generate.ts`
- `src/lib/color/semantic.ts`
- `src/lib/color/css.ts`
- `src/lib/color/dtcg.ts`
- `src/components/ColorInput.tsx`
- `src/components/PaletteDisplay.tsx`
- `src/components/ComponentPreview.tsx`
- `src/components/ThemeControls.tsx`
- `src/components/ThemePanel.tsx`
- `src/App.tsx`
- `src/components/SideNav.tsx`
- `.github/copilot-instructions.md`

**New:**
- `src/components/ComponentInspector.tsx`

---

## Verification checklist
1. `npm run build` passes clean
2. Primary color drives palette; no `brand` row without a brand color entered
3. Entering a brand color adds brand reference row + tints neutral scale
4. Clicking "vivid" preset updates all components immediately; dials still adjustable
5. Size toggle (sm/md/lg) visibly changes component padding/radius
6. All 4 semantic button variants render correctly
7. Dark mode toggle flips component preview to dark semantic tokens
8. Selecting a component + setting a background override updates only that component; clearing restores generated value
9. CSS Export: `--color-primary-*` always present; `--color-brand-*` only when brand color entered
10. DTCG JSON reflects same conditional brand structure

---

## Key decisions
- `PrimaryActionSource` fully removed — primary color IS the action color
- `Vibrancy` expanded to 5 levels (not a separate `colorMode` field) — keeps model flat
- `ComponentOverrideMap` lives in state, **not** `ThemeConfig` — generation stays pure
- Brand scale is reference-only: drives neutral tint + `brandAction` tokens only
- `ColorInput.tsx` made props-driven for reuse for both primary and brand inputs
- Dark mode toggle is **local** to component preview (not a global app dark mode)
- `ThemePanel` slide-in drawer replaced with inline collapsible "Advanced" section

## Open questions for review
1. **`brandAction` tokens in CSS Export**: should `--color-brand-action-*` vars be omitted entirely when no brand color is entered, or emitted as commented-out placeholders?
2. **"default" preset**: same values as "classic" — show as a visible card, or treat as a hidden internal sentinel with no UI card?
3. **ComponentInspector input format**: free-form CSS values (any valid color) or constrained to palette stops only (dropdown of `primary-600`, `neutral-200`, etc.)?

## Out of scope (future)
- Additional accent/secondary scales from color harmony algorithm
- Full color-wheel harmony picker (analogous/complementary/triadic)
- Style Dictionary-ready grouped JSON export
- Form elements (checkbox, toggle, select) in component preview
- Modal / card / badge component previews
