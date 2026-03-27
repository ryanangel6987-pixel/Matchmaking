"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";

interface AdminKanbanClient {
  id: string;
  profile_id: string;
  assigned_matchmaker_id: string | null;
  onboarding_status: string;
  created_at: string;
  updated_at: string;
  admin_pipeline_stage: string | null;
  profile_name: string | null;
  setup_complete: boolean;
  consultation_booked: boolean;
  has_live_photos: boolean;
  has_date_scheduled: boolean;
  approved_dates: number;
  matchmaker_name: string | null;
}

interface AdminKanbanProps {
  clients: AdminKanbanClient[];
}

const STALL_DAYS = 7;

function daysSince(dateStr: string): number {
  const d = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}

function isStalled(c: AdminKanbanClient): boolean {
  const stage = c.admin_pipeline_stage ?? "new_signup";
  if (stage === "five_dates") return false;
  return daysSince(c.updated_at) >= STALL_DAYS;
}

const PIPELINE_COLUMNS = [
  { key: "new_signup", title: "New Signup", icon: "person_add", color: "text-blue-400" },
  { key: "call_booked", title: "Onboarding Call Booked", icon: "calendar_month", color: "text-cyan-400" },
  { key: "onboarding_complete", title: "Onboarding Complete", icon: "task_alt", color: "text-teal-400" },
  { key: "profile_build", title: "Profile Build", icon: "construction", color: "text-orange-400" },
  { key: "profile_complete", title: "Profile Complete", icon: "check_circle", color: "text-amber-400" },
  { key: "assigned", title: "Assigned to Matchmaker", icon: "assignment_ind", color: "text-purple-400" },
  { key: "profile_live", title: "Profile Live", icon: "rocket_launch", color: "text-green-400" },
  { key: "first_date", title: "First Date Scheduled", icon: "event_available", color: "text-emerald-400" },
  { key: "five_dates", title: "First 5 Dates Delivered", icon: "verified", color: "text-gold" },
  { key: "stalled", title: "Stalled / Blocked", icon: "warning", color: "text-red-400" },
];

export function AdminKanban({ clients }: AdminKanbanProps) {
  const router = useRouter();
  const supabase = createClient();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [moving, setMoving] = useState<string | null>(null);
  const dragCounter = useRef<Record<string, number>>({});

  const stalledClients = clients.filter((c) => isStalled(c));
  const activeClients = clients.filter((c) => !isStalled(c));

  const moveClient = async (clientId: string, newStage: string) => {
    setMoving(clientId);
    const { error } = await supabase
      .from("clients")
      .update({
        admin_pipeline_stage: newStage,
        admin_stage_changed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", clientId);

    if (!error) {
      await supabase.from("audit_logs").insert({
        action: "admin_stage_change",
        entity_type: "client",
        entity_id: clientId,
        details: { new_stage: newStage },
      });
    }
    setMoving(null);
    router.refresh();
  };

  const handleDragStart = (e: React.DragEvent, clientId: string) => {
    setDraggingId(clientId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", clientId);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverCol(null);
    dragCounter.current = {};
  };

  const handleDragEnter = (e: React.DragEvent, colKey: string) => {
    e.preventDefault();
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

  const columns = PIPELINE_COLUMNS.map((col) => ({
    ...col,
    clients:
      col.key === "stalled"
        ? stalledClients
        : activeClients.filter((c) => (c.admin_pipeline_stage ?? "new_signup") === col.key),
  }));

  return (
    <div className="overflow-x-auto -mx-4 px-4 pb-4">
      <div className="grid grid-cols-10 gap-2 min-w-[1600px]">
        {columns.map((col) => {
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
              <div className="flex flex-col items-start gap-1 px-1">
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
                <h3 className="text-on-surface text-[10px] font-medium leading-tight">
                  {col.title}
                </h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  col.key === "stalled" && col.clients.length > 0
                    ? "bg-red-500/20 text-red-400"
                    : "bg-surface-container-high text-outline"
                }`}>
                  {col.clients.length}
                </span>
              </div>

              {/* Drop zone */}
              <div className={`space-y-2 min-h-[100px] rounded-2xl transition-all duration-200 p-1 ${
                isDropTarget ? "bg-gold/10 ring-2 ring-gold/30 ring-dashed" : ""
              }`}>
                {col.clients.length === 0 && !isDropTarget ? (
                  <div className="bg-surface-container-low rounded-2xl p-3 border border-outline-variant/10">
                    <p className="text-outline text-[10px] text-center">
                      {col.key === "stalled" ? "All clear" : "Empty"}
                    </p>
                  </div>
                ) : col.clients.length === 0 && isDropTarget ? (
                  <div className="bg-gold/5 rounded-2xl p-3 border-2 border-dashed border-gold/30">
                    <p className="text-gold text-[10px] text-center">Drop here</p>
                  </div>
                ) : (
                  col.clients.map((client) => {
                    const days = daysSince(client.created_at);
                    const staleDays = daysSince(client.updated_at);
                    const isStalledCard = col.key === "stalled";
                    const isDragging = draggingId === client.id;
                    const isMoving = moving === client.id;

                    return (
                      <div
                        key={client.id}
                        draggable={!isMoving}
                        onDragStart={(e) => handleDragStart(e, client.id)}
                        onDragEnd={handleDragEnd}
                        className={`p-3 rounded-2xl shadow-xl relative overflow-hidden group transition-all duration-300 cursor-grab active:cursor-grabbing ${
                          isDragging ? "opacity-40 scale-95" : ""
                        } ${isMoving ? "opacity-60 animate-pulse" : ""} ${
                          isStalledCard
                            ? "bg-red-500/5 hover:bg-red-500/10 border border-red-500/20"
                            : "bg-surface-container-low hover:bg-surface-container-high"
                        }`}
                      >
                        <div className={`absolute top-0 left-0 w-1 h-full opacity-30 group-hover:opacity-100 transition-opacity duration-500 ${
                          isStalledCard ? "bg-red-400" : "bg-gold"
                        }`} />
                        <h4 className="font-heading text-xs font-bold text-on-surface truncate">
                          {client.profile_name ?? "Unknown"}
                        </h4>
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          <Badge
                            variant="outline"
                            className="text-[7px] uppercase tracking-widest border-outline-variant/30 text-outline"
                          >
                            {days}d
                          </Badge>
                          {isStalledCard && (
                            <Badge
                              variant="outline"
                              className="text-[7px] uppercase tracking-widest border-red-500/30 text-red-400"
                            >
                              {staleDays}d idle
                            </Badge>
                          )}
                          {client.approved_dates > 0 && !isStalledCard && (
                            <Badge
                              variant="outline"
                              className="text-[7px] uppercase tracking-widest border-gold/30 text-gold"
                            >
                              {client.approved_dates} approved
                            </Badge>
                          )}
                        </div>
                        {client.matchmaker_name && (
                          <p className="text-on-surface-variant text-[9px] mt-1.5 flex items-center gap-1 truncate">
                            <span
                              className="material-symbols-outlined text-gold text-xs"
                              style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
                            >
                              badge
                            </span>
                            {client.matchmaker_name}
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
  );
}
