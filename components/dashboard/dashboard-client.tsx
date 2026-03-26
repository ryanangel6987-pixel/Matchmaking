"use client";

import { useState, useMemo } from "react";
import { IntelligenceSuggestions } from "@/components/dashboard/intelligence-suggestions";
import { DiagnosisBlock } from "@/components/dashboard/diagnosis-block";
import { UpcomingEngagements } from "@/components/dashboard/upcoming-engagements";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface DashboardClientProps {
  dailyStats: any[];
  kpiSummary: any;
  allOpportunities: any[];
  actions: any[];
  datingApps: any[];
  photos: any[];
  accountHealth: any[];
}

export interface AppStats {
  appName: string;
  swipes: number;
  matches: number;
  conversations: number;
  dates_closed: number;
  match_rate: number;
  conversation_rate: number;
  close_rate: number;
}

type Period = "7d" | "30d" | "90d" | "all";

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────

export function DashboardClient({
  dailyStats,
  kpiSummary,
  allOpportunities,
  actions,
  datingApps,
  photos,
  accountHealth,
}: DashboardClientProps) {
  const [period, setPeriod] = useState<Period>("30d");
  const [expandedClosedId, setExpandedClosedId] = useState<string | null>(null);

  // ── Filter daily stats by selected period ──────────────────────────────
  const { currentStats, previousStats } = useMemo(() => {
    const now = new Date();
    const days = period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 90 : 0;

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

  // ── Aggregate metrics for current period ───────────────────────────────
  const currentMetrics = useMemo(() => aggregateStats(currentStats), [currentStats]);
  const previousMetrics = useMemo(() => aggregateStats(previousStats), [previousStats]);

  // ── Opportunities filtered by period ───────────────────────────────────
  const periodOpportunities = useMemo(() => {
    if (period === "all") return allOpportunities;
    const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return allOpportunities.filter(
      (o) => o.client_decision_at && new Date(o.client_decision_at) >= cutoff
    );
  }, [allOpportunities, period]);

  // ── Per-app stats for current period ───────────────────────────────────
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
    return Object.values(byApp).sort((a, b) => b.dates_closed - a.dates_closed);
  }, [currentStats]);

  // ── Dates approved (from allOpportunities, always) ─────────────────────
  const approvedCount = allOpportunities.filter(
    (o) => o.client_decision === "approved"
  ).length;
  const declinedCount = allOpportunities.filter(
    (o) => o.client_decision === "declined"
  ).length;
  const pendingCount = allOpportunities.filter(
    (o) => o.client_decision === "pending"
  ).length;

  // ── Funnel data ────────────────────────────────────────────────────────
  const funnelStages = [
    { label: "Swipes", value: currentMetrics.swipes, icon: "swipe" },
    { label: "Matches", value: currentMetrics.matches, icon: "favorite" },
    {
      label: "Conversations",
      value: currentMetrics.conversations,
      icon: "chat",
    },
    {
      label: "Dates Closed",
      value: currentMetrics.datesClosed,
      icon: "event_available",
    },
    { label: "Dates Approved", value: approvedCount, icon: "verified" },
  ];

  // ── Recently closed (status != 'lead') sorted newest first ───────────
  const recentlyClosed = useMemo(
    () =>
      allOpportunities
        .filter((o) => o.status !== "lead")
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ),
    [allOpportunities]
  );

  // ── Trend chart data ───────────────────────────────────────────────────
  const trendData = useMemo(() => {
    const byDate: Record<string, number> = {};
    for (const stat of currentStats) {
      const d = stat.stat_date;
      byDate[d] = (byDate[d] ?? 0) + (stat.new_matches ?? 0);
    }
    const entries = Object.entries(byDate).sort(
      (a, b) => a[0].localeCompare(b[0])
    );
    // Limit to last 30 entries
    return entries.slice(-30);
  }, [currentStats]);

  // ── Health Score ───────────────────────────────────────────────────────
  const healthScore = useMemo(
    () =>
      computeHealthScore(
        currentMetrics,
        photos,
        accountHealth,
        kpiSummary
      ),
    [currentMetrics, photos, accountHealth, kpiSummary]
  );

  // ── Profile Strength ──────────────────────────────────────────────────
  const profileStrength = useMemo(
    () => computeProfileStrength(photos, accountHealth, kpiSummary),
    [photos, accountHealth, kpiSummary]
  );

  // ── Upcoming engagements — approved in last 7 days ─────────────────────
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const approvedOpportunities = allOpportunities.filter(
    (o) => o.client_decision === "approved" && o.client_decision_at && o.client_decision_at >= sevenDaysAgo
  );

  // ── Best app ──────────────────────────────────────────────────────────
  const bestApp =
    appStatsArray.length > 0 ? appStatsArray[0].appName : null;

  // ── Decision speed ─────────────────────────────────────────────────────
  const avgDecisionDays = useMemo(() => {
    const decided = allOpportunities.filter(
      (o) =>
        o.client_decision !== "pending" &&
        o.client_decision_at &&
        o.proposed_day
    );
    if (decided.length === 0) return null;
    let totalDays = 0;
    for (const o of decided) {
      const proposed = new Date(o.proposed_day);
      const decided_at = new Date(o.client_decision_at);
      totalDays += Math.max(
        0,
        (decided_at.getTime() - proposed.getTime()) / (1000 * 60 * 60 * 24)
      );
    }
    return (totalDays / decided.length).toFixed(1);
  }, [allOpportunities]);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-heading font-bold text-gold tracking-tight">
          Dashboard
        </h1>
        <div className="h-px w-20 bg-gradient-to-r from-gold to-transparent" />
      </div>

      {/* ═══ 1. PERIOD SELECTOR ═══════════════════════════════════════════ */}
      <div className="flex flex-wrap gap-2">
        {(
          [
            { key: "7d", label: "Last 7 Days" },
            { key: "30d", label: "Last 30 Days" },
            { key: "90d", label: "Last 90 Days" },
            { key: "all", label: "All Time" },
          ] as { key: Period; label: string }[]
        ).map((opt) => (
          <button
            key={opt.key}
            onClick={() => setPeriod(opt.key)}
            className={`px-4 py-2 rounded-full text-xs font-heading font-semibold uppercase tracking-widest transition-all duration-300 ${
              period === opt.key
                ? "bg-gradient-to-r from-gold to-[#c9a96e] text-[#131313] shadow-lg shadow-gold/20"
                : "bg-surface-container-low text-on-surface-variant hover:text-gold hover:bg-surface-container-low/80"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* ═══ 2. EXECUTIVE SUMMARY CARDS ═══════════════════════════════════ */}
      <section className="space-y-4">
        <h2 className="text-on-surface-variant text-xs uppercase tracking-widest">
          Executive Summary
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <ExecCard
            label="Total Swipes"
            value={currentMetrics.swipes}
            prev={previousMetrics.swipes}
            icon="swipe"
          />
          <ExecCard
            label="Total Matches"
            value={currentMetrics.matches}
            prev={previousMetrics.matches}
            icon="favorite"
          />
          <ExecCard
            label="Conversations"
            value={currentMetrics.conversations}
            prev={previousMetrics.conversations}
            icon="chat"
          />
          <ExecCard
            label="Dates Closed"
            value={currentMetrics.datesClosed}
            prev={previousMetrics.datesClosed}
            icon="event_available"
          />
          <ExecCard
            label="Dates Approved"
            value={approvedCount}
            prev={null}
            icon="verified"
            highlight
          />
        </div>
      </section>

      {/* ═══ 3. UPCOMING ENGAGEMENTS ═════════════════════════════════════ */}
      <UpcomingEngagements opportunities={approvedOpportunities} />

      {/* ═══ 4. RECENTLY CLOSED DATES ═══════════════════════════════════ */}
      <section className="space-y-4">
        <h2 className="text-on-surface-variant text-xs uppercase tracking-widest flex items-center gap-2">
          <span
            className="material-symbols-outlined text-gold text-base"
            style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}
          >
            event_busy
          </span>
          Recently Closed Dates
        </h2>
        {recentlyClosed.length === 0 ? (
          <p className="text-on-surface-variant text-sm text-center py-8">
            No closed date opportunities yet.
          </p>
        ) : (
          <div className="space-y-3">
            {recentlyClosed.map((opp: any) => (
              <RecentlyClosedCard
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
      </section>

      {/* ═══ 5. TREND CHART ═══════════════════════════════════════════════ */}
      <section className="space-y-4">
        <h2 className="text-on-surface-variant text-xs uppercase tracking-widest flex items-center gap-2">
          <span
            className="material-symbols-outlined text-gold text-base"
            style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}
          >
            trending_up
          </span>
          Daily Matches Trend
        </h2>
        <div className="bg-surface-container-low p-6 rounded-2xl shadow-xl overflow-x-auto">
          <TrendChart data={trendData} />
        </div>
      </section>

      {/* ═══ 7. ACTION REQUIRED ══════════════════════════════════════════ */}
      {actions.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-on-surface-variant text-xs uppercase tracking-widest flex items-center gap-2">
            <span
              className="material-symbols-outlined text-gold text-base"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}
            >
              checklist
            </span>
            Action Required
          </h2>
          <div className="space-y-3">
            {actions.map((action: any) => {
              const isOverdue =
                action.due_date && new Date(action.due_date) < new Date();
              return (
                <div
                  key={action.id}
                  className="bg-surface-container-low p-4 rounded-xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`material-symbols-outlined text-lg ${
                        isOverdue ? "text-red-400" : "text-gold"
                      }`}
                      style={{
                        fontVariationSettings: "'FILL' 1, 'wght' 400",
                      }}
                    >
                      {action.priority === "urgent"
                        ? "priority_high"
                        : "task_alt"}
                    </span>
                    <p className="text-on-surface text-sm font-medium">
                      {action.title}
                    </p>
                  </div>
                  {action.due_date && (
                    <span
                      className={`text-xs ${
                        isOverdue ? "text-red-400" : "text-gold"
                      }`}
                    >
                      {isOverdue ? "Overdue — " : ""}
                      {new Date(action.due_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

// ─── HELPER: Aggregate stats ─────────────────────────────────────────────────

interface AggregatedMetrics {
  swipes: number;
  matches: number;
  conversations: number;
  datesClosed: number;
}

function aggregateStats(stats: any[]): AggregatedMetrics {
  let swipes = 0;
  let matches = 0;
  let conversations = 0;
  let datesClosed = 0;
  for (const s of stats) {
    swipes += s.swipes ?? 0;
    matches += s.new_matches ?? 0;
    conversations += s.conversations ?? 0;
    datesClosed += s.dates_closed ?? 0;
  }
  return { swipes, matches, conversations, datesClosed };
}

// (Weekly summary removed — replaced by Recently Closed)

// ─── HELPER: Compute health score ───────────────────────────────────────────

function computeHealthScore(
  metrics: AggregatedMetrics,
  photos: any[],
  accountHealth: any[],
  kpiSummary: any
): number {
  let score = 0;
  const matchRate = metrics.swipes > 0 ? metrics.matches / metrics.swipes : 0;
  const convRate =
    metrics.matches > 0 ? metrics.conversations / metrics.matches : 0;
  const closeRate =
    metrics.conversations > 0
      ? metrics.datesClosed / metrics.conversations
      : 0;

  // Match rate: 0-35 points
  if (matchRate >= 0.1) score += 35;
  else if (matchRate >= 0.05) score += 25;
  else if (matchRate > 0) score += 10;

  // Conversation rate: 0-25 points
  if (convRate >= 0.3) score += 25;
  else if (convRate >= 0.15) score += 18;
  else if (convRate > 0) score += 8;

  // Close rate: 0-20 points
  if (closeRate >= 0.15) score += 20;
  else if (closeRate >= 0.08) score += 14;
  else if (closeRate > 0) score += 6;

  // Photos: 0-10 points
  const livePhotos = photos.filter((p) => p.status === "live").length;
  score += Math.min(10, livePhotos * 2);

  // Account health: 0-10 points
  const problemAccounts = accountHealth.filter(
    (ah) => ah.status === "shadowbanned" || ah.status === "banned"
  );
  if (accountHealth.length > 0 && problemAccounts.length === 0) score += 10;
  else if (problemAccounts.length === 0) score += 5;

  return Math.min(100, score);
}

// ─── HELPER: Profile Strength ───────────────────────────────────────────────

interface ProfileStrengthData {
  total: number;
  photosUploaded: number;
  photosLive: number;
  accountHealthScore: number;
  matchRateScore: number;
  closeRateScore: number;
  recommendations: string[];
}

function computeProfileStrength(
  photos: any[],
  accountHealth: any[],
  kpiSummary: any
): ProfileStrengthData {
  const recommendations: string[] = [];

  // Photos uploaded: 0-20 points (5 photos = max)
  const photosUploaded = Math.min(20, photos.length * 4);
  if (photos.length < 5)
    recommendations.push(
      `Upload ${5 - photos.length} more photo${5 - photos.length > 1 ? "s" : ""} to strengthen your profile`
    );

  // Photos live: 0-30 points
  const livePhotos = photos.filter((p) => p.status === "live").length;
  const photosLive = Math.min(30, livePhotos * 6);
  if (livePhotos < 5)
    recommendations.push("Get more photos approved and set to live");

  // Account health: 0-20 points
  const problemAccounts = accountHealth.filter(
    (ah) =>
      ah.status === "shadowbanned" ||
      ah.status === "banned" ||
      ah.status === "needs_verification"
  );
  const accountHealthScore =
    accountHealth.length === 0
      ? 10
      : problemAccounts.length === 0
        ? 20
        : Math.max(0, 20 - problemAccounts.length * 10);
  if (problemAccounts.length > 0)
    recommendations.push("Resolve account health issues on flagged apps");

  // Match rate: 0-15 points
  const matchRate = kpiSummary?.match_rate ?? 0;
  const matchRateScore = Math.min(15, Math.round(matchRate * 150));
  if (matchRate < 0.05)
    recommendations.push(
      "Improve match rate by refreshing photos and bio"
    );

  // Close rate: 0-15 points
  const closeRate = kpiSummary?.close_rate ?? 0;
  const closeRateScore = Math.min(15, Math.round(closeRate * 150));
  if (closeRate < 0.05)
    recommendations.push(
      "Increase close rate with stronger date proposals"
    );

  const total =
    photosUploaded +
    photosLive +
    accountHealthScore +
    matchRateScore +
    closeRateScore;

  return {
    total: Math.min(100, total),
    photosUploaded,
    photosLive,
    accountHealthScore,
    matchRateScore,
    closeRateScore,
    recommendations,
  };
}

// ─── HELPER: Trend calculation ──────────────────────────────────────────────

function trendPct(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 100);
}

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

// ─── COMPONENT: Executive Summary Card ──────────────────────────────────────

function ExecCard({
  label,
  value,
  prev,
  icon,
  highlight,
}: {
  label: string;
  value: number;
  prev: number | null;
  icon: string;
  highlight?: boolean;
}) {
  const trend = prev !== null ? trendPct(value, prev) : null;

  return (
    <div
      className={`p-5 rounded-2xl shadow-xl transition-all duration-300 hover:scale-[1.02] ${
        highlight
          ? "bg-gold/10 border border-gold/20"
          : "bg-surface-container-low"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`material-symbols-outlined text-base ${
            highlight ? "text-gold" : "text-on-surface-variant"
          }`}
          style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}
        >
          {icon}
        </span>
        <p className="text-on-surface-variant text-[10px] uppercase tracking-widest">
          {label}
        </p>
      </div>
      <p
        className={`font-heading text-2xl md:text-3xl font-bold ${
          highlight ? "text-gold" : "text-on-surface"
        }`}
      >
        {fmtNum(value)}
      </p>
      {trend !== null && (
        <div
          className={`flex items-center gap-1 mt-1 text-xs font-semibold ${
            trend >= 0 ? "text-emerald-400" : "text-red-400"
          }`}
        >
          <span
            className="material-symbols-outlined text-sm"
            style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}
          >
            {trend >= 0 ? "trending_up" : "trending_down"}
          </span>
          {trend >= 0 ? "+" : ""}
          {trend}% vs prev
        </div>
      )}
    </div>
  );
}

