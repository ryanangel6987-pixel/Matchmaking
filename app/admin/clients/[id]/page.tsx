export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import ReassignMatchmaker from "@/components/admin/reassign-matchmaker";

export default async function AdminClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: clientId } = await params;
  const supabase = await createClient();

  // Admin can see ALL clients — no assignment check
  const { data: client } = await supabase
    .from("clients")
    .select(
      "*, profiles!clients_profile_id_fkey(full_name, avatar_url, setup_complete), matchmaker:profiles!clients_assigned_matchmaker_id_fkey(full_name)"
    )
    .eq("id", clientId)
    .single();

  if (!client) redirect("/admin/clients");

  const clientName = (client.profiles as any)?.full_name ?? "Unknown Client";
  const matchmakerName = (client.matchmaker as any)?.full_name ?? "Unassigned";

  // Fetch everything in parallel
  const [
    { data: kpi },
    { data: onboarding },
    { data: preferences },
    { data: accountHealth },
    { data: photos },
    { data: dateOpps },
    { data: recentStats },
    { data: actions },
    { data: alerts },
    { data: supportNotes },
    { data: matchmakers },
    { data: credentials },
    { data: searchAreas },
    { data: availability },
    { data: preferenceAssets },
  ] = await Promise.all([
    supabase
      .from("client_kpi_summary")
      .select("*")
      .eq("client_id", clientId)
      .single(),
    supabase
      .from("onboarding_data")
      .select("*")
      .eq("client_id", clientId)
      .single(),
    supabase
      .from("preferences")
      .select("*")
      .eq("client_id", clientId)
      .single(),
    supabase
      .from("account_health")
      .select("*, dating_apps(name)")
      .eq("client_id", clientId),
    supabase
      .from("photos")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false }),
    supabase
      .from("date_opportunities")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("daily_app_stats")
      .select("*, dating_apps(name)")
      .eq("client_id", clientId)
      .order("stat_date", { ascending: false })
      .limit(10),
    supabase
      .from("actions")
      .select("*, assignee:profiles!actions_assigned_to_fkey(full_name)")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("alerts")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("support_notes")
      .select("*, author:profiles!support_notes_created_by_fkey(full_name)")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("profiles")
      .select("id, full_name")
      .eq("role", "matchmaker"),
    supabase
      .from("credentials")
      .select("*, dating_apps(name)")
      .eq("client_id", clientId),
    supabase
      .from("client_search_areas")
      .select("*")
      .eq("client_id", clientId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("client_availability")
      .select("*")
      .eq("client_id", clientId)
      .order("day_of_week", { ascending: true }),
    supabase
      .from("preference_assets")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false }),
  ]);

  const iconStyle = {
    fontVariationSettings: "'FILL' 0, 'wght' 300",
  };

  return (
    <div className="space-y-10">
      {/* ── Header ─────────────────────────────────────────── */}
      <div>
        <Link
          href="/admin/clients"
          className="text-gold text-xs uppercase tracking-widest hover:text-gold-light transition-colors inline-flex items-center gap-1"
        >
          <span
            className="material-symbols-outlined text-sm"
            style={iconStyle}
          >
            arrow_back
          </span>
          Back to All Clients
        </Link>
        <h1 className="text-3xl font-heading font-bold text-on-surface mt-3">
          {clientName}
        </h1>
        <div className="h-px w-20 bg-gradient-to-r from-gold to-transparent mt-2 mb-3" />
        <div className="flex flex-wrap items-center gap-3 mt-2">
          <Badge
            variant="outline"
            className="text-[9px] uppercase tracking-widest border-outline-variant/30 text-outline"
          >
            {client.onboarding_status.replace(/_/g, " ")}
          </Badge>
          <span className="text-on-surface-variant text-xs flex items-center gap-1.5">
            <span
              className="material-symbols-outlined text-sm text-gold"
              style={iconStyle}
            >
              badge
            </span>
            Matchmaker: {matchmakerName}
          </span>
          <span className="text-on-surface-variant text-xs flex items-center gap-1.5">
            <span
              className="material-symbols-outlined text-sm text-gold"
              style={iconStyle}
            >
              apps
            </span>
            Active apps: {client.active_apps?.join(", ") || "None"}
          </span>
          <span className="text-outline text-[10px]">
            Client ID: {clientId}
          </span>
        </div>
      </div>

      {/* ── KPI Summary ────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-on-surface-variant text-xs uppercase tracking-widest flex items-center gap-2">
          <span
            className="material-symbols-outlined text-base text-gold"
            style={iconStyle}
          >
            monitoring
          </span>
          KPI Summary
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Total Swipes", value: kpi?.total_swipes ?? 0, icon: "swipe_right" },
            { label: "Matches", value: kpi?.total_matches ?? 0, icon: "handshake" },
            { label: "Conversations", value: kpi?.total_conversations ?? 0, icon: "chat" },
            { label: "Dates Closed", value: kpi?.total_dates_closed ?? 0, icon: "event_available" },
            {
              label: "Dates Approved",
              value: kpi?.dates_approved ?? 0,
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
                {(s.value as number).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Client Profile / Onboarding Data ───────────────── */}
      <section className="space-y-4">
        <h2 className="text-on-surface-variant text-xs uppercase tracking-widest flex items-center gap-2">
          <span
            className="material-symbols-outlined text-base text-gold"
            style={iconStyle}
          >
            person
          </span>
          Client Profile
        </h2>
        {onboarding ? (
          <div className="bg-surface-container-low rounded-2xl shadow-xl p-6 space-y-5">
            {/* Top row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Full Name", value: onboarding.full_name },
                { label: "Age", value: onboarding.age },
                { label: "City", value: onboarding.city },
                { label: "Neighborhood", value: onboarding.neighborhood },
              ].map((f) => (
                <div key={f.label}>
                  <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-1">
                    {f.label}
                  </p>
                  <p className="text-on-surface text-sm">
                    {f.value ?? "—"}
                  </p>
                </div>
              ))}
            </div>

            <div className="h-px bg-outline-variant/20" />

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "Profession", value: onboarding.profession },
                { label: "Title", value: onboarding.title },
                {
                  label: "Communication Preference",
                  value: onboarding.preferred_communication_channel,
                },
                { label: "Height", value: onboarding.height_inches ? `${onboarding.height_inches}"` : null },
                { label: "Education", value: onboarding.education?.join(", ") },
                { label: "Drinks", value: onboarding.drinks_alcohol },
                { label: "Has Kids", value: onboarding.has_kids },
              ].map((f) => (
                <div key={f.label}>
                  <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-1">
                    {f.label}
                  </p>
                  <p className="text-on-surface text-sm">
                    {f.value ?? "—"}
                  </p>
                </div>
              ))}
            </div>

            {/* Long-form fields */}
            {[
              { label: "Personality Summary", value: onboarding.personality_summary },
              { label: "Relationship Intent", value: onboarding.target_relationship_intent },
              { label: "Deal Breakers", value: onboarding.target_deal_breakers?.join(", ") },
              { label: "Preferred First Date Style", value: onboarding.preferred_first_date_style },
              { label: "Kids Details", value: onboarding.kids_details },
              { label: "Client Notes", value: onboarding.client_notes },
              { label: "Lifestyle Notes", value: onboarding.lifestyle_notes },
            ].map((f) => (
              <div key={f.label}>
                <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-1">
                  {f.label}
                </p>
                <p className="text-on-surface text-sm whitespace-pre-wrap leading-relaxed">
                  {f.value ?? "—"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-surface-container-low rounded-2xl shadow-xl p-6">
            <p className="text-on-surface-variant text-sm">
              No onboarding data submitted yet.
            </p>
          </div>
        )}
      </section>

      {/* ── Preferences ────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-on-surface-variant text-xs uppercase tracking-widest flex items-center gap-2">
          <span
            className="material-symbols-outlined text-base text-gold"
            style={iconStyle}
          >
            tune
          </span>
          Preferences
        </h2>
        {preferences ? (
          <div className="bg-surface-container-low rounded-2xl shadow-xl p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                {
                  label: "Age Range",
                  value:
                    preferences.age_range_min && preferences.age_range_max
                      ? `${preferences.age_range_min} – ${preferences.age_range_max}`
                      : null,
                },
                {
                  label: "Max Distance",
                  value: preferences.max_distance_miles
                    ? `${preferences.max_distance_miles} mi`
                    : null,
                },
                {
                  label: "Height Range",
                  value:
                    preferences.height_range_min && preferences.height_range_max
                      ? `${preferences.height_range_min}" – ${preferences.height_range_max}"`
                      : null,
                },
                {
                  label: "Preferred Ethnicities",
                  value: preferences.preferred_ethnicities?.join(", "),
                },
                {
                  label: "Preferred Body Types",
                  value: preferences.preferred_body_types?.join(", "),
                },
                {
                  label: "Preferred Education",
                  value: preferences.preferred_education?.join(", "),
                },
                {
                  label: "Preferred Professions",
                  value: preferences.preferred_professions?.join(", "),
                },
              ].map((f) => (
                <div key={f.label}>
                  <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-1">
                    {f.label}
                  </p>
                  <p className="text-on-surface text-sm">
                    {f.value || "—"}
                  </p>
                </div>
              ))}
            </div>
            {preferences.additional_notes && (
              <div className="mt-4 pt-4 border-t border-outline-variant/20">
                <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-1">
                  Additional Notes
                </p>
                <p className="text-on-surface text-sm whitespace-pre-wrap leading-relaxed">
                  {preferences.additional_notes}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-surface-container-low rounded-2xl shadow-xl p-6">
            <p className="text-on-surface-variant text-sm">
              No preferences set yet.
            </p>
          </div>
        )}
      </section>

      {/* ── Search Areas ──────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-on-surface-variant text-xs uppercase tracking-widest flex items-center gap-2">
          <span
            className="material-symbols-outlined text-base text-gold"
            style={iconStyle}
          >
            location_on
          </span>
          Search Areas
        </h2>
        {searchAreas && searchAreas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {searchAreas.map((area) => (
              <div
                key={area.id}
                className="bg-surface-container-low rounded-2xl shadow-xl p-4 flex items-center gap-3"
              >
                <span
                  className="material-symbols-outlined text-lg text-gold"
                  style={iconStyle}
                >
                  my_location
                </span>
                <div>
                  <p className="text-on-surface text-sm font-medium font-heading">
                    {area.location_name}
                  </p>
                  <p className="text-on-surface-variant text-xs mt-0.5">
                    {area.radius_miles} mile radius
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-surface-container-low rounded-2xl shadow-xl p-6">
            <p className="text-on-surface-variant text-sm">
              No search areas set.
            </p>
          </div>
        )}
      </section>

      {/* ── Availability ─────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-on-surface-variant text-xs uppercase tracking-widest flex items-center gap-2">
          <span
            className="material-symbols-outlined text-base text-gold"
            style={iconStyle}
          >
            calendar_month
          </span>
          Availability
        </h2>
        {availability && availability.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {availability.map((slot) => (
              <div
                key={slot.id}
                className="bg-surface-container-low rounded-2xl shadow-xl p-4 flex items-center gap-3"
              >
                <span
                  className="material-symbols-outlined text-lg text-on-surface-variant"
                  style={iconStyle}
                >
                  schedule
                </span>
                <div>
                  <p className="text-on-surface text-sm font-medium font-heading">
                    {slot.day_of_week}
                  </p>
                  <p className="text-on-surface-variant text-xs mt-0.5">
                    {slot.start_time} – {slot.end_time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-surface-container-low rounded-2xl shadow-xl p-6">
            <p className="text-on-surface-variant text-sm">
              No availability set.
            </p>
          </div>
        )}
      </section>

      {/* ── Preference Assets (Visual References) ────────── */}
      <section className="space-y-4">
        <h2 className="text-on-surface-variant text-xs uppercase tracking-widest flex items-center gap-2">
          <span
            className="material-symbols-outlined text-base text-gold"
            style={iconStyle}
          >
            collections
          </span>
          Preference Assets
        </h2>
        {preferenceAssets && preferenceAssets.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {preferenceAssets.map((asset) => (
              <div
                key={asset.id}
                className="bg-surface-container-low rounded-2xl shadow-xl p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className="text-[9px] uppercase tracking-widest border-outline-variant/30 text-outline"
                  >
                    {asset.asset_type}
                  </Badge>
                </div>
                {asset.storage_url ? (
                  <img
                    src={asset.storage_url}
                    alt={asset.notes || "Reference photo"}
                    className="w-full h-24 object-cover rounded-xl"
                  />
                ) : (
                  <div className="flex items-center justify-center h-24 rounded-xl bg-surface-container-high">
                    <span
                      className="material-symbols-outlined text-2xl text-on-surface-variant"
                      style={iconStyle}
                    >
                      image
                    </span>
                  </div>
                )}
                {asset.notes && (
                  <p className="text-on-surface-variant text-[10px] leading-snug truncate">
                    {asset.notes}
                  </p>
                )}
                {asset.tags && asset.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {asset.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="text-[9px] text-on-surface-variant bg-surface-container-high rounded-full px-1.5 py-0.5"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-surface-container-low rounded-2xl shadow-xl p-6">
            <p className="text-on-surface-variant text-sm">
              No preference assets uploaded.
            </p>
          </div>
        )}
      </section>

      {/* ── Account Health ─────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-on-surface-variant text-xs uppercase tracking-widest flex items-center gap-2">
          <span
            className="material-symbols-outlined text-base text-gold"
            style={iconStyle}
          >
            health_and_safety
          </span>
          Account Health
        </h2>
        {accountHealth && accountHealth.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accountHealth.map((ah) => (
              <div
                key={ah.id}
                className="bg-surface-container-low rounded-2xl shadow-xl p-5 flex items-start gap-4"
              >
                <span
                  className={`material-symbols-outlined text-2xl ${
                    ah.health_status === "green"
                      ? "text-green-400"
                      : ah.health_status === "yellow"
                      ? "text-yellow-400"
                      : "text-error-red"
                  }`}
                  style={iconStyle}
                >
                  {ah.health_status === "green"
                    ? "check_circle"
                    : ah.health_status === "yellow"
                    ? "warning"
                    : "error"}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-on-surface text-sm font-medium font-heading">
                      {(ah.dating_apps as any)?.name ?? "Unknown App"}
                    </p>
                    <Badge
                      variant="outline"
                      className="text-[9px] uppercase tracking-widest border-outline-variant/30 text-outline"
                    >
                      {ah.health_status}
                    </Badge>
                  </div>
                  {ah.notes && (
                    <p className="text-on-surface-variant text-xs mt-1">
                      {ah.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-surface-container-low rounded-2xl shadow-xl p-6">
            <p className="text-on-surface-variant text-sm">
              No account health data.
            </p>
          </div>
        )}
      </section>

      {/* ── Credentials (Admin Only) ──────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-on-surface-variant text-xs uppercase tracking-widest flex items-center gap-2">
          <span
            className="material-symbols-outlined text-base text-gold"
            style={iconStyle}
          >
            key
          </span>
          Credentials
          <Badge
            variant="outline"
            className="text-[9px] uppercase tracking-widest border-gold/30 text-gold ml-2"
          >
            Admin Only
          </Badge>
        </h2>
        {credentials && credentials.length > 0 ? (
          <div className="space-y-2">
            {credentials.map((cred) => (
              <div
                key={cred.id}
                className="bg-surface-container-low rounded-2xl shadow-xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="material-symbols-outlined text-lg text-on-surface-variant"
                    style={iconStyle}
                  >
                    lock
                  </span>
                  <div>
                    <p className="text-on-surface text-sm font-medium font-heading">
                      {(cred.dating_apps as any)?.name ?? "Unknown App"}
                    </p>
                    <p className="text-on-surface-variant text-xs mt-0.5">
                      Username: {cred.encrypted_username}
                    </p>
                    {cred.notes && (
                      <p className="text-on-surface-variant text-xs mt-0.5">
                        {cred.notes}
                      </p>
                    )}
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="text-[9px] uppercase tracking-widest border-outline-variant/30 text-outline"
                >
                  {cred.status}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-surface-container-low rounded-2xl shadow-xl p-6">
            <p className="text-on-surface-variant text-sm">
              No credentials stored.
            </p>
          </div>
        )}
      </section>

      {/* ── Photos ─────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-on-surface-variant text-xs uppercase tracking-widest flex items-center gap-2">
          <span
            className="material-symbols-outlined text-base text-gold"
            style={iconStyle}
          >
            photo_library
          </span>
          Photos
        </h2>
        {photos && photos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="bg-surface-container-low rounded-2xl shadow-xl p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant text-[10px] uppercase tracking-widest">
                    v{photo.version}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[9px] uppercase tracking-widest ${
                      photo.status === "approved"
                        ? "border-gold/30 text-gold"
                        : photo.status === "rejected"
                        ? "border-error-red/30 text-error-red"
                        : "border-outline-variant/30 text-outline"
                    }`}
                  >
                    {photo.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-center h-16 rounded-xl bg-surface-container-high">
                  <span
                    className="material-symbols-outlined text-2xl text-on-surface-variant"
                    style={iconStyle}
                  >
                    image
                  </span>
                </div>
                {photo.feedback && (
                  <p className="text-on-surface-variant text-[10px] leading-snug truncate">
                    {photo.feedback}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-surface-container-low rounded-2xl shadow-xl p-6">
            <p className="text-on-surface-variant text-sm">
              No photos uploaded.
            </p>
          </div>
        )}
      </section>

      {/* ── Date Opportunities ─────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-on-surface-variant text-xs uppercase tracking-widest flex items-center gap-2">
          <span
            className="material-symbols-outlined text-base text-gold"
            style={iconStyle}
          >
            favorite
          </span>
          Date Opportunities
        </h2>
        {dateOpps && dateOpps.length > 0 ? (
          <div className="space-y-2">
            {dateOpps.map((opp) => (
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
                    {opp.proposed_date && (
                      <span className="flex items-center gap-1">
                        <span
                          className="material-symbols-outlined text-xs"
                          style={iconStyle}
                        >
                          calendar_today
                        </span>
                        {new Date(opp.proposed_date).toLocaleDateString()}
                      </span>
                    )}
                    {opp.proposed_time && (
                      <span className="flex items-center gap-1">
                        <span
                          className="material-symbols-outlined text-xs"
                          style={iconStyle}
                        >
                          schedule
                        </span>
                        {opp.proposed_time}
                      </span>
                    )}
                    {opp.notes && (
                      <span className="truncate max-w-xs">{opp.notes}</span>
                    )}
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
            ))}
          </div>
        ) : (
          <div className="bg-surface-container-low rounded-2xl shadow-xl p-6">
            <p className="text-on-surface-variant text-sm">
              No date opportunities.
            </p>
          </div>
        )}
      </section>

      {/* ── Recent Daily Stats ─────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-on-surface-variant text-xs uppercase tracking-widest flex items-center gap-2">
          <span
            className="material-symbols-outlined text-base text-gold"
            style={iconStyle}
          >
            bar_chart
          </span>
          Recent Daily Stats
        </h2>
        {recentStats && recentStats.length > 0 ? (
          <div className="space-y-2">
            {recentStats.map((stat) => (
              <div
                key={stat.id}
                className="bg-surface-container-low rounded-2xl shadow-xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-on-surface text-sm font-medium">
                    {new Date(stat.stat_date).toLocaleDateString()}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[9px] uppercase tracking-widest border-outline-variant/30 text-outline"
                  >
                    {(stat.dating_apps as any)?.name ?? "—"}
                  </Badge>
                </div>
                <div className="flex gap-5 text-xs">
                  <span className="text-on-surface-variant">
                    <span className="text-on-surface font-medium">{stat.swipes}</span>{" "}
                    swipes
                  </span>
                  <span className="text-on-surface-variant">
                    <span className="text-on-surface font-medium">{stat.new_matches}</span>{" "}
                    matches
                  </span>
                  <span className="text-on-surface-variant">
                    <span className="text-on-surface font-medium">{stat.conversations}</span>{" "}
                    convos
                  </span>
                  <span className="text-on-surface-variant">
                    <span className="text-on-surface font-medium">{stat.dates_closed}</span>{" "}
                    dates
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-surface-container-low rounded-2xl shadow-xl p-6">
            <p className="text-on-surface-variant text-sm">
              No stats uploaded yet.
            </p>
          </div>
        )}
      </section>

      {/* ── Actions / Tasks ────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-on-surface-variant text-xs uppercase tracking-widest flex items-center gap-2">
          <span
            className="material-symbols-outlined text-base text-gold"
            style={iconStyle}
          >
            task_alt
          </span>
          Actions / Tasks
        </h2>
        {actions && actions.length > 0 ? (
          <div className="space-y-2">
            {actions.map((action) => (
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
                          action.priority === "high" || action.priority === "urgent"
                            ? "border-error-red/30 text-error-red"
                            : "border-outline-variant/30 text-outline"
                        }`}
                      >
                        {action.priority}
                      </Badge>
                    </div>
                    {action.description && (
                      <p className="text-on-surface-variant text-xs mt-1 leading-relaxed">
                        {action.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-3 mt-2 text-[10px] text-on-surface-variant">
                      <span>
                        Assigned to:{" "}
                        {(action.assignee as any)?.full_name ?? "Unassigned"}
                      </span>
                      {action.due_date && (
                        <span>
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
            ))}
          </div>
        ) : (
          <div className="bg-surface-container-low rounded-2xl shadow-xl p-6">
            <p className="text-on-surface-variant text-sm">No actions.</p>
          </div>
        )}
      </section>

      {/* ── Alerts ─────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-on-surface-variant text-xs uppercase tracking-widest flex items-center gap-2">
          <span
            className="material-symbols-outlined text-base text-gold"
            style={iconStyle}
          >
            notifications
          </span>
          Alerts
        </h2>
        {alerts && alerts.length > 0 ? (
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`bg-surface-container-low rounded-2xl shadow-xl p-4 flex items-start gap-3 ${
                  !alert.is_read ? "border-l-2 border-gold" : ""
                }`}
              >
                <span
                  className={`material-symbols-outlined text-lg mt-0.5 ${
                    !alert.is_read
                      ? "text-gold"
                      : "text-on-surface-variant"
                  }`}
                  style={iconStyle}
                >
                  {alert.alert_type === "warning"
                    ? "warning"
                    : alert.alert_type === "error"
                    ? "error"
                    : "info"}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-on-surface text-sm font-medium font-heading">
                      {alert.title}
                    </p>
                    <div className="flex items-center gap-2">
                      {!alert.is_read && (
                        <Badge
                          variant="outline"
                          className="text-[9px] uppercase tracking-widest border-gold/30 text-gold"
                        >
                          Unread
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className="text-[9px] uppercase tracking-widest border-outline-variant/30 text-outline"
                      >
                        {alert.alert_type}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-on-surface-variant text-xs mt-1">
                    {alert.message}
                  </p>
                  <p className="text-outline text-[10px] mt-1.5">
                    {new Date(alert.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-surface-container-low rounded-2xl shadow-xl p-6">
            <p className="text-on-surface-variant text-sm">No alerts.</p>
          </div>
        )}
      </section>

      {/* ── Support Notes ──────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-on-surface-variant text-xs uppercase tracking-widest flex items-center gap-2">
          <span
            className="material-symbols-outlined text-base text-gold"
            style={iconStyle}
          >
            sticky_note_2
          </span>
          Support Notes
        </h2>
        {supportNotes && supportNotes.length > 0 ? (
          <div className="space-y-2">
            {supportNotes.map((note) => (
              <div
                key={note.id}
                className="bg-surface-container-low rounded-2xl shadow-xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-on-surface-variant text-xs flex items-center gap-1.5">
                    <span
                      className="material-symbols-outlined text-sm"
                      style={iconStyle}
                    >
                      person
                    </span>
                    {(note.author as any)?.full_name ?? "Unknown"}
                  </span>
                  <span className="text-outline text-[10px]">
                    {new Date(note.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-on-surface text-sm whitespace-pre-wrap leading-relaxed">
                  {note.content}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-surface-container-low rounded-2xl shadow-xl p-6">
            <p className="text-on-surface-variant text-sm">
              No support notes.
            </p>
          </div>
        )}
      </section>

      {/* ── Reassign Matchmaker ────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-on-surface-variant text-xs uppercase tracking-widest flex items-center gap-2">
          <span
            className="material-symbols-outlined text-base text-gold"
            style={iconStyle}
          >
            swap_horiz
          </span>
          Reassign Matchmaker
          <Badge
            variant="outline"
            className="text-[9px] uppercase tracking-widest border-gold/30 text-gold ml-2"
          >
            Admin Only
          </Badge>
        </h2>
        <div className="bg-surface-container-low rounded-2xl shadow-xl p-6">
          <p className="text-on-surface-variant text-xs mb-3">
            Current matchmaker:{" "}
            <span className="text-on-surface font-medium">{matchmakerName}</span>
          </p>
          <ReassignMatchmaker
            clientId={clientId}
            currentMatchmakerId={client.assigned_matchmaker_id}
            matchmakers={
              (matchmakers ?? []).map((m) => ({
                id: m.id,
                full_name: m.full_name,
              }))
            }
          />
        </div>
      </section>
    </div>
  );
}
