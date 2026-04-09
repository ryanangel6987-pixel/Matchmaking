"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Application {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  city: string | null;
  profession: string | null;
  age: number | null;
  height: string | null;
  weight: string | null;
  own_ethnicity: string | null;
  own_body_type: string | null;
  intent: string | null;
  life_window: string | null;
  income_qualified: string | null;
  shape_qualified: string | null;
  biggest_challenge: string | null;
  challenge_notes: string | null;
  duration: string | null;
  tried_before: string | null;
  current_results: string | null;
  priority_level: number | null;
  goal: string | null;
  timeline: string | null;
  ideal_partner: string | null;
  her_age_min: number | null;
  her_age_max: number | null;
  her_ethnicities: string[] | null;
  her_body_types: string[] | null;
  lead_score: number | null;
  lead_tier: string | null;
  status: string;
  activated_at: string | null;
  created_at: string;
}

const TIER_STYLES: Record<string, string> = {
  high: "bg-green-400/15 text-green-400 border-green-400/30",
  medium: "bg-gold/15 text-gold border-gold/30",
  likely_unqualified: "bg-red-400/15 text-red-400 border-red-400/30",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-outline-variant/20 text-on-surface-variant border-outline-variant/30",
  activated: "bg-green-400/15 text-green-400 border-green-400/30",
  rejected: "bg-red-400/15 text-red-400 border-red-400/30",
  auto_disqualified: "bg-red-400/10 text-red-400/60 border-red-400/20",
};

const LIFE_WINDOW_LABELS: Record<string, string> = {
  divorce: "Post-relationship / Divorce",
  new_city: "New City",
  milestone: "Milestone Birthday",
  career: "Career Change",
  none: "No specific trigger",
};

const DURATION_LABELS: Record<string, string> = {
  less_than_3: "< 3 months",
  "3_6": "3-6 months",
  "6_12": "6-12 months",
  "1_2_years": "1-2 years",
  "3_plus_years": "3+ years",
};

const TRIED_LABELS: Record<string, string> = {
  nothing: "Nothing yet",
  apps: "Dating apps",
  photos: "Professional photos",
  matchmaker: "Matchmaker / coach",
  multiple: "Multiple things — nothing worked",
};

const RESULTS_LABELS: Record<string, string> = {
  none: "Not dating at all",
  "0_1": "0-1 low quality dates",
  "2_3": "2-3, not quality enough",
  "4_plus": "4+ but wants better",
};

const GOAL_LABELS: Record<string, string> = {
  consistent_quality: "Consistent quality dates every week",
  relationship: "Find a serious relationship",
  options: "Multiple quality options at all times",
  handled: "Dating life handled and off my plate",
};

const TIMELINE_LABELS: Record<string, string> = {
  asap: "As soon as possible",
  "1_month": "Within the next month",
  "3_months": "Within 3 months",
  no_rush: "No rush — just want it done right",
};

