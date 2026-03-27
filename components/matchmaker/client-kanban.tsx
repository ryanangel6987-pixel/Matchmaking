"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";

interface KanbanClient {
  id: string;
  onboarding_status: string;
  created_at: string;
  updated_at: string;
  mm_pipeline_stage: string | null;
  profiles: { full_name: string | null; avatar_url: string | null } | null;
  has_credentials: boolean;
  has_swipes: boolean;
  has_date_scheduled: boolean;
  approved_dates: number;
}

const STALL_DAYS = 7;

const STAGES = [
  { key: "date_assigned", title: "Date Assigned", icon: "assignment_ind", color: "text-blue-400" },
  { key: "account_live", title: "Account Live & Setup", icon: "phonelink_setup", color: "text-orange-400" },
  { key: "first_swipes", title: "First Swipes Logged", icon: "swipe", color: "text-purple-400" },
  { key: "first_date", title: "First Date Scheduled", icon: "event_available", color: "text-green-400" },
  { key: "five_dates", title: "First 5 Dates Delivered", icon: "verified", color: "text-gold" },
] as const;

function daysSince(dateStr: string): number {
  const d = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}

function getNextAction(key: string): string {
  switch (key) {
    case "date_assigned": return "Set up dating app credentials";
    case "account_live": return "Begin swiping & log first stats";
    case "first_swipes": return "Schedule the first date";
    case "first_date": return "Deliver 5 approved dates";
    case "five_dates": return "System proven — ongoing delivery";
    case "stalled": return "Client needs follow-up";
    default: return "";
  }
}

function isStalled(c: KanbanClient): boolean {
  const stage = c.mm_pipeline_stage ?? "date_assigned";
  if (stage === "five_dates") return false;
  return daysSince(c.updated_at) >= STALL_DAYS;
}

