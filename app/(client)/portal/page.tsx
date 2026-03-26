export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ClientPortal } from "@/components/client-portal";

export default async function PortalPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("auth_user_id", user.id)
    .single();

  if (!profile) redirect("/login");

  const { data: client } = await supabase
    .from("clients")
    .select("id, assigned_matchmaker_id")
    .eq("profile_id", profile.id)
    .single();

  if (!client) {
    return (
      <div className="space-y-6">
        <h1 className="font-heading text-3xl font-bold text-gold tracking-tight">
          Welcome
        </h1>
        <p className="text-on-surface-variant">
          Your account is being set up. Please contact your matchmaker.
        </p>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Single massive Promise.all — deduplicated across all 5 tabs
  // ---------------------------------------------------------------------------
  const [
    // Dashboard + Overview shared
    { data: kpiSummary },
    { data: allOpportunities },
    { data: actions },
    // Dashboard
    { data: dailyStats },
    { data: accountHealth },
    // Dashboard + Profile shared (fetch full photos for profile, dashboard uses subset)
    { data: photos },
    // Shared: dashboard + preferences + access
    { data: datingApps },
    // Overview
    { data: alerts },
    // Overview + Preferences shared
    { data: candidates },
    { data: onboarding },
    // Preferences
    { data: preferences },
    { data: preferenceAssets },
    { data: approvedType },
    { data: venues },
    { data: availability },
    { data: searchAreas },
    // Access
    { data: credentials },
    { data: supportNotes },
  ] = await Promise.all([
    // kpiSummary — dashboard + overview
    supabase
      .from("client_kpi_summary")
      .select("*")
      .eq("client_id", client.id)
      .single(),
    // allOpportunities — dashboard uses all, overview derives subsets
    supabase
      .from("date_opportunities")
      .select("*, venues(venue_name), dating_apps(app_name)")
      .eq("client_id", client.id)
      .order("created_at", { ascending: false }),
    // actions (open) — dashboard + overview
    supabase
      .from("actions")
      .select("*")
      .eq("client_id", client.id)
      .eq("status", "open")
      .order("due_date", { ascending: true }),
    // dailyStats — dashboard only
    supabase
      .from("daily_app_stats")
      .select("*, dating_apps(app_name)")
      .eq("client_id", client.id)
      .order("stat_date", { ascending: true }),
    // accountHealth — dashboard + access
    supabase
      .from("account_health")
      .select("*, dating_apps(app_name)")
      .eq("client_id", client.id),
    // photos (full) — profile uses all fields, dashboard uses id+status
    supabase
      .from("photos")
      .select("*")
      .eq("client_id", client.id)
      .order("created_at", { ascending: false }),
    // datingApps — dashboard + preferences + access
    supabase.from("dating_apps").select("*").eq("is_active", true),
    // alerts — overview
    supabase
      .from("alerts")
      .select("*")
      .eq("client_id", client.id)
      .eq("read", false)
      .order("created_at", { ascending: false })
      .limit(5),
    // candidates — overview + preferences (fetch with dating_apps join for preferences)
    supabase
      .from("candidates")
      .select("*, dating_apps(app_name)")
      .eq("client_id", client.id)
      .neq("status", "archived")
      .order("created_at", { ascending: false }),
    // onboarding — overview (full_name) + preferences (full) + access (communication)
    supabase
      .from("onboarding_data")
      .select("*")
      .eq("client_id", client.id)
      .single(),
    // preferences — preferences tab
    supabase
      .from("preferences")
      .select("*")
      .eq("client_id", client.id)
      .single(),
    // preferenceAssets — preferences tab
    supabase
      .from("preference_assets")
      .select("*")
      .eq("client_id", client.id)
      .order("created_at", { ascending: false }),
    // approvedType — preferences tab
    supabase
      .from("approved_type")
      .select("*")
      .eq("client_id", client.id)
      .single(),
    // venues — preferences tab
    supabase
      .from("venues")
      .select("*")
      .eq("client_id", client.id)
      .order("name"),
    // availability — preferences tab
    supabase
      .from("client_availability")
      .select("*")
      .eq("client_id", client.id)
      .order("day_of_week"),
    // searchAreas — preferences tab
    supabase
      .from("client_search_areas")
      .select("*")
      .eq("client_id", client.id)
      .order("sort_order"),
    // credentials — access tab
    supabase
      .from("credentials")
      .select("*, dating_apps(app_name)")
      .eq("client_id", client.id),
    // supportNotes — access tab
    supabase
      .from("support_notes")
      .select("*")
      .eq("client_id", client.id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  // ---------------------------------------------------------------------------
  // Matchmaker info for access tab (conditional, not in the main Promise.all)
  // ---------------------------------------------------------------------------
  let matchmakerName: string | null = null;
  let matchmakerWhatsApp: string | null = null;
  let matchmakerAvailability: any = null;

  if (client.assigned_matchmaker_id) {
    const mmId = client.assigned_matchmaker_id;
    const [{ data: matchmaker }, { data: avail }] = await Promise.all([
      supabase.from("profiles").select("full_name").eq("id", mmId).single(),
      supabase
        .from("matchmaker_availability")
        .select("*")
        .eq("profile_id", mmId)
        .single(),
    ]);
    matchmakerName = matchmaker?.full_name ?? null;
    matchmakerAvailability = avail;
    try {
      const { data: mm2 } = await supabase
        .from("profiles")
        .select("whatsapp_number")
        .eq("id", mmId)
        .single();
      matchmakerWhatsApp = (mm2 as any)?.whatsapp_number ?? null;
    } catch {
      // Column may not exist yet
    }
  }

  // ---------------------------------------------------------------------------
  // Derive subsets for overview tab from allOpportunities
  // ---------------------------------------------------------------------------
  const safeOpportunities = allOpportunities ?? [];

  const pendingOpportunities = safeOpportunities.filter(
    (o: any) => o.status === "pending_client_approval"
  );

  const thirtyDaysAgo = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000
  ).toISOString();
  const recentApproved = safeOpportunities.filter(
    (o: any) =>
      o.client_decision === "approved" &&
      o.client_decision_at &&
      o.client_decision_at >= thirtyDaysAgo
  );

  const declinedDates = safeOpportunities
    .filter((o: any) => o.client_decision === "declined")
    .slice(0, 20);

  // For preferences tab — approved/declined without venue join (already have it)
  const preferencesApprovedDates = safeOpportunities
    .filter((o: any) => o.client_decision === "approved")
    .slice(0, 20);
  const preferencesDeclinedDates = declinedDates;

  const displayName = onboarding?.full_name || profile.full_name;

  return (
    <ClientPortal
      clientId={client.id}
      clientName={displayName}
      // Dashboard props
      dashboardData={{
        dailyStats: dailyStats ?? [],
        kpiSummary,
        allOpportunities: safeOpportunities,
        actions: actions ?? [],
        datingApps: datingApps ?? [],
        photos: (photos ?? []).map((p: any) => ({ id: p.id, status: p.status })),
        accountHealth: accountHealth ?? [],
      }}
      // Overview (Dates) props
      overviewData={{
        clientId: client.id,
        clientName: displayName,
        pendingOpportunities,
        recentApproved,
        declinedDates,
        kpiSummary,
        alerts: alerts ?? [],
        actions: (actions ?? []).slice(0, 3),
        candidates: candidates ?? [],
      }}
      // Preferences (Taste Calibration) props
      preferencesData={{
        clientId: client.id,
        onboarding,
        preferences,
        preferenceAssets: preferenceAssets ?? [],
        approvedType,
        candidates: candidates ?? [],
        datingApps: datingApps ?? [],
        venues: venues ?? [],
        availability: availability ?? [],
        searchAreas: searchAreas ?? [],
        approvedDates: preferencesApprovedDates,
        declinedDates: preferencesDeclinedDates,
      }}
      // Profile props
      profileData={{
        clientId: client.id,
        photos: photos ?? [],
      }}
      // Access (Credentials Vault) props
      accessData={{
        clientId: client.id,
        credentials: credentials ?? [],
        datingApps: datingApps ?? [],
        communication: onboarding,
        matchmakerName,
        matchmakerWhatsApp,
        matchmakerAvailability,
        accountHealth: accountHealth ?? [],
        supportNotes: supportNotes ?? [],
      }}
    />
  );
}
