/**
 * ThemeControls — personality axis controls for the design library generator.
 * Presents a row of named preset cards (quick-start bundles) at the top,
 * followed by per-axis dials for fine-tuning.
 */

import { useTokenStudio } from '../context/TokenStudioContext';
import type { ThemeConfig, Vibrancy, ButtonShape, ElevationModel, ThemePreset } from '../lib/color/types';

// ─── Segmented control primitive ─────────────────────────────────────────────

interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
}: SegmentedControlProps<T>) {
  return (
    <div className="flex flex-col gap-1.5">
      <span
        className="text-xs font-semibold uppercase tracking-wide"
        style={{ color: 'var(--color-neutral-500, #6b7280)' }}
      >
        {label}
      </span>
      <div
        className="flex rounded-lg p-0.5 gap-0.5"
        style={{ backgroundColor: 'var(--color-bg-sunken, #f3f4f6)' }}
        role="group"
        aria-label={label}
      >
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className="flex-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer"
              style={
                active
                  ? {
                      backgroundColor: 'var(--color-bg-elevated, #ffffff)',
                      color: 'var(--color-primary-action-default, #4f46e5)',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                    }
                  : {
                      backgroundColor: 'transparent',
                      color: 'var(--color-neutral-500, #6b7280)',
                    }
              }
              aria-pressed={active}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Preset card row ───────────────────────────────────────────────────────────

const PRESETS: { value: ThemePreset; label: string; description: string; swatchColors: string[] }[] = [
  { value: 'default',    label: 'Default',    description: 'Balanced',   swatchColors: ['#4f46e5', '#6366f1', '#a5b4fc'] },
  { value: 'classic',    label: 'Classic',    description: 'Professional', swatchColors: ['#3b82f6', '#60a5fa', '#bfdbfe'] },
  { value: 'muted',      label: 'Muted',      description: 'Subdued',    swatchColors: ['#6b7280', '#9ca3af', '#e5e7eb'] },
  { value: 'vivid',      label: 'Vivid',      description: 'Saturated',  swatchColors: ['#7c3aed', '#a855f7', '#e879f9'] },
  { value: 'pastel',     label: 'Pastel',     description: 'Soft',       swatchColors: ['#c4b5fd', '#fbcfe8', '#bae6fd'] },
  { value: 'monochrome', label: 'Mono',       description: 'Minimal',    swatchColors: ['#111827', '#6b7280', '#f3f4f6'] },
];

interface PresetCardRowProps {
  activePreset: ThemePreset;
  onSelect: (preset: ThemePreset) => void;
}

function PresetCardRow({ activePreset, onSelect }: PresetCardRowProps) {
  return (
    <div className="flex flex-col gap-2">
      <span
        className="text-xs font-semibold uppercase tracking-wide"
        style={{ color: 'var(--color-neutral-500, #6b7280)' }}
      >
        Theme Preset
      </span>
      <div className="grid grid-cols-3 gap-2">
        {PRESETS.map(({ value, label, description, swatchColors }) => {
          const active = value === activePreset;
          return (
            <button
              key={value}
              type="button"
              onClick={() => onSelect(value)}
              className="flex flex-col items-center gap-1.5 px-2 py-2.5 rounded-xl border transition-all duration-150 cursor-pointer"
              style={{
                backgroundColor: active
                  ? 'var(--color-bg-elevated, #ffffff)'
                  : 'var(--color-bg-sunken, #f9fafb)',
                borderColor: active
                  ? 'var(--color-primary-action-default, #4f46e5)'
                  : 'var(--color-border-subtle, #e5e7eb)',
                boxShadow: active ? '0 0 0 2px var(--color-primary-action-default, #4f46e5)33' : 'none',
              }}
              aria-pressed={active}
            >
              {/* Colour swatch preview */}
              <div className="flex gap-0.5">
                {swatchColors.map((c, i) => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <span
                className="text-[11px] font-semibold leading-none"
                style={{
                  color: active
                    ? 'var(--color-primary-action-default, #4f46e5)'
                    : 'var(--color-neutral-700, #374151)',
                }}
              >
                {label}
              </span>
              <span
                className="text-[10px] leading-none"
                style={{ color: 'var(--color-neutral-400, #9ca3af)' }}
              >
                {description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Dial options ─────────────────────────────────────────────────────────────

const VIBRANCY_OPTIONS: SegmentOption<Vibrancy>[] = [
  { value: 'monochrome', label: 'Mono' },
  { value: 'pastel',     label: 'Pastel' },
  { value: 'muted',      label: 'Muted' },
  { value: 'natural',    label: 'Natural' },
  { value: 'vivid',      label: 'Vivid' },
];

const BUTTON_SHAPE_OPTIONS: SegmentOption<ButtonShape>[] = [
  { value: 'sharp',   label: 'Sharp' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'pill',    label: 'Pill' },
];

const ELEVATION_OPTIONS: SegmentOption<ElevationModel>[] = [
  { value: 'flat',      label: 'Flat' },
  { value: 'subtle',    label: 'Subtle' },
  { value: 'prominent', label: 'Deep' },
  { value: 'glow',      label: 'Glow' },
];

// ─── ThemeControls ─────────────────────────────────────────────────────────────

export function ThemeControls() {
  const { state, handleThemeConfig, handlePresetSelect } = useTokenStudio();
  const config = state.themeConfig;

  function update(partial: Partial<ThemeConfig>) {
    handleThemeConfig({ ...config, ...partial });
  }

  return (
    <div className="flex flex-col gap-6 px-1">
      {/* Preset cards */}
      <PresetCardRow activePreset={config.themePreset} onSelect={handlePresetSelect} />

      {/* Divider + label */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border-subtle, #e5e7eb)' }} />
        <span className="text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: 'var(--color-neutral-400, #9ca3af)' }}
        >Advanced</span>
        <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border-subtle, #e5e7eb)' }} />
      </div>

      {/* Vibrancy */}
      <SegmentedControl
        label="Saturation"
        options={VIBRANCY_OPTIONS}
        value={config.vibrancy}
        onChange={(v) => update({ vibrancy: v })}
      />

      {/* Button Shape */}
      <SegmentedControl
        label="Button Shape"
        options={BUTTON_SHAPE_OPTIONS}
        value={config.buttonShape}
        onChange={(v) => update({ buttonShape: v })}
      />

      {/* Elevation */}
      <SegmentedControl
        label="Elevation"
        options={ELEVATION_OPTIONS}
        value={config.elevationModel}
        onChange={(v) => update({ elevationModel: v })}
      />
    </div>
  );
}