// ─── COMPONENT: Health Score Card ───────────────────────────────────────────

function HealthScoreCard({ score }: { score: number }) {
  const color =
    score >= 70
      ? "text-emerald-400"
      : score >= 40
        ? "text-yellow-400"
        : "text-red-400";
  const label = score >= 70 ? "Healthy" : score >= 40 ? "Fair" : "Needs Work";
  const bgRing =
    score >= 70
      ? "from-emerald-400/20 to-emerald-400/5"
      : score >= 40
        ? "from-yellow-400/20 to-yellow-400/5"
        : "from-red-400/20 to-red-400/5";

  return (
    <div className="p-5 rounded-2xl shadow-xl bg-surface-container-low transition-all duration-300 hover:scale-[1.02]">
      <div className="flex items-center gap-2 mb-2">
        <span
          className="material-symbols-outlined text-base text-on-surface-variant"
          style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}
        >
          monitor_heart
        </span>
        <p className="text-on-surface-variant text-[10px] uppercase tracking-widest">
          Health Score
        </p>
      </div>
      <div className="flex items-end gap-2">
        <p className={`font-heading text-2xl md:text-3xl font-bold ${color}`}>
          {score}
        </p>
        <span className={`text-xs font-semibold ${color} mb-1`}>{label}</span>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-outline-variant/20 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${bgRing} transition-all duration-700`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

// ─── COMPONENT: Conversion Funnel ───────────────────────────────────────────

function ConversionFunnel({
  stages,
}: {
  stages: { label: string; value: number; icon: string }[];
}) {
  const maxVal = stages[0]?.value || 1;

  // Find weakest conversion link
  let weakestIdx = -1;
  let weakestRate = Infinity;
  for (let i = 1; i < stages.length; i++) {
    const prev = stages[i - 1].value;
    if (prev > 0) {
      const rate = stages[i].value / prev;
      if (rate < weakestRate) {
        weakestRate = rate;
        weakestIdx = i;
      }
    }
  }

  const goldShades = [
    "from-[#E6C487] to-[#d4b070]",
    "from-[#d4b070] to-[#c29e5c]",
    "from-[#c29e5c] to-[#b08c48]",
    "from-[#b08c48] to-[#9e7a34]",
    "from-[#9e7a34] to-[#8c6820]",
  ];

  return (
    <div className="space-y-3">
      {stages.map((stage, i) => {
        const widthPct = maxVal > 0 ? Math.max(3, (stage.value / maxVal) * 100) : 3;
        const prevStageRate =
          i > 0 && stages[i - 1].value > 0
            ? ((stage.value / stages[i - 1].value) * 100).toFixed(1)
            : null;
        const totalPct =
          maxVal > 0 ? ((stage.value / maxVal) * 100).toFixed(2) : "0";
        const isWeakest = i === weakestIdx;

        return (
          <div key={stage.label}>
            {/* Conversion rate arrow between stages */}
            {i > 0 && prevStageRate !== null && (
              <div className="flex items-center gap-2 ml-4 mb-1">
                <span
                  className={`material-symbols-outlined text-xs ${
                    isWeakest ? "text-red-400" : "text-on-surface-variant"
                  }`}
                  style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
                >
                  arrow_downward
                </span>
                <span
                  className={`text-[10px] font-semibold ${
                    isWeakest
                      ? "text-red-400"
                      : "text-on-surface-variant"
                  }`}
                >
                  {prevStageRate}% conversion
                  {isWeakest && " — weakest link"}
                </span>
              </div>
            )}

            <div className="flex items-center gap-4">
              <span
                className="material-symbols-outlined text-on-surface-variant text-sm w-6 text-center flex-shrink-0"
                style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}
              >
                {stage.icon}
              </span>

              <div className="flex-1 min-w-0">
                <div
                  className={`relative h-10 rounded-lg overflow-hidden transition-all duration-700 ${
                    isWeakest ? "ring-1 ring-red-400/40" : ""
                  }`}
                  style={{ width: `${widthPct}%`, minWidth: "80px" }}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${goldShades[i] ?? goldShades[4]} opacity-${90 - i * 15}`}
                    style={{ opacity: (90 - i * 15) / 100 }}
                  />
                  <div className="relative h-full flex items-center px-3 gap-2">
                    <span className="text-[#131313] text-xs font-heading font-bold whitespace-nowrap">
                      {stage.label}
                    </span>
                    <span className="text-[#131313]/70 text-xs font-semibold whitespace-nowrap ml-auto">
                      {fmtNum(stage.value)}
                    </span>
                  </div>
                </div>
              </div>

              <span className="text-on-surface-variant text-[10px] w-14 text-right flex-shrink-0">
                {totalPct}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── COMPONENT: Recently Closed Card ────────────────────────────────────────

