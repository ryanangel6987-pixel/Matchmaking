export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: clientId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles").select("id").eq("auth_user_id", user.id).single();
  if (!profile) redirect("/login");

  // Verify this matchmaker is assigned
  const { data: client } = await supabase
    .from("clients")
    .select("*, profiles!clients_profile_id_fkey(full_name)")
    .eq("id", clientId)
    .eq("assigned_matchmaker_id", profile.id)
    .single();

  if (!client) redirect("/clients");

  const clientName = (client.profiles as any)?.full_name ?? "Unknown Client";

  // Fetch summary data
  const [
    { data: kpi },
    { data: recentStats },
    { data: pendingOpps },
    { data: photos },
    { data: onboarding },
    { data: accountHealth },
  ] = await Promise.all([
    supabase.from("client_kpi_summary").select("*").eq("client_id", clientId).single(),
    supabase.from("daily_app_stats").select("*").eq("client_id", clientId).order("stat_date", { ascending: false }).limit(5),
    supabase.from("date_opportunities").select("*").eq("client_id", clientId).neq("status", "archived").order("created_at", { ascending: false }).limit(10),
    supabase.from("photos").select("*").eq("client_id", clientId).order("created_at", { ascending: false }).limit(6),
    supabase.from("onboarding_data").select("*").eq("client_id", clientId).single(),
    supabase.from("account_health").select("*, dating_apps(name)").eq("client_id", clientId),
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/clients" className="text-gold text-xs uppercase tracking-widest hover:text-gold-light transition-colors">
            ← Back to Clients
          </Link>
          <h1 className="text-3xl font-heading font-bold text-on-surface mt-2">{clientName}</h1>
          <Badge variant="outline" className="text-[9px] uppercase tracking-widest border-outline-variant/30 text-outline mt-2">
            {client.onboarding_status.replace(/_/g, " ")}
          </Badge>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          href={`/clients/${clientId}/stats`}
          className="bg-surface-container-low p-6 rounded-2xl shadow-xl group hover:bg-surface-container-high transition-colors duration-300 flex items-center gap-4"
        >
          <span className="material-symbols-outlined text-3xl text-gold" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>bar_chart</span>
          <div>
            <p className="text-on-surface font-medium">Upload Daily Stats</p>
            <p className="text-on-surface-variant text-xs mt-0.5">Log swipes, matches, conversations, dates</p>
          </div>
        </Link>
        <Link
          href={`/clients/${clientId}/opportunities`}
          className="bg-surface-container-low p-6 rounded-2xl shadow-xl group hover:bg-surface-container-high transition-colors duration-300 flex items-center gap-4"
        >
          <span className="material-symbols-outlined text-3xl text-gold" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>favorite</span>
          <div>
            <p className="text-on-surface font-medium">Date Opportunities</p>
            <p className="text-on-surface-variant text-xs mt-0.5">Create and manage date handoffs</p>
          </div>
        </Link>
        <Link
          href={`/clients/${clientId}/photos`}
          className="bg-surface-container-low p-6 rounded-2xl shadow-xl group hover:bg-surface-container-high transition-colors duration-300 flex items-center gap-4"
        >
          <span className="material-symbols-outlined text-3xl text-gold" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>photo_library</span>
          <div>
            <p className="text-on-surface font-medium">Photo Review</p>
            <p className="text-on-surface-variant text-xs mt-0.5">Approve, request changes, or set photos live</p>
          </div>
        </Link>
        <Link
          href={`/clients/${clientId}/preferences`}
          className="bg-surface-container-low p-6 rounded-2xl shadow-xl group hover:bg-surface-container-high transition-colors duration-300 flex items-center gap-4"
        >
          <span className="material-symbols-outlined text-3xl text-gold" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>tune</span>
          <div>
            <p className="text-on-surface font-medium">Preferences & Type</p>
            <p className="text-on-surface-variant text-xs mt-0.5">Edit preferences, approved type, and candidates</p>
          </div>
        </Link>
        <Link
          href={`/clients/${clientId}/venues`}
          className="bg-surface-container-low p-6 rounded-2xl shadow-xl group hover:bg-surface-container-high transition-colors duration-300 flex items-center gap-4"
        >
          <span className="material-symbols-outlined text-3xl text-gold" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>location_on</span>
          <div>
            <p className="text-on-surface font-medium">Venues</p>
            <p className="text-on-surface-variant text-xs mt-0.5">Manage date venues, locations, and preferences</p>
          </div>
        </Link>
        <Link
          href={`/clients/${clientId}/notes`}
          className="bg-surface-container-low p-6 rounded-2xl shadow-xl group hover:bg-surface-container-high transition-colors duration-300 flex items-center gap-4"
        >
          <span className="material-symbols-outlined text-3xl text-gold" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>sticky_note_2</span>
          <div>
            <p className="text-on-surface font-medium">Notes</p>
            <p className="text-on-surface-variant text-xs mt-0.5">Internal support notes and updates</p>
          </div>
        </Link>
        <Link
          href={`/clients/${clientId}/credentials`}
          className="bg-surface-container-low p-6 rounded-2xl shadow-xl group hover:bg-surface-container-high transition-colors duration-300 flex items-center gap-4"
        >
          <span className="material-symbols-outlined text-3xl text-gold" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>key</span>
          <div>
            <p className="text-on-surface font-medium">Credentials</p>
            <p className="text-on-surface-variant text-xs mt-0.5">App logins and credential vault</p>
          </div>
        </Link>
        <Link
          href={`/clients/${clientId}/actions`}
          className="bg-surface-container-low p-6 rounded-2xl shadow-xl group hover:bg-surface-container-high transition-colors duration-300 flex items-center gap-4"
        >
          <span className="material-symbols-outlined text-3xl text-gold" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>task_alt</span>
          <div>
            <p className="text-on-surface font-medium">Actions & Alerts</p>
            <p className="text-on-surface-variant text-xs mt-0.5">Manage tasks, alerts, and follow-ups</p>
          </div>
        </Link>
      </div>

      {/* Client Profile */}
      <section className="space-y-4">
        <h2 className="text-on-surface-variant text-xs uppercase tracking-widest">Client Profile</h2>
        {onboarding ? (
          <div className="bg-surface-container-low rounded-2xl shadow-xl p-6 space-y-6">
            {/* Personal */}
            <div>
              <h3 className="text-gold text-[10px] uppercase tracking-widest font-medium mb-3">Personal</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Full Name", value: onboarding.full_name },
                  { label: "Age", value: onboarding.age },
                  { label: "City", value: onboarding.city },
                  { label: "Neighborhood", value: onboarding.neighborhood },
                  { label: "Profession", value: onboarding.profession },
                  { label: "Title", value: onboarding.title },
                  { label: "Height", value: onboarding.height_inches ? `${onboarding.height_inches}"` : null },
                  { label: "Has Kids", value: onboarding.has_kids },
                  { label: "Surprising Fact", value: onboarding.surprising_fact },
                ].map((f) => (
                  <div key={f.label}>
                    <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-1">{f.label}</p>
                    <p className="text-on-surface text-sm">{f.value ?? "—"}</p>
                  </div>
                ))}
              </div>
              {/* Tag lists for personal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-2">Dating Apps Used</p>
                  <div className="flex flex-wrap gap-1.5">
                    {onboarding.dating_apps_used?.length ? onboarding.dating_apps_used.map((app: string) => (
                      <span key={app} className="bg-gold/10 text-gold text-xs px-2.5 py-1 rounded-full">{app}</span>
                    )) : <span className="text-on-surface-variant text-sm">—</span>}
                  </div>
                </div>
                <div>
                  <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-2">Hobbies & Interests</p>
                  <div className="flex flex-wrap gap-1.5">
                    {onboarding.hobbies_and_interests?.length ? onboarding.hobbies_and_interests.map((h: string) => (
                      <span key={h} className="bg-gold/10 text-gold text-xs px-2.5 py-1 rounded-full">{h}</span>
                    )) : <span className="text-on-surface-variant text-sm">—</span>}
                  </div>
                </div>
              </div>
              {(onboarding.personality_summary || onboarding.lifestyle_notes) && (
                <div className="mt-4 space-y-3">
                  {onboarding.personality_summary && (
                    <div>
                      <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-1">Personality Summary</p>
                      <p className="text-on-surface text-sm whitespace-pre-wrap leading-relaxed">{onboarding.personality_summary}</p>
                    </div>
                  )}
                  {onboarding.lifestyle_notes && (
                    <div>
                      <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-1">Lifestyle Notes</p>
                      <p className="text-on-surface text-sm whitespace-pre-wrap leading-relaxed">{onboarding.lifestyle_notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Preferences & Logistics */}
            <div className="border-t border-outline-variant/20 pt-6">
              <h3 className="text-gold text-[10px] uppercase tracking-widest font-medium mb-3">Preferences & Logistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Communication Channel", value: onboarding.preferred_communication_channel },
                  { label: "First Date Style", value: onboarding.preferred_first_date_style },
                  { label: "Budget Comfort", value: onboarding.budget_comfort },
                  { label: "Date Frequency", value: onboarding.target_date_frequency },
                ].map((f) => (
                  <div key={f.label}>
                    <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-1">{f.label}</p>
                    <p className="text-on-surface text-sm">{f.value ?? "—"}</p>
                  </div>
                ))}
              </div>
              {/* Tag lists for preferences */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-2">Preferred Neighborhoods</p>
                  <div className="flex flex-wrap gap-1.5">
                    {onboarding.preferred_neighborhoods?.length ? onboarding.preferred_neighborhoods.map((n: string) => (
                      <span key={n} className="bg-gold/10 text-gold text-xs px-2.5 py-1 rounded-full">{n}</span>
                    )) : <span className="text-on-surface-variant text-sm">—</span>}
                  </div>
                </div>
                <div>
                  <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-2">Venue Categories</p>
                  <div className="flex flex-wrap gap-1.5">
                    {onboarding.venues_to_use?.length ? onboarding.venues_to_use.map((v: string) => (
                      <span key={v} className="bg-gold/10 text-gold text-xs px-2.5 py-1 rounded-full">{v}</span>
                    )) : <span className="text-on-surface-variant text-sm">—</span>}
                  </div>
                </div>
                <div>
                  <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-2">Venue No-Gos</p>
                  <div className="flex flex-wrap gap-1.5">
                    {onboarding.venues_to_avoid?.length ? onboarding.venues_to_avoid.map((v: string) => (
                      <span key={v} className="bg-red-400/10 text-red-400 text-xs px-2.5 py-1 rounded-full">{v}</span>
                    )) : <span className="text-on-surface-variant text-sm">—</span>}
                  </div>
                </div>
                <div>
                  <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-2">Blackout Dates</p>
                  <div className="flex flex-wrap gap-1.5">
                    {onboarding.blackout_dates?.length ? onboarding.blackout_dates.map((d: string) => (
                      <span key={d} className="bg-red-400/10 text-red-400 text-xs px-2.5 py-1 rounded-full">{new Date(d).toLocaleDateString()}</span>
                    )) : <span className="text-on-surface-variant text-sm">—</span>}
                  </div>
                </div>
                <div>
                  <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-2">Days Available</p>
                  <div className="flex flex-wrap gap-1.5">
                    {onboarding.days_available?.length ? onboarding.days_available.map((d: string) => (
                      <span key={d} className="bg-gold/10 text-gold text-xs px-2.5 py-1 rounded-full">{d}</span>
                    )) : <span className="text-on-surface-variant text-sm">—</span>}
                  </div>
                </div>
                <div>
                  <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-2">Preferred Date Times</p>
                  <div className="flex flex-wrap gap-1.5">
                    {onboarding.preferred_date_times?.length ? onboarding.preferred_date_times.map((t: string) => (
                      <span key={t} className="bg-gold/10 text-gold text-xs px-2.5 py-1 rounded-full">{t}</span>
                    )) : <span className="text-on-surface-variant text-sm">—</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Notes & Exclusions */}
            <div className="border-t border-outline-variant/20 pt-6">
              <h3 className="text-gold text-[10px] uppercase tracking-widest font-medium mb-3">Notes & Exclusions</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-2">Photo Exclusions</p>
                  <div className="flex flex-wrap gap-1.5">
                    {onboarding.photo_exclusions?.length ? onboarding.photo_exclusions.map((e: string) => (
                      <span key={e} className="bg-red-400/10 text-red-400 text-xs px-2.5 py-1 rounded-full">{e}</span>
                    )) : <span className="text-on-surface-variant text-sm">—</span>}
                  </div>
                </div>
                {onboarding.target_deal_breakers?.length > 0 && (
                  <div>
                    <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-2">Deal Breakers</p>
                    <div className="flex flex-wrap gap-1.5">
                      {onboarding.target_deal_breakers.map((db: string) => (
                        <span key={db} className="bg-red-400/10 text-red-400 text-xs px-2.5 py-1 rounded-full">{db}</span>
                      ))}
                    </div>
                  </div>
                )}
                {onboarding.anything_else && (
                  <div>
                    <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-1">Client Notes</p>
                    <p className="text-on-surface text-sm whitespace-pre-wrap leading-relaxed">{onboarding.anything_else}</p>
                  </div>
                )}
                {onboarding.prior_matchmaker_experience && (
                  <div>
                    <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-1">Prior Matchmaker Experience</p>
                    <p className="text-on-surface text-sm whitespace-pre-wrap leading-relaxed">{onboarding.prior_matchmaker_experience}</p>
                  </div>
                )}
                {onboarding.target_30_day_outcome && (
                  <div>
                    <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-1">30-Day Target Outcome</p>
                    <p className="text-on-surface text-sm whitespace-pre-wrap leading-relaxed">{onboarding.target_30_day_outcome}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-surface-container-low rounded-2xl shadow-xl p-6">
            <p className="text-on-surface-variant text-sm">No onboarding data submitted yet.</p>
          </div>
        )}
      </section>

      {/* Account Health */}
      <section className="space-y-4">
        <h2 className="text-on-surface-variant text-xs uppercase tracking-widest">Account Health</h2>
        {accountHealth && accountHealth.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {accountHealth.map((ah) => (
              <div
                key={ah.id}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                  ah.health_status === "green"
                    ? "bg-green-400/10 border border-green-400/20"
                    : ah.health_status === "yellow"
                    ? "bg-yellow-400/10 border border-yellow-400/20"
                    : "bg-red-400/10 border border-red-400/20"
                }`}
              >
                <span
                  className={`material-symbols-outlined text-sm ${
                    ah.health_status === "green"
                      ? "text-green-400"
                      : ah.health_status === "yellow"
                      ? "text-yellow-400"
                      : "text-error-red"
                  }`}
                  style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
                >
                  {ah.health_status === "green" ? "check_circle" : ah.health_status === "yellow" ? "warning" : "error"}
                </span>
                <span className="text-on-surface text-sm font-medium">
                  {(ah.dating_apps as any)?.name ?? "Unknown App"}
                </span>
                <Badge variant="outline" className="text-[9px] uppercase tracking-widest border-outline-variant/30 text-outline">
                  {ah.health_status}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-surface-container-low rounded-2xl shadow-xl p-6">
            <p className="text-on-surface-variant text-sm">No account health data.</p>
          </div>
        )}
      </section>

      {/* KPI Summary */}
      <section className="space-y-4">
        <h2 className="text-on-surface-variant text-xs uppercase tracking-widest">KPI Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Swipes", value: kpi?.total_swipes ?? 0 },
            { label: "Matches", value: kpi?.total_matches ?? 0 },
            { label: "Conversations", value: kpi?.total_conversations ?? 0 },
            { label: "Dates Closed", value: kpi?.total_dates_closed ?? 0 },
            { label: "Dates Approved", value: kpi?.dates_approved ?? 0, highlight: true },
          ].map((s) => (
            <div key={s.label} className={`p-4 rounded-xl ${s.highlight ? "bg-gold/10" : "bg-surface-container-low"}`}>
              <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-1">{s.label}</p>
              <p className={`font-heading text-2xl font-bold ${s.highlight ? "text-gold" : "text-on-surface"}`}>{(s.value as number).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Stats */}
      {recentStats && recentStats.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-on-surface-variant text-xs uppercase tracking-widest">Recent Stats Uploads</h2>
          <div className="space-y-2">
            {recentStats.map((stat) => (
              <div key={stat.id} className="bg-surface-container-low p-3 rounded-xl flex items-center justify-between text-sm">
                <span className="text-on-surface">{new Date(stat.stat_date).toLocaleDateString()}</span>
                <div className="flex gap-4 text-xs text-on-surface-variant">
                  <span>S:{stat.swipes}</span>
                  <span>M:{stat.new_matches}</span>
                  <span>C:{stat.conversations}</span>
                  <span>D:{stat.dates_closed}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Active Opportunities */}
      {pendingOpps && pendingOpps.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-on-surface-variant text-xs uppercase tracking-widest">Date Opportunities</h2>
          <div className="space-y-2">
            {pendingOpps.map((opp) => (
              <div key={opp.id} className="bg-surface-container-low p-4 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-on-surface text-sm font-medium font-heading">{opp.candidate_name}</p>
                  <p className="text-on-surface-variant text-xs mt-0.5">{opp.status.replace(/_/g, " ")}</p>
                </div>
                <Badge variant="outline" className={`text-[9px] uppercase tracking-widest ${opp.client_decision === "approved" ? "border-gold/30 text-gold" : opp.client_decision === "declined" ? "border-error-red/30 text-error-red" : "border-outline-variant/30 text-outline"}`}>
                  {opp.client_decision}
                </Badge>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