export function ApplicationsCRM({ applications, adminProfileId }: { applications: Application[]; adminProfileId: string }) {
  const router = useRouter();
  const [filter, setFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activating, setActivating] = useState<string | null>(null);

  const filtered = filter === "all"
    ? applications
    : applications.filter((a) => a.status === filter || a.lead_tier === filter);

  const counts = {
    all: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    activated: applications.filter((a) => a.status === "activated").length,
    high: applications.filter((a) => a.lead_tier === "high" && a.status === "pending").length,
    medium: applications.filter((a) => a.lead_tier === "medium" && a.status === "pending").length,
    disqualified: applications.filter((a) => a.status === "auto_disqualified").length,
  };

  const handleActivate = async (appId: string) => {
    setActivating(appId);
    try {
      const res = await fetch("/api/applications/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: appId }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Client activated — invite email sent");
        router.refresh();
      } else {
        toast.error("Activation failed", { description: data.error });
      }
    } catch {
      toast.error("Network error");
    }
    setActivating(null);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

  return (
    <div className="space-y-6">
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: "all", label: "All", count: counts.all },
          { key: "pending", label: "Pending", count: counts.pending },
          { key: "high", label: "High Priority", count: counts.high },
          { key: "medium", label: "Medium", count: counts.medium },
          { key: "activated", label: "Activated", count: counts.activated },
          { key: "auto_disqualified", label: "Disqualified", count: counts.disqualified },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
              filter === tab.key
                ? "bg-gold/15 text-gold border border-gold/30"
                : "bg-surface-container-low text-on-surface-variant border border-outline-variant/20 hover:bg-surface-container-high"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-surface-container-low p-4 rounded-xl text-center">
          <p className="font-heading text-2xl font-bold text-on-surface">{counts.all}</p>
          <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mt-0.5">Total</p>
        </div>
        <div className="bg-surface-container-low p-4 rounded-xl text-center">
          <p className="font-heading text-2xl font-bold text-gold">{counts.pending}</p>
          <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mt-0.5">Pending</p>
        </div>
        <div className="bg-surface-container-low p-4 rounded-xl text-center">
          <p className="font-heading text-2xl font-bold text-green-400">{counts.high}</p>
          <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mt-0.5">High Priority</p>
        </div>
        <div className="bg-surface-container-low p-4 rounded-xl text-center">
          <p className="font-heading text-2xl font-bold text-green-400">{counts.activated}</p>
          <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mt-0.5">Activated</p>
        </div>
      </div>

      {/* Applications list */}
      {filtered.length === 0 ? (
        <div className="bg-surface-container-low rounded-2xl p-10 text-center">
          <span className="material-symbols-outlined text-4xl text-outline/30 block" style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>assignment</span>
          <p className="text-on-surface-variant text-sm mt-3">No applications match this filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => {
            const isExpanded = expandedId === app.id;
            const isActivating = activating === app.id;

            return (
              <div key={app.id} className="bg-surface-container-low rounded-2xl overflow-hidden">
                {/* Collapsed row */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : app.id)}
                  className="w-full flex items-center gap-4 p-4 text-left hover:bg-surface-container-low/80 transition-colors"
                >
                  {/* Lead tier indicator */}
                  <div className={`w-2 h-10 rounded-full shrink-0 ${
                    app.lead_tier === "high" ? "bg-green-400" : app.lead_tier === "medium" ? "bg-gold" : "bg-red-400"
                  }`} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-on-surface font-heading font-semibold text-sm truncate">{app.full_name}</p>
                      <Badge variant="outline" className={`text-[8px] uppercase tracking-widest ${TIER_STYLES[app.lead_tier ?? "medium"]}`}>
                        {app.lead_tier?.replace("_", " ")}
                      </Badge>
                      <Badge variant="outline" className={`text-[8px] uppercase tracking-widest ${STATUS_STYLES[app.status]}`}>
                        {app.status}
                      </Badge>
                    </div>
                    <p className="text-on-surface-variant text-xs mt-0.5 truncate">
                      {app.profession ?? "—"} · {app.city ?? "—"} · Priority {app.priority_level ?? "—"}/10
                    </p>
                  </div>

                  <div className="text-right shrink-0 hidden sm:block">
                    <p className="text-on-surface-variant text-xs">{formatDate(app.created_at)}</p>
                    {app.phone && <p className="text-outline text-[10px]">{app.phone}</p>}
                  </div>

                  <span className={`material-symbols-outlined text-on-surface-variant text-lg transition-transform ${isExpanded ? "rotate-180" : ""}`}>expand_more</span>
                </button>

                {/* Expanded detail */}
                <div className={`grid transition-all duration-300 ${isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="overflow-hidden">
                    <div className="px-4 pb-4 border-t border-outline-variant/10 space-y-4">

                      {/* Contact + basics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3">
                        <Field label="Email" value={app.email} />
                        <Field label="Phone" value={app.phone} />
                        <Field label="Age" value={app.age} />
                        <Field label="Height" value={app.height} />
                        <Field label="Weight" value={app.weight} />
                        <Field label="Ethnicity" value={app.own_ethnicity} />
                        <Field label="Body Type" value={app.own_body_type} />
                        <Field label="Lead Score" value={app.lead_score} />
                        <Field label="Priority" value={app.priority_level ? `${app.priority_level}/10` : null} />
                      </div>

                      {/* Qualification answers */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-surface-container p-3 rounded-xl">
                          <p className="text-gold text-[10px] uppercase tracking-widest mb-1">Life Window</p>
                          <p className="text-on-surface text-sm">{LIFE_WINDOW_LABELS[app.life_window ?? ""] ?? app.life_window ?? "—"}</p>
                        </div>
                        <div className="bg-surface-container p-3 rounded-xl">
                          <p className="text-gold text-[10px] uppercase tracking-widest mb-1">Duration Unsatisfied</p>
                          <p className="text-on-surface text-sm">{DURATION_LABELS[app.duration ?? ""] ?? app.duration ?? "—"}</p>
                        </div>
                        <div className="bg-surface-container p-3 rounded-xl">
                          <p className="text-gold text-[10px] uppercase tracking-widest mb-1">What They&apos;ve Tried</p>
                          <p className="text-on-surface text-sm">{TRIED_LABELS[app.tried_before ?? ""] ?? app.tried_before ?? "—"}</p>
                        </div>
                        <div className="bg-surface-container p-3 rounded-xl">
                          <p className="text-gold text-[10px] uppercase tracking-widest mb-1">Current Results</p>
                          <p className="text-on-surface text-sm">{RESULTS_LABELS[app.current_results ?? ""] ?? app.current_results ?? "—"}</p>
                        </div>
                        <div className="bg-surface-container p-3 rounded-xl">
                          <p className="text-gold text-[10px] uppercase tracking-widest mb-1">6-Month Goal</p>
                          <p className="text-on-surface text-sm">{GOAL_LABELS[app.goal ?? ""] ?? app.goal ?? "—"}</p>
                        </div>
                        <div className="bg-surface-container p-3 rounded-xl">
                          <p className="text-gold text-[10px] uppercase tracking-widest mb-1">Timeline</p>
                          <p className="text-on-surface text-sm">{TIMELINE_LABELS[app.timeline ?? ""] ?? app.timeline ?? "—"}</p>
                        </div>
                      </div>

                      {/* Partner preferences */}
                      <div className="bg-surface-container p-3 rounded-xl space-y-2">
                        <p className="text-gold text-[10px] uppercase tracking-widest">What They Want</p>
                        {app.ideal_partner && <p className="text-on-surface text-sm leading-relaxed">{app.ideal_partner}</p>}
                        <div className="flex flex-wrap gap-3 text-xs text-on-surface-variant">
                          {app.her_age_min && app.her_age_max && <span>Age: {app.her_age_min}–{app.her_age_max}</span>}
                          {app.her_ethnicities && app.her_ethnicities.length > 0 && <span>Ethnicity: {app.her_ethnicities.join(", ")}</span>}
                          {app.her_body_types && app.her_body_types.length > 0 && <span>Body: {app.her_body_types.join(", ")}</span>}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 pt-2">
                        {app.status === "pending" && (
                          <>
                            <Button
                              onClick={() => handleActivate(app.id)}
                              disabled={isActivating}
                              className="gold-gradient text-on-gold font-semibold rounded-full text-xs"
                            >
                              {isActivating ? "Activating..." : "Activate — Send Invite Email"}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-full text-xs border-outline-variant/20 text-on-surface-variant"
                              onClick={async () => {
                                await fetch("/api/applications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: app.id, status: "rejected" }) });
                                toast.success("Application rejected");
                                router.refresh();
                              }}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {app.status === "activated" && (
                          <p className="text-green-400 text-xs flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}>check_circle</span>
                            Activated {app.activated_at ? formatDate(app.activated_at) : ""}
                          </p>
                        )}
                        {app.status === "rejected" && (
                          <p className="text-red-400 text-xs">Rejected</p>
                        )}
                        {app.status === "auto_disqualified" && (
                          <p className="text-red-400/60 text-xs flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>block</span>
                            Auto-disqualified: {app.biggest_challenge === "income_under_100k" ? "Income under $100K" : app.biggest_challenge === "not_in_shape" ? "Not in shape" : app.biggest_challenge ?? "Unknown reason"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-on-surface text-sm">{value ?? "—"}</p>
    </div>
  );
}
