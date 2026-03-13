import type { SemanticToken } from '../lib/color/types';
import { ContrastBadge } from './ContrastBadge';

interface SemanticTokenRowProps {
  token: SemanticToken;
  mode: 'light' | 'dark';
  /** Future: no-op now */
  onEdit?: (id: string) => void;
}

function getResolved(token: SemanticToken, mode: 'light' | 'dark') {
  return mode === 'light' ? token.light : token.dark;
}

export function SemanticTokenRow({ token, mode, onEdit: _ }: SemanticTokenRowProps) {
  const resolved = getResolved(token, mode);
  const ratio = resolved.preferredTextColor === 'white' ? resolved.contrastOnWhite : resolved.contrastOnBlack;

  return (
    <div className="flex items-center gap-3 group">
      {/* Swatch */}
      <div
        className="w-14 h-10 rounded flex-shrink-0 border border-black/10"
        style={{ backgroundColor: resolved.hex }}
      />
      {/* Token info */}
      <div className="flex-1 min-w-0">
        <div className="text-xs font-mono text-neutral-600 truncate">
          --color-{token.id}
        </div>
        <div className="text-[11px] font-mono text-neutral-400">{resolved.hex}</div>
      </div>
      {/* Contrast */}
      <ContrastBadge ratio={ratio} />
    </div>
  );
}

interface SemanticTokenGroupProps {
  title: string;
  tokens: SemanticToken[];
  mode: 'light' | 'dark';
}

export function SemanticTokenGroup({ title, tokens, mode }: SemanticTokenGroupProps) {
  return (
    <div className="mb-6">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
        {title}
      </h4>
      <div className="flex flex-col gap-2">
        {tokens.map((token) => (
          <SemanticTokenRow key={token.id} token={token} mode={mode} />
        ))}
      </div>
    </div>
  );
}
