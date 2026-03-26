export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardResponsive } from "@/components/dashboard/dashboard-responsive";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles").select("id").eq("auth_user_id", user.id).single();
  if (!profile) redirect("/login");

  const { data: client } = await supabase
    .from("clients").select("id").eq("profile_id", profile.id).single();

  if (!client) {
    return (
      <div className="space-y-6">
        <h1 className="font-heading text-3xl font-bold text-gold tracking-tight">Overview</h1>
        <p className="text-on-surface-variant">Your account is being set up.</p>
      </div>
    );
  }

  const [
    { data: dailyStats },
    { data: kpiSummary },
    { data: allOpportunities },
    { data: actions },
    { data: datingApps },
    { data: photos },
    { data: accountHealth },
  ] = await Promise.all([
    supabase
      .from("daily_app_stats")
      .select("*, dating_apps(app_name)")
      .eq("client_id", client.id)
      .order("stat_date", { ascending: true }),
    supabase.from("client_kpi_summary").select("*").eq("client_id", client.id).single(),
    supabase
      .from("date_opportunities")
      .select("*, venues(venue_name), dating_apps(app_name)")
      .eq("client_id", client.id)
      .order("created_at", { ascending: false }),
    supabase.from("actions").select("*").eq("client_id", client.id).eq("status", "open"),
    supabase.from("dating_apps").select("*").eq("is_active", true),
    supabase.from("photos").select("id, status").eq("client_id", client.id),
    supabase
      .from("account_health")
      .select("*, dating_apps(app_name)")
      .eq("client_id", client.id),
  ]);

  return (
    <DashboardResponsive
      dailyStats={dailyStats ?? []}
      kpiSummary={kpiSummary}
      allOpportunities={allOpportunities ?? []}
      actions={actions ?? []}
      datingApps={datingApps ?? []}
      photos={photos ?? []}
      accountHealth={accountHealth ?? []}
    />
  );
}
