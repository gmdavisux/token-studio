import { useCallback, useState } from 'react';
import { useTokenStudio } from '../context/TokenStudioContext';
import type { ColorFormat } from '../lib/color/types';

const FORMAT_OPTIONS: { value: ColorFormat; label: string; placeholder: string }[] = [
  { value: 'hex', label: 'HEX', placeholder: '#ff0000' },
  { value: 'rgb', label: 'RGB', placeholder: 'rgb(255, 0, 0)' },
  { value: 'hsl', label: 'HSL', placeholder: 'hsl(0, 100%, 50%)' },
  { value: 'oklch', label: 'OKLCH', placeholder: 'oklch(0.63 0.26 29)' },
];

export function ColorInput() {
  const { state, handleColorInput } = useTokenStudio();
  const [localFormat, setLocalFormat] = useState<ColorFormat>('hex');

  const placeholder =
    FORMAT_OPTIONS.find((f) => f.value === localFormat)?.placeholder ?? '#ff0000';

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleColorInput(e.target.value);
    },
    [handleColorInput]
  );

  const isError = state.rawInput.length > 0 && !state.isInputValid;

  return (
    <div className="w-full">
      <div className="flex items-stretch gap-2">
        {/* Format selector */}
        <select
          value={localFormat}
          onChange={(e) => setLocalFormat(e.target.value as ColorFormat)}
          className="px-2 py-2 text-sm rounded-md border bg-white text-neutral-700 focus:outline-none focus:ring-2"
          style={{
            borderColor: 'var(--color-border-default, #d1d5db)',
            ['--tw-ring-color' as string]: 'var(--color-border-focus, #4f46e5)',
          }}
          aria-label="Color format"
        >
          {FORMAT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Color text input */}
        <input
          type="text"
          value={state.rawInput}
          onChange={handleChange}
          placeholder={placeholder}
          spellCheck={false}
          autoComplete="off"
          className="flex-1 px-3 py-2 text-sm font-mono rounded-md border focus:outline-none focus:ring-2 transition-colors"
          style={{
            borderColor: isError
              ? '#ef4444'
              : 'var(--color-border-default, #d1d5db)',
            ['--tw-ring-color' as string]: 'var(--color-border-focus, #4f46e5)',
            backgroundColor: 'white',
            color: 'var(--color-neutral-900, #111827)',
          }}
          aria-invalid={isError}
          aria-label="Brand color input"
        />

        {/* Brand color preview swatch */}
        <div
          className="w-10 h-10 rounded-md border border-black/10 flex-shrink-0 transition-colors duration-200"
          style={{
            backgroundColor:
              state.palette && state.isInputValid
                ? state.palette.brand[500].hex
                : '#9ca3af',
          }}
          title="Brand color preview (500 stop)"
          aria-label="Brand color preview"
        />
      </div>

      {/* Inline error */}
      {isError && (
        <p className="mt-1 text-xs text-red-600" role="alert">
          Unrecognized color format — try HEX, RGB, HSL, or OKLCH.
        </p>
      )}
    </div>
  );
}
