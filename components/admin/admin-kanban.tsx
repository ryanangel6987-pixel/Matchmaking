"use client";

import { Badge } from "@/components/ui/badge";

interface AdminKanbanClient {
  id: string;
  profile_id: string;
  assigned_matchmaker_id: string | null;
  onboarding_status: string;
  created_at: string;
  profile_name: string | null;
  setup_complete: boolean;
  photo_count: number;
  has_recent_approved_date: boolean;
  matchmaker_name: string | null;
}

interface AdminKanbanProps {
  clients: AdminKanbanClient[];
}

function daysSince(dateStr: string): number {
  const created = new Date(dateStr);
  const now = new Date();
  return Math.floor(
    (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
  );
}

export function AdminKanban({ clients }: AdminKanbanProps) {
  const columns = [
    {
      key: "new",
      title: "New",
      icon: "fiber_new",
      color: "text-blue-400",
      clients: clients.filter((c) => !c.assigned_matchmaker_id),
    },
    {
      key: "onboarding",
      title: "Onboarding",
      icon: "person_add",
      color: "text-orange-400",
      clients: clients.filter(
        (c) => c.assigned_matchmaker_id && !c.setup_complete
      ),
    },
    {
      key: "active",
      title: "Active",
      icon: "play_circle",
      color: "text-green-400",
      clients: clients.filter(
        (c) =>
          c.setup_complete &&
          (c.photo_count > 0 || c.has_recent_approved_date) &&
          !c.has_recent_approved_date
      ),
    },
    {
      key: "dating",
      title: "Dating",
      icon: "favorite",
      color: "text-gold",
      clients: clients.filter((c) => c.has_recent_approved_date),
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
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
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
                const days = daysSince(client.created_at);
                return (
                  <div
                    key={client.id}
                    className="bg-surface-container-low p-4 rounded-2xl shadow-xl relative overflow-hidden group hover:bg-surface-container-high transition-colors duration-300"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-gold opacity-30 group-hover:opacity-100 transition-opacity duration-500" />
                    <h4 className="font-heading text-sm font-bold text-on-surface">
                      {client.profile_name ?? "Unknown"}
                    </h4>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <Badge
                        variant="outline"
                        className="text-[8px] uppercase tracking-widest border-outline-variant/30 text-outline"
                      >
                        {days}d ago
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-[8px] uppercase tracking-widest border-outline-variant/30 text-outline"
                      >
                        {client.onboarding_status.replace("_", " ")}
                      </Badge>
                    </div>
                    {client.matchmaker_name && (
                      <p className="text-on-surface-variant text-[10px] mt-2 flex items-center gap-1">
                        <span
                          className="material-symbols-outlined text-gold text-xs"
                          style={{
                            fontVariationSettings: "'FILL' 0, 'wght' 300",
                          }}
                        >
                          badge
                        </span>
                        {client.matchmaker_name}
                      </p>
                    )}
                    {col.key === "new" && (
                      <p className="text-on-surface-variant text-[10px] mt-2 flex items-center gap-1">
                        <span
                          className="material-symbols-outlined text-gold text-xs"
                          style={{
                            fontVariationSettings: "'FILL' 0, 'wght' 300",
                          }}
                        >
                          arrow_forward
                        </span>
                        Needs matchmaker assignment
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
