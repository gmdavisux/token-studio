import type { GeneratedPalette } from '../lib/color/types';
import { ScaleRow } from './ScaleRow';
import { SemanticTokenGroup } from './SemanticTokenGroup';
import { CSSExport } from './CSSExport';
import type { SemanticToken } from '../lib/color/types';

interface PaletteDisplayProps {
  palette: GeneratedPalette;
}

// ─── Sections ──────────────────────────────────────────────────────────────────

function RawScalesSection({ palette }: { palette: GeneratedPalette }) {
  const scaleNames = ['brand', 'primary', 'neutral', 'success', 'info', 'warning', 'error'] as const;
  return (
    <section>
      <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--color-neutral-900, #111827)' }}>
        Color Scales
      </h2>
      {scaleNames.map((name) => (
        <ScaleRow key={name} name={name} scale={palette[name]} />
      ))}
    </section>
  );
}

function ActionStatesSection({ palette, mode }: { palette: GeneratedPalette; mode: 'light' | 'dark' }) {
  const { primaryAction, brandAction } = palette.semanticTokens;
  return (
    <section>
      <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--color-neutral-900, #111827)' }}>
        Action States
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SemanticTokenGroup
          title="Primary"
          tokens={Object.values(primaryAction) as SemanticToken[]}
          mode={mode}
        />
        <SemanticTokenGroup
          title="Brand"
          tokens={Object.values(brandAction) as SemanticToken[]}
          mode={mode}
        />
      </div>
    </section>
  );
}

function AlertTokensSection({ palette, mode }: { palette: GeneratedPalette; mode: 'light' | 'dark' }) {
  const { success, info, warning, error } = palette.semanticTokens;
  return (
    <section>
      <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--color-neutral-900, #111827)' }}>
        Status / Alert Tokens
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <SemanticTokenGroup title="Success" tokens={Object.values(success) as SemanticToken[]} mode={mode} />
        <SemanticTokenGroup title="Info" tokens={Object.values(info) as SemanticToken[]} mode={mode} />
        <SemanticTokenGroup title="Warning" tokens={Object.values(warning) as SemanticToken[]} mode={mode} />
        <SemanticTokenGroup title="Error" tokens={Object.values(error) as SemanticToken[]} mode={mode} />
      </div>
    </section>
  );
}

function BackgroundBorderSection({ palette, mode }: { palette: GeneratedPalette; mode: 'light' | 'dark' }) {
  const { backgrounds, borders } = palette.semanticTokens;
  return (
    <section>
      <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--color-neutral-900, #111827)' }}>
        Backgrounds & Borders
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SemanticTokenGroup
          title="Backgrounds"
          tokens={Object.values(backgrounds) as SemanticToken[]}
          mode={mode}
        />
        <SemanticTokenGroup
          title="Borders"
          tokens={Object.values(borders) as SemanticToken[]}
          mode={mode}
        />
      </div>
    </section>
  );
}

// ─── Mode Panel ────────────────────────────────────────────────────────────────

function ModePanel({ palette, mode }: { palette: GeneratedPalette; mode: 'light' | 'dark' }) {
  const bg = mode === 'light' ? '#ffffff' : '#111827';
  const label = mode === 'light' ? '☀ Light Mode' : '☾ Dark Mode';
  const labelColor = mode === 'light' ? '#6b7280' : '#9ca3af';

  return (
    <div
      className="rounded-2xl border p-6 flex flex-col gap-10"
      style={{
        backgroundColor: bg,
        borderColor: mode === 'light' ? '#e5e7eb' : '#374151',
      }}
    >
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: labelColor }}>
          {label}
        </span>
      </div>

      <ActionStatesSection palette={palette} mode={mode} />
      <AlertTokensSection palette={palette} mode={mode} />
      <BackgroundBorderSection palette={palette} mode={mode} />
    </div>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────────

export function PaletteDisplay({ palette }: PaletteDisplayProps) {
  return (
    <div className="flex flex-col gap-10">
      {/* Raw scales (mode-independent) */}
      <RawScalesSection palette={palette} />

      {/* Semantic sections — both light and dark visible simultaneously */}
      <div>
        <h2
          className="text-xl font-bold mb-6"
          style={{ color: 'var(--color-neutral-900, #111827)' }}
        >
          Semantic Tokens
        </h2>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <ModePanel palette={palette} mode="light" />
          <ModePanel palette={palette} mode="dark" />
        </div>
      </div>

      {/* CSS Export */}
      <CSSExport cssTokenString={palette.cssTokenString} />
    </div>
  );
}
