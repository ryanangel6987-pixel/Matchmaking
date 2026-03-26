"use client";

import { useState, useMemo, type UIEvent } from "react";
import { UpcomingEngagements } from "@/components/dashboard/upcoming-engagements";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface DashboardMobileProps {
  dailyStats: any[];
  kpiSummary: any;
  allOpportunities: any[];
  actions: any[];
  datingApps: any[];
  photos: any[];
  accountHealth: any[];
}

type Period = "7d" | "30d" | "90d" | "all";

interface AggregatedMetrics {
  swipes: number;
  matches: number;
  conversations: number;
  datesClosed: number;
}


interface AppStats {
  appName: string;
  swipes: number;
  matches: number;
  conversations: number;
  dates_closed: number;
  match_rate: number;
  conversation_rate: number;
  close_rate: number;
}

// ─── HELPERS ────────────────────────────────────────────────────────────────

function aggregateStats(stats: any[]): AggregatedMetrics {
  let swipes = 0,
    matches = 0,
    conversations = 0,
    datesClosed = 0;
  for (const s of stats) {
    swipes += s.swipes ?? 0;
    matches += s.new_matches ?? 0;
    conversations += s.conversations ?? 0;
    datesClosed += s.dates_closed ?? 0;
  }
  return { swipes, matches, conversations, datesClosed };
}

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function trendPct(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 100);
}

function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}


// ─── MAIN COMPONENT ────────────────────────────────────────────────────────

