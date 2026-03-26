export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { WhatsAppEditor } from "@/components/admin/whatsapp-editor";

export default async function AdminMatchmakerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: matchmakerId } = await params;
  const supabase = await createClient();

  // Fetch matchmaker profile
  const { data: matchmaker } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, whatsapp_number, created_at")
    .eq("id", matchmakerId)
    .eq("role", "matchmaker")
    .single();

  if (!matchmaker) redirect("/admin/matchmakers");

  // Fetch all assigned clients with their profiles and KPIs
  const { data: clients } = await supabase
    .from("clients")
    .select(
      "id, onboarding_status, profiles!clients_profile_id_fkey(full_name)"
    )
    .eq("assigned_matchmaker_id", matchmakerId);

  const clientIds = (clients ?? []).map((c) => c.id);

  // Fetch everything in parallel
  const [
    { data: kpis },
    { data: dateOpps },
    { data: actions },
    { data: auditLogs },
    { data: availability },
    { data: sessions },
    { count: totalSessionCount },
    { data: allSessions },
  ] = await Promise.all([
    // KPIs for all assigned clients
    clientIds.length > 0
      ? supabase
          .from("client_kpi_summary")
          .select("*")
          .in("client_id", clientIds)
      : Promise.resolve({ data: [] as any[] }),
    // Recent date opportunities for their clients
    clientIds.length > 0
      ? supabase
          .from("date_opportunities")
          .select(
            "id, client_id, candidate_name, status, client_decision, created_at, clients!inner(profiles!clients_profile_id_fkey(full_name))"
          )
          .in("client_id", clientIds)
          .order("created_at", { ascending: false })
          .limit(15)
      : Promise.resolve({ data: [] as any[] }),
    // Open actions assigned to this matchmaker
    supabase
      .from("actions")
      .select(
        "id, client_id, title, status, priority, due_date, created_at, clients!inner(profiles!clients_profile_id_fkey(full_name))"
      )
      .eq("assigned_to", matchmakerId)
      .in("status", ["open", "in_progress"])
      .order("created_at", { ascending: false })
      .limit(20),
    // Recent audit activity
    supabase
      .from("audit_logs")
      .select("id, action_type, target_table, created_at")
      .eq("user_id", matchmakerId)
      .order("created_at", { ascending: false })
      .limit(20),
    // Matchmaker availability / working hours
    supabase
      .from("matchmaker_availability")
      .select("id, working_days, start_time, end_time, timezone, notes")
      .eq("profile_id", matchmakerId)
      .single(),
    // Last 30 sessions
    supabase
      .from("matchmaker_sessions")
      .select("id, login_at, logout_at, duration_minutes")
      .eq("profile_id", matchmakerId)
      .order("login_at", { ascending: false })
      .limit(30),
    // Total session count (all time)
    supabase
      .from("matchmaker_sessions")
      .select("*", { count: "exact", head: true })
      .eq("profile_id", matchmakerId),
    // All sessions for total hours calc
    supabase
      .from("matchmaker_sessions")
      .select("duration_minutes, login_at")
      .eq("profile_id", matchmakerId),
  ]);

  // Build KPI lookup by client_id and aggregate totals
  const kpiMap: Record<string, any> = {};
  let totalSwipes = 0;
  let totalMatches = 0;
  let totalConversations = 0;
  let totalDatesClosed = 0;
  let totalDatesApproved = 0;

  for (const k of kpis ?? []) {
    kpiMap[k.client_id] = k;
    totalSwipes += k.total_swipes ?? 0;
    totalMatches += k.total_matches ?? 0;
    totalConversations += k.total_conversations ?? 0;
    totalDatesClosed += k.total_dates_closed ?? 0;
    totalDatesApproved += k.dates_approved ?? 0;
  }

  // Session stats
  const totalHoursLogged =
    (allSessions ?? []).reduce(
      (sum: number, s: { duration_minutes: number | null }) =>
        sum + (s.duration_minutes ?? 0),
      0
    ) / 60;

  const completedSessions = (allSessions ?? []).filter(
    (s: { duration_minutes: number | null }) => s.duration_minutes != null
  );
  const avgSessionLength =
    completedSessions.length > 0
      ? completedSessions.reduce(
          (sum: number, s: { duration_minutes: number | null }) =>
            sum + (s.duration_minutes ?? 0),
          0
        ) / completedSessions.length
      : 0;

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const sessionsThisWeek = (allSessions ?? []).filter(
    (s: { login_at: string }) => new Date(s.login_at) >= weekAgo
  ).length;

  // Day abbreviation map
  const dayAbbr: Record<string, string> = {
    monday: "M",
    tuesday: "T",
    wednesday: "W",
    thursday: "Th",
    friday: "F",
    saturday: "Sa",
    sunday: "Su",
  };

  const iconStyle = {
    fontVariationSettings: "'FILL' 0, 'wght' 300",
  };

  return (
    <div className="space-y-10">
      {/* ── Header ─────────────────────────────────────────── */}
      <div>
        <Link
          href="/admin/matchmakers"
          className="text-gold text-xs uppercase tracking-widest hover:text-gold-light transition-colors inline-flex items-center gap-1"
        >
          <span
            className="material-symbols-outlined text-sm"
            style={iconStyle}
          >
            arrow_back
          </span>
          Back to All Matchmakers
        </Link>
        <h1 className="text-3xl font-heading font-bold text-on-surface mt-3">
          {matchmaker.full_name}
        </h1>
        <div className="h-px w-20 bg-gradient-to-r from-gold to-transparent mt-2 mb-3" />
        <div className="flex flex-wrap items-center gap-3 mt-2">
          <Badge
            variant="outline"
            className="text-[9px] uppercase tracking-widest border-gold/30 text-gold"
          >
            Matchmaker
          </Badge>
          <span className="text-on-surface-variant text-xs flex items-center gap-1.5">
            <span
              className="material-symbols-outlined text-sm text-gold"
              style={iconStyle}
            >
              calendar_today
            </span>
            Joined {new Date(matchmaker.created_at).toLocaleDateString()}
          </span>
          <span className="text-on-surface-variant text-xs flex items-center gap-1.5">
            <span
              className="material-symbols-outlined text-sm text-gold"
              style={iconStyle}
            >
              group
            </span>
            {clientIds.length} client{clientIds.length !== 1 ? "s" : ""}
          </span>
          <span className="text-outline text-[10px]">
            Profile ID: {matchmakerId}
          </span>
        </div>
        <div className="mt-4">
          <WhatsAppEditor profileId={matchmakerId} currentNumber={matchmaker.whatsapp_number} />
        </div>
      </div>

      {/* ── Working Hours ──────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-on-surface-variant text-xs uppercase tracking-widest flex items-center gap-2">
          <span
            className="material-symbols-outlined text-base text-gold"
            style={iconStyle}
          >
            schedule
          </span>
          Working Hours
        </h2>
        {availability ? (
          <div className="bg-surface-container-low rounded-2xl shadow-xl p-5 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {(availability.working_days ?? []).map((day: string) => (
                <span
                  key={day}
                  className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-medium uppercase tracking-wide"
                >
                  {dayAbbr[day.toLowerCase()] ?? day}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <span className="flex items-center gap-2 text-on-surface">
                <span
                  className="material-symbols-outlined text-base text-gold"
                  style={iconStyle}
                >
                  access_time
                </span>
                {availability.start_time?.slice(0, 5)} &ndash;{" "}
                {availability.end_time?.slice(0, 5)}
              </span>
              <span className="flex items-center gap-2 text-on-surface-variant">
                <span
                  className="material-symbols-outlined text-base text-gold"
                  style={iconStyle}
                >
                  public
                </span>
                {availability.timezone}
              </span>
            </div>
            {availability.notes && (
              <p className="text-on-surface-variant text-xs italic">
                {availability.notes}
              </p>
            )}
          </div>
        ) : (
          <div className="bg-surface-container-low rounded-2xl shadow-xl p-6">
            <p className="text-on-surface-variant text-sm">
              Not configured yet
            </p>
          </div>
        )}
      </section>

      {/* ── Session Activity ──────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-on-surface-variant text-xs uppercase tracking-widest flex items-center gap-2">
          <span
            className="material-symbols-outlined text-base text-gold"
            style={iconStyle}
          >
            timer
          </span>
          Session Activity
        </h2>

        {/* Session Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Total Sessions",
              value: (totalSessionCount ?? 0).toLocaleString(),
              icon: "login",
            },
            {
              label: "Total Hours",
              value: totalHoursLogged.toFixed(1),
              icon: "hourglass_top",
            },
            {
              label: "Avg Session",
              value: `${Math.round(avgSessionLength)}m`,
              icon: "avg_pace",
            },
            {
              label: "This Week",
              value: sessionsThisWeek.toString(),
              icon: "date_range",
              highlight: true,
            },
          ].map((s) => (
            <div
              key={s.label}
              className={`p-4 rounded-2xl ${
                s.highlight
                  ? "bg-gold/10 border border-gold/20"
                  : "bg-surface-container-low"
              } shadow-xl`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`material-symbols-outlined text-base ${
                    s.highlight ? "text-gold" : "text-on-surface-variant"
                  }`}
                  style={iconStyle}
                >
                  {s.icon}
                </span>
                <p className="text-on-surface-variant text-[10px] uppercase tracking-widest">
                  {s.label}
                </p>
              </div>
              <p
                className={`font-heading text-2xl font-bold ${
                  s.highlight ? "text-gold" : "text-on-surface"
                }`}
              >
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Recent Sessions List */}
        {sessions && sessions.length > 0 ? (
          <div className="space-y-2">
            {sessions.map(
              (session: {
                id: string;
                login_at: string;
                logout_at: string | null;
                duration_minutes: number | null;
              }) => {
                const isActive = !session.logout_at;
                const isLong =
                  (session.duration_minutes ?? 0) >= 240 && !isActive;
                const isShort =
                  (session.duration_minutes ?? 0) < 30 &&
                  session.duration_minutes != null &&
                  !isActive;

                return (
                  <div
                    key={session.id}
                    className={`rounded-2xl shadow-xl p-4 flex items-center justify-between ${
                      isLong
                        ? "bg-gold/10 border border-gold/20"
                        : "bg-surface-container-low"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`material-symbols-outlined text-base ${
                          isActive
                            ? "text-green-400"
                            : isLong
                              ? "text-gold"
                              : "text-on-surface-variant"
                        }`}
                        style={iconStyle}
                      >
                        {isActive ? "radio_button_checked" : "schedule"}
                      </span>
                      <div>
                        <p className="text-on-surface text-sm">
                          {new Date(session.login_at).toLocaleString()}
                        </p>
                        <p className="text-on-surface-variant text-xs mt-0.5">
                          {isActive ? (
                            <span className="text-green-400 font-medium">
                              Active now
                            </span>
                          ) : session.logout_at ? (
                            <>
                              Logout:{" "}
                              {new Date(session.logout_at).toLocaleString()}
                            </>
                          ) : null}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {isActive ? (
                        <Badge
                          variant="outline"
                          className="text-[9px] uppercase tracking-widest border-green-400/30 text-green-400"
                        >
                          Active
                        </Badge>
                      ) : (
                        <span
                          className={`font-heading text-sm font-bold ${
                            isLong
                              ? "text-gold"
                              : isShort
                                ? "text-on-surface-variant"
                                : "text-on-surface"
                          }`}
                        >
                          {session.duration_minutes != null
                            ? session.duration_minutes >= 60
                              ? `${Math.floor(session.duration_minutes / 60)}h ${session.duration_minutes % 60}m`
                              : `${session.duration_minutes}m`
                            : "--"}
                        </span>
                      )}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        ) : (
          <div className="bg-surface-container-low rounded-2xl shadow-xl p-6">
            <p className="text-on-surface-variant text-sm">
              No session activity recorded.
            </p>
          </div>
        )}
      </section>

      {/* ── Performance Overview ──────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-on-surface-variant text-xs uppercase tracking-widest flex items-center gap-2">
          <span
            className="material-symbols-outlined text-base text-gold"
            style={iconStyle}
          >
            monitoring
          </span>
          Performance Overview
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Total Swipes", value: totalSwipes, icon: "swipe_right" },
            { label: "Matches", value: totalMatches, icon: "handshake" },
            { label: "Conversations", value: totalConversations, icon: "chat" },
            {
              label: "Dates Closed",
              value: totalDatesClosed,
              icon: "event_available",
            },
            {
              label: "Dates Approved",
              value: totalDatesApproved,
              icon: "thumb_up",
              highlight: true,
            },
          ].map((s) => (
            <div
              key={s.label}
              className={`p-4 rounded-2xl ${
                s.highlight
                  ? "bg-gold/10 border border-gold/20"
                  : "bg-surface-container-low"
              } shadow-xl`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`material-symbols-outlined text-base ${
                    s.highlight ? "text-gold" : "text-on-surface-variant"
                  }`}
                  style={iconStyle}
                >
                  {s.icon}
                </span>
                <p className="text-on-surface-variant text-[10px] uppercase tracking-widest">
                  {s.label}
                </p>
              </div>
              <p
                className={`font-heading text-2xl font-bold ${
                  s.highlight ? "text-gold" : "text-on-surface"
                }`}
              >
                {s.value.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Assigned Clients ─────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-on-surface-variant text-xs uppercase tracking-widest flex items-center gap-2">
          <span
            className="material-symbols-outlined text-base text-gold"
            style={iconStyle}
          >
            group
          </span>
          Assigned Clients
        </h2>
        {clients && clients.length > 0 ? (
          <div className="space-y-2">
            {clients.map((client) => {
              const kpi = kpiMap[client.id];
              const clientName =
                (client.profiles as any)?.full_name ?? "Unknown Client";
              return (
                <Link
                  key={client.id}
                  href={`/admin/clients/${client.id}`}
                  className="bg-surface-container-low rounded-2xl shadow-xl p-4 flex items-center justify-between hover:bg-surface-container-high transition-colors block"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="material-symbols-outlined text-lg text-on-surface-variant"
                      style={iconStyle}
                    >
                      person
                    </span>
                    <div>
                      <p className="text-on-surface text-sm font-medium font-heading">
                        {clientName}
                      </p>
                      <Badge
                        variant="outline"
                        className="text-[9px] uppercase tracking-widest border-outline-variant/30 text-outline mt-1"
                      >
                        {client.onboarding_status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-5 text-xs">
                    <span className="text-on-surface-variant">
                      <span className="text-on-surface font-medium">
                        {kpi?.total_swipes ?? 0}
                      </span>{" "}
                      swipes
                    </span>
                    <span className="text-on-surface-variant">
                      <span className="text-on-surface font-medium">
                        {kpi?.total_matches ?? 0}
                      </span>{" "}
                      matches
                    </span>
                    <span className="text-on-surface-variant">
                      <span className="text-on-surface font-medium">
                        {kpi?.total_conversations ?? 0}
                      </span>{" "}
                      convos
                    </span>
                    <span className="text-on-surface-variant">
                      <span className="text-on-surface font-medium">
                        {kpi?.total_dates_closed ?? 0}
                      </span>{" "}
                      dates
                    </span>
                    <span className="text-gold">
                      <span className="font-medium">
                        {kpi?.dates_approved ?? 0}
                      </span>{" "}
                      approved
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="bg-surface-container-low rounded-2xl shadow-xl p-6">
            <p className="text-on-surface-variant text-sm">
              No clients assigned to this matchmaker.
            </p>
          </div>
        )}
      </section>

      {/* ── Recent Date Opportunities ────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-on-surface-variant text-xs uppercase tracking-widest flex items-center gap-2">
          <span
            className="material-symbols-outlined text-base text-gold"
            style={iconStyle}
          >
            favorite
          </span>
          Recent Date Opportunities
        </h2>
        {dateOpps && dateOpps.length > 0 ? (
          <div className="space-y-2">
            {dateOpps.map((opp) => {
              const oppClientName =
                (opp.clients as any)?.profiles?.full_name ?? "Unknown Client";
              return (
                <div
                  key={opp.id}
                  className="bg-surface-container-low rounded-2xl shadow-xl p-4 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="text-on-surface text-sm font-medium font-heading">
                        {opp.candidate_name}
                      </p>
                      <Badge
                        variant="outline"
                        className="text-[9px] uppercase tracking-widest border-outline-variant/30 text-outline"
                      >
                        {opp.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-1.5 text-on-surface-variant text-xs">
                      <span className="flex items-center gap-1">
                        <span
                          className="material-symbols-outlined text-xs"
                          style={iconStyle}
                        >
                          person
                        </span>
                        For: {oppClientName}
                      </span>
                      <span className="flex items-center gap-1">
                        <span
                          className="material-symbols-outlined text-xs"
                          style={iconStyle}
                        >
                          schedule
                        </span>
                        {new Date(opp.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[9px] uppercase tracking-widest ml-3 ${
                      opp.client_decision === "approved"
                        ? "border-gold/30 text-gold"
                        : opp.client_decision === "declined"
                        ? "border-error-red/30 text-error-red"
                        : "border-outline-variant/30 text-outline"
                    }`}
                  >
                    {opp.client_decision ?? "pending"}
                  </Badge>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-surface-container-low rounded-2xl shadow-xl p-6">
            <p className="text-on-surface-variant text-sm">
              No date opportunities yet.
            </p>
          </div>
        )}
      </section>

      {/* ── Open Actions / Tasks ─────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-on-surface-variant text-xs uppercase tracking-widest flex items-center gap-2">
          <span
            className="material-symbols-outlined text-base text-gold"
            style={iconStyle}
          >
            task_alt
          </span>
          Open Actions / Tasks
        </h2>
        {actions && actions.length > 0 ? (
          <div className="space-y-2">
            {actions.map((action) => {
              const actionClientName =
                (action.clients as any)?.profiles?.full_name ??
                "Unknown Client";
              return (
                <div
                  key={action.id}
                  className="bg-surface-container-low rounded-2xl shadow-xl p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-on-surface text-sm font-medium font-heading">
                          {action.title}
                        </p>
                        <Badge
                          variant="outline"
                          className={`text-[9px] uppercase tracking-widest ${
                            action.priority === "high" ||
                            action.priority === "urgent"
                              ? "border-error-red/30 text-error-red"
                              : "border-outline-variant/30 text-outline"
                          }`}
                        >
                          {action.priority}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-3 mt-2 text-[10px] text-on-surface-variant">
                        <span className="flex items-center gap-1">
                          <span
                            className="material-symbols-outlined text-xs"
                            style={iconStyle}
                          >
                            person
                          </span>
                          Client: {actionClientName}
                        </span>
                        {action.due_date && (
                          <span className="flex items-center gap-1">
                            <span
                              className="material-symbols-outlined text-xs"
                              style={iconStyle}
                            >
                              event
                            </span>
                            Due:{" "}
                            {new Date(action.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[9px] uppercase tracking-widest border-outline-variant/30 text-outline ml-3"
                    >
                      {action.status}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-surface-container-low rounded-2xl shadow-xl p-6">
            <p className="text-on-surface-variant text-sm">
              No open actions.
            </p>
          </div>
        )}
      </section>

      {/* ── Recent Audit Activity ────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-on-surface-variant text-xs uppercase tracking-widest flex items-center gap-2">
          <span
            className="material-symbols-outlined text-base text-gold"
            style={iconStyle}
          >
            history
          </span>
          Recent Audit Activity
        </h2>
        {auditLogs && auditLogs.length > 0 ? (
          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="bg-surface-container-low rounded-2xl shadow-xl p-3 flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="material-symbols-outlined text-base text-on-surface-variant"
                    style={iconStyle}
                  >
                    edit_note
                  </span>
                  <span className="text-gold">{log.action_type}</span>
                  <span className="text-on-surface-variant">
                    on {log.target_table}
                  </span>
                </div>
                <span className="text-outline text-xs shrink-0 ml-4">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-surface-container-low rounded-2xl shadow-xl p-6">
            <p className="text-on-surface-variant text-sm">
              No audit activity recorded.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
