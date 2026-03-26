"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Overview", segment: "" },
  { label: "Stats", segment: "stats" },
  { label: "Opportunities", segment: "opportunities" },
  { label: "Photos", segment: "photos" },
  { label: "Preferences", segment: "preferences" },
  { label: "Venues", segment: "venues" },
  { label: "Notes", segment: "notes" },
  { label: "Credentials", segment: "credentials" },
  { label: "Actions", segment: "actions" },
];

export function ClientSubNav({ clientId }: { clientId: string }) {
  const pathname = usePathname();
  const base = `/clients/${clientId}`;

  return (
    <nav className="bg-surface-container-low rounded-xl overflow-x-auto md:overflow-visible">
      <div className="flex md:flex-wrap gap-1 px-2 py-2 min-w-max md:min-w-0">
        {tabs.map((tab) => {
          const href = tab.segment ? `${base}/${tab.segment}` : base;
          const isActive =
            tab.segment === ""
              ? pathname === base || pathname === `${base}/`
              : pathname.startsWith(`${base}/${tab.segment}`);

          return (
            <Link
              key={tab.segment}
              href={href}
              className={`px-4 py-2 rounded-lg text-xs uppercase tracking-widest font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? "text-gold bg-gold/10"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
