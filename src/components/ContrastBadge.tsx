import type { ContrastLevel } from '../lib/color/contrast';
import { contrastLevel } from '../lib/color/contrast';

interface ContrastBadgeProps {
  ratio: number;
  className?: string;
}

const LEVEL_STYLES: Record<ContrastLevel, string> = {
  AAA: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
  AA: 'bg-blue-100 text-blue-800 border border-blue-300',
  'AA-Large': 'bg-amber-100 text-amber-800 border border-amber-300',
  Fail: 'bg-red-100 text-red-800 border border-red-300',
};

const LEVEL_LABELS: Record<ContrastLevel, string> = {
  AAA: '✅ AAA',
  AA: '✅ AA',
  'AA-Large': '⚠ AA+',
  Fail: '✗ Fail',
};

export function ContrastBadge({ ratio, className = '' }: ContrastBadgeProps) {
  const level = contrastLevel(ratio);
  return (
    <span
      className={`inline-flex items-center rounded px-1 py-0.5 text-[10px] font-semibold leading-none tabular-nums ${LEVEL_STYLES[level]} ${className}`}
      title={`Contrast ratio: ${ratio.toFixed(2)}:1`}
    >
      {LEVEL_LABELS[level]} {ratio.toFixed(1)}
    </span>
  );
}
