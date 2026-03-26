"use client";

import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function CollapsibleSection({
  title,
  subtitle,
  children,
  defaultOpen = true,
}: SectionHeaderProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="w-full group">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1 text-left">
            <h3 className="text-on-surface-variant text-xs uppercase tracking-widest font-medium">
              {title}
            </h3>
            {subtitle && (
              <p className="text-on-surface-variant/60 text-xs">{subtitle}</p>
            )}
          </div>
          <span
            className="material-symbols-outlined text-outline transition-transform duration-300"
            style={{
              fontVariationSettings: "'FILL' 0, 'wght' 300",
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
            }}
          >
            expand_more
          </span>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-6">{children}</CollapsibleContent>
    </Collapsible>
  );
}

interface DataRowProps {
  label: string;
  value: string | number | null | undefined;
}

export function DataRow({ label, value }: DataRowProps) {
  return (
    <div className="flex justify-between items-end border-b border-outline-variant/15 pb-2">
      <span className="text-on-surface-variant text-sm">{label}</span>
      <span className="text-gold font-heading text-lg text-right max-w-[60%]">
        {value ?? "—"}
      </span>
    </div>
  );
}

interface TagListProps {
  items: string[] | null | undefined;
}

export function TagList({ items }: TagListProps) {
  if (!items || items.length === 0) {
    return <span className="text-on-surface-variant/50 text-sm">None specified</span>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="px-4 py-2 rounded-full border border-outline-variant/20 text-xs uppercase tracking-widest text-gold bg-surface-container-high"
        >
          {item}
        </span>
      ))}
    </div>
  );
}