function RecentlyClosedCard({
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
    ? new Date(opp.proposed_day + "T12:00:00").toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : "Date TBD";

  const photoUrl = opp.candidate_photo_url || (opp.candidate_photos && opp.candidate_photos[0]);
  const allPhotos = buildClosedPhotoList(opp);

  const heightDisplay = opp.candidate_height_inches
    ? `${Math.floor(opp.candidate_height_inches / 12)}'${opp.candidate_height_inches % 12}"`
    : null;

  return (
    <div className="bg-surface-container-low rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
      {/* Collapsed row */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 p-5 text-left transition-colors duration-200 hover:bg-surface-container-low/80"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Photo thumbnail */}
          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-transparent group-hover:ring-gold transition-all duration-200">
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
          <div className="min-w-0">
            <p className="text-on-surface text-sm font-heading font-semibold truncate">
              {opp.candidate_name}
              {opp.candidate_age && (
                <span className="text-on-surface-variant font-normal ml-1.5 text-xs">
                  {opp.candidate_age}
                </span>
              )}
            </p>
            <p className="text-on-surface-variant text-xs">{dateStr}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold ${badgeClass}`}
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
          <div className="px-5 pb-5 pt-0 border-t border-outline-variant/10">
            {/* Photo gallery when expanded */}
            {allPhotos.length > 0 && (
              <div className="pt-4">
                <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden">
                  <div
                    className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-none"
                    onScroll={(e) => {
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

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 pt-4">
              <DetailField label="Candidate" value={opp.candidate_name} />
              <DetailField
                label="Age"
                value={opp.candidate_age ? String(opp.candidate_age) : "\u2014"}
              />
              {opp.candidate_profession && (
                <DetailField label="Profession" value={opp.candidate_profession} />
              )}
              {opp.candidate_location && (
                <DetailField label="Location" value={opp.candidate_location} />
              )}
              {opp.candidate_education && (
                <DetailField label="Education" value={opp.candidate_education} />
              )}
              {heightDisplay && (
                <DetailField label="Height" value={heightDisplay} />
              )}
              <DetailField
                label="Source App"
                value={opp.dating_apps?.app_name ?? "\u2014"}
              />
              <DetailField label="Proposed Day" value={dateStr} />
              <DetailField
                label="Proposed Time"
                value={opp.proposed_time ?? "\u2014"}
              />
              <DetailField
                label="Venue"
                value={opp.venues?.venue_name ?? "\u2014"}
              />
              <DetailField
                label="Phone Number"
                value={opp.phone_number ?? "\u2014"}
              />
            </div>

            {opp.memorable_detail && (
              <div className="mt-4">
                <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-1">
                  Memorable Detail
                </p>
                <p className="text-on-surface text-sm leading-relaxed">
                  {opp.memorable_detail}
                </p>
              </div>
            )}

            {opp.notes && (
              <div className="mt-4">
                <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-1">
                  Matchmaker Notes
                </p>
                <p className="text-on-surface text-sm leading-relaxed">
                  {opp.notes}
                </p>
              </div>
            )}

            {opp.prewritten_text && (
              <div className="mt-3">
                <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-1">
                  Prewritten Text
                </p>
                <p className="text-on-surface text-sm leading-relaxed bg-surface-container-low/50 rounded-lg p-3 border border-outline-variant/10">
                  {opp.prewritten_text}
                </p>
              </div>
            )}

            {decision === "declined" && opp.decline_reason && (
              <div className="mt-3 bg-red-400/5 border border-red-400/15 rounded-lg p-3">
                <p className="text-red-400 text-[10px] uppercase tracking-widest mb-1">
                  Decline Reason
                </p>
                <p className="text-on-surface text-sm leading-relaxed">
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

function buildClosedPhotoList(opp: any): string[] {
  const photos: string[] = [];
  if (opp.candidate_photo_url) photos.push(opp.candidate_photo_url);
  if (Array.isArray(opp.candidate_photos)) {
    for (const p of opp.candidate_photos) {
      if (p && !photos.includes(p)) photos.push(p);
    }
  }
  return photos;
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-0.5">
        {label}
      </p>
      <p className="text-on-surface text-sm font-medium">{value}</p>
    </div>
  );
}

// ─── COMPONENT: Trend Chart (CSS) ───────────────────────────────────────────

function TrendChart({ data }: { data: [string, number][] }) {
  if (data.length === 0) {
    return (
      <p className="text-on-surface-variant text-sm text-center py-8">
        No trend data available for this period
      </p>
    );
  }

  const maxVal = Math.max(...data.map(([, v]) => v), 1);

  return (
    <div>
      <div className="flex items-end gap-[2px] md:gap-1 h-40">
        {data.map(([date, value], i) => {
          const heightPct = (value / maxVal) * 100;
          return (
            <div
              key={date}
              className="flex-1 flex flex-col items-center justify-end h-full group relative"
            >
              {/* Tooltip */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#131313] border border-gold/20 rounded-lg px-2 py-1 text-[10px] text-gold font-heading font-semibold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                {value} matches
              </div>
              <div
                className="w-full rounded-t-sm bg-gradient-to-t from-gold/60 to-gold transition-all duration-300 group-hover:from-gold/80 group-hover:to-gold min-h-[2px]"
                style={{ height: `${Math.max(2, heightPct)}%` }}
              />
            </div>
          );
        })}
      </div>
      {/* X-axis labels */}
      <div className="flex gap-[2px] md:gap-1 mt-2">
        {data.map(([date], i) => {
          // Only show every Nth label to avoid crowding
          const showLabel =
            data.length <= 10 ||
            i % Math.ceil(data.length / 10) === 0 ||
            i === data.length - 1;
          return (
            <div
              key={date}
              className="flex-1 text-center"
            >
              {showLabel && (
                <span className="text-on-surface-variant text-[8px] md:text-[9px]">
                  {formatDateLabel(date)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─── COMPONENT: Per-App Card ────────────────────────────────────────────────

function PerAppCard({
  app,
  accountHealth,
  isBest,
}: {
  app: AppStats;
  accountHealth: any[];
  isBest: boolean;
}) {
  const health = accountHealth.find(
    (ah) => ah.dating_apps?.app_name === app.appName
  );
  const status = health?.status ?? "unknown";
  const statusColor =
    status === "active"
      ? "bg-emerald-400"
      : status === "shadowbanned"
        ? "bg-yellow-400"
        : status === "banned"
          ? "bg-red-400"
          : "bg-outline-variant";

  const maxBar = Math.max(app.swipes, 1);
  const funnelBars = [
    { label: "Swipes", value: app.swipes },
    { label: "Matches", value: app.matches },
    { label: "Convos", value: app.conversations },
    { label: "Dates", value: app.dates_closed },
  ];

  const matchesPerSwipe =
    app.swipes > 0 ? Math.round(app.swipes / Math.max(1, app.matches)) : 0;
  const datesPerConvo =
    app.conversations > 0
      ? Math.round(
          app.conversations / Math.max(1, app.dates_closed)
        )
      : 0;

  return (
    <div className="bg-surface-container-low p-6 rounded-2xl shadow-xl relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-1 h-full bg-gold opacity-30 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="font-heading text-lg font-bold text-on-surface">
            {app.appName}
          </h3>
          <span
            className={`inline-block w-2 h-2 rounded-full ${statusColor}`}
            title={status}
          />
          <span className="text-on-surface-variant text-[10px] uppercase tracking-widest">
            {status}
          </span>
        </div>
        {isBest && (
          <span className="bg-gold/15 text-gold text-[9px] uppercase tracking-widest font-bold px-2 py-1 rounded-full">
            #1
          </span>
        )}
      </div>

      {/* Mini funnel */}
      <div className="space-y-1.5 mb-4">
        {funnelBars.map((bar) => {
          const w = maxBar > 0 ? Math.max(4, (bar.value / maxBar) * 100) : 4;
          return (
            <div key={bar.label} className="flex items-center gap-2">
              <span className="text-on-surface-variant text-[10px] w-12 text-right">
                {bar.label}
              </span>
              <div className="flex-1 h-4 rounded-sm overflow-hidden bg-outline-variant/10">
                <div
                  className="h-full bg-gradient-to-r from-gold/70 to-gold/40 rounded-sm transition-all duration-500"
                  style={{ width: `${w}%` }}
                />
              </div>
              <span className="text-on-surface text-[10px] font-heading font-semibold w-10 text-right">
                {fmtNum(bar.value)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Rates */}
      <div className="border-t border-outline-variant/15 pt-3 space-y-2 mb-3">
        <RateRow label="Match Rate" rate={app.match_rate} />
        <RateRow label="Conversation Rate" rate={app.conversation_rate} />
        <RateRow label="Close Rate" rate={app.close_rate} />
      </div>

      {/* Efficiency */}
      <div className="border-t border-outline-variant/15 pt-3 space-y-1">
        {app.matches > 0 && (
          <p className="text-on-surface-variant text-[10px]">
            <span className="text-gold font-heading font-semibold">
              1 match
            </span>{" "}
            per {matchesPerSwipe} swipes
          </p>
        )}
        {app.dates_closed > 0 && (
          <p className="text-on-surface-variant text-[10px]">
            <span className="text-gold font-heading font-semibold">
              1 date
            </span>{" "}
            per {datesPerConvo} conversations
          </p>
        )}
      </div>
    </div>
  );
}

function RateRow({ label, rate }: { label: string; rate: number }) {
  const color =
    rate >= 0.1
      ? "text-emerald-400"
      : rate >= 0.05
        ? "text-yellow-400"
        : "text-red-400";
  const dot =
    rate >= 0.1
      ? "bg-emerald-400"
      : rate >= 0.05
        ? "bg-yellow-400"
        : "bg-red-400";

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <span className={`inline-block w-1.5 h-1.5 rounded-full ${dot}`} />
        <span className="text-on-surface-variant text-[10px]">{label}</span>
      </div>
      <span className={`font-heading text-xs font-semibold ${color}`}>
        {(rate * 100).toFixed(1)}%
      </span>
    </div>
  );
}

// ─── COMPONENT: Opportunities Waterfall ─────────────────────────────────────

function OpportunitiesWaterfall({
  total,
  approved,
  declined,
  pending,
  avgDecisionDays,
}: {
  total: number;
  approved: number;
  declined: number;
  pending: number;
  avgDecisionDays: string | null;
}) {
  const approvalRate = total > 0 ? ((approved / total) * 100).toFixed(0) : "0";

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <MiniStat label="Total" value={total} color="text-on-surface" />
        <MiniStat label="Approved" value={approved} color="text-gold" />
        <MiniStat label="Declined" value={declined} color="text-red-400" />
        <MiniStat label="Pending" value={pending} color="text-on-surface-variant" />
        <div className="text-center">
          <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-1">
            Approval Rate
          </p>
          <p className="font-heading text-2xl font-bold text-gold">
            {approvalRate}%
          </p>
        </div>
      </div>

      {/* Visual bar */}
      {total > 0 && (
        <div className="space-y-2">
          <div className="h-8 rounded-lg overflow-hidden flex">
            {approved > 0 && (
              <div
                className="h-full bg-gradient-to-r from-gold to-[#c9a96e] flex items-center justify-center"
                style={{ width: `${(approved / total) * 100}%` }}
              >
                <span className="text-[#131313] text-[9px] font-bold">
                  {approved}
                </span>
              </div>
            )}
            {declined > 0 && (
              <div
                className="h-full bg-red-400/70 flex items-center justify-center"
                style={{ width: `${(declined / total) * 100}%` }}
              >
                <span className="text-[#131313] text-[9px] font-bold">
                  {declined}
                </span>
              </div>
            )}
            {pending > 0 && (
              <div
                className="h-full bg-outline-variant/30 flex items-center justify-center"
                style={{ width: `${(pending / total) * 100}%` }}
              >
                <span className="text-on-surface-variant text-[9px] font-bold">
                  {pending}
                </span>
              </div>
            )}
          </div>
          <div className="flex text-[9px] uppercase tracking-widest gap-4 justify-center">
            <span className="text-gold flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-gold" />
              Approved
            </span>
            <span className="text-red-400 flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-red-400" />
              Declined
            </span>
            <span className="text-on-surface-variant flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-outline-variant/50" />
              Pending
            </span>
          </div>
        </div>
      )}

      {/* Decision speed */}
      {avgDecisionDays && (
        <div className="text-center pt-2 border-t border-outline-variant/15">
          <p className="text-on-surface-variant text-xs">
            Avg. decision speed:{" "}
            <span className="text-gold font-heading font-semibold">
              {avgDecisionDays} days
            </span>
          </p>
        </div>
      )}
    </div>
  );
}

function MiniStat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="text-center">
      <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-1">
        {label}
      </p>
      <p className={`font-heading text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

// ─── COMPONENT: Profile Strength Score ──────────────────────────────────────

function ProfileStrengthScore({
  strength,
}: {
  strength: ProfileStrengthData;
}) {
  const { total, recommendations } = strength;

  const scoreColor =
    total >= 70
      ? "#34d399"
      : total >= 40
        ? "#facc15"
        : "#f87171";

  const segments = [
    { label: "Photos Uploaded", value: strength.photosUploaded, max: 20 },
    { label: "Photos Live", value: strength.photosLive, max: 30 },
    { label: "Account Health", value: strength.accountHealthScore, max: 20 },
    { label: "Match Rate", value: strength.matchRateScore, max: 15 },
    { label: "Close Rate", value: strength.closeRateScore, max: 15 },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-8 items-center">
      {/* Circular gauge */}
      <div className="relative flex-shrink-0">
        <div
          className="w-36 h-36 rounded-full flex items-center justify-center"
          style={{
            background: `conic-gradient(${scoreColor} 0deg, ${scoreColor} ${total * 3.6}deg, rgba(255,255,255,0.05) ${total * 3.6}deg, rgba(255,255,255,0.05) 360deg)`,
          }}
        >
          <div className="w-28 h-28 rounded-full bg-surface-container-low flex flex-col items-center justify-center">
            <span
              className="font-heading text-3xl font-bold"
              style={{ color: scoreColor }}
            >
              {total}
            </span>
            <span className="text-on-surface-variant text-[9px] uppercase tracking-widest">
              / 100
            </span>
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="flex-1 space-y-3 w-full">
        {segments.map((seg) => {
          const pct = seg.max > 0 ? (seg.value / seg.max) * 100 : 0;
          return (
            <div key={seg.label}>
              <div className="flex justify-between mb-1">
                <span className="text-on-surface-variant text-[10px]">
                  {seg.label}
                </span>
                <span className="text-on-surface text-[10px] font-heading font-semibold">
                  {seg.value}/{seg.max}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-outline-variant/15 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-gold/60 to-gold transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="pt-3 border-t border-outline-variant/15 space-y-2">
            <p className="text-on-surface-variant text-[10px] uppercase tracking-widest">
              Recommendations
            </p>
            {recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-2">
                <span
                  className="material-symbols-outlined text-gold text-xs mt-0.5"
                  style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}
                >
                  arrow_right
                </span>
                <p className="text-on-surface-variant text-xs">{rec}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
