"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface PipelineEntry {
  id: string;
  type: "application" | "client";
  name: string;
  stage: string;
  created_at: string;
  updated_at: string;
  // Application fields
  profession?: string | null;
  city?: string | null;
  lead_tier?: string | null;
  lead_score?: number | null;
  email?: string | null;
  phone?: string | null;
  status?: string | null;
  // Client fields
  matchmaker_name?: string | null;
  approved_dates?: number;
  onboarding_status?: string | null;
}

interface UnifiedPipelineProps {
  entries: PipelineEntry[];
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const STALL_DAYS = 7;

function daysSince(dateStr: string): number {
  const d = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}

const PIPELINE_COLUMNS = [
  { key: "new_signup", title: "New Signup", icon: "person_add", color: "text-blue-400", accepts: "application" },
  { key: "call_booked", title: "Call Booked", icon: "calendar_month", color: "text-cyan-400", accepts: "application" },
  { key: "onboarding_complete", title: "Onboarding Complete", icon: "task_alt", color: "text-teal-400", accepts: "client" },
  { key: "profile_build", title: "Profile Build", icon: "construction", color: "text-orange-400", accepts: "client" },
  { key: "profile_complete", title: "Profile Complete", icon: "check_circle", color: "text-amber-400", accepts: "client" },
  { key: "assigned", title: "Assigned to Matchmaker", icon: "assignment_ind", color: "text-purple-400", accepts: "client" },
  { key: "profile_live", title: "Profile Live", icon: "rocket_launch", color: "text-green-400", accepts: "client" },
  { key: "first_date", title: "First Date Scheduled", icon: "event_available", color: "text-emerald-400", accepts: "client" },
  { key: "five_dates", title: "5 Dates Delivered", icon: "verified", color: "text-gold", accepts: "client" },
  { key: "stalled", title: "Stalled / Blocked", icon: "warning", color: "text-red-400", accepts: "both" },
];

const TIER_COLORS: Record<string, string> = {
  high: "border-green-400/30 text-green-400",
  medium: "border-gold/30 text-gold",
  likely_unqualified: "border-red-400/30 text-red-400",
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function UnifiedPipeline({ entries }: UnifiedPipelineProps) {
  const router = useRouter();
  const supabase = createClient();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [draggingType, setDraggingType] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [moving, setMoving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const dragCounter = useRef<Record<string, number>>({});

  // Split stalled clients (7+ days idle, not in five_dates)
  const stalledEntries = entries.filter(
    (e) => e.type === "client" && e.stage !== "five_dates" && daysSince(e.updated_at) >= STALL_DAYS
  );
  const stalledIds = new Set(stalledEntries.map((e) => e.id));
  const activeEntries = entries.filter((e) => !stalledIds.has(e.id));

  const moveEntry = async (entryId: string, entryType: string, newStage: string) => {
    setMoving(entryId);
    setError(null);

    if (entryType === "application") {
      // Update applications table
      const { error: updateError } = await supabase
        .from("applications")
        .update({ pipeline_stage: newStage })
        .eq("id", entryId);

      if (updateError) {
        setError(`Failed to move: ${updateError.message}`);
        setMoving(null);
        return;
      }
    } else {
      // Update clients table
      const { error: updateError } = await supabase
        .from("clients")
        .update({
          admin_pipeline_stage: newStage,
          admin_stage_changed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", entryId);

      if (updateError) {
        setError(`Failed to move: ${updateError.message}`);
        setMoving(null);
        return;
      }

      await supabase.from("audit_logs").insert({
        action: "admin_stage_change",
        entity_type: "client",
        entity_id: entryId,
        details: { new_stage: newStage },
      });
    }

    setMoving(null);
    router.refresh();
  };

  const handleDragStart = (e: React.DragEvent, entry: PipelineEntry) => {
    setDraggingId(entry.id);
    setDraggingType(entry.type);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", JSON.stringify({ id: entry.id, type: entry.type }));
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDraggingType(null);
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
    try {
      const data = JSON.parse(e.dataTransfer.getData("text/plain"));
      if (data.id && colKey !== "stalled") {
        moveEntry(data.id, data.type, colKey);
      }
    } catch {}
    setDraggingId(null);
    setDraggingType(null);
    setDragOverCol(null);
    dragCounter.current = {};
  };

  const columns = PIPELINE_COLUMNS.map((col) => ({
    ...col,
    entries:
      col.key === "stalled"
        ? stalledEntries
        : activeEntries.filter((e) => e.stage === col.key),
  }));

  // Totals
  const totalApps = entries.filter((e) => e.type === "application").length;
  const totalClients = entries.filter((e) => e.type === "client").length;

  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <div className="flex items-center gap-4 text-xs">
        <span className="text-on-surface-variant">
          <span className="text-blue-400 font-bold">{totalApps}</span> applications
        </span>
        <span className="text-outline">|</span>
        <span className="text-on-surface-variant">
          <span className="text-green-400 font-bold">{totalClients}</span> clients
        </span>
        <span className="text-outline">|</span>
        <span className="text-on-surface-variant">
          <span className="text-red-400 font-bold">{stalledEntries.length}</span> stalled
        </span>
      </div>

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
                    col.key === "stalled" && col.entries.length > 0
                      ? "bg-red-500/20 text-red-400"
                      : "bg-surface-container-high text-outline"
                  }`}>
                    {col.entries.length}
                  </span>
                </div>

                {/* Drop zone */}
                <div className={`space-y-2 min-h-[100px] rounded-2xl transition-all duration-200 p-1 ${
                  isDropTarget ? "bg-gold/10 ring-2 ring-gold/30 ring-dashed" : ""
                }`}>
                  {col.entries.length === 0 && !isDropTarget ? (
                    <div className="bg-surface-container-low rounded-2xl p-3 border border-outline-variant/10">
                      <p className="text-outline text-[10px] text-center">
                        {col.key === "stalled" ? "All clear" : "Empty"}
                      </p>
                    </div>
                  ) : col.entries.length === 0 && isDropTarget ? (
                    <div className="bg-gold/5 rounded-2xl p-3 border-2 border-dashed border-gold/30">
                      <p className="text-gold text-[10px] text-center">Drop here</p>
                    </div>
                  ) : (
                    col.entries.map((entry) => {
                      const days = daysSince(entry.created_at);
                      const isStalledCard = col.key === "stalled";
                      const isDragging = draggingId === entry.id;
                      const isMoving = moving === entry.id;
                      const isApp = entry.type === "application";

                      return (
                        <div
                          key={`${entry.type}-${entry.id}`}
                          draggable={!isMoving}
                          onDragStart={(e) => handleDragStart(e, entry)}
                          onDragEnd={handleDragEnd}
                          className={`p-3 rounded-2xl shadow-xl relative overflow-hidden group transition-all duration-300 cursor-grab active:cursor-grabbing ${
                            isDragging ? "opacity-40 scale-95" : ""
                          } ${isMoving ? "opacity-60 animate-pulse" : ""} ${
                            isStalledCard
                              ? "bg-red-500/5 hover:bg-red-500/10 border border-red-500/20"
                              : "bg-surface-container-low hover:bg-surface-container-high"
                          }`}
                        >
                          {/* Left accent bar */}
                          <div className={`absolute top-0 left-0 w-1 h-full opacity-30 group-hover:opacity-100 transition-opacity duration-500 ${
                            isStalledCard ? "bg-red-400" : isApp ? "bg-blue-400" : "bg-gold"
                          }`} />

                          {/* Name + type badge */}
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-heading text-xs font-bold text-on-surface truncate flex-1">
                              {entry.name}
                            </h4>
                            {isApp && (
                              <span className="shrink-0 text-[7px] uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-blue-400/15 text-blue-400 border border-blue-400/20">
                                App
                              </span>
                            )}
                          </div>

                          {/* Badges */}
                          <div className="flex items-center gap-1 mt-1 flex-wrap">
                            <Badge variant="outline" className="text-[7px] uppercase tracking-widest border-outline-variant/30 text-outline">
                              {days}d
                            </Badge>
                            {isApp && entry.lead_tier && (
                              <Badge variant="outline" className={`text-[7px] uppercase tracking-widest ${TIER_COLORS[entry.lead_tier] ?? "border-outline-variant/30 text-outline"}`}>
                                {entry.lead_tier.replace("_", " ")}
                              </Badge>
                            )}
                            {!isApp && (entry.approved_dates ?? 0) > 0 && !isStalledCard && (
                              <Badge variant="outline" className="text-[7px] uppercase tracking-widest border-gold/30 text-gold">
                                {entry.approved_dates} approved
                              </Badge>
                            )}
                            {isStalledCard && (
                              <Badge variant="outline" className="text-[7px] uppercase tracking-widest border-red-500/30 text-red-400">
                                {daysSince(entry.updated_at)}d idle
                              </Badge>
                            )}
                          </div>

                          {/* Subtitle */}
                          {isApp && (entry.profession || entry.city) && (
                            <p className="text-on-surface-variant text-[9px] mt-1.5 truncate">
                              {[entry.profession, entry.city].filter(Boolean).join(" · ")}
                            </p>
                          )}
                          {!isApp && entry.matchmaker_name && (
                            <p className="text-on-surface-variant text-[9px] mt-1.5 flex items-center gap-1 truncate">
                              <span className="material-symbols-outlined text-gold text-xs" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>badge</span>
                              {entry.matchmaker_name}
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
