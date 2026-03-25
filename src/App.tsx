import { useTokenStudio } from './context/TokenStudioContext';
import { ColorInput } from './components/ColorInput';
import { PaletteDisplay } from './components/PaletteDisplay';
import { ThemePanel } from './components/ThemePanel';
import { SideNav } from './components/SideNav';

function App() {
  const { state, handleColorInput, handleBrandColorInput } = useTokenStudio();

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: 'var(--color-bg-base, #f9fafb)' }}
    >
      {/* ── Header / Input Zone ── */}
      <header
        id="color-setup"
        className="sticky top-0 z-10 border-b"
        style={{
          backgroundColor: 'var(--color-bg-surface, #ffffff)',
          borderColor: 'var(--color-border-subtle, #e5e7eb)',
        }}
      >
        <div className="max-w-screen-2xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Wordmark */}
            <div className="flex-shrink-0">
              <h1
                className="text-xl font-bold tracking-tight"
                style={{ color: 'var(--color-primary-action-default, #4f46e5)' }}
              >
                Token Studio
              </h1>
              <p className="text-xs" style={{ color: 'var(--color-neutral-500, #6b7280)' }}>
                Design token generator · OKLCH
              </p>            </div>

            {/* Divider */}
            <div
              className="hidden sm:block h-8 w-px"
              style={{ backgroundColor: 'var(--color-border-subtle, #e5e7eb)' }}
            />

            {/* Inputs */}
            <div className="flex-1 min-w-72 max-w-2xl flex flex-col gap-3">
              <ColorInput
                label="Primary color"
                value={state.rawInput}
                isValid={state.isInputValid}
                inputFormat={state.inputFormat}
                colorOKLCH={state.primaryColorOKLCH}
                swatchHex={state.palette?.primary[500].hex ?? null}
                onChange={handleColorInput}
                hint="Drives buttons, links, and focus rings"
              />
              <ColorInput
                label="Brand color"
                value={state.brandRawInput}
                isValid={state.brandIsValid}
                inputFormat="hex"
                colorOKLCH={state.brandColorOKLCH}
                swatchHex={state.palette?.brand?.[500].hex ?? (state.brandRawInput ? '#9ca3af' : undefined)}
                onChange={handleBrandColorInput}
                hint="Tints neutrals toward your logo color"
                optional
              />
            </div>

            {/* Spacer */}
            <div className="flex-1" />
          </div>
        </div>
      </header>

      {/* ── Palette Display Zone ── */}
      <div className="max-w-screen-2xl mx-auto px-6 py-8 flex items-start gap-8">
        <SideNav />
        <main className="flex-1 min-w-0">
          {state.palette ? (
            <PaletteDisplay palette={state.palette} />
          ) : (
            <div className="flex items-center justify-center h-64">
              <span className="text-sm" style={{ color: 'var(--color-neutral-500, #6b7280)' }}>
                Generating palette…
              </span>
            </div>
          )}
        </main>
      </div>

      {/* ── Inline Theme Controls (no drawer) ── */}
      <ThemePanel />
    </div>
  );
}

export default App;
