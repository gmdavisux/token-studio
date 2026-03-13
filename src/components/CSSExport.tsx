import { useState } from 'react';

interface CSSExportProps {
  cssTokenString: string;
}

export function CSSExport({ cssTokenString }: CSSExportProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(cssTokenString).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-neutral-700">CSS Token Output</h3>
        <button
          onClick={handleCopy}
          className="px-3 py-1 text-xs font-medium rounded border transition-colors"
          style={{
            backgroundColor: copied ? 'var(--color-primary-action-hover, #4338ca)' : 'var(--color-primary-action-default, #4f46e5)',
            borderColor: 'transparent',
            color: '#fff',
          }}
        >
          {copied ? '✓ Copied!' : 'Copy CSS'}
        </button>
      </div>
      <pre className="text-[11px] font-mono leading-relaxed p-4 rounded-lg overflow-auto max-h-64 border"
        style={{ backgroundColor: 'var(--color-bg-sunken, #f3f4f6)', borderColor: 'var(--color-border-subtle, #e5e7eb)', color: 'var(--color-neutral-700, #374151)' }}>
        {cssTokenString}
      </pre>
    </div>
  );
}
