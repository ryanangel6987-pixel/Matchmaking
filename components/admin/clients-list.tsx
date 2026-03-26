"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { CustomSelect } from "@/components/ui/custom-select";

interface ClientItem {
  id: string;
  onboarding_status: string;
  created_at: string;
  profiles: { full_name: string | null } | null;
  matchmaker: { full_name: string | null } | null;
}

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "not_started", label: "Not Started" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "approved", label: "Approved" },
];

export function ClientsList({ clients }: { clients: ClientItem[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = clients.filter((client) => {
    const name = (client.profiles as any)?.full_name ?? "";
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || client.onboarding_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
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
        <div className="w-full sm:w-48">
          <CustomSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={STATUS_OPTIONS}
            placeholder="Filter status"
          />
        </div>
      </div>

      {/* Results count */}
      <p className="text-on-surface-variant text-xs">
        {filtered.length} client{filtered.length !== 1 ? "s" : ""}
        {search || statusFilter !== "all" ? " matching filters" : ""}
      </p>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <span
            className="material-symbols-outlined text-4xl text-outline/30 mb-3 block"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}
          >
            search_off
          </span>
          <p className="text-on-surface-variant">No clients match your filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((client) => (
            <Link
              key={client.id}
              href={`/admin/clients/${client.id}`}
              className="bg-surface-container-low p-4 rounded-xl flex items-center justify-between hover:bg-surface-container-high transition-colors duration-300"
            >
              <div>
                <p className="text-on-surface font-medium font-heading">
                  {(client.profiles as any)?.full_name ?? "Unknown"}
                </p>
                <p className="text-on-surface-variant text-xs mt-0.5">
                  Matchmaker:{" "}
                  {(client.matchmaker as any)?.full_name ?? "Unassigned"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="text-[9px] uppercase tracking-widest border-outline-variant/30 text-outline"
                >
                  {client.onboarding_status.replace(/_/g, " ")}
                </Badge>
                <span className="text-outline text-[10px]">
                  {new Date(client.created_at).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
