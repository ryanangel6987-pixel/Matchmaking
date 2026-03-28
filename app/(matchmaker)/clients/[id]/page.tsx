export const dynamic = "force-dynamic";
export const metadata = { title: "Client Overview | Matchmaker Portal" };

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ClientSubNav } from "@/components/matchmaker/client-sub-nav";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: clientId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles").select("id").eq("auth_user_id", user.id).single();
  if (!profile) redirect("/login");

  const { data: client } = await supabase
    .from("clients")
    .select("*, profiles!clients_profile_id_fkey(full_name, avatar_url)")
    .eq("id", clientId)
    .eq("assigned_matchmaker_id", profile.id)
    .single();

  if (!client) redirect("/clients");

  const clientName = (client.profiles as any)?.full_name ?? "Unknown Client";

  const [
    { data: kpi },
    { data: recentStats },
    { data: pendingOpps },
    { data: onboarding },
    { data: accountHealth },
    { data: credentials },
  ] = await Promise.all([
    supabase.from("client_kpi_summary").select("*").eq("client_id", clientId).maybeSingle(),
    supabase.from("daily_app_stats").select("*, dating_apps(app_name)").eq("client_id", clientId).order("stat_date", { ascending: false }).limit(5),
    supabase.from("date_opportunities").select("*").eq("client_id", clientId).neq("status", "archived").order("created_at", { ascending: false }).limit(5),
    supabase.from("onboarding_data").select("*").eq("client_id", clientId).maybeSingle(),
    supabase.from("account_health").select("*, dating_apps(app_name)").eq("client_id", clientId),
    supabase.from("credentials").select("id").eq("client_id", clientId),
  ]);

  // Helper for rendering field rows
  const Field = ({ label, value }: { label: string; value: any }) => (
    <div>
      <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-on-surface text-sm">{value ?? "—"}</p>
    </div>
  );

  const Tags = ({ label, items, color = "gold" }: { label: string; items?: string[] | null; color?: string }) => (
    <div>
      <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {items?.length ? items.map((t) => (
          <span key={t} className={`text-xs px-2.5 py-1 rounded-full ${
            color === "red" ? "bg-red-400/10 text-red-400" : "bg-gold/10 text-gold"
          }`}>{t}</span>
        )) : <span className="text-on-surface-variant text-xs">—</span>}
      </div>
    </div>
  );

  const heightDisplay = onboarding?.height_inches
    ? `${Math.floor(onboarding.height_inches / 12)}'${onboarding.height_inches % 12}"`
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/clients" className="text-gold text-xs uppercase tracking-widest hover:text-gold-light transition-colors">
          ← Back to Clients
        </Link>
        <div className="flex items-center gap-3 mt-2">
          <h1 className="text-3xl font-heading font-bold text-on-surface">{clientName}</h1>
          <Badge variant="outline" className="text-[9px] uppercase tracking-widest border-outline-variant/30 text-outline">
            {client.onboarding_status.replace(/_/g, " ")}
          </Badge>
          <Badge variant="outline" className="text-[9px] uppercase tracking-widest border-gold/30 text-gold">
            {client.mm_pipeline_stage?.replace(/_/g, " ") ?? "date assigned"}
          </Badge>
        </div>
      </div>

      <ClientSubNav clientId={clientId} />

      {/* ═══ KPI STRIP ═══ */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {[
          { label: "Swipes", value: kpi?.total_swipes ?? 0 },
          { label: "Matches", value: kpi?.total_matches ?? 0 },
          { label: "Convos", value: kpi?.total_conversations ?? 0 },
          { label: "Dates Closed", value: kpi?.total_dates_closed ?? 0 },
          { label: "Approved", value: kpi?.dates_approved ?? 0, highlight: true },
          { label: "Apps", value: credentials?.length ?? 0 },
        ].map((s) => (
          <div key={s.label} className={`p-3 rounded-xl text-center ${s.highlight ? "bg-gold/10" : "bg-surface-container-low"}`}>
            <p className={`font-heading text-xl font-bold ${s.highlight ? "text-gold" : "text-on-surface"}`}>
              {(s.value as number).toLocaleString()}
            </p>
            <p className="text-on-surface-variant text-[9px] uppercase tracking-widest mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ═══ ACCOUNT HEALTH ═══ */}
      {accountHealth && accountHealth.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {accountHealth.map((ah) => (
            <div
              key={ah.id}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                ah.health_status === "green"
                  ? "bg-green-400/10 text-green-400 border border-green-400/20"
                  : ah.health_status === "yellow"
                  ? "bg-yellow-400/10 text-yellow-400 border border-yellow-400/20"
                  : "bg-red-400/10 text-error-red border border-red-400/20"
              }`}
            >
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}>
                {ah.health_status === "green" ? "check_circle" : ah.health_status === "yellow" ? "warning" : "error"}
              </span>
              {(ah.dating_apps as any)?.app_name ?? "App"}
            </div>
          ))}
        </div>
      )}

      {/* ═══ TWO COLUMN: PROFILE + ACTIVITY ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* LEFT: Client Profile (3 cols) */}
        <div className="lg:col-span-3 space-y-4">

          {onboarding ? (
            <>
              {/* WHO THEY ARE */}
              <div className="bg-surface-container-low rounded-2xl p-5 space-y-4">
                <h3 className="text-gold text-[10px] uppercase tracking-widest font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>person</span>
                  About the Client
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Field label="Full Name" value={onboarding.full_name} />
                  <Field label="Age" value={onboarding.age} />
                  <Field label="Height" value={heightDisplay} />
                  <Field label="City" value={onboarding.city} />
                  <Field label="Neighborhood" value={onboarding.neighborhood} />
                  <Field label="Profession" value={onboarding.profession} />
                  <Field label="Title" value={onboarding.title} />
                  <Field label="Ethnicity" value={onboarding.own_ethnicity} />
                  <Field label="Body Type" value={onboarding.own_body_type} />
                  <Field label="Has Kids" value={onboarding.has_kids} />
                  {onboarding.kids_details && <Field label="Kids Details" value={onboarding.kids_details} />}
                  <Field label="Drinks" value={onboarding.drinks_alcohol} />
                  <Field label="Preferred Date Type" value={onboarding.preferred_date_type} />
                  <Field label="Education" value={Array.isArray(onboarding.education) ? onboarding.education.join(", ") : onboarding.education} />
                  <Field label="Relationship Goal" value={onboarding.target_relationship_intent?.replace(/_/g, " ")} />
                  <Field label="Date Frequency" value={onboarding.target_date_frequency} />
                </div>
                {onboarding.surprising_fact && (
                  <Field label="Surprising Fact" value={onboarding.surprising_fact} />
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-outline-variant/10">
                  <Tags label="Hobbies & Interests" items={onboarding.hobbies_and_interests} />
                  <Tags label="Dating Apps Used" items={onboarding.dating_apps_used} />
                  <Tags label="Open to Apps" items={onboarding.dating_apps_open_to} />
                  <Tags label="Previous Apps" items={onboarding.previous_apps} />
                  <Tags label="Previous Services" items={onboarding.previous_services} />
                </div>
                {(onboarding.personality_summary || onboarding.lifestyle_notes || onboarding.client_notes) && (
                  <div className="space-y-3 pt-2 border-t border-outline-variant/10">
                    {onboarding.personality_summary && <Field label="Personality Summary" value={onboarding.personality_summary} />}
                    {onboarding.lifestyle_notes && <Field label="Lifestyle Notes" value={onboarding.lifestyle_notes} />}
                    {onboarding.client_notes && <Field label="Client Notes (About Himself)" value={onboarding.client_notes} />}
                  </div>
                )}
              </div>

              {/* WHAT THEY WANT */}
              <div className="bg-surface-container-low rounded-2xl p-5 space-y-4">
                <h3 className="text-gold text-[10px] uppercase tracking-widest font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>favorite</span>
                  What They Want
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Field label="Target Age" value={
                    onboarding.target_age_min || onboarding.target_age_max
                      ? `${onboarding.target_age_min ?? "?"} – ${onboarding.target_age_max ?? "?"}`
                      : null
                  } />
                  <Field label="Max Distance" value={
                    onboarding.target_max_distance_miles ? `${onboarding.target_max_distance_miles} miles` : null
                  } />
                  <Field label="Education Pref" value={onboarding.target_education_preference} />
                  <Field label="Kids Pref" value={onboarding.kids_preference?.replace(/_/g, " ")} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Tags label="Preferred Professions" items={onboarding.target_profession_preferences} />
                  <Tags label="Deal Breakers" items={onboarding.target_deal_breakers} color="red" />
                </div>
                {onboarding.target_physical_preferences && Object.keys(onboarding.target_physical_preferences).length > 0 && (
                  <div className="pt-2 border-t border-outline-variant/10">
                    <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-2">Physical Preferences</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {Object.entries(onboarding.target_physical_preferences as Record<string, any>).map(([key, value]) => (
                        <Field key={key} label={key.replace(/_/g, " ")} value={Array.isArray(value) ? value.join(", ") : String(value)} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* LOGISTICS */}
              <div className="bg-surface-container-low rounded-2xl p-5 space-y-4">
                <h3 className="text-gold text-[10px] uppercase tracking-widest font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>calendar_month</span>
                  Logistics & Scheduling
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Field label="First Date Style" value={onboarding.preferred_first_date_style} />
                  <Field label="Budget Comfort" value={onboarding.budget_comfort} />
                  <Field label="Comms Channel" value={onboarding.preferred_communication_channel} />
                  <Field label="Channel Verified" value={onboarding.communication_channel_verified ? "Yes" : "No"} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Tags label="Days Available" items={onboarding.days_available} />
                  <Tags label="Preferred Times" items={onboarding.preferred_date_times} />
                  <Tags label="Preferred Neighborhoods" items={onboarding.preferred_neighborhoods} />
                  <Tags label="Blackout Dates" items={onboarding.blackout_dates?.map((d: string) => new Date(d).toLocaleDateString("en-US"))} color="red" />
                  <Tags label="Venue Categories" items={onboarding.venues_to_use ?? onboarding.venue_categories} />
                  <Tags label="Venue No-Gos" items={onboarding.venues_to_avoid ?? onboarding.venue_no_gos} color="red" />
                </div>
                {onboarding.drink_preferences && <Field label="Drink Preferences" value={onboarding.drink_preferences} />}
                {onboarding.venue_suggestions && <Field label="Venue Suggestions" value={onboarding.venue_suggestions} />}
              </div>

              {/* NOTES & CONTEXT */}
              {(onboarding.target_30_day_outcome || onboarding.prior_matchmaker_experience || onboarding.anything_else || onboarding.photo_exclusions?.length > 0) && (
                <div className="bg-surface-container-low rounded-2xl p-5 space-y-4">
                  <h3 className="text-gold text-[10px] uppercase tracking-widest font-medium flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>sticky_note_2</span>
                    Notes & Context
                  </h3>
                  {onboarding.target_30_day_outcome && <Field label="30-Day Target Outcome" value={onboarding.target_30_day_outcome} />}
                  {onboarding.prior_matchmaker_experience && <Field label="Prior Matchmaker Experience" value={onboarding.prior_matchmaker_experience} />}
                  {onboarding.anything_else && <Field label="Additional Client Notes" value={onboarding.anything_else} />}
                  <Tags label="Photo Exclusions" items={onboarding.photo_exclusions} color="red" />
                  <Field label="AI Enhancement Consent" value={onboarding.ai_enhancement_consent ? "Yes" : "No"} />
                </div>
              )}
            </>
          ) : (
            <div className="bg-surface-container-low rounded-2xl p-8 text-center">
              <span className="material-symbols-outlined text-4xl text-outline/30 mb-3 block" style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>person_off</span>
              <p className="text-on-surface-variant text-sm">No onboarding data submitted yet.</p>
            </div>
          )}
        </div>

        {/* RIGHT: Activity Feed (2 cols) */}
        <div className="lg:col-span-2 space-y-4">

          {/* Recent Stats */}
          <div className="bg-surface-container-low rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-gold text-[10px] uppercase tracking-widest font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>bar_chart</span>
                Recent Stats
              </h3>
              <Link href={`/clients/${clientId}/stats`} className="text-gold text-[10px] uppercase tracking-widest hover:text-gold-light">
                Log Stats →
              </Link>
            </div>
            {recentStats && recentStats.length > 0 ? (
              <div className="space-y-1.5">
                {recentStats.map((stat) => (
                  <div key={stat.id} className="flex items-center justify-between py-1.5 border-b border-outline-variant/10 last:border-0">
                    <div>
                      <span className="text-on-surface text-xs">{new Date(stat.stat_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                      {(stat.dating_apps as any)?.app_name && (
                        <span className="text-outline text-[10px] ml-2">{(stat.dating_apps as any).app_name}</span>
                      )}
                    </div>
                    <div className="flex gap-3 text-[10px] text-on-surface-variant font-mono">
                      <span>S:{stat.swipes}</span>
                      <span>M:{stat.new_matches}</span>
                      <span>C:{stat.conversations}</span>
                      <span>D:{stat.dates_closed}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-on-surface-variant/60 text-xs">No stats uploaded yet.</p>
            )}
          </div>

          {/* Date Opportunities */}
          <div className="bg-surface-container-low rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-gold text-[10px] uppercase tracking-widest font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>favorite</span>
                Recent Dates
              </h3>
              <Link href={`/clients/${clientId}/opportunities`} className="text-gold text-[10px] uppercase tracking-widest hover:text-gold-light">
                Manage →
              </Link>
            </div>
            {pendingOpps && pendingOpps.length > 0 ? (
              <div className="space-y-1.5">
                {pendingOpps.map((opp) => (
                  <div key={opp.id} className="flex items-center justify-between py-1.5 border-b border-outline-variant/10 last:border-0">
                    <div className="min-w-0">
                      <p className="text-on-surface text-xs font-medium truncate">{opp.candidate_name}</p>
                      <p className="text-on-surface-variant text-[10px]">{opp.status.replace(/_/g, " ")}</p>
                    </div>
                    <span className={`text-[8px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      opp.client_decision === "approved" ? "bg-gold/15 text-gold"
                      : opp.client_decision === "declined" ? "bg-red-400/10 text-red-400"
                      : "bg-outline-variant/20 text-on-surface-variant"
                    }`}>
                      {opp.client_decision}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-on-surface-variant/60 text-xs">No active opportunities.</p>
            )}
          </div>

          {/* Quick Links */}
          <div className="bg-surface-container-low rounded-2xl p-5 space-y-2">
            <h3 className="text-gold text-[10px] uppercase tracking-widest font-medium mb-1">Quick Actions</h3>
            {[
              { href: `/clients/${clientId}/stats`, icon: "bar_chart", label: "Log Daily Stats" },
              { href: `/clients/${clientId}/opportunities`, icon: "favorite", label: "New Date Opportunity" },
              { href: `/clients/${clientId}/photos`, icon: "photo_library", label: "Review Photos" },
              { href: `/clients/${clientId}/credentials`, icon: "key", label: "Credential Vault" },
              { href: `/clients/${clientId}/notes`, icon: "sticky_note_2", label: "Add Note" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-gold text-base" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