export function DashboardMobile({
  dailyStats,
  kpiSummary,
  allOpportunities,
  actions,
  datingApps,
  photos,
  accountHealth,
}: DashboardMobileProps) {
  const [period, setPeriod] = useState<Period>("30d");
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    kpi: true,
    weekly: true,
    apps: true,
    alerts: true,
    upcoming: true,
    actions: true,
  });

  const toggleSection = (key: string) =>
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));

  // ── Filter daily stats by selected period ──────────────────────────────
  const { currentStats, previousStats } = useMemo(() => {
    const now = new Date();
    const days =
      period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 90 : 0;

    if (days === 0) {
      return { currentStats: dailyStats, previousStats: [] as any[] };
    }

    const currentCutoff = new Date(now);
    currentCutoff.setDate(currentCutoff.getDate() - days);
    const previousCutoff = new Date(currentCutoff);
    previousCutoff.setDate(previousCutoff.getDate() - days);

    const current = dailyStats.filter(
      (s) => new Date(s.stat_date) >= currentCutoff
    );
    const previous = dailyStats.filter(
      (s) =>
        new Date(s.stat_date) >= previousCutoff &&
        new Date(s.stat_date) < currentCutoff
    );

    return { currentStats: current, previousStats: previous };
  }, [dailyStats, period]);

  const currentMetrics = useMemo(
    () => aggregateStats(currentStats),
    [currentStats]
  );
  const previousMetrics = useMemo(
    () => aggregateStats(previousStats),
    [previousStats]
  );

  const approvedCount = allOpportunities.filter(
    (o) => o.client_decision === "approved"
  ).length;

  const appStatsArray = useMemo(() => {
    const byApp: Record<string, AppStats> = {};
    for (const stat of currentStats) {
      const appName = stat.dating_apps?.app_name ?? "Unknown";
      if (!byApp[appName]) {
        byApp[appName] = {
          appName,
          swipes: 0,
          matches: 0,
          conversations: 0,
          dates_closed: 0,
          match_rate: 0,
          conversation_rate: 0,
          close_rate: 0,
        };
      }
      byApp[appName].swipes += stat.swipes ?? 0;
      byApp[appName].matches += stat.new_matches ?? 0;
      byApp[appName].conversations += stat.conversations ?? 0;
      byApp[appName].dates_closed += stat.dates_closed ?? 0;
    }
    for (const app of Object.values(byApp)) {
      app.match_rate = app.swipes > 0 ? app.matches / app.swipes : 0;
      app.conversation_rate =
        app.matches > 0 ? app.conversations / app.matches : 0;
      app.close_rate =
        app.conversations > 0 ? app.dates_closed / app.conversations : 0;
    }
    return Object.values(byApp).sort(
      (a, b) => b.dates_closed - a.dates_closed
    );
  }, [currentStats]);

  const [expandedClosedId, setExpandedClosedId] = useState<string | null>(null);
  const [mobileViewerOpp, setMobileViewerOpp] = useState<any | null>(null);

  const recentlyClosed = useMemo(
    () =>
      allOpportunities
        .filter((o: any) => o.status !== "lead")
        .sort(
          (a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ),
    [allOpportunities]
  );

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const approvedOpportunities = allOpportunities.filter(
    (o) => o.client_decision === "approved" && o.client_decision_at && o.client_decision_at >= sevenDaysAgo
  );

  // ── Intelligence alerts from account health + kpi ────────────────────
  const alerts = useMemo(() => {
    const items: { icon: string; text: string; severity: "red" | "yellow" | "green" }[] = [];

    const problemAccounts = accountHealth.filter(
      (ah) => ah.status === "shadowbanned" || ah.status === "banned"
    );
    for (const ah of problemAccounts) {
      items.push({
        icon: "warning",
        text: `${ah.dating_apps?.app_name ?? "App"} — ${ah.status === "banned" ? "Banned" : "Shadowbanned"}`,
        severity: ah.status === "banned" ? "red" : "yellow",
      });
    }

    const matchRate =
      currentMetrics.swipes > 0
        ? currentMetrics.matches / currentMetrics.swipes
        : 0;
    if (matchRate < 0.03 && currentMetrics.swipes > 50) {
      items.push({
        icon: "trending_down",
        text: "Match rate below 3% — consider refreshing photos",
        severity: "yellow",
      });
    }

    const livePhotos = photos.filter((p) => p.status === "live").length;
    if (livePhotos < 3) {
      items.push({
        icon: "photo_camera",
        text: `Only ${livePhotos} live photo${livePhotos !== 1 ? "s" : ""} — upload more for better results`,
        severity: "yellow",
      });
    }

    if (items.length === 0) {
      items.push({
        icon: "check_circle",
        text: "All systems healthy — no issues detected",
        severity: "green",
      });
    }

    return items;
  }, [accountHealth, currentMetrics, photos]);

  // ─── RENDER ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-[24px] font-heading font-bold text-gold tracking-tight">
          Dashboard
        </h1>
        <div className="h-px w-16 mt-1 bg-gradient-to-r from-gold to-transparent" />
      </div>

      {/* ═══ 1. PERIOD SELECTOR ═════════════════════════════════════════════ */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
        {(
          [
            { key: "7d", label: "7 Days" },
            { key: "30d", label: "30 Days" },
            { key: "90d", label: "90 Days" },
            { key: "all", label: "All Time" },
          ] as { key: Period; label: string }[]
        ).map((opt) => (
          <button
            key={opt.key}
            onClick={() => setPeriod(opt.key)}
            className={`flex-shrink-0 min-h-[48px] px-5 py-3 rounded-full text-[13px] font-heading font-semibold uppercase tracking-widest transition-all duration-200 ${
              period === opt.key
                ? "bg-gradient-to-r from-gold to-[#c9a96e] text-[#131313] shadow-lg shadow-gold/20"
                : "bg-surface-container-low text-on-surface-variant active:bg-surface-container-low/80"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* ═══ 2. KPI CARDS — vertical stack ══════════════════════════════════ */}
      <CollapsibleSection
        title="Key Metrics"
        icon="analytics"
        expanded={expandedSections.kpi}
        onToggle={() => toggleSection("kpi")}
      >
        <div className="space-y-3">
          <MobileKpiCard
            icon="swipe"
            label="Swipes"
            value={currentMetrics.swipes}
            prev={previousMetrics.swipes}
          />
          <MobileKpiCard
            icon="favorite"
            label="Matches"
            value={currentMetrics.matches}
            prev={previousMetrics.matches}
          />
          <MobileKpiCard
            icon="chat"
            label="Conversations"
            value={currentMetrics.conversations}
            prev={previousMetrics.conversations}
          />
          <MobileKpiCard
            icon="event_available"
            label="Dates Closed"
            value={currentMetrics.datesClosed}
            prev={previousMetrics.datesClosed}
          />
          <MobileKpiCard
            icon="verified"
            label="Dates Approved"
            value={approvedCount}
            prev={null}
            highlight
          />
        </div>
      </CollapsibleSection>

      {/* ═══ 3. UPCOMING ENGAGEMENTS ═════════════════════════════════════════ */}
      <UpcomingEngagements opportunities={approvedOpportunities} />

      {/* ═══ 4. RECENTLY CLOSED DATES ════════════════════════════════════════ */}
      <CollapsibleSection
        title="Recently Closed"
        icon="event_busy"
        expanded={expandedSections.weekly}
        onToggle={() => toggleSection("weekly")}
      >
        {recentlyClosed.length === 0 ? (
          <p className="text-on-surface-variant text-[13px] py-4 text-center">
            No closed date opportunities yet.
          </p>
        ) : (
          <div className="space-y-3">
            {recentlyClosed.map((opp: any) => (
              <RecentlyClosedMobileCard
                key={opp.id}
                opp={opp}
                expanded={expandedClosedId === opp.id}
                onToggle={() =>
                  setExpandedClosedId(
                    expandedClosedId === opp.id ? null : opp.id
                  )
                }
              />
            ))}
          </div>
        )}
      </CollapsibleSection>

      {/* ═══ 5. ACTIONS ═════════════════════════════════════════════════════ */}
      {actions.length > 0 && (
        <CollapsibleSection
          title="Action Required"
          icon="checklist"
          expanded={expandedSections.actions}
          onToggle={() => toggleSection("actions")}
        >
          <div className="space-y-2">
            {actions.map((action: any) => {
              const isOverdue =
                action.due_date && new Date(action.due_date) < new Date();
              const priorityColor =
                action.priority === "urgent"
                  ? "bg-red-400"
                  : action.priority === "high"
                    ? "bg-yellow-400"
                    : "bg-emerald-400";
              return (
                <div
                  key={action.id}
                  className="bg-surface-container-low rounded-xl p-4 flex items-start gap-3 min-h-[48px]"
                >
                  <div
                    className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5 ${priorityColor}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-on-surface text-[14px] font-medium leading-snug">
                      {action.title}
                    </p>
                    {action.due_date && (
                      <p
                        className={`text-[13px] mt-0.5 ${
                          isOverdue ? "text-red-400" : "text-on-surface-variant"
                        }`}
                      >
                        {isOverdue ? "Overdue — " : "Due "}
                        {new Date(action.due_date).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
}

// ─── COMPONENT: Collapsible Section ────────────────────────────────────────

function CollapsibleSection({
  title,
  icon,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  icon: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section>
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full min-h-[48px] py-2 active:opacity-70"
      >
        <div className="flex items-center gap-2">
          <span
            className="material-symbols-outlined text-gold text-base"
            style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}
          >
            {icon}
          </span>
          <h2 className="text-on-surface-variant text-[13px] uppercase tracking-widest font-semibold">
            {title}
          </h2>
        </div>
        <span
          className={`material-symbols-outlined text-on-surface-variant text-lg transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
        >
          expand_more
        </span>
      </button>
      {expanded && <div className="mt-2">{children}</div>}
    </section>
  );
}

// ─── COMPONENT: Mobile KPI Card ────────────────────────────────────────────

function MobileKpiCard({
  icon,
  label,
  value,
  prev,
  highlight,
}: {
  icon: string;
  label: string;
  value: number;
  prev: number | null;
  highlight?: boolean;
}) {
  const trend = prev !== null ? trendPct(value, prev) : null;

  return (
    <div
      className={`w-full rounded-xl p-4 flex items-center gap-4 min-h-[64px] ${
        highlight
          ? "bg-gold/10 border border-gold/20"
          : "bg-surface-container-low"
      }`}
    >
      {/* Icon */}
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
          highlight ? "bg-gold/20" : "bg-surface-container-low"
        }`}
      >
        <span
          className={`material-symbols-outlined text-lg ${
            highlight ? "text-gold" : "text-on-surface-variant"
          }`}
          style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}
        >
          {icon}
        </span>
      </div>

      {/* Label */}
      <div className="flex-1 min-w-0">
        <p className="text-on-surface-variant text-[13px] uppercase tracking-wider">
          {label}
        </p>
      </div>

      {/* Value + Trend */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <p
          className={`font-heading text-[24px] font-bold ${
            highlight ? "text-gold" : "text-on-surface"
          }`}
        >
          {fmtNum(value)}
        </p>
        {trend !== null && (
          <span
            className={`material-symbols-outlined text-lg ${
              trend >= 0 ? "text-emerald-400" : "text-red-400"
            }`}
            style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}
          >
            {trend >= 0 ? "trending_up" : "trending_down"}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── COMPONENT: Recently Closed Mobile Card ────────────────────────────────

function RecentlyClosedMobileCard({
  opp,
  expanded,
  onToggle,
}: {
  opp: any;
  expanded: boolean;
  onToggle: () => void;
}) {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const decision = opp.client_decision as string;
  const badgeClass =
    decision === "approved"
      ? "bg-gold/15 text-gold border border-gold/30"
      : decision === "declined"
        ? "bg-red-400/15 text-red-400 border border-red-400/30"
        : "bg-outline-variant/20 text-on-surface-variant border border-outline-variant/20";
  const badgeLabel =
    decision === "approved"
      ? "Approved"
      : decision === "declined"
        ? "Declined"
        : "Pending";

  const dateStr = opp.proposed_day
    ? new Date(opp.proposed_day).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : "Date TBD";

  const photoUrl = opp.candidate_photo_url || (opp.candidate_photos && opp.candidate_photos[0]);
  const allPhotos = buildMobilePhotoList(opp);

  return (
    <div className="bg-surface-container-low rounded-xl overflow-hidden">
      {/* Collapsed -- touch-friendly 48px min height */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 p-4 min-h-[48px] text-left active:opacity-70"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Photo thumbnail */}
          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-transparent">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={opp.candidate_name ?? "Candidate"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gold/10 flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-gold text-lg"
                  style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}
                >
                  person
                </span>
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-on-surface text-[14px] font-heading font-semibold truncate">
              {opp.candidate_name}
              {opp.candidate_age && (
                <span className="text-on-surface-variant font-normal ml-1 text-[13px]">
                  {opp.candidate_age}
                </span>
              )}
            </p>
            <p className="text-on-surface-variant text-[13px]">{dateStr}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase tracking-widest font-bold ${badgeClass}`}
          >
            {badgeLabel}
          </span>
          <span
            className={`material-symbols-outlined text-on-surface-variant text-lg transition-transform duration-200 ${
              expanded ? "rotate-180" : ""
            }`}
          >
            expand_more
          </span>
        </div>
      </button>

      {/* Expanded details */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          expanded
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pt-0 border-t border-outline-variant/10">
            {/* Photo gallery when expanded */}
            {allPhotos.length > 0 && (
              <div className="pt-3">
                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden">
                  <div
                    className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-none"
                    onScroll={(e: UIEvent<HTMLDivElement>) => {
                      const el = e.currentTarget;
                      const idx = Math.round(el.scrollLeft / el.clientWidth);
                      setActivePhotoIndex(idx);
                    }}
                  >
                    {allPhotos.map((url, i) => (
                      <div key={i} className="w-full h-full flex-shrink-0 snap-center">
                        <img
                          src={url}
                          alt={`${opp.candidate_name ?? "Candidate"} photo ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                {allPhotos.length > 1 && (
                  <div className="flex justify-center gap-1.5 mt-2">
                    {allPhotos.map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full transition-all duration-200 ${
                          i === activePhotoIndex ? "bg-gold w-4" : "bg-outline-variant/40"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-3">
              <MobileDetailField label="Candidate" value={opp.candidate_name} />
              <MobileDetailField
                label="Age"
                value={opp.candidate_age ? String(opp.candidate_age) : "\u2014"}
              />
              {opp.candidate_profession && (
                <MobileDetailField label="Profession" value={opp.candidate_profession} />
              )}
              {opp.candidate_location && (
                <MobileDetailField label="Location" value={opp.candidate_location} />
              )}
              {opp.candidate_education && (
                <MobileDetailField label="Education" value={opp.candidate_education} />
              )}
              <MobileDetailField
                label="Source App"
                value={opp.dating_apps?.app_name ?? "\u2014"}
              />
              <MobileDetailField label="Day" value={dateStr} />
              <MobileDetailField
                label="Time"
                value={opp.proposed_time ?? "\u2014"}
              />
              <MobileDetailField
                label="Venue"
                value={opp.venues?.venue_name ?? "\u2014"}
              />
              <MobileDetailField
                label="Phone"
                value={opp.phone_number ?? "\u2014"}
              />
            </div>

            {opp.memorable_detail && (
              <div className="mt-3">
                <p className="text-on-surface-variant text-[11px] uppercase tracking-widest mb-1">
                  Memorable Detail
                </p>
                <p className="text-on-surface text-[13px] leading-relaxed">
                  {opp.memorable_detail}
                </p>
              </div>
            )}

            {opp.notes && (
              <div className="mt-3">
                <p className="text-on-surface-variant text-[11px] uppercase tracking-widest mb-1">
                  Matchmaker Notes
                </p>
                <p className="text-on-surface text-[13px] leading-relaxed">
                  {opp.notes}
                </p>
              </div>
            )}

            {opp.prewritten_text && (
              <div className="mt-3">
                <p className="text-on-surface-variant text-[11px] uppercase tracking-widest mb-1">
                  Prewritten Text
                </p>
                <p className="text-on-surface text-[13px] leading-relaxed bg-surface-container-low/50 rounded-lg p-3 border border-outline-variant/10">
                  {opp.prewritten_text}
                </p>
              </div>
            )}

            {decision === "declined" && opp.decline_reason && (
              <div className="mt-3 bg-red-400/5 border border-red-400/15 rounded-lg p-3">
                <p className="text-red-400 text-[11px] uppercase tracking-widest mb-1">
                  Decline Reason
                </p>
                <p className="text-on-surface text-[13px] leading-relaxed">
                  {opp.decline_reason}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileDetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-on-surface-variant text-[11px] uppercase tracking-widest mb-0.5">
        {label}
      </p>
      <p className="text-on-surface text-[14px] font-medium">{value}</p>
    </div>
  );
}

function MiniMetric({
  label,
  value,
  prev,
}: {
  label: string;
  value: number;
  prev: number | null;
}) {
  const trend = prev !== null ? trendPct(value, prev) : null;

  return (
    <div>
      <p className="text-on-surface-variant text-[13px]">{label}</p>
      <div className="flex items-baseline gap-1.5">
        <p className="text-on-surface font-heading font-bold text-[16px]">
          {fmtNum(value)}
        </p>
        {trend !== null && (
          <span
            className={`text-[11px] font-semibold ${
              trend >= 0 ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {trend >= 0 ? "+" : ""}
            {trend}%
          </span>
        )}
      </div>
    </div>
  );
}

// ─── COMPONENT: Per-App Mobile Card ────────────────────────────────────────

function PerAppMobileCard({
  app,
  status,
}: {
  app: AppStats;
  status: string;
}) {
  const statusColor =
    status === "active"
      ? "bg-emerald-400"
      : status === "shadowbanned"
        ? "bg-yellow-400"
        : status === "banned"
          ? "bg-red-400"
          : "bg-on-surface-variant";
  const statusLabel =
    status === "active"
      ? "Active"
      : status === "shadowbanned"
        ? "Shadowbanned"
        : status === "banned"
          ? "Banned"
          : status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <div className="bg-surface-container-low rounded-xl p-4">
      {/* App name + status */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-on-surface text-[16px] font-heading font-semibold">
          {app.appName}
        </h3>
        <span className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${statusColor}`} />
          <span className="text-on-surface-variant text-[13px]">
            {statusLabel}
          </span>
        </span>
      </div>

      {/* 2x2 metrics grid */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <MiniMetric label="Swipes" value={app.swipes} prev={null} />
        <MiniMetric label="Matches" value={app.matches} prev={null} />
        <MiniMetric label="Convos" value={app.conversations} prev={null} />
        <MiniMetric label="Closed" value={app.dates_closed} prev={null} />
      </div>

      {/* Rates */}
      <div className="flex items-center gap-4 pt-2 border-t border-outline-variant/10">
        <RateDot label="Match" value={pct(app.match_rate)} color="text-gold" />
        <RateDot
          label="Conv"
          value={pct(app.conversation_rate)}
          color="text-emerald-400"
        />
        <RateDot
          label="Close"
          value={pct(app.close_rate)}
          color="text-sky-400"
        />
      </div>
    </div>
  );
}

function RateDot({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-1.5 h-1.5 rounded-full ${color} bg-current`} />
      <span className="text-on-surface-variant text-[13px]">
        {label}:{" "}
        <span className={`font-semibold ${color}`}>{value}</span>
      </span>
    </div>
  );
}

// ─── COMPONENT: Mobile Candidate Photo Viewer ──────────────────────────────

function MobileCandidateViewer({ opp, onClose }: { opp: any; onClose: () => void }) {
  const photos = buildMobilePhotoList(opp);
  const [activeIndex, setActiveIndex] = useState(0);

  const heightDisplay = opp.candidate_height_inches
    ? `${Math.floor(opp.candidate_height_inches / 12)}'${opp.candidate_height_inches % 12}"`
    : null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-[#1a1a1a] rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <div className="flex justify-end p-3 pb-0">
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-surface-container-low active:bg-outline-variant/20 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-on-surface-variant text-lg">
              close
            </span>
          </button>
        </div>

        {/* Photo gallery */}
        {photos.length > 0 ? (
          <div className="px-4">
            <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden">
              <div
                className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-none"
                onScroll={(e: UIEvent<HTMLDivElement>) => {
                  const el = e.currentTarget;
                  const idx = Math.round(el.scrollLeft / el.clientWidth);
                  setActiveIndex(idx);
                }}
              >
                {photos.map((url, i) => (
                  <div key={i} className="w-full h-full flex-shrink-0 snap-center">
                    <img
                      src={url}
                      alt={`${opp.candidate_name ?? "Candidate"} photo ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
            {photos.length > 1 && (
              <div className="flex justify-center gap-1.5 mt-3">
                {photos.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      i === activeIndex ? "bg-gold w-4" : "bg-outline-variant/40"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="mx-4 aspect-[3/4] rounded-xl bg-gold/5 flex items-center justify-center">
            <span
              className="material-symbols-outlined text-gold/40 text-6xl"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}
            >
              person
            </span>
          </div>
        )}

        {/* Candidate details */}
        <div className="p-5 space-y-4">
          <div>
            <h3 className="text-on-surface text-xl font-heading font-bold">
              {opp.candidate_name}
              {opp.candidate_age && (
                <span className="text-on-surface-variant font-normal text-base ml-2">
                  {opp.candidate_age}
                </span>
              )}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {opp.candidate_profession && (
              <MobileDetailField label="Profession" value={opp.candidate_profession} />
            )}
            {opp.candidate_location && (
              <MobileDetailField label="Location" value={opp.candidate_location} />
            )}
            {opp.candidate_education && (
              <MobileDetailField label="Education" value={opp.candidate_education} />
            )}
            {heightDisplay && (
              <MobileDetailField label="Height" value={heightDisplay} />
            )}
            {opp.candidate_ethnicity && (
              <MobileDetailField label="Ethnicity" value={opp.candidate_ethnicity} />
            )}
            {opp.candidate_has_kids !== null && opp.candidate_has_kids !== undefined && (
              <MobileDetailField label="Has Kids" value={opp.candidate_has_kids ? "Yes" : "No"} />
            )}
          </div>

          {opp.memorable_detail && (
            <div>
              <p className="text-on-surface-variant text-[11px] uppercase tracking-widest mb-1">
                Memorable Detail
              </p>
              <p className="text-on-surface text-[13px] leading-relaxed">{opp.memorable_detail}</p>
            </div>
          )}

          {opp.notes && (
            <div>
              <p className="text-on-surface-variant text-[11px] uppercase tracking-widest mb-1">
                Matchmaker Notes
              </p>
              <p className="text-on-surface text-[13px] leading-relaxed">{opp.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function buildMobilePhotoList(opp: any): string[] {
  const photos: string[] = [];
  if (opp.candidate_photo_url) photos.push(opp.candidate_photo_url);
  if (Array.isArray(opp.candidate_photos)) {
    for (const p of opp.candidate_photos) {
      if (p && !photos.includes(p)) photos.push(p);
    }
  }
  return photos;
}
