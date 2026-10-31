"use client";
import { startTransition, ReactNode } from 'react';

export interface TabItem { id: string; label: string; short?: string; icon?: ReactNode; }

// Controlled: the parent owns which tab is active, so links elsewhere on the
// page (e.g. the header's "Pick the next song") can switch tabs too.
export default function Tabs({ tabs, active, onChange }: { tabs: TabItem[]; active: string; onChange(id: string): void }) {
  // The panel swap is a transition: that is what lets <ViewTransition> animate
  // it, and it keeps the page responsive while a heavy panel renders.
  function select(id: string) { startTransition(() => onChange(id)); }
  return (
    <div role="tablist" aria-label="Site sections" className="flex gap-1 p-1 rounded-full border border-neutral-200 bg-white/95 dark:border-white/10 dark:bg-[#121916]/95 shadow-lg shadow-black/20 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {tabs.map(t => {
        const selected = active === t.id;
        return (
          <button key={t.id} data-tab={t.id} role="tab" aria-selected={selected} aria-controls={`panel-${t.id}`} id={`tab-${t.id}`} onClick={() => select(t.id)}
            className={`focus-ring flex-1 whitespace-nowrap px-3 sm:px-4 py-2 rounded-full text-sm font-medium transition-colors ${selected ? 'bg-brand-green text-white shadow-sm' : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/10'}`}>
            {t.icon}
            {t.short ? <><span className="sm:hidden">{t.short}</span><span className="hidden sm:inline">{t.label}</span></> : t.label}
          </button>
        );
      })}
    </div>
  );
}
