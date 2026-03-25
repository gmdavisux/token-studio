import { useCallback, useState } from 'react';
import type { ColorFormat, OKLCHColor } from '../lib/color/types';
import { formatColor, parseColor } from '../lib/color/parse';

type SupportedColorFormat = Exclude<ColorFormat, 'unknown'>;

const FORMAT_OPTIONS: { value: SupportedColorFormat; label: string; placeholder: string }[] = [
  { value: 'hex',   label: 'HEX',   placeholder: '#4f46e5' },
  { value: 'rgb',   label: 'RGB',   placeholder: 'rgb(79, 70, 229)' },
  { value: 'hsl',   label: 'HSL',   placeholder: 'hsl(243, 75%, 59%)' },
  { value: 'oklch', label: 'OKLCH', placeholder: 'oklch(0.55 0.22 272)' },
];

export interface ColorInputProps {
  label: string;
  value: string;
  isValid: boolean;
  inputFormat: ColorFormat;
  colorOKLCH: OKLCHColor | null;
  /** Resolved swatch hex — shown in the preview chip. Null = no swatch. */
  swatchHex?: string | null;
  onChange: (raw: string) => void;
  hint?: string;
  optional?: boolean;
}

export function ColorInput({
  label,
  value,
  isValid,
  inputFormat,
  colorOKLCH,
  swatchHex,
  onChange,
  hint,
  optional,
}: ColorInputProps) {
  const [displayFormat, setDisplayFormat] = useState<SupportedColorFormat>(
    inputFormat === 'unknown' ? 'oklch' : inputFormat
  );

  const placeholder =
    FORMAT_OPTIONS.find((f) => f.value === displayFormat)?.placeholder ?? '#4f46e5';

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const nextRaw = e.target.value;
      const result = parseColor(nextRaw);
      if (result.ok && result.format !== 'unknown') {
        setDisplayFormat(result.format);
      }
      onChange(nextRaw);
    },
    [onChange]
  );

  const handleFormatChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const nextFormat = e.target.value as SupportedColorFormat;
      setDisplayFormat(nextFormat);
      if (!isValid || !colorOKLCH) return;
      onChange(formatColor(colorOKLCH, nextFormat));
    },
    [onChange, colorOKLCH, isValid]
  );

  const isError = value.length > 0 && !isValid;

  return (
    <div className="w-full">
      {/* Label row */}
      <div className="flex items-center gap-1.5 mb-1.5">
        <span
          className="text-xs font-semibold"
          style={{ color: 'var(--color-neutral-700, #374151)' }}
        >
          {label}
        </span>
        {optional && (
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
            style={{
              backgroundColor: 'var(--color-bg-sunken, #f3f4f6)',
              color: 'var(--color-neutral-400, #9ca3af)',
            }}
          >
            optional
          </span>
        )}
      </div>

      <div className="flex items-stretch gap-2">
        {/* Format selector */}
        <select
          value={displayFormat}
          onChange={handleFormatChange}
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
          value={value}
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
          aria-label={`${label} input`}
        />

        {/* Color preview swatch */}
        {swatchHex !== undefined && (
          <div
            className="w-10 h-10 rounded-md border border-black/10 flex-shrink-0 transition-colors duration-200"
            style={{ backgroundColor: swatchHex ?? '#9ca3af' }}
            title={swatchHex ?? 'No color'}
            aria-label={`${label} preview`}
          />
        )}
      </div>

      {/* Hint */}
      {hint && !isError && (
        <p className="mt-1 text-xs" style={{ color: 'var(--color-neutral-400, #9ca3af)' }}>
          {hint}
        </p>
      )}

      {/* Inline error */}
      {isError && (
        <p className="mt-1 text-xs text-red-600" role="alert">
          Unrecognized color format — try HEX, RGB, HSL, or OKLCH.
        </p>
      )}
    </div>
  );
}
