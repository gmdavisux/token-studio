/**
 * ComponentInspector — per-component token-slot override panel.
 * Shown below ComponentPreview when a button variant is selected.
 * Each of the 5 token slots shows its current resolved value and accepts
 * a free-form CSS value as an override. Clearing a slot restores the generated value.
 */

import type { ComponentTokenSlots, ComponentVariant, ComponentSize } from '../lib/color/types';
import { useTokenStudio } from '../context/TokenStudioContext';

export interface ComponentInspectorProps {
  componentType: string;
  variant: ComponentVariant;
  size: ComponentSize;
  overrideKey: string;
  currentSlots: ComponentTokenSlots;
}

type SlotKey = keyof ComponentTokenSlots;

interface SlotDef {
  key: SlotKey;
  label: string;
  hint: string;
  isColor: boolean;
}

const SLOT_DEFS: SlotDef[] = [
  { key: 'backgroundColor', label: 'Background',  hint: '#hex / oklch(...) / rgb(...)', isColor: true },
  { key: 'borderColor',     label: 'Border',       hint: '#hex or transparent',          isColor: true },
  { key: 'textColor',       label: 'Text',         hint: '#hex',                         isColor: true },
  { key: 'radius',          label: 'Radius',       hint: '4px / 9999px / 0.5rem',        isColor: false },
  { key: 'shadow',          label: 'Shadow',       hint: 'CSS box-shadow value or none', isColor: false },
];

export function ComponentInspector({
  componentType,
  variant,
  size,
  overrideKey,
  currentSlots,
}: ComponentInspectorProps) {
  const { handleComponentOverride } = useTokenStudio();

  function setSlot(key: SlotKey, value: string | undefined) {
    const next: ComponentTokenSlots = { ...currentSlots };
    if (value === undefined || value.trim() === '') {
      delete next[key];
    } else {
      next[key] = value.trim();
    }
    handleComponentOverride(overrideKey, next);
  }

  return (
    <div
      className="border-t px-5 py-4"
      style={{
        borderColor: 'var(--color-border-subtle, #e5e7eb)',
        backgroundColor: 'var(--color-bg-subtle, #f9fafb)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: 'var(--color-neutral-500, #6b7280)' }}
          >
            Token overrides
          </span>
          <span
            className="ml-2 text-xs font-mono px-1.5 py-0.5 rounded"
            style={{
              color: 'var(--color-primary-action-default, #4f46e5)',
              backgroundColor: 'var(--color-primary-50, #eef2ff)',
            }}
          >
            {componentType}/{variant}/{size}
          </span>
        </div>
        {/* Clear all */}
        <button
          type="button"
          onClick={() => handleComponentOverride(overrideKey, {})}
          className="text-xs px-2 py-1 rounded transition-colors"
          style={{
            color: 'var(--color-error-text, #dc2626)',
            backgroundColor: 'transparent',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              'var(--color-error-bg, #fee2e2)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
          }}
        >
          Clear all
        </button>
      </div>

      {/* Slot rows */}
      <div className="flex flex-col gap-2">
        {SLOT_DEFS.map(({ key, label, hint, isColor }) => {
          const value = currentSlots[key] ?? '';
          const hasOverride = Boolean(currentSlots[key]);
          return (
            <div key={key} className="flex items-center gap-2">
              {/* Swatch / indicator */}
              {isColor ? (
                <div
                  className="w-7 h-7 rounded border border-black/10 flex-shrink-0"
                  style={{
                    backgroundColor: value || 'transparent',
                    backgroundImage: value
                      ? undefined
                      : 'repeating-linear-gradient(45deg, #ccc 0,#ccc 1px,transparent 0,transparent 50%)',
                    backgroundSize: '6px 6px',
                  }}
                  title={value || 'no override'}
                />
              ) : (
                <div
                  className="w-7 h-7 rounded border border-black/10 flex-shrink-0 flex items-center justify-center"
                  style={{ backgroundColor: 'var(--color-neutral-100, #f3f4f6)' }}
                >
                  <span
                    className="text-[9px] font-bold"
                    style={{ color: 'var(--color-neutral-400, #9ca3af)' }}
                  >
                    {key === 'radius' ? 'R' : 'S'}
                  </span>
                </div>
              )}

              {/* Label */}
              <div className="w-20 flex-shrink-0">
                <span
                  className="text-xs font-medium"
                  style={{ color: 'var(--color-neutral-700, #374151)' }}
                >
                  {label}
                </span>
              </div>

              {/* Input */}
              <input
                type="text"
                value={value}
                placeholder={hint}
                onChange={(e) => setSlot(key, e.target.value)}
                className="flex-1 text-xs font-mono px-2 py-1 rounded border transition-colors min-w-0"
                style={{
                  backgroundColor: hasOverride
                    ? 'var(--color-primary-50, #eef2ff)'
                    : 'var(--color-bg-surface, #ffffff)',
                  borderColor: hasOverride
                    ? 'var(--color-primary-action-default, #4f46e5)'
                    : 'var(--color-border-default, #d1d5db)',
                  color: 'var(--color-neutral-900, #111827)',
                }}
              />

              {/* Clear slot */}
              {hasOverride && (
                <button
                  type="button"
                  onClick={() => setSlot(key, undefined)}
                  className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center transition-colors"
                  style={{ color: 'var(--color-neutral-400, #9ca3af)' }}
                  aria-label={`Clear ${label} override`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                    <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
                  </svg>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
