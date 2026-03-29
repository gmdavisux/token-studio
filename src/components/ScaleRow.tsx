import { useState } from 'react';
import type { ColorScale } from '../lib/color/types';
import { SCALE_STOPS } from '../lib/color/types';
import { SwatchCell } from './SwatchCell';

interface ScaleRowProps {
  name: string;
  scale: ColorScale;
  /** Future hook: no-op now */
  onSwatchEdit?: (tokenId: string) => void;
}

export function ScaleRow({ name, scale, onSwatchEdit: _ }: ScaleRowProps) {
  const [expanded, setExpanded] = useState(false);

  // Use 500 as the "hero" stop (index 5 of 11)
  const hero = scale[500];
  const heroText = hero.preferredTextColor === 'white' ? '#ffffff' : '#000000';
  const { l, c, h } = hero.oklch;
  const oklchLabel = `oklch(${(l * 100).toFixed(1)}% ${c.toFixed(3)} ${h.toFixed(1)})`;

  return (
    <div className="mb-4">
      {/* Collapsed card */}
      <div
        className="rounded-2xl overflow-hidden cursor-pointer select-none"
        style={{ boxShadow: '0 2px 12px 0 rgba(0,0,0,0.10)' }}
        onClick={() => setExpanded((v) => !v)}
        role="button"
        aria-expanded={expanded}
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setExpanded((v) => !v)}
      >
        {/* Top half — hero color */}
        <div
          className="flex items-start justify-between px-5 pt-5 pb-6"
          style={{ backgroundColor: hero.hex, minHeight: 96 }}
        >
          <div className="flex flex-col gap-1">
            <span className="text-base font-bold capitalize" style={{ color: heroText }}>
              {name}
            </span>
            <span
              className="text-xs font-mono opacity-70"
              style={{ color: heroText }}
            >
              {oklchLabel}
            </span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-base font-mono font-semibold" style={{ color: heroText }}>
              {hero.hex.toUpperCase()}
            </span>
            <span
              className="text-xs opacity-60"
              style={{ color: heroText }}
            >
              500 · {expanded ? '▲' : '▼'}
            </span>
          </div>
        </div>

        {/* Bottom half — color bands */}
        <div className="flex h-10">
          {SCALE_STOPS.map((stop) => (
            <div
              key={stop}
              className="flex-1"
              style={{ backgroundColor: scale[stop].hex }}
              title={`${stop} — ${scale[stop].hex}`}
            />
          ))}
        </div>
      </div>

      {/* Expanded detail grid */}
      {expanded && (
        <div className="mt-2 flex flex-wrap gap-1 px-1">
          {SCALE_STOPS.map((stop) => (
            <SwatchCell
              key={stop}
              stop={stop}
              color={scale[stop]}
              tokenId={`${name}-${stop}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
