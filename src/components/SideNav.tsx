import { useEffect, useState } from 'react';

interface NavItem {
  id: string;
  label: string;
  children?: { id: string; label: string }[];
}

const NAV_ITEMS: NavItem[] = [
  { id: 'color-setup', label: 'Color Setup' },
  { id: 'components', label: 'Components' },
  { id: 'color-scales', label: 'Color Scales' },
  {
    id: 'semantic-tokens',
    label: 'Semantic Tokens',
    children: [
      { id: 'light-mode', label: '☀ Light' },
      { id: 'dark-mode', label: '☾ Dark' },
    ],
  },
  { id: 'design-system', label: 'Theme & Style' },
  { id: 'export', label: 'Export' },
];

// Flat ordered list used for "topmost visible" logic
const ALL_IDS = ['color-setup', 'components', 'color-scales', 'semantic-tokens', 'light-mode', 'dark-mode', 'design-system', 'export'];

export function SideNav() {
  const [activeId, setActiveId] = useState<string>('color-scales');

  useEffect(() => {
    const visible = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visible.add(entry.target.id);
          } else {
            visible.delete(entry.target.id);
          }
        });
        const topmost = ALL_IDS.find((id) => visible.has(id));
        if (topmost) setActiveId(topmost);
      },
      // Shrink the intersection window: start 88px below top (below sticky header),
      // end 55% from the bottom — so only the "upper" section activates.
      { rootMargin: '-88px 0px -55% 0px', threshold: 0 },
    );

    ALL_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav
      className="hidden xl:flex flex-col gap-0.5 w-44 flex-shrink-0 sticky top-[88px] self-start max-h-[calc(100vh-112px)] overflow-y-auto"
      aria-label="Page sections"
    >
      <p
        className="text-[10px] font-semibold uppercase tracking-widest mb-3 px-2"
        style={{ color: 'var(--color-neutral-400, #9ca3af)' }}
      >
        On this page
      </p>

      {NAV_ITEMS.map((item) => {
        const isActive = activeId === item.id;
        const childActive = item.children?.some((c) => c.id === activeId);

        return (
          <div key={item.id}>
            <button
              type="button"
              onClick={() => scrollTo(item.id)}
              className="w-full text-left px-2 py-1.5 rounded-md text-sm transition-colors"
              style={{
                fontWeight: isActive ? 600 : 400,
                color:
                  isActive || childActive
                    ? 'var(--color-primary-action-default, #4f46e5)'
                    : 'var(--color-neutral-700, #374151)',
                backgroundColor: isActive ? 'var(--color-primary-50, #eef2ff)' : 'transparent',
              }}
            >
              {item.label}
            </button>

            {item.children?.map((child) => {
              const isChildActive = activeId === child.id;
              return (
                <button
                  key={child.id}
                  type="button"
                  onClick={() => scrollTo(child.id)}
                  className="w-full text-left pl-5 pr-2 py-1 rounded-md text-xs transition-colors"
                  style={{
                    fontWeight: isChildActive ? 600 : 400,
                    color: isChildActive
                      ? 'var(--color-primary-action-default, #4f46e5)'
                      : 'var(--color-neutral-500, #6b7280)',
                    backgroundColor: isChildActive
                      ? 'var(--color-primary-50, #eef2ff)'
                      : 'transparent',
                  }}
                >
                  {child.label}
                </button>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}
