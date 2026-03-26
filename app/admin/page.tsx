export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { count: totalClients },
    { count: totalMatchmakers },
    { data: recentAudit },
    { count: activeDateOpps },
    { data: onboardingData },
    { data: kpiSummary },
    { data: matchmakerWorkload },
  ] = await Promise.all([
    supabase.from("clients").select("*", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "matchmaker"),
    supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("date_opportunities")
      .select("*", { count: "exact", head: true })
      .not("status", "in", "(archived,declined)"),
    supabase.from("clients").select("id, onboarding_status"),
    supabase.from("client_kpi_summary").select("dates_approved"),
    supabase
      .from("profiles")
      .select("id, full_name")
      .eq("role", "matchmaker"),
  ]);

  // Fetch matchmaker availability and active sessions for the availability overview
  const { data: mmAvailability } = await supabase
    .from("matchmaker_availability")
    .select("profile_id, working_days, start_time, end_time, timezone");

  const { data: activeSessions } = await supabase
    .from("matchmaker_sessions")
    .select("profile_id")
    .is("logout_at", null);

  // Build lookup maps
  const availabilityMap: Record<
    string,
    {
      working_days: string[];
      start_time: string;
      end_time: string;
      timezone: string;
    }
  > = {};
  (mmAvailability ?? []).forEach((a: any) => {
    availabilityMap[a.profile_id] = a;
  });

  const activeSessionSet = new Set(
    (activeSessions ?? []).map((s: { profile_id: string }) => s.profile_id)
  );

  const dayAbbrMap: Record<string, string> = {
    monday: "M",
    tuesday: "T",
    wednesday: "W",
    thursday: "Th",
    friday: "F",
    saturday: "Sa",
    sunday: "Su",
  };

  function formatTime12(time: string | undefined): string {
    if (!time) return "--";
    const [h, m] = time.split(":").map(Number);
    const ampm = h >= 12 ? "pm" : "am";
    const hour12 = h % 12 || 12;
    return m === 0 ? `${hour12}${ampm}` : `${hour12}:${String(m).padStart(2, "0")}${ampm}`;
  }

  // Compute onboarding breakdown
  const onboarding = {
    not_started: 0,
    in_progress: 0,
    completed: 0,
    approved: 0,
  };
  onboardingData?.forEach((c: { onboarding_status: string }) => {
    const status = c.onboarding_status as keyof typeof onboarding;
    if (status in onboarding) onboarding[status]++;
  });

  const totalOnboarding =
    onboarding.not_started +
    onboarding.in_progress +
    onboarding.completed +
    onboarding.approved;

  // Total dates approved across all clients
  const totalDatesApproved =
    kpiSummary?.reduce(
      (sum: number, row: { dates_approved: number | null }) =>
        sum + (row.dates_approved ?? 0),
      0
    ) ?? 0;

  // Matchmaker workload: get client counts per matchmaker
  const { data: assignments } = await supabase
    .from("clients")
    .select("matchmaker_id");

  const matchmakerClientCounts: Record<string, number> = {};
  assignments?.forEach((a: { matchmaker_id: string | null }) => {
    if (a.matchmaker_id) {
      matchmakerClientCounts[a.matchmaker_id] =
        (matchmakerClientCounts[a.matchmaker_id] || 0) + 1;
    }
  });

  const funnelStages = [
    {
      key: "not_started",
      label: "Not Started",
      count: onboarding.not_started,
      icon: "hourglass_empty",
    },
    {
      key: "in_progress",
      label: "In Progress",
      count: onboarding.in_progress,
      icon: "pending",
    },
    {
      key: "completed",
      label: "Completed",
      count: onboarding.completed,
      icon: "task_alt",
    },
    {
      key: "approved",
      label: "Approved",
      count: onboarding.approved,
      icon: "verified",
    },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-heading font-bold text-gold tracking-tight">
          Admin Dashboard
        </h1>
        <div className="h-px w-20 bg-gradient-to-r from-gold to-transparent" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-surface-container-low p-5 rounded-2xl shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="material-symbols-outlined text-lg text-gold"
              style={{
                fontVariationSettings: "'FILL' 0, 'wght' 300",
              }}
            >
              group
            </span>
            <p className="text-on-surface-variant text-[10px] uppercase tracking-widest">
              Clients
            </p>
          </div>
          <p className="font-heading text-3xl font-bold text-on-surface">
            {totalClients ?? 0}
          </p>
        </div>

        <div className="bg-surface-container-low p-5 rounded-2xl shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="material-symbols-outlined text-lg text-gold"
              style={{
                fontVariationSettings: "'FILL' 0, 'wght' 300",
              }}
            >
              badge
            </span>
            <p className="text-on-surface-variant text-[10px] uppercase tracking-widest">
              Matchmakers
            </p>
          </div>
          <p className="font-heading text-3xl font-bold text-on-surface">
            {totalMatchmakers ?? 0}
          </p>
        </div>

        <div className="bg-surface-container-low p-5 rounded-2xl shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="material-symbols-outlined text-lg text-gold"
              style={{
                fontVariationSettings: "'FILL' 0, 'wght' 300",
              }}
            >
              favorite
            </span>
            <p className="text-on-surface-variant text-[10px] uppercase tracking-widest">
              Active Dates
            </p>
          </div>
          <p className="font-heading text-3xl font-bold text-on-surface">
            {activeDateOpps ?? 0}
          </p>
        </div>

        <div className="bg-surface-container-low p-5 rounded-2xl shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="material-symbols-outlined text-lg text-gold"
              style={{
                fontVariationSettings: "'FILL' 0, 'wght' 300",
              }}
            >
              check_circle
            </span>
            <p className="text-on-surface-variant text-[10px] uppercase tracking-widest">
              Dates Approved
            </p>
          </div>
          <p className="font-heading text-3xl font-bold text-on-surface">
            {totalDatesApproved}
          </p>
        </div>

        <div className="bg-surface-container-low p-5 rounded-2xl shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="material-symbols-outlined text-lg text-gold"
              style={{
                fontVariationSettings: "'FILL' 0, 'wght' 300",
              }}
            >
              assignment_turned_in
            </span>
            <p className="text-on-surface-variant text-[10px] uppercase tracking-widest">
              Onboarded
            </p>
          </div>
          <p className="font-heading text-3xl font-bold text-on-surface">
            {onboarding.approved}
          </p>
          <p className="text-on-surface-variant text-[10px] mt-1">
            of {totalOnboarding} total
          </p>
        </div>

        <div className="bg-gold/10 border border-gold/20 p-5 rounded-2xl shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="material-symbols-outlined text-lg text-gold"
              style={{
                fontVariationSettings: "'FILL' 0, 'wght' 300",
              }}
            >
              monitor_heart
            </span>
            <p className="text-on-surface-variant text-[10px] uppercase tracking-widest">
              System
            </p>
          </div>
          <p className="font-heading text-3xl font-bold text-gold">OK</p>
        </div>
      </div>

      {/* Quick Nav */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          href="/admin/clients"
          className="bg-surface-container-low p-6 rounded-2xl shadow-xl hover:bg-surface-container-high transition-colors duration-300 flex items-center gap-4"
        >
          <span
            className="material-symbols-outlined text-3xl text-gold"
            style={{
              fontVariationSettings: "'FILL' 0, 'wght' 300",
            }}
          >
            group
          </span>
          <div>
            <p className="text-on-surface font-medium">All Clients</p>
            <p className="text-on-surface-variant text-xs">
              View and manage all clients
            </p>
          </div>
        </Link>
        <Link
          href="/admin/matchmakers"
          className="bg-surface-container-low p-6 rounded-2xl shadow-xl hover:bg-surface-container-high transition-colors duration-300 flex items-center gap-4"
        >
          <span
            className="material-symbols-outlined text-3xl text-gold"
            style={{
              fontVariationSettings: "'FILL' 0, 'wght' 300",
            }}
          >
            badge
          </span>
          <div>
            <p className="text-on-surface font-medium">Matchmakers</p>
            <p className="text-on-surface-variant text-xs">
              Assignments and workload
            </p>
          </div>
        </Link>
        <Link
          href="/admin/audit"
          className="bg-surface-container-low p-6 rounded-2xl shadow-xl hover:bg-surface-container-high transition-colors duration-300 flex items-center gap-4"
        >
          <span
            className="material-symbols-outlined text-3xl text-gold"
            style={{
              fontVariationSettings: "'FILL' 0, 'wght' 300",
            }}
          >
            history
          </span>
          <div>
            <p className="text-on-surface font-medium">Audit Log</p>
            <p className="text-on-surface-variant text-xs">
              System activity history
            </p>
          </div>
        </Link>
        <Link
          href="/admin/settings"
          className="bg-surface-container-low p-6 rounded-2xl shadow-xl hover:bg-surface-container-high transition-colors duration-300 flex items-center gap-4"
        >
          <span
            className="material-symbols-outlined text-3xl text-gold"
            style={{
              fontVariationSettings: "'FILL' 0, 'wght' 300",
            }}
          >
            settings
          </span>
          <div>
            <p className="text-on-surface font-medium">Settings</p>
            <p className="text-on-surface-variant text-xs">
              Apps, exports &amp; config
            </p>
          </div>
        </Link>
      </div>

      {/* Client Onboarding Funnel */}
      <section className="space-y-4">
        <h2 className="font-heading text-lg font-semibold text-on-surface">
          Client Onboarding Funnel
        </h2>
        <div className="bg-surface-container-low rounded-2xl shadow-xl p-6 space-y-4">
          {funnelStages.map((stage) => {
            const pct =
              totalOnboarding > 0
                ? Math.round((stage.count / totalOnboarding) * 100)
                : 0;
            return (
              <div key={stage.key} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="material-symbols-outlined text-base text-gold"
                      style={{
                        fontVariationSettings: "'FILL' 0, 'wght' 300",
                      }}
                    >
                      {stage.icon}
                    </span>
                    <span className="text-on-surface font-medium">
                      {stage.label}
                    </span>
                  </div>
                  <span className="text-on-surface-variant text-xs tabular-nums">
                    {stage.count} ({pct}%)
                  </span>
                </div>
                <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-gold to-gold/60 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Matchmaker Workload Distribution */}
      {matchmakerWorkload && matchmakerWorkload.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-heading text-lg font-semibold text-on-surface">
            Matchmaker Workload
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matchmakerWorkload.map(
              (mm: { id: string; full_name: string | null }) => {
                const clientCount = matchmakerClientCounts[mm.id] ?? 0;
                return (
                  <Link
                    key={mm.id}
                    href={`/admin/matchmakers`}
                    className="bg-surface-container-low rounded-2xl shadow-xl p-5 hover:bg-surface-container-high transition-colors duration-300"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
                        <span
                          className="material-symbols-outlined text-lg text-gold"
                          style={{
                            fontVariationSettings: "'FILL' 0, 'wght' 300",
                          }}
                        >
                          person
                        </span>
                      </div>
                      <div>
                        <p className="text-on-surface font-medium text-sm">
                          {mm.full_name ?? "Unnamed"}
                        </p>
                        <p className="text-on-surface-variant text-xs">
                          Matchmaker
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-on-surface-variant text-[10px] uppercase tracking-widest">
                          Assigned Clients
                        </p>
                        <p className="font-heading text-2xl font-bold text-on-surface">
                          {clientCount}
                        </p>
                      </div>
                      <span
                        className="material-symbols-outlined text-xl text-outline"
                        style={{
                          fontVariationSettings: "'FILL' 0, 'wght' 300",
                        }}
                      >
                        arrow_forward
                      </span>
                    </div>
                  </Link>
                );
              }
            )}
          </div>
        </section>
      )}

      {/* Matchmaker Availability */}
      {matchmakerWorkload && matchmakerWorkload.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-heading text-lg font-semibold text-on-surface">
            Matchmaker Availability
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matchmakerWorkload.map(
              (mm: { id: string; full_name: string | null }) => {
                const avail = availabilityMap[mm.id];
                const isOnline = activeSessionSet.has(mm.id);
                return (
                  <Link
                    key={mm.id}
                    href={`/admin/matchmakers/${mm.id}`}
                    className="bg-surface-container-low rounded-2xl shadow-xl p-5 hover:bg-surface-container-high transition-colors duration-300"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
                          <span
                            className="material-symbols-outlined text-lg text-gold"
                            style={{
                              fontVariationSettings: "'FILL' 0, 'wght' 300",
                            }}
                          >
                            person
                          </span>
                        </div>
                        <p className="text-on-surface font-medium text-sm">
                          {mm.full_name ?? "Unnamed"}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[9px] uppercase tracking-widest ${
                          isOnline
                            ? "border-green-400/30 text-green-400"
                            : "border-outline-variant/30 text-outline"
                        }`}
                      >
                        {isOnline ? "Online" : "Offline"}
                      </Badge>
                    </div>
                    {avail ? (
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1">
                          {(avail.working_days ?? []).map((day: string) => (
                            <span
                              key={day}
                              className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gold/10 text-gold text-[10px] font-medium"
                            >
                              {dayAbbrMap[day.toLowerCase()] ?? day}
                            </span>
                          ))}
                        </div>
                        <p className="text-on-surface-variant text-xs flex items-center gap-1.5">
                          <span
                            className="material-symbols-outlined text-sm text-gold"
                            style={{
                              fontVariationSettings: "'FILL' 0, 'wght' 300",
                            }}
                          >
                            schedule
                          </span>
                          {formatTime12(avail.start_time)}&ndash;{formatTime12(avail.end_time)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-on-surface-variant text-xs italic">
                        Hours not configured
                      </p>
                    )}
                  </Link>
                );
              }
            )}
          </div>
        </section>
      )}

      {/* Recent Activity */}
      {recentAudit && recentAudit.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-heading text-lg font-semibold text-on-surface">
            Recent Activity
          </h2>
          <div className="bg-surface-container-low rounded-2xl shadow-xl divide-y divide-outline-variant/10">
            {recentAudit.map(
              (log: {
                id: string;
                action_type: string;
                target_table: string;
                created_at: string;
                actor_id: string | null;
              }) => (
                <div
                  key={log.id}
                  className="px-5 py-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                      <span
                        className="material-symbols-outlined text-sm text-gold"
                        style={{
                          fontVariationSettings: "'FILL' 0, 'wght' 300",
                        }}
                      >
                        {log.action_type === "INSERT"
                          ? "add_circle"
                          : log.action_type === "UPDATE"
                            ? "edit"
                            : log.action_type === "DELETE"
                              ? "delete"
                              : "info"}
                      </span>
                    </div>
                    <div>
                      <p className="text-on-surface text-sm font-medium">
                        {log.action_type}{" "}
                        <span className="text-on-surface-variant font-normal">
                          on
                        </span>{" "}
                        <span className="text-gold">{log.target_table}</span>
                      </p>
                      {log.actor_id && (
                        <p className="text-on-surface-variant text-[10px] font-mono truncate max-w-[180px]">
                          by {log.actor_id.slice(0, 8)}...
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-outline text-xs whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
              )
            )}
          </div>
        </section>
      )}
    </div>
  );
}