export function ClientKanban({ clients }: { clients: KanbanClient[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [moving, setMoving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const dragCounter = useRef<Record<string, number>>({});
  const didDrag = useRef(false);

  const stalledClients = clients.filter((c) => isStalled(c));
  const activeClients = clients.filter((c) => !isStalled(c));

  const moveClient = async (clientId: string, newStage: string) => {
    setMoving(clientId);
    setError(null);
    const { error: updateError } = await supabase
      .from("clients")
      .update({
        mm_pipeline_stage: newStage,
        mm_stage_changed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", clientId);

    if (updateError) {
      setError(`Failed to move client: ${updateError.message}`);
      setMoving(null);
      return;
    }

    await supabase.from("audit_logs").insert({
      action: "mm_stage_change",
      entity_type: "client",
      entity_id: clientId,
      details: { new_stage: newStage },
    });

    setMoving(null);
    router.refresh();
  };

  const handleDragStart = (e: React.DragEvent, clientId: string) => {
    didDrag.current = false;
    setDraggingId(clientId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", clientId);
    // Set a drag image
    if (e.currentTarget instanceof HTMLElement) {
      e.dataTransfer.setDragImage(e.currentTarget, 20, 20);
    }
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverCol(null);
    dragCounter.current = {};
  };

  const handleDragEnter = (e: React.DragEvent, colKey: string) => {
    e.preventDefault();
    didDrag.current = true;
    dragCounter.current[colKey] = (dragCounter.current[colKey] || 0) + 1;
    setDragOverCol(colKey);
  };

  const handleDragLeave = (colKey: string) => {
    dragCounter.current[colKey] = (dragCounter.current[colKey] || 0) - 1;
    if (dragCounter.current[colKey] <= 0) {
      dragCounter.current[colKey] = 0;
      if (dragOverCol === colKey) setDragOverCol(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, colKey: string) => {
    e.preventDefault();
    const clientId = e.dataTransfer.getData("text/plain");
    if (clientId && colKey !== "stalled") {
      moveClient(clientId, colKey);
    }
    setDraggingId(null);
    setDragOverCol(null);
    dragCounter.current = {};
  };

  // Navigate to client on click (not drag)
  const handleCardClick = (clientId: string) => {
    if (!didDrag.current) {
      router.push(`/clients/${clientId}`);
    }
    didDrag.current = false;
  };

  const allColumns = [
    ...STAGES.map((s) => ({
      ...s,
      clients: activeClients.filter((c) => (c.mm_pipeline_stage ?? "date_assigned") === s.key),
    })),
    {
      key: "stalled",
      title: "Stalled / Blocked",
      icon: "warning",
      color: "text-red-400",
      clients: stalledClients,
    },
  ];

  return (
    <div className="space-y-3">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-red-400 text-sm">error</span>
          <p className="text-red-400 text-xs flex-1">{error}</p>
          <button onClick={() => setError(null)} className="text-red-400/60 hover:text-red-400">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}
      <div className="overflow-x-auto -mx-4 px-4 pb-4">
        <div className="grid grid-cols-6 gap-3 min-w-[1050px]">
          {allColumns.map((col) => {
            const isDropTarget = dragOverCol === col.key && col.key !== "stalled";
            return (
              <div
                key={col.key}
                className="space-y-3"
                onDragEnter={(e) => handleDragEnter(e, col.key)}
                onDragLeave={() => handleDragLeave(col.key)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.key)}
              >
                {/* Column header */}
                <div className="flex items-center gap-2 px-1">
                  <span
                    className={`material-symbols-outlined text-lg ${col.color}`}
                    style={{
                      fontVariationSettings: col.key === "stalled"
                        ? "'FILL' 1, 'wght' 400"
                        : "'FILL' 0, 'wght' 300",
                    }}
                  >
                    {col.icon}
                  </span>
                  <h3 className="text-on-surface text-xs font-medium leading-tight">
                    {col.title}
                  </h3>
                  <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                    col.key === "stalled" && col.clients.length > 0
                      ? "bg-red-500/20 text-red-400"
                      : "bg-surface-container-high text-outline"
                  }`}>
                    {col.clients.length}
                  </span>
                </div>

                {/* Drop zone */}
                <div className={`space-y-2 min-h-[120px] rounded-2xl transition-all duration-200 p-1 ${
                  isDropTarget ? "bg-gold/10 ring-2 ring-gold/30" : ""
                }`}>
                  {col.clients.length === 0 && !isDropTarget ? (
                    <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/10">
                      <p className="text-outline text-xs text-center">
                        {col.key === "stalled" ? "All clear" : "No clients"}
                      </p>
                    </div>
                  ) : col.clients.length === 0 && isDropTarget ? (
                    <div className="bg-gold/5 rounded-2xl p-4 border-2 border-dashed border-gold/30">
                      <p className="text-gold text-xs text-center">Drop here</p>
                    </div>
                  ) : (
                    col.clients.map((client) => {
                      const name = (client.profiles as any)?.full_name ?? "Unknown";
                      const days = daysSince(client.created_at);
                      const staleDays = daysSince(client.updated_at);
                      const action = getNextAction(col.key);
                      const isStalledCard = col.key === "stalled";
                      const isDragging = draggingId === client.id;
                      const isMoving = moving === client.id;

                      return (
                        <div
                          key={client.id}
                          draggable={!isMoving}
                          onDragStart={(e) => handleDragStart(e, client.id)}
                          onDragEnd={handleDragEnd}
                          onClick={() => handleCardClick(client.id)}
                          className={`p-4 rounded-2xl shadow-xl relative overflow-hidden group transition-all duration-300 select-none ${
                            isDragging ? "opacity-40 scale-95" : "cursor-grab active:cursor-grabbing"
                          } ${isMoving ? "opacity-60 animate-pulse" : ""} ${
                            isStalledCard
                              ? "bg-red-500/5 hover:bg-red-500/10 border border-red-500/20"
                              : "bg-surface-container-low hover:bg-surface-container-high"
                          }`}
                        >
                          <div className={`absolute top-0 left-0 w-1 h-full opacity-30 group-hover:opacity-100 transition-opacity duration-500 ${
                            isStalledCard ? "bg-red-400" : "bg-gold"
                          }`} />
                          <h4 className="font-heading text-sm font-bold text-on-surface">
                            {name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <Badge
                              variant="outline"
                              className="text-[8px] uppercase tracking-widest border-outline-variant/30 text-outline"
                            >
                              {days}d since assigned
                            </Badge>
                            {isStalledCard && (
                              <Badge
                                variant="outline"
                                className="text-[8px] uppercase tracking-widest border-red-500/30 text-red-400"
                              >
                                {staleDays}d idle
                              </Badge>
                            )}
                            {col.key === "first_date" && (
                              <Badge
                                variant="outline"
                                className="text-[8px] uppercase tracking-widest border-gold/30 text-gold"
                              >
                                {client.approved_dates}/5 approved
                              </Badge>
                            )}
                          </div>
                          {action && (
                            <p className="text-on-surface-variant text-[10px] mt-2 flex items-center gap-1">
                              <span
                                className={`material-symbols-outlined text-xs ${
                                  isStalledCard ? "text-red-400" : "text-gold"
                                }`}
                                style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
                              >
                                {isStalledCard ? "priority_high" : "arrow_forward"}
                              </span>
                              {action}
                            </p>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
