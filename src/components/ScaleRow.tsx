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
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-2 capitalize">
        {name}
      </h3>
      <div className="flex flex-wrap gap-1">
        {SCALE_STOPS.map((stop) => (
          <SwatchCell
            key={stop}
            stop={stop}
            color={scale[stop]}
            tokenId={`${name}-${stop}`}
          />
        ))}
      </div>
    </div>
  );
}
