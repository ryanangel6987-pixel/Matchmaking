"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface KanbanClient {
  id: string;
  onboarding_status: string;
  created_at: string;
  profiles: { full_name: string | null; avatar_url: string | null } | null;
  has_live_photos: boolean;
  has_date_opportunity: boolean;
  has_pending_or_approved: boolean;
}

interface Column {
  key: string;
  title: string;
  icon: string;
  clients: KanbanClient[];
  color: string;
}

function getNextAction(client: KanbanClient, columnKey: string): string {
  switch (columnKey) {
    case "onboarding":
      return client.onboarding_status === "not_started"
        ? "Start onboarding intake"
        : "Complete onboarding form";
    case "profile_build":
      return "Upload and approve photos";
    case "active":
      return "Create date opportunity";
    case "date_scheduled":
      return "Follow up on scheduled date";
    default:
      return "";
  }
}

function daysSince(dateStr: string): number {
  const created = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
}

export function ClientKanban({ clients }: { clients: KanbanClient[] }) {
  const columns: Column[] = [
    {
      key: "onboarding",
      title: "Onboarding",
      icon: "person_add",
      color: "text-blue-400",
      clients: clients.filter(
        (c) =>
          c.onboarding_status === "not_started" ||
          c.onboarding_status === "in_progress"
      ),
    },
    {
      key: "profile_build",
      title: "Profile Build",
      icon: "construction",
      color: "text-orange-400",
      clients: clients.filter(
        (c) => c.onboarding_status === "completed" && !c.has_live_photos
      ),
    },
    {
      key: "active",
      title: "Active",
      icon: "play_circle",
      color: "text-green-400",
      clients: clients.filter(
        (c) =>
          c.has_live_photos &&
          c.has_date_opportunity &&
          !c.has_pending_or_approved
      ),
    },
    {
      key: "date_scheduled",
      title: "Date Scheduled",
      icon: "event_available",
      color: "text-gold",
      clients: clients.filter((c) => c.has_pending_or_approved),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {columns.map((col) => (
        <div key={col.key} className="space-y-3">
          {/* Column header */}
          <div className="flex items-center gap-2 px-1">
            <span
              className={`material-symbols-outlined text-lg ${col.color}`}
              style={{
                fontVariationSettings: "'FILL' 0, 'wght' 300",
              }}
            >
              {col.icon}
            </span>
            <h3 className="text-on-surface text-sm font-medium">
              {col.title}
            </h3>
            <span className="ml-auto text-outline text-xs bg-surface-container-high px-2 py-0.5 rounded-full">
              {col.clients.length}
            </span>
          </div>

          {/* Column cards */}
          <div className="space-y-2 min-h-[120px]">
            {col.clients.length === 0 ? (
              <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/10">
                <p className="text-outline text-xs text-center">No clients</p>
              </div>
            ) : (
              col.clients.map((client) => {
                const name =
                  (client.profiles as any)?.full_name ?? "Unknown";
                const days = daysSince(client.created_at);
                const action = getNextAction(client, col.key);
                return (
                  <Link
                    key={client.id}
                    href={`/clients/${client.id}`}
                    className="block bg-surface-container-low p-4 rounded-2xl shadow-xl relative overflow-hidden group hover:bg-surface-container-high transition-colors duration-300"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-gold opacity-30 group-hover:opacity-100 transition-opacity duration-500" />
                    <h4 className="font-heading text-sm font-bold text-on-surface">
                      {name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge
                        variant="outline"
                        className="text-[8px] uppercase tracking-widest border-outline-variant/30 text-outline"
                      >
                        {days}d since onboarding
                      </Badge>
                    </div>
                    {action && (
                      <p className="text-on-surface-variant text-[10px] mt-2 flex items-center gap-1">
                        <span
                          className="material-symbols-outlined text-gold text-xs"
                          style={{
                            fontVariationSettings: "'FILL' 0, 'wght' 300",
                          }}
                        >
                          arrow_forward
                        </span>
                        {action}
                      </p>
                    )}
                  </Link>
                );
              })
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
