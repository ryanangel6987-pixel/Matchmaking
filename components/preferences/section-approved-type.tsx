"use client";

import { CollapsibleSection } from "./section-header";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SectionApprovedType({ approvedType }: { approvedType: any }) {
  const data = approvedType ?? {};

  return (
    <div className="bg-surface-container-low p-8 rounded-2xl shadow-xl relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-1 h-full bg-gold opacity-30 group-hover:opacity-100 transition-opacity duration-500" />

      <CollapsibleSection
        title="Section E — Approved Type"
        subtitle="Internal matchmaker targeting brief (read-only)"
        defaultOpen={false}
      >
        <div className="space-y-6">
          <div>
            <p className="text-on-surface-variant text-xs uppercase tracking-widest mb-2">
              Target Archetype
            </p>
            <p className="text-on-surface text-base leading-relaxed font-heading">
              {data.target_archetype ?? <span className="text-on-surface-variant/40">&mdash;</span>}
            </p>
          </div>

          <div>
            <p className="text-on-surface-variant text-xs uppercase tracking-widest mb-2">
              What to Prioritize
            </p>
            <p className="text-on-surface text-sm leading-relaxed">
              {data.what_to_prioritize ?? <span className="text-on-surface-variant/40">&mdash;</span>}
            </p>
          </div>

          <div>
            <p className="text-on-surface-variant text-xs uppercase tracking-widest mb-2">
              What to Avoid
            </p>
            <p className="text-on-surface text-sm leading-relaxed">
              {data.what_to_avoid ?? <span className="text-on-surface-variant/40">&mdash;</span>}
            </p>
          </div>

          <div>
            <p className="text-on-surface-variant text-xs uppercase tracking-widest mb-2">
              Targeting Notes
            </p>
            <p className="text-on-surface text-sm leading-relaxed">
              {data.targeting_notes ?? <span className="text-on-surface-variant/40">&mdash;</span>}
            </p>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
}
