"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface MatchmakerClientItem {
  id: string;
  onboarding_status: string;
  created_at: string;
  profiles: { full_name: string | null; avatar_url: string | null } | null;
}

export function MatchmakerClientsSearch({
  clients,
}: {
  clients: MatchmakerClientItem[];
}) {
  const [search, setSearch] = useState("");

  const filtered = clients.filter((client) => {
    const name = (client.profiles as any)?.full_name ?? "";
    return name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <span
          className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg"
          style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
        >
          search
        </span>
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl pl-10 pr-4 py-2.5 text-on-surface text-sm placeholder:text-outline focus:border-gold outline-none transition-colors"
        />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <span
            className="material-symbols-outlined text-4xl text-outline/30 mb-3 block"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}
          >
            search_off
          </span>
          <p className="text-on-surface-variant">No clients match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((client) => {
            const name = (client.profiles as any)?.full_name ?? "Unknown";
            return (
              <Link
                key={client.id}
                href={`/clients/${client.id}`}
                className="bg-surface-container-low p-6 rounded-2xl shadow-xl relative overflow-hidden group hover:bg-surface-container-high transition-colors duration-300"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-gold opacity-30 group-hover:opacity-100 transition-opacity duration-500" />
                <h3 className="font-heading text-lg font-bold text-on-surface">
                  {name}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    variant="outline"
                    className="text-[9px] uppercase tracking-widest border-outline-variant/30 text-outline"
                  >
                    {client.onboarding_status.replace(/_/g, " ")}
                  </Badge>
                </div>
                <p className="text-outline text-[10px] mt-3">
                  Since {new Date(client.created_at).toLocaleDateString("en-US")}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
