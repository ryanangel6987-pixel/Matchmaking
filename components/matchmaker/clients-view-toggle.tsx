"use client";

import Link from "next/link";

export function ClientsViewToggle({ isKanban }: { isKanban: boolean }) {
  return (
    <div className="flex items-center gap-1 bg-surface-container-low rounded-xl p-1">
      <Link
        href="/clients?view=list"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
          !isKanban
            ? "bg-gold/10 text-gold"
            : "text-on-surface-variant hover:text-on-surface"
        }`}
      >
        <span
          className="material-symbols-outlined text-sm"
          style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
        >
          view_list
        </span>
        List
      </Link>
      <Link
        href="/clients?view=kanban"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
          isKanban
            ? "bg-gold/10 text-gold"
            : "text-on-surface-variant hover:text-on-surface"
        }`}
      >
        <span
          className="material-symbols-outlined text-sm"
          style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
        >
          view_kanban
        </span>
        Kanban
      </Link>
    </div>
  );
}
