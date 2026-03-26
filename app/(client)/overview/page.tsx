export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { OverviewResponsive } from "@/components/overview/overview-responsive";

export default async function OverviewPage() {
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
          Dates
        </h1>
        <p className="text-on-surface-variant">
          Your account is being set up. Please contact your matchmaker.
        </p>
      </div>
    );
  }

  // Fetch all overview data in parallel
  const [
    { data: pendingOpportunities },
    { data: recentOpportunities },
    { data: kpiSummary },
    { data: alerts },
    { data: declinedOpportunities },
    { data: actions },
    { data: candidates },
    { data: onboarding },
  ] = await Promise.all([
    supabase
      .from("date_opportunities")
      .select("*, venues(venue_name), dating_apps(app_name)")
      .eq("client_id", client.id)
      .eq("status", "pending_client_approval")
      .order("created_at", { ascending: false }),
    supabase
      .from("date_opportunities")
      .select("*, venues(venue_name)")
      .eq("client_id", client.id)
      .eq("client_decision", "approved")
      .gte("client_decision_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order("client_decision_at", { ascending: false }),
    supabase
      .from("client_kpi_summary")
      .select("*")
      .eq("client_id", client.id)
      .single(),
    supabase
      .from("date_opportunities")
      .select("*, venues(venue_name)")
      .eq("client_id", client.id)
      .eq("client_decision", "declined")
      .order("client_decision_at", { ascending: false })
      .limit(20),
    supabase
      .from("alerts")
      .select("*")
      .eq("client_id", client.id)
      .eq("read", false)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("actions")
      .select("*")
      .eq("client_id", client.id)
      .eq("status", "open")
      .order("due_date", { ascending: true })
      .limit(3),
    supabase
      .from("candidates")
      .select("*")
      .eq("client_id", client.id)
      .neq("status", "archived")
      .order("created_at", { ascending: false }),
    supabase
      .from("onboarding_data")
      .select("full_name")
      .eq("client_id", client.id)
      .single(),
  ]);

  const displayName = onboarding?.full_name || profile.full_name;

  return (
    <OverviewResponsive
      clientId={client.id}
      clientName={displayName}
      pendingOpportunities={pendingOpportunities ?? []}
      recentApproved={recentOpportunities ?? []}
      declinedDates={declinedOpportunities ?? []}
      kpiSummary={kpiSummary}
      alerts={alerts ?? []}
      actions={actions ?? []}
      candidates={candidates ?? []}
    />
  );
}
