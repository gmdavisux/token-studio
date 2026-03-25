/**
 * CSS token string generation.
 * Converts a GeneratedPalette into a flat CSS custom properties string.
 * Output is Style Dictionary / Token Transformer compatible.
 */

import type { GeneratedPalette, ColorScale, ScaleStop, ShadowValue, DtcgShadowLayer } from './types';
import { SCALE_STOPS } from './types';

function scaleVars(name: string, scale: ColorScale): string[] {
  return SCALE_STOPS.map(
    (stop: ScaleStop) => `  --color-${name}-${stop}: ${scale[stop].hex};`
  );
}

/**
 * Convert a ShadowValue (structured DTCG shadow) to a CSS box-shadow string.
 * Exported so other modules (dtcg.ts, tests) can reuse the conversion.
 */
export function shadowToCss(v: ShadowValue): string {
  if (v === 'none') return 'none';
  const layers: DtcgShadowLayer[] = Array.isArray(v) ? v : [v];
  return layers
    .map(l => `${l.offsetX} ${l.offsetY} ${l.blur} ${l.spread} ${l.color}${l.inset ? ' inset' : ''}`)
    .join(', ');
}

export function generateCssTokenString(palette: Omit<GeneratedPalette, 'cssTokenString' | 'dtcgTokenString'>): string {
  const { brand, primary, neutral, success, info, warning, error, semanticTokens: st, shapeTokens: sh, effectsTokens: ef } = palette;

  const lines: string[] = [];

  lines.push(':root {');

  // ── Raw scales ──────────────────────────────────────────────────────────────
  if (brand) {
    lines.push('  /* Brand Scale */');
    lines.push(...scaleVars('brand', brand));
  }

  lines.push('  /* Primary Scale */');
  lines.push(...scaleVars('primary', primary));

  lines.push('  /* Neutral Scale */');
  lines.push(...scaleVars('neutral', neutral));

  lines.push('  /* Success Scale */');
  lines.push(...scaleVars('success', success));

  lines.push('  /* Info Scale */');
  lines.push(...scaleVars('info', info));

  lines.push('  /* Warning Scale */');
  lines.push(...scaleVars('warning', warning));

  lines.push('  /* Error Scale */');
  lines.push(...scaleVars('error', error));

  // ── Semantic: action states ──────────────────────────────────────────────────
  lines.push('  /* Primary Action States (Light) */');
  lines.push(`  --color-primary-action-default: ${st.primaryAction.default.light.hex};`);
  lines.push(`  --color-primary-action-hover: ${st.primaryAction.hover.light.hex};`);
  lines.push(`  --color-primary-action-pressed: ${st.primaryAction.pressed.light.hex};`);
  lines.push(`  --color-primary-action-disabled: ${st.primaryAction.disabled.light.hex};`);
  lines.push(`  --color-primary-action-disabled-text: ${st.primaryAction.disabledText.light.hex};`);

  if (st.brandAction) {
    lines.push('  /* Brand Action States (Light) */');
    lines.push(`  --color-brand-action-default: ${st.brandAction.default.light.hex};`);
    lines.push(`  --color-brand-action-hover: ${st.brandAction.hover.light.hex};`);
    lines.push(`  --color-brand-action-pressed: ${st.brandAction.pressed.light.hex};`);
    lines.push(`  --color-brand-action-disabled: ${st.brandAction.disabled.light.hex};`);
  }

  // ── Semantic: backgrounds ────────────────────────────────────────────────────
  lines.push('  /* Backgrounds */');
  lines.push(`  --color-bg-base: ${st.backgrounds.base.light.hex};`);
  lines.push(`  --color-bg-surface: ${st.backgrounds.surface.light.hex};`);
  lines.push(`  --color-bg-elevated: ${st.backgrounds.elevated.light.hex};`);
  lines.push(`  --color-bg-sunken: ${st.backgrounds.sunken.light.hex};`);
  lines.push(`  --color-bg-sunken-deep: ${st.backgrounds.sunkenDeep.light.hex};`);

  // ── Semantic: borders ────────────────────────────────────────────────────────
  lines.push('  /* Borders */');
  lines.push(`  --color-border-subtle: ${st.borders.subtle.light.hex};`);
  lines.push(`  --color-border-default: ${st.borders.default.light.hex};`);
  lines.push(`  --color-border-strong: ${st.borders.strong.light.hex};`);
  lines.push(`  --color-border-focus: ${st.borders.focus.light.hex};`);

  // ── Semantic: alert tokens ───────────────────────────────────────────────────
  for (const name of ['success', 'info', 'warning', 'error'] as const) {
    lines.push(`  /* ${name.charAt(0).toUpperCase() + name.slice(1)} (Light) */`);
    lines.push(`  --color-${name}-bg: ${st[name].bg.light.hex};`);
    lines.push(`  --color-${name}-border: ${st[name].border.light.hex};`);
    lines.push(`  --color-${name}-text: ${st[name].text.light.hex};`);
    lines.push(`  --color-${name}-icon: ${st[name].icon.light.hex};`);
    lines.push(`  --color-${name}-action: ${st[name].action.light.hex};`);
  }
  // ── Shape tokens ──────────────────────────────────────────────────────────────────
  lines.push('  /* Shape */');
  lines.push(`  --radius-button: ${sh.radiusButton};`);
  lines.push(`  --radius-xs: ${sh.radiusXs};`);
  lines.push(`  --radius-sm: ${sh.radiusSm};`);
  lines.push(`  --radius-md: ${sh.radiusMd};`);
  lines.push(`  --radius-lg: ${sh.radiusLg};`);
  lines.push(`  --radius-card: ${sh.radiusCard};`);

  // ── Elevation / Effects tokens ────────────────────────────────────────────────
  lines.push('  /* Elevation */');
  lines.push(`  --shadow-sm: ${shadowToCss(ef.shadowSm)};`);
  lines.push(`  --shadow-md: ${shadowToCss(ef.shadowMd)};`);
  lines.push(`  --shadow-lg: ${shadowToCss(ef.shadowLg)};`);
  lines.push(`  --shadow-button: ${shadowToCss(ef.shadowButton)};`);
  lines.push(`  --glow-button: ${shadowToCss(ef.glowButton)};`);
  lines.push(`  --glow-focus: ${shadowToCss(ef.glowFocus)};`);
  lines.push('}');
  lines.push('');

  // ── Dark mode overrides ──────────────────────────────────────────────────────
  lines.push('@media (prefers-color-scheme: dark) {');
  lines.push('  :root {');
  lines.push(`    --color-primary-action-default: ${st.primaryAction.default.dark.hex};`);
  lines.push(`    --color-primary-action-hover: ${st.primaryAction.hover.dark.hex};`);
  lines.push(`    --color-primary-action-pressed: ${st.primaryAction.pressed.dark.hex};`);
  lines.push(`    --color-primary-action-disabled: ${st.primaryAction.disabled.dark.hex};`);
  lines.push(`    --color-bg-base: ${st.backgrounds.base.dark.hex};`);
  lines.push(`    --color-bg-surface: ${st.backgrounds.surface.dark.hex};`);
  lines.push(`    --color-bg-elevated: ${st.backgrounds.elevated.dark.hex};`);
  lines.push(`    --color-bg-sunken: ${st.backgrounds.sunken.dark.hex};`);
  lines.push(`    --color-bg-sunken-deep: ${st.backgrounds.sunkenDeep.dark.hex};`);
  lines.push(`    --color-border-subtle: ${st.borders.subtle.dark.hex};`);
  lines.push(`    --color-border-default: ${st.borders.default.dark.hex};`);
  lines.push(`    --color-border-strong: ${st.borders.strong.dark.hex};`);
  lines.push(`    --color-border-focus: ${st.borders.focus.dark.hex};`);
  for (const name of ['success', 'info', 'warning', 'error'] as const) {
    lines.push(`    --color-${name}-bg: ${st[name].bg.dark.hex};`);
    lines.push(`    --color-${name}-border: ${st[name].border.dark.hex};`);
    lines.push(`    --color-${name}-text: ${st[name].text.dark.hex};`);
    lines.push(`    --color-${name}-icon: ${st[name].icon.dark.hex};`);
    lines.push(`    --color-${name}-action: ${st[name].action.dark.hex};`);
  }
  lines.push('  }');
  lines.push('}');

  return lines.join('\n');
}

