/**
 * ComponentPreview — shows mock UI components (Button, Input, Alerts) rendered
 * using the live-injected CSS custom properties, with a token legend under each
 * that shows which CSS var drives each color role and which scale stop it maps to.
 *
 * Enhanced: size tabs (sm/md/lg), variant row (primary/secondary/danger/ghost),
 * dark mode toggle per-panel, component selection, and context override support.
 */

import { useState } from 'react';
import type {
  GeneratedPalette,
  ResolvedColor,
  ComponentSize,
  ComponentVariant,
} from '../lib/color/types';
import { SCALE_NAMES, SCALE_STOPS } from '../lib/color/types';
import { useTokenStudio } from '../context/TokenStudioContext';
import { ComponentInspector } from './ComponentInspector';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Reverse-lookup: returns the first "scaleName-stop" string whose hex matches. */
function resolveToStop(hex: string, palette: GeneratedPalette): string | null {
  for (const scaleName of SCALE_NAMES) {
    for (const stop of SCALE_STOPS) {
      const scale = palette[scaleName];
      if (scale[stop].hex.toLowerCase() === hex.toLowerCase()) {
        return `${scaleName}-${stop}`;
      }
    }
  }
  return null;
}

function getSemanticHex(token: { light: ResolvedColor; dark: ResolvedColor }, mode: 'light' | 'dark'): string {
  return mode === 'light' ? token.light.hex : token.dark.hex;
}

// ─── Token Legend ─────────────────────────────────────────────────────────────

interface LegendEntryProps {
  label: string;
  cssVar: string;
  hex: string;
  palette: GeneratedPalette;
}

