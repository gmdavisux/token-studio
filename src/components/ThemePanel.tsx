/**
 * ThemePanel — inline collapsible section hosting all personality controls.
 * No props required; toggle state is local.
 */

import { useState } from 'react';
import { ThemeControls } from './ThemeControls';

export function ThemePanel() {
  const [open, setOpen] = useState(true);

  return (
    <section
      id="design-system"
      className="border-t"
      style={{
        backgroundColor: 'var(--color-bg-surface, #ffffff)',
        borderColor: 'var(--color-border-subtle, #e5e7eb)',
        scrollMarginTop: '88px',
      }}
    >
      <div className="max-w-screen-2xl mx-auto px-6">
        {/* Header / toggle row */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center justify-between py-4"
          aria-expanded={open}
        >
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4 flex-shrink-0"
              style={{ color: 'var(--color-primary-action-default, #4f46e5)' }}
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8.34 1.804A1 1 0 0 1 9.32 1h1.36a1 1 0 0 1 .98.804l.295 1.473c.497.144.971.342 1.416.587l1.25-.834a1 1 0 0 1 1.262.125l.962.962a1 1 0 0 1 .125 1.262l-.834 1.25c.245.445.443.919.587 1.416l1.473.294a1 1 0 0 1 .804.98v1.361a1 1 0 0 1-.804.98l-1.473.295a6.95 6.95 0 0 1-.587 1.416l.834 1.25a1 1 0 0 1-.125 1.262l-.962.962a1 1 0 0 1-1.262.125l-1.25-.834a6.953 6.953 0 0 1-1.416.587l-.294 1.473A1 1 0 0 1 10.68 19H9.32a1 1 0 0 1-.98-.804l-.295-1.473a6.957 6.957 0 0 1-1.416-.587l-1.25.834a1 1 0 0 1-1.262-.125l-.962-.962a1 1 0 0 1-.125-1.262l.834-1.25a6.957 6.957 0 0 1-.587-1.416l-1.473-.294A1 1 0 0 1 1 9.32V7.96a1 1 0 0 1 .804-.98l1.473-.295c.144-.497.342-.971.587-1.416l-.834-1.25a1 1 0 0 1 .125-1.262l.962-.962A1 1 0 0 1 5.38 1.67l1.25.834a6.957 6.957 0 0 1 1.416-.587L8.34 1.804ZM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                clipRule="evenodd"
              />
            </svg>
            <h2
              className="text-sm font-semibold"
              style={{ color: 'var(--color-neutral-900, #111827)' }}
            >
              Theme &amp; Style
            </h2>
            <span
              className="text-xs"
              style={{ color: 'var(--color-neutral-400, #9ca3af)' }}
            >
              Presets and per-axis controls
            </span>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4 transition-transform duration-200"
            style={{
              color: 'var(--color-neutral-400, #9ca3af)',
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Collapsible controls */}
        {open && (
          <div className="pb-6">
            <ThemeControls />
          </div>
        )}
      </div>
    </section>
  );
}
