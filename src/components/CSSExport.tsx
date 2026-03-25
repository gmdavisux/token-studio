import { useState } from 'react';

type ExportFormat = {
  id: string;
  label: string;
  content: string;
  copyLabel: string;
};

interface ExportPanelProps {
  cssTokenString: string;
  dtcgTokenString: string;
}

export function CSSExport({ cssTokenString, dtcgTokenString }: ExportPanelProps) {
  const [activeTab, setActiveTab] = useState<string>('css');
  const [copied, setCopied] = useState(false);

  const formats: ExportFormat[] = [
    { id: 'css', label: 'CSS', content: cssTokenString, copyLabel: 'Copy CSS' },
    { id: 'dtcg', label: 'DTCG JSON', content: dtcgTokenString, copyLabel: 'Copy JSON' },
  ];

  const active = formats.find(f => f.id === activeTab) ?? formats[0];

  function handleCopy() {
    navigator.clipboard.writeText(active.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-3">
        {/* Format tabs */}
        <div
          className="flex gap-1 rounded-lg p-1"
          style={{ backgroundColor: 'var(--color-bg-sunken, #f3f4f6)' }}
        >
          {formats.map(f => (
            <button
              key={f.id}
              onClick={() => { setActiveTab(f.id); setCopied(false); }}
              className="px-3 py-1.5 text-xs font-medium rounded-md transition-all"
              style={{
                backgroundColor: activeTab === f.id
                  ? 'var(--color-bg-elevated, #ffffff)'
                  : 'transparent',
                boxShadow: activeTab === f.id ? '0 1px 3px rgba(0,0,0,0.10)' : 'none',
                color: activeTab === f.id
                  ? 'var(--color-neutral-900, #111827)'
                  : 'var(--color-neutral-500, #6b7280)',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors"
          style={{
            backgroundColor: copied
              ? 'var(--color-primary-action-default, #4f46e5)'
              : 'var(--color-bg-surface, #ffffff)',
            borderColor: copied ? 'transparent' : 'var(--color-border-default, #d1d5db)',
            color: copied ? '#ffffff' : 'var(--color-neutral-700, #374151)',
          }}
        >
          {copied ? '✓ Copied!' : active.copyLabel}
        </button>
      </div>

      <pre
        className="text-[11px] font-mono leading-relaxed p-4 rounded-lg overflow-auto max-h-64 border"
        style={{
          backgroundColor: 'var(--color-bg-sunken, #f3f4f6)',
          borderColor: 'var(--color-border-subtle, #e5e7eb)',
          color: 'var(--color-neutral-700, #374151)',
        }}
      >
        {active.content}
      </pre>
    </div>
  );
}
