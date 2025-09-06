"use client";
import { useState, ReactNode } from 'react';

export interface TabItem { id: string; label: string; icon?: ReactNode; }

export default function Tabs({ tabs, initial, onChange }: { tabs: TabItem[]; initial?: string; onChange?(id:string):void }) {
  const [active, setActive] = useState(initial || tabs[0]?.id);
  function select(id: string){ setActive(id); onChange?.(id); }
  return (
    <div className="w-full">
  <div role="tablist" aria-label="Site sections" className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6">
        {tabs.map(t => (
          <button key={t.id} role="tab" aria-selected={active===t.id} aria-controls={`panel-${t.id}`} id={`tab-${t.id}`} onClick={()=>select(t.id)}
            className={`focus-ring px-2.5 sm:px-3 py-1.5 rounded-full text-[13px] sm:text-sm font-medium border transition-colors ${active===t.id? 'bg-brand-green text-white border-brand-green shadow-sm':'border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'}`}>{t.icon}{t.label}</button>
        ))}
      </div>
      {/* Panels provided externally; this component only handles the tab buttons now */}
    </div>
  );
}
