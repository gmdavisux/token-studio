import type { ResolvedColor } from '../lib/color/types';
import { ContrastBadge } from './ContrastBadge';

interface SwatchCellProps {
  stop: number;
  color: ResolvedColor;
  /** Token ID for future editable tokens — currently a no-op prop */
  tokenId?: string;
  onEdit?: (tokenId: string, color: ResolvedColor) => void;
}

export function SwatchCell({ stop, color, tokenId, onEdit }: SwatchCellProps) {
  const textColor = color.preferredTextColor === 'white' ? '#ffffff' : '#000000';
  const contrastRatio =
    color.preferredTextColor === 'white'
      ? color.contrastOnWhite
      : color.contrastOnBlack;

  return (
    <div
      className="group relative flex flex-col justify-between p-2 rounded overflow-hidden cursor-default select-none"
      style={{ backgroundColor: color.hex, minWidth: 88, minHeight: 100 }}
      onClick={() => onEdit && tokenId && onEdit(tokenId, color)}
      title={`${stop} — ${color.hex}`}
    >
      {/* Stop number */}
      <span
        className="text-xs font-bold leading-none"
        style={{ color: textColor, opacity: 0.85 }}
      >
        {stop}
      </span>

      {/* Bottom info block */}
      <div className="flex flex-col gap-0.5 mt-auto">
        <span
          className="text-[11px] font-mono leading-none"
          style={{ color: textColor, opacity: 0.9 }}
        >
          {color.hex}
        </span>
        <span
          className="text-[9px] font-mono leading-none"
          style={{ color: textColor, opacity: 0.6 }}
        >
          {color.oklch.l.toFixed(2)} {color.oklch.c.toFixed(3)} {color.oklch.h.toFixed(0)}°
        </span>
        <ContrastBadge ratio={contrastRatio} className="mt-0.5 self-start" />
      </div>
    </div>
  );
}