/**
 * Inject all semantic token light values as CSS custom properties on :root.
 * Called live on every palette regeneration so the UI re-themes itself.
 */
export function injectCssTokens(palette: Omit<GeneratedPalette, 'cssTokenString' | 'dtcgTokenString'>): void {
  const root = document.documentElement;
  const { semanticTokens: st, primary, neutral, shapeTokens: sh, effectsTokens: ef } = palette;

  // Interactive primary colors
  root.style.setProperty('--color-primary-action-default', st.primaryAction.default.light.hex);
  root.style.setProperty('--color-primary-action-hover', st.primaryAction.hover.light.hex);
  root.style.setProperty('--color-primary-action-pressed', st.primaryAction.pressed.light.hex);
  root.style.setProperty('--color-primary-action-disabled', st.primaryAction.disabled.light.hex);
  root.style.setProperty('--color-primary-500', primary[500].hex);
  root.style.setProperty('--color-primary-400', primary[400].hex);

  // Backgrounds
  root.style.setProperty('--color-bg-base', st.backgrounds.base.light.hex);
  root.style.setProperty('--color-bg-surface', st.backgrounds.surface.light.hex);
  root.style.setProperty('--color-bg-elevated', st.backgrounds.elevated.light.hex);
  root.style.setProperty('--color-bg-sunken', st.backgrounds.sunken.light.hex);

  // Borders
  root.style.setProperty('--color-border-subtle', st.borders.subtle.light.hex);
  root.style.setProperty('--color-border-default', st.borders.default.light.hex);
  root.style.setProperty('--color-border-strong', st.borders.strong.light.hex);
  root.style.setProperty('--color-border-focus', st.borders.focus.light.hex);

  // Neutral for text
  root.style.setProperty('--color-neutral-900', neutral[900].hex);
  root.style.setProperty('--color-neutral-700', neutral[700].hex);
  root.style.setProperty('--color-neutral-500', neutral[500].hex);
  root.style.setProperty('--color-neutral-300', neutral[300].hex);
  root.style.setProperty('--color-neutral-100', neutral[100].hex);
  root.style.setProperty('--color-neutral-50', neutral[50].hex);

  // Shape
  root.style.setProperty('--radius-button', sh.radiusButton);
  root.style.setProperty('--radius-xs', sh.radiusXs);
  root.style.setProperty('--radius-sm', sh.radiusSm);
  root.style.setProperty('--radius-md', sh.radiusMd);
  root.style.setProperty('--radius-lg', sh.radiusLg);
  root.style.setProperty('--radius-card', sh.radiusCard);

  // Elevation
  root.style.setProperty('--shadow-sm', shadowToCss(ef.shadowSm));
  root.style.setProperty('--shadow-md', shadowToCss(ef.shadowMd));
  root.style.setProperty('--shadow-lg', shadowToCss(ef.shadowLg));
  root.style.setProperty('--shadow-button', shadowToCss(ef.shadowButton));
  root.style.setProperty('--glow-button', shadowToCss(ef.glowButton));
  root.style.setProperty('--glow-focus', shadowToCss(ef.glowFocus));
}
