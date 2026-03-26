export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { AdminKanban } from "@/components/admin/admin-kanban";
import ReassignMatchmaker from "@/components/admin/reassign-matchmaker";

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
    { data: allClientProfiles },
    { data: allDateOpps },
    { data: recentFeedback },
    { data: allClientsRaw },
    { data: consultationClients },
    { data: allMatchmakersList },
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
    // Business Analytics: Application funnel from profiles
    supabase
      .from("profiles")
      .select("id, role, setup_complete")
      .eq("role", "client"),
    // Business Analytics: All date opportunities for performance metrics
    supabase
      .from("date_opportunities")
      .select("id, client_id, client_decision, created_at, client_decision_at, created_by"),
    // Task 1: Recent client feedback
    supabase
      .from("date_opportunities")
      .select("id, candidate_name, feedback_rating, feedback_notes, feedback_want_second_date, feedback_submitted_at, client_id, clients!inner(id, profile_id, profiles!inner(full_name))")
      .eq("feedback_status", "submitted")
      .order("feedback_submitted_at", { ascending: false })
      .limit(10),
    // Task 2: All clients with profiles for kanban + applications
    supabase
      .from("clients")
      .select("id, profile_id, assigned_matchmaker_id, onboarding_status, created_at, profiles!inner(full_name, setup_complete)"),
    // Task 5: Consultation bookings
    supabase
      .from("clients")
      .select("id, consultation_booked_at, consultation_status, assigned_matchmaker_id, profiles!inner(full_name)")
      .not("consultation_booked_at", "is", null)
      .order("consultation_booked_at", { ascending: false }),
    // All matchmakers for ReassignMatchmaker component
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

  // Task 2: Fetch photo counts and recent approved dates for kanban
  const { data: photoCounts } = await supabase
    .from("photos")
    .select("client_id")
    .eq("status", "live");

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const { data: recentApprovedDates } = await supabase
    .from("date_opportunities")
    .select("client_id")
    .eq("client_decision", "approved")
    .gte("client_decision_at", thirtyDaysAgo.toISOString());

  // Build photo count and recent approved maps
  const photoCountMap: Record<string, number> = {};
  (photoCounts ?? []).forEach((p: { client_id: string }) => {
    photoCountMap[p.client_id] = (photoCountMap[p.client_id] || 0) + 1;
  });

  const recentApprovedSet = new Set(
    (recentApprovedDates ?? []).map((d: { client_id: string }) => d.client_id)
  );

  // Build matchmaker name lookup
  const matchmakerNameMap: Record<string, string> = {};
  (allMatchmakersList ?? []).forEach((mm: { id: string; full_name: string | null }) => {
    if (mm.full_name) matchmakerNameMap[mm.id] = mm.full_name;
  });

  // Build kanban clients
  const kanbanClients = (allClientsRaw ?? []).map((c: any) => ({
    id: c.id,
    profile_id: c.profile_id,
    assigned_matchmaker_id: c.assigned_matchmaker_id,
    onboarding_status: c.onboarding_status,
    created_at: c.created_at,
    profile_name: c.profiles?.full_name ?? null,
    setup_complete: c.profiles?.setup_complete ?? false,
    photo_count: photoCountMap[c.id] ?? 0,
    has_recent_approved_date: recentApprovedSet.has(c.id),
    matchmaker_name: c.assigned_matchmaker_id
      ? matchmakerNameMap[c.assigned_matchmaker_id] ?? null
      : null,
  }));

  // Unassigned clients for "New Applications" section
  const unassignedClients = (allClientsRaw ?? []).filter(
    (c: any) => !c.assigned_matchmaker_id
  );

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

  // ── Business Analytics Calculations ──────────────────────────────

  // Application Funnel
  const totalApplications = allClientProfiles?.length ?? 0;
  const totalOnboardedProfiles = allClientProfiles?.filter(
    (p: { setup_complete: boolean }) => p.setup_complete
  ).length ?? 0;

  // Clients with assigned matchmaker
  const clientsWithMatchmaker = onboardingData?.filter((c: any) => {
    const assignment = assignments?.find((a: any) => a.matchmaker_id !== null);
    return assignment;
  });
  // More accurate: count from assignments
  const activeClientsCount = assignments?.filter(
    (a: { matchmaker_id: string | null }) => a.matchmaker_id !== null
  ).length ?? 0;

  // Date Performance
  const totalDatesCreated = allDateOpps?.length ?? 0;
  const totalDatesApprovedAll = allDateOpps?.filter(
    (d: { client_decision: string }) => d.client_decision === "approved"
  ).length ?? 0;
  const totalDatesDeclined = allDateOpps?.filter(
    (d: { client_decision: string }) => d.client_decision === "declined"
  ).length ?? 0;
  const decidedDates = totalDatesApprovedAll + totalDatesDeclined;
  const approvalRate = decidedDates > 0
    ? Math.round((totalDatesApprovedAll / decidedDates) * 100)
    : 0;

  // Unique clients with dates
  const uniqueClientsWithDates = new Set(
    (allDateOpps ?? []).map((d: { client_id: string }) => d.client_id)
  ).size;
  const avgDatesPerClient = uniqueClientsWithDates > 0
    ? (totalDatesCreated / uniqueClientsWithDates).toFixed(1)
    : "0";

  // Response Time: avg hours from created_at to client_decision_at
  const responseTimes = (allDateOpps ?? [])
    .filter(
      (d: { client_decision_at: string | null; created_at: string }) =>
        d.client_decision_at !== null
    )
    .map((d: { client_decision_at: string; created_at: string }) => {
      const created = new Date(d.created_at).getTime();
      const decided = new Date(d.client_decision_at).getTime();
      return (decided - created) / (1000 * 60 * 60); // hours
    });
  const avgResponseHours = responseTimes.length > 0
    ? (responseTimes.reduce((a: number, b: number) => a + b, 0) / responseTimes.length).toFixed(1)
    : "N/A";

  // Matchmaker Utilization
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const matchmakerUtilization = (matchmakerWorkload ?? []).map(
    (mm: { id: string; full_name: string | null }) => {
      const clientCount = matchmakerClientCounts[mm.id] ?? 0;

      // Dates closed this month (created_by = matchmaker, has client_decision_at this month)
      const datesThisMonth = (allDateOpps ?? []).filter(
        (d: { created_by: string; client_decision_at: string | null }) =>
          d.created_by === mm.id &&
          d.client_decision_at &&
          new Date(d.client_decision_at) >= startOfMonth
      ).length;

      // Avg response time for this matchmaker's dates
      const mmResponseTimes = (allDateOpps ?? [])
        .filter(
          (d: {
            created_by: string;
            client_decision_at: string | null;
            created_at: string;
          }) =>
            d.created_by === mm.id && d.client_decision_at !== null
        )
        .map(
          (d: { client_decision_at: string; created_at: string }) =>
            (new Date(d.client_decision_at).getTime() -
              new Date(d.created_at).getTime()) /
            (1000 * 60 * 60)
        );
      const mmAvgResponse = mmResponseTimes.length > 0
        ? (
            mmResponseTimes.reduce((a: number, b: number) => a + b, 0) /
            mmResponseTimes.length
          ).toFixed(1)
        : "N/A";

      return {
        id: mm.id,
        name: mm.full_name ?? "Unnamed",
        clientCount,
        datesThisMonth,
        avgResponse: mmAvgResponse,
      };
    }
  );

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

      {/* ── Business Analytics ─────────────────────────────────────── */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <span
            className="material-symbols-outlined text-xl text-gold"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
          >
            insights
          </span>
          <h2 className="font-heading text-lg font-semibold text-on-surface">
            Business Analytics
          </h2>
        </div>

        {/* Application Funnel */}
        <div>
          <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-3">
            Application Funnel
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-surface-container-low p-5 rounded-2xl shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-gold to-gold/40" />
              <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-1">
                Applications
              </p>
              <p className="font-heading text-3xl font-bold text-on-surface">
                {totalApplications}
              </p>
            </div>
            <div className="bg-surface-container-low p-5 rounded-2xl shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-gold/80 to-gold/30" />
              <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-1">
                Onboarded
              </p>
              <p className="font-heading text-3xl font-bold text-on-surface">
                {totalOnboardedProfiles}
              </p>
            </div>
            <div className="bg-surface-container-low p-5 rounded-2xl shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-gold/60 to-gold/20" />
              <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-1">
                Active Clients
              </p>
              <p className="font-heading text-3xl font-bold text-on-surface">
                {activeClientsCount}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2 px-1">
            <div className="flex-1 h-px bg-outline-variant/20" />
            <span className="material-symbols-outlined text-xs text-outline" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>arrow_forward</span>
            <div className="flex-1 h-px bg-outline-variant/20" />
            <span className="material-symbols-outlined text-xs text-outline" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>arrow_forward</span>
            <div className="flex-1 h-px bg-outline-variant/20" />
          </div>
        </div>

        {/* Date Performance */}
        <div>
          <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-3">
            Date Performance
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-surface-container-low p-4 rounded-2xl shadow-xl">
              <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-1">
                Total Created
              </p>
              <p className="font-heading text-2xl font-bold text-on-surface">
                {totalDatesCreated}
              </p>
            </div>
            <div className="bg-surface-container-low p-4 rounded-2xl shadow-xl">
              <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-1">
                Approved
              </p>
              <p className="font-heading text-2xl font-bold text-gold">
                {totalDatesApprovedAll}
              </p>
            </div>
            <div className="bg-surface-container-low p-4 rounded-2xl shadow-xl">
              <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-1">
                Declined
              </p>
              <p className="font-heading text-2xl font-bold text-on-surface">
                {totalDatesDeclined}
              </p>
            </div>
            <div className="bg-surface-container-low p-4 rounded-2xl shadow-xl">
              <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-1">
                Approval Rate
              </p>
              <p className="font-heading text-2xl font-bold text-gold">
                {approvalRate}%
              </p>
            </div>
            <div className="bg-surface-container-low p-4 rounded-2xl shadow-xl">
              <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-1">
                Avg / Client
              </p>
              <p className="font-heading text-2xl font-bold text-on-surface">
                {avgDatesPerClient}
              </p>
            </div>
          </div>
        </div>

        {/* Response Time */}
        <div className="bg-surface-container-low p-5 rounded-2xl shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center">
            <span
              className="material-symbols-outlined text-2xl text-gold"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
            >
              timer
            </span>
          </div>
          <div>
            <p className="text-on-surface-variant text-[10px] uppercase tracking-widest">
              Avg Response Time
            </p>
            <p className="font-heading text-2xl font-bold text-on-surface">
              {avgResponseHours}{typeof avgResponseHours === "string" && avgResponseHours !== "N/A" ? "h" : avgResponseHours !== "N/A" ? "h" : ""}
            </p>
            <p className="text-on-surface-variant text-[10px]">
              From opportunity created to client decision
            </p>
          </div>
        </div>

        {/* Matchmaker Utilization */}
        {matchmakerUtilization.length > 0 && (
          <div>
            <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-3">
              Matchmaker Utilization
            </p>
            <div className="bg-surface-container-low rounded-2xl shadow-xl overflow-hidden">
              <div className="grid grid-cols-4 gap-4 px-5 py-3 border-b border-outline-variant/10">
                <p className="text-gold text-[10px] uppercase tracking-widest font-medium">
                  Matchmaker
                </p>
                <p className="text-gold text-[10px] uppercase tracking-widest font-medium text-center">
                  Clients
                </p>
                <p className="text-gold text-[10px] uppercase tracking-widest font-medium text-center">
                  Dates This Mo.
                </p>
                <p className="text-gold text-[10px] uppercase tracking-widest font-medium text-center">
                  Avg Response
                </p>
              </div>
              {matchmakerUtilization.map(
                (mm: {
                  id: string;
                  name: string;
                  clientCount: number;
                  datesThisMonth: number;
                  avgResponse: string;
                }) => (
                  <div
                    key={mm.id}
                    className="grid grid-cols-4 gap-4 px-5 py-4 border-b border-outline-variant/10 last:border-b-0 hover:bg-surface-container-high/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
                        <span
                          className="material-symbols-outlined text-sm text-gold"
                          style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
                        >
                          person
                        </span>
                      </div>
                      <span className="text-on-surface text-sm font-medium truncate">
                        {mm.name}
                      </span>
                    </div>
                    <p className="text-on-surface text-sm font-heading font-bold text-center self-center">
                      {mm.clientCount}
                    </p>
                    <p className="text-on-surface text-sm font-heading font-bold text-center self-center">
                      {mm.datesThisMonth}
                    </p>
                    <p className="text-on-surface-variant text-sm text-center self-center">
                      {mm.avgResponse !== "N/A" ? `${mm.avgResponse}h` : "--"}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </section>

      {/* ── Recent Client Feedback ──────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span
            className="material-symbols-outlined text-xl text-gold"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
          >
            rate_review
          </span>
          <h2 className="font-heading text-lg font-semibold text-on-surface">
            Recent Client Feedback
          </h2>
        </div>
        {recentFeedback && recentFeedback.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentFeedback.map((fb: any) => {
              const clientName =
                fb.clients?.profiles?.full_name ?? "Unknown Client";
              const rating = fb.feedback_rating ?? 0;
              const wantSecondDate = fb.feedback_want_second_date;
              return (
                <div
                  key={fb.id}
                  className="bg-surface-container-low rounded-2xl shadow-xl p-5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-on-surface text-sm font-medium">
                        {clientName}
                      </p>
                      <p className="text-on-surface-variant text-xs">
                        Date with{" "}
                        <span className="text-gold font-medium">
                          {fb.candidate_name}
                        </span>
                      </p>
                    </div>
                    <span className="text-outline text-[10px]">
                      {fb.feedback_submitted_at
                        ? new Date(fb.feedback_submitted_at).toLocaleDateString()
                        : ""}
                    </span>
                  </div>
                  {/* Star rating */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`material-symbols-outlined text-lg ${
                          star <= rating ? "text-gold" : "text-outline-variant/30"
                        }`}
                        style={{
                          fontVariationSettings: `'FILL' ${star <= rating ? 1 : 0}, 'wght' 300`,
                        }}
                      >
                        star
                      </span>
                    ))}
                  </div>
                  {/* Would see again */}
                  <div className="flex items-center gap-2">
                    <span className="text-on-surface-variant text-xs">
                      Would see again?
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[9px] uppercase tracking-widest ${
                        wantSecondDate
                          ? "border-green-400/30 text-green-400"
                          : wantSecondDate === false
                            ? "border-red-400/30 text-red-400"
                            : "border-outline-variant/30 text-outline"
                      }`}
                    >
                      {wantSecondDate === true
                        ? "Yes"
                        : wantSecondDate === false
                          ? "No"
                          : "N/A"}
                    </Badge>
                  </div>
                  {/* Feedback notes */}
                  {fb.feedback_notes && (
                    <p className="text-on-surface-variant text-xs leading-relaxed bg-surface-container-highest/50 rounded-xl px-3 py-2">
                      {fb.feedback_notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-surface-container-low rounded-2xl shadow-xl p-8 text-center">
            <span
              className="material-symbols-outlined text-3xl text-outline mb-2"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
            >
              rate_review
            </span>
            <p className="text-on-surface-variant text-sm">
              No client feedback submitted yet.
            </p>
          </div>
        )}
      </section>

      {/* ── New Applications (Pending Assignment) ─────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span
            className="material-symbols-outlined text-xl text-gold"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
          >
            person_add
          </span>
          <h2 className="font-heading text-lg font-semibold text-on-surface">
            New Applications
          </h2>
          <span className="text-outline text-xs bg-surface-container-high px-2 py-0.5 rounded-full">
            {unassignedClients.length}
          </span>
        </div>
        {unassignedClients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unassignedClients.map((client: any) => (
              <div
                key={client.id}
                className="bg-surface-container-low rounded-2xl shadow-xl p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
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
                    <div>
                      <p className="text-on-surface text-sm font-medium">
                        {client.profiles?.full_name ?? "Unknown"}
                      </p>
                      <Badge
                        variant="outline"
                        className="text-[8px] uppercase tracking-widest border-outline-variant/30 text-outline mt-0.5"
                      >
                        {client.onboarding_status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                  <span className="text-outline text-[10px]">
                    {new Date(client.created_at).toLocaleDateString()}
                  </span>
                </div>
                <ReassignMatchmaker
                  clientId={client.id}
                  currentMatchmakerId={null}
                  matchmakers={(allMatchmakersList ?? []).map((mm: any) => ({
                    id: mm.id,
                    full_name: mm.full_name ?? "Unnamed",
                  }))}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-surface-container-low rounded-2xl shadow-xl p-8 text-center">
            <span
              className="material-symbols-outlined text-3xl text-outline mb-2"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
            >
              check_circle
            </span>
            <p className="text-on-surface-variant text-sm">
              All clients have been assigned a matchmaker.
            </p>
          </div>
        )}
      </section>

      {/* ── All-Clients Kanban Board ──────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span
            className="material-symbols-outlined text-xl text-gold"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
          >
            view_kanban
          </span>
          <h2 className="font-heading text-lg font-semibold text-on-surface">
            All-Clients Pipeline
          </h2>
        </div>
        <AdminKanban clients={kanbanClients} />
      </section>

      {/* ── Consultation Bookings ─────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span
            className="material-symbols-outlined text-xl text-gold"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
          >
            calendar_month
          </span>
          <h2 className="font-heading text-lg font-semibold text-on-surface">
            Consultation Bookings
          </h2>
        </div>
        {consultationClients && consultationClients.length > 0 ? (
          <div className="bg-surface-container-low rounded-2xl shadow-xl overflow-hidden">
            <div className="grid grid-cols-4 gap-4 px-5 py-3 border-b border-outline-variant/10">
              <p className="text-gold text-[10px] uppercase tracking-widest font-medium">
                Client
              </p>
              <p className="text-gold text-[10px] uppercase tracking-widest font-medium text-center">
                Booked
              </p>
              <p className="text-gold text-[10px] uppercase tracking-widest font-medium text-center">
                Status
              </p>
              <p className="text-gold text-[10px] uppercase tracking-widest font-medium text-center">
                Matchmaker
              </p>
            </div>
            {consultationClients.map((client: any) => {
              const statusColors: Record<string, string> = {
                pending: "border-orange-400/30 text-orange-400",
                booked: "border-blue-400/30 text-blue-400",
                completed: "border-green-400/30 text-green-400",
                no_show: "border-red-400/30 text-red-400",
              };
              const statusLabel = client.consultation_status ?? "pending";
              return (
                <div
                  key={client.id}
                  className="grid grid-cols-4 gap-4 px-5 py-4 border-b border-outline-variant/10 last:border-b-0 hover:bg-surface-container-high/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
                      <span
                        className="material-symbols-outlined text-sm text-gold"
                        style={{
                          fontVariationSettings: "'FILL' 0, 'wght' 300",
                        }}
                      >
                        person
                      </span>
                    </div>
                    <span className="text-on-surface text-sm font-medium truncate">
                      {client.profiles?.full_name ?? "Unknown"}
                    </span>
                  </div>
                  <p className="text-on-surface-variant text-sm text-center self-center">
                    {client.consultation_booked_at
                      ? new Date(
                          client.consultation_booked_at
                        ).toLocaleDateString()
                      : "--"}
                  </p>
                  <div className="flex items-center justify-center self-center">
                    <Badge
                      variant="outline"
                      className={`text-[9px] uppercase tracking-widest ${
                        statusColors[statusLabel] ??
                        "border-outline-variant/30 text-outline"
                      }`}
                    >
                      {statusLabel.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="text-on-surface-variant text-sm text-center self-center">
                    {client.assigned_matchmaker_id
                      ? matchmakerNameMap[client.assigned_matchmaker_id] ?? "--"
                      : "--"}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-surface-container-low rounded-2xl shadow-xl p-8 text-center">
            <span
              className="material-symbols-outlined text-3xl text-outline mb-2"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
            >
              calendar_month
            </span>
            <p className="text-on-surface-variant text-sm">
              No consultations booked yet.
            </p>
          </div>
        )}
      </section>

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