function LegendEntry({ label, cssVar, hex, palette }: LegendEntryProps) {
  const stop = resolveToStop(hex, palette);
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div
        className="w-4 h-4 rounded flex-shrink-0 border border-black/10"
        style={{ backgroundColor: hex }}
        title={hex}
      />
      <div className="min-w-0">
        <div
          className="text-[10px] font-semibold leading-none truncate"
          style={{ color: 'var(--color-neutral-500, #6b7280)' }}
        >
          {label}
        </div>
        <div className="flex items-center gap-1 mt-0.5 flex-wrap">
          <code
            className="text-[9px] font-mono leading-none"
            style={{ color: 'var(--color-neutral-400, #9ca3af)' }}
          >
            {cssVar}
          </code>
          {stop && (
            <span
              className="text-[9px] font-mono leading-none px-1 py-px rounded"
              style={{
                color: 'var(--color-neutral-600, #4b5563)',
                backgroundColor: 'var(--color-neutral-100, #f3f4f6)',
              }}
            >
              {stop}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

interface TokenLegendProps {
  entries: LegendEntryProps[];
}

function TokenLegend({ entries }: TokenLegendProps) {
  return (
    <div className="mt-3 pt-3 border-t flex flex-wrap gap-x-4 gap-y-2"
      style={{ borderColor: 'var(--color-border-subtle, #e5e7eb)' }}
    >
      {entries.map((e) => (
        <LegendEntry key={e.cssVar} {...e} />
      ))}
    </div>
  );
}

// ─── Mock Components ──────────────────────────────────────────────────────────

interface MockProps {
  palette: GeneratedPalette;
  mode: 'light' | 'dark';
  size: ComponentSize;
  selectedVariant: ComponentVariant | null;
  onSelectVariant: (v: ComponentVariant | null) => void;
}

/** Returns Tailwind-compatible inline padding and font size strings for a button by size. */
function sizeStyles(size: ComponentSize): { px: string; py: string; fontSize: string; minHeight: string } {
  switch (size) {
    case 'sm': return { px: '10px', py: '5px', fontSize: '12px', minHeight: '28px' };
    case 'lg': return { px: '20px', py: '11px', fontSize: '16px', minHeight: '44px' };
    default:   return { px: '16px', py: '8px',  fontSize: '14px', minHeight: '36px' };
  }
}

function MockButtons({ palette, mode, size, selectedVariant, onSelectVariant }: MockProps) {
  const s = palette.semanticTokens;
  const st = sizeStyles(size);
  const radiusButton = `var(--radius-button, ${palette.shapeTokens.radiusButton})`;

  const primaryDefaultHex = getSemanticHex(s.primaryAction.default, mode);
  const primaryHoverHex = getSemanticHex(s.primaryAction.hover, mode);
  const borderDefaultHex = getSemanticHex(s.borders.default, mode);
  const neutralHex = mode === 'light' ? palette.neutral[900].hex : palette.neutral[100].hex;
  const errorDefaultHex = getSemanticHex(s.error.icon, mode);
  const errorHoverHex = getSemanticHex(s.error.text, mode);

  type ButtonDef = {
    variant: ComponentVariant;
    label: string;
    style: React.CSSProperties;
    hoverStyle?: React.CSSProperties;
  };

  const buttons: ButtonDef[] = [
    {
      variant: 'primary',
      label: 'Primary',
      style: { backgroundColor: primaryDefaultHex, color: '#ffffff', border: 'none' },
      hoverStyle: { backgroundColor: primaryHoverHex },
    },
    {
      variant: 'secondary',
      label: 'Secondary',
      style: { backgroundColor: 'transparent', border: `1.5px solid ${borderDefaultHex}`, color: neutralHex },
    },
    {
      variant: 'danger',
      label: 'Danger',
      style: { backgroundColor: errorDefaultHex, color: '#ffffff', border: 'none' },
      hoverStyle: { backgroundColor: errorHoverHex },
    },
    {
      variant: 'ghost',
      label: 'Ghost',
      style: { backgroundColor: 'transparent', border: 'none', color: primaryDefaultHex },
    },
  ];

  return (
    <div>
      <h4
        className="text-xs font-semibold uppercase tracking-wider mb-3"
        style={{ color: 'var(--color-neutral-400, #9ca3af)' }}
      >
        Buttons
      </h4>
      <div className="flex gap-2 flex-wrap items-center">
        {buttons.map(({ variant, label, style, hoverStyle }) => {
          const isSelected = selectedVariant === variant;
          return (
            <button
              key={variant}
              type="button"
              onClick={() => onSelectVariant(isSelected ? null : variant)}
              style={{
                ...style,
                padding: `${st.py} ${st.px}`,
                fontSize: st.fontSize,
                minHeight: st.minHeight,
                borderRadius: radiusButton,
                fontWeight: 600,
                lineHeight: 1.25,
                transition: 'background-color 0.15s, box-shadow 0.15s',
                outline: isSelected ? `2px solid ${primaryDefaultHex}` : 'none',
                outlineOffset: isSelected ? '3px' : undefined,
              }}
              onMouseEnter={(e) => {
                if (hoverStyle) {
                  Object.assign((e.currentTarget as HTMLButtonElement).style, hoverStyle);
                }
              }}
              onMouseLeave={(e) => {
                Object.assign((e.currentTarget as HTMLButtonElement).style, style as Record<string, string>);
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      <TokenLegend
        entries={[
          { label: 'Primary BG', cssVar: '--color-primary-action-default', hex: primaryDefaultHex, palette },
          { label: 'Primary hover', cssVar: '--color-primary-action-hover', hex: primaryHoverHex, palette },
          { label: 'Border', cssVar: '--color-border-default', hex: borderDefaultHex, palette },
          { label: 'Danger BG', cssVar: '--color-error-icon', hex: errorDefaultHex, palette },
        ]}
      />
    </div>
  );
}

function MockInput({ palette, mode, size }: MockProps) {
  const s = palette.semanticTokens;
  const bgHex = getSemanticHex(s.backgrounds.surface, mode);
  const borderHex = getSemanticHex(s.borders.default, mode);
  const focusBorderHex = getSemanticHex(s.borders.focus, mode);
  const textHex = mode === 'light' ? palette.neutral[900].hex : palette.neutral[100].hex;
  const placeholderHex = palette.neutral[400].hex;
  const radiusXs = `var(--radius-xs, ${palette.shapeTokens.radiusXs})`;
  const st = sizeStyles(size);

  return (
    <div>
      <h4
        className="text-xs font-semibold uppercase tracking-wider mb-3"
        style={{ color: 'var(--color-neutral-400, #9ca3af)' }}
      >
        Input
      </h4>
      <div className="flex flex-col gap-2 max-w-xs">
        {/* Normal state */}
        <div
          className="flex items-center px-3 py-2"
          style={{
            backgroundColor: bgHex,
            border: `1.5px solid ${borderHex}`,
            color: textHex,
            borderRadius: radiusXs,
            fontSize: st.fontSize,
            padding: `${st.py} 12px`,
          }}
        >
          <span style={{ color: placeholderHex }}>
            Placeholder text…
          </span>
        </div>

        {/* Focus state */}
        <div
          className="flex items-center px-3 py-2"
          style={{
            backgroundColor: bgHex,
            border: `2px solid ${focusBorderHex}`,
            color: textHex,
            borderRadius: radiusXs,
            fontSize: st.fontSize,
            padding: `${st.py} 12px`,
            boxShadow: `0 0 0 3px ${focusBorderHex}33`,
          }}
        >
          <span>Focused input value</span>
        </div>
      </div>

      <TokenLegend
        entries={[
          { label: 'BG', cssVar: '--color-bg-surface', hex: bgHex, palette },
          { label: 'Border', cssVar: '--color-border-default', hex: borderHex, palette },
          { label: 'Focus ring', cssVar: '--color-border-focus', hex: focusBorderHex, palette },
          {
            label: 'Text',
            cssVar: mode === 'light' ? '--color-neutral-900' : '--color-neutral-100',
            hex: textHex,
            palette,
          },
        ]}
      />
    </div>
  );
}

type StatusScale = 'success' | 'info' | 'warning' | 'error';

function MockAlertBanner({ palette, mode, status }: MockProps & { status: StatusScale }) {
  const tokenGroup = palette.semanticTokens[status];
  const bgHex = getSemanticHex(tokenGroup.bg, mode);
  const borderHex = getSemanticHex(tokenGroup.border, mode);
  const textHex = getSemanticHex(tokenGroup.text, mode);
  const iconHex = getSemanticHex(tokenGroup.icon, mode);

  const icons: Record<StatusScale, string> = {
    success: '✓',
    info: 'i',
    warning: '!',
    error: '✕',
  };

  return (
    <div
      className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg text-sm"
      style={{
        backgroundColor: bgHex,
        border: `1px solid ${borderHex}`,
      }}
    >
      <span
        className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold mt-0.5"
        style={{
          backgroundColor: iconHex,
          color: '#ffffff',
        }}
      >
        {icons[status]}
      </span>
      <div>
        <p
          className="font-semibold leading-tight capitalize"
          style={{ color: textHex }}
        >
          {status} message
        </p>
        <p
          className="text-xs mt-0.5 leading-relaxed"
          style={{ color: textHex, opacity: 0.8 }}
        >
          This is an example {status} alert using the generated token set.
        </p>
      </div>
    </div>
  );
}

function MockAlerts({ palette, mode, size }: MockProps) {
  const statuses: StatusScale[] = ['success', 'info', 'warning', 'error'];
  const s = palette.semanticTokens;

  const legendEntries = statuses.flatMap((status): LegendEntryProps[] => {
    const tokenGroup = s[status];
    return [
      {
        label: `${status} bg`,
        cssVar: `--color-${status}-bg`,
        hex: getSemanticHex(tokenGroup.bg, mode),
        palette,
      },
      {
        label: `${status} text`,
        cssVar: `--color-${status}-text`,
        hex: getSemanticHex(tokenGroup.text, mode),
        palette,
      },
    ];
  });

  return (
    <div>
      <h4
        className="text-xs font-semibold uppercase tracking-wider mb-3"
        style={{ color: 'var(--color-neutral-400, #9ca3af)' }}
      >
        Alert Banners
      </h4>
      <div className="flex flex-col gap-2 max-w-md">
        {statuses.map((status) => (
          <MockAlertBanner key={status} palette={palette} mode={mode} size={size} selectedVariant={null} onSelectVariant={() => void 0}  status={status} />
        ))}
      </div>
      <TokenLegend entries={legendEntries} />
    </div>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────

export interface ComponentPreviewProps {
  palette: GeneratedPalette;
}

export function ComponentPreview({ palette }: ComponentPreviewProps) {
  const { state } = useTokenStudio();
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const [size, setSize] = useState<ComponentSize>('md');
  const [selectedVariant, setSelectedVariant] = useState<ComponentVariant | null>(null);

  const bg = mode === 'light' ? '#ffffff' : '#111827';
  const overrideKey = selectedVariant ? `button-${selectedVariant}-${size}` : null;
  const currentOverrides = overrideKey ? (state.componentOverrides[overrideKey] ?? {}) : {};

  const sizes: ComponentSize[] = ['sm', 'md', 'lg'];

  return (
    <div
      className="rounded-2xl border flex flex-col overflow-hidden"
      style={{
        backgroundColor: bg,
        borderColor: mode === 'light' ? '#e5e7eb' : '#374151',
      }}
    >
      {/* Toolbar */}
      <div
        className="flex items-center justify-between px-4 py-2 border-b"
        style={{
          borderColor: mode === 'light' ? '#e5e7eb' : '#374151',
          backgroundColor: mode === 'light' ? '#f9fafb' : '#1f2937',
        }}
      >
        {/* Size tabs */}
        <div className="flex items-center gap-1">
          {sizes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSize(s)}
              className="px-2 py-0.5 rounded text-xs font-semibold transition-colors"
              style={{
                backgroundColor: size === s
                  ? 'var(--color-primary-action-default, #4f46e5)'
                  : 'transparent',
                color: size === s
                  ? '#ffffff'
                  : (mode === 'light' ? '#6b7280' : '#9ca3af'),
              }}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Mode toggle */}
        <button
          type="button"
          onClick={() => setMode((m) => m === 'light' ? 'dark' : 'light')}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors"
          style={{
            backgroundColor: mode === 'light' ? '#f3f4f6' : '#374151',
            color: mode === 'light' ? '#374151' : '#d1d5db',
          }}
          aria-label="Toggle light/dark mode"
        >
          <span aria-hidden="true">{mode === 'light' ? '☀' : '☾'}</span>
          <span>{mode === 'light' ? 'Light' : 'Dark'}</span>
        </button>
      </div>

      {/* Components */}
      <div className="p-6 flex flex-col gap-8">
        <MockButtons
          palette={palette}
          mode={mode}
          size={size}
          selectedVariant={selectedVariant}
          onSelectVariant={setSelectedVariant}
        />
        <MockInput
          palette={palette}
          mode={mode}
          size={size}
          selectedVariant={null}
          onSelectVariant={() => void 0}
        />
        <MockAlerts
          palette={palette}
          mode={mode}
          size={size}
          selectedVariant={null}
          onSelectVariant={() => void 0}
        />
      </div>

      {/* Inspector — shown when a button variant is selected */}
      {selectedVariant && overrideKey && (
        <ComponentInspector
          componentType="button"
          variant={selectedVariant}
          size={size}
          overrideKey={overrideKey}
          currentSlots={currentOverrides}
        />
      )}
    </div>
  );
}
