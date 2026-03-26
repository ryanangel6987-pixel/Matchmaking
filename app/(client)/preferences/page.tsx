export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PreferencesResponsive } from "@/components/preferences/preferences-responsive";

export default async function PreferencesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get client record
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  if (!profile) redirect("/login");

  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("profile_id", profile.id)
    .single();

  if (!client) {
    return (
      <div className="space-y-6">
        <h1 className="font-heading text-3xl font-bold text-gold tracking-tight">
          Taste Calibration
        </h1>
        <p className="text-on-surface-variant">
          Your onboarding has not been completed yet. Please contact your matchmaker.
        </p>
      </div>
    );
  }

  // Fetch all data in parallel
  const [
    { data: onboarding },
    { data: preferences },
    { data: preferenceAssets },
    { data: approvedType },
    { data: candidates },
    { data: datingApps },
    { data: venues },
    { data: availability },
    { data: searchAreas },
    { data: approvedDates },
    { data: declinedDates },
  ] = await Promise.all([
    supabase
      .from("onboarding_data")
      .select("*")
      .eq("client_id", client.id)
      .single(),
    supabase
      .from("preferences")
      .select("*")
      .eq("client_id", client.id)
      .single(),
    supabase
      .from("preference_assets")
      .select("*")
      .eq("client_id", client.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("approved_type")
      .select("*")
      .eq("client_id", client.id)
      .single(),
    supabase
      .from("candidates")
      .select("*, dating_apps(app_name)")
      .eq("client_id", client.id)
      .order("created_at", { ascending: false }),
    supabase.from("dating_apps").select("*").eq("is_active", true),
    supabase
      .from("venues")
      .select("*")
      .eq("client_id", client.id)
      .order("name"),
    supabase
      .from("client_availability")
      .select("*")
      .eq("client_id", client.id)
      .order("day_of_week"),
    supabase
      .from("client_search_areas")
      .select("*")
      .eq("client_id", client.id)
      .order("sort_order"),
    supabase
      .from("date_opportunities")
      .select("*")
      .eq("client_id", client.id)
      .eq("client_decision", "approved")
      .order("client_decision_at", { ascending: false })
      .limit(20),
    supabase
      .from("date_opportunities")
      .select("*")
      .eq("client_id", client.id)
      .eq("client_decision", "declined")
      .order("client_decision_at", { ascending: false })
      .limit(20),
  ]);

  return (
    <PreferencesResponsive
      clientId={client.id}
      onboarding={onboarding}
      preferences={preferences}
      preferenceAssets={preferenceAssets ?? []}
      approvedType={approvedType}
      candidates={candidates ?? []}
      datingApps={datingApps ?? []}
      venues={venues ?? []}
      availability={availability ?? []}
      searchAreas={searchAreas ?? []}
      approvedDates={approvedDates ?? []}
      declinedDates={declinedDates ?? []}
    />
  );
}
