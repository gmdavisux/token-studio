import { useTokenStudio } from './context/TokenStudioContext';
import { ColorInput } from './components/ColorInput';
import { PaletteDisplay } from './components/PaletteDisplay';

function App() {
  const { state } = useTokenStudio();

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: 'var(--color-bg-base, #f9fafb)' }}
    >
      {/* ── Header / Input Zone ── */}
      <header
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
              </p>
            </div>

            {/* Divider */}
            <div
              className="hidden sm:block h-8 w-px"
              style={{ backgroundColor: 'var(--color-border-subtle, #e5e7eb)' }}
            />

            {/* Input */}
            <div className="flex-1 min-w-72 max-w-xl">
              <ColorInput />
            </div>

            {/* Brand vs Primary note */}
            <p
              className="hidden lg:block text-xs max-w-xs leading-relaxed"
              style={{ color: 'var(--color-neutral-500, #6b7280)' }}
            >
              Enter your <strong>brand color</strong> — its accent scale and a
              harmonized <strong>blue-indigo primary</strong> are generated
              automatically.
            </p>
          </div>
        </div>
      </header>

      {/* ── Palette Display Zone ── */}
      <main className="max-w-screen-2xl mx-auto px-6 py-8">
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
  );
}

export default App;
