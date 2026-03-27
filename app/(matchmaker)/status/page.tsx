export const dynamic = "force-dynamic";
export const metadata = { title: "Client Status | Matchmaker Portal" };

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ClientKanban } from "@/components/matchmaker/client-kanban";

export default async function StatusPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles").select("id").eq("auth_user_id", user.id).single();
  if (!profile) redirect("/login");

  const { data: clients } = await supabase
    .from("clients")
    .select("id, onboarding_status, created_at, updated_at, mm_pipeline_stage, profiles!clients_profile_id_fkey(full_name, avatar_url)")
    .eq("assigned_matchmaker_id", profile.id)
    .order("created_at", { ascending: false });

  if (!clients || clients.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-gold tracking-tight">Client Status</h1>
          <div className="h-px w-20 bg-gradient-to-r from-gold to-transparent mt-2" />
          <p className="text-on-surface-variant text-sm mt-3">Track your clients through the delivery pipeline.</p>
        </div>
        <p className="text-on-surface-variant">No clients assigned yet.</p>
      </div>
    );
  }

  const clientIds = clients.map((c) => c.id);

  const [
    { data: creds },
    { data: stats },
    { data: dateOpps },
  ] = await Promise.all([
    supabase
      .from("credentials")
      .select("client_id")
      .in("client_id", clientIds),
    supabase
      .from("daily_app_stats")
      .select("client_id")
      .in("client_id", clientIds),
    supabase
      .from("date_opportunities")
      .select("client_id, client_decision")
      .in("client_id", clientIds),
  ]);

  const hasCredentials = new Set(
    (creds ?? []).map((c: any) => c.client_id)
  );
  const hasSwipes = new Set(
    (stats ?? []).map((s: any) => s.client_id)
  );
  const hasDateScheduled = new Set(
    (dateOpps ?? []).map((o: any) => o.client_id)
  );
  const approvedCount: Record<string, number> = {};
  (dateOpps ?? []).forEach((o: any) => {
    if (o.client_decision === "approved") {
      approvedCount[o.client_id] = (approvedCount[o.client_id] || 0) + 1;
    }
  });

  const kanbanClients = clients.map((c: any) => ({
    ...c,
    mm_pipeline_stage: c.mm_pipeline_stage ?? "date_assigned",
    has_credentials: hasCredentials.has(c.id),
    has_swipes: hasSwipes.has(c.id),
    has_date_scheduled: hasDateScheduled.has(c.id),
    approved_dates: approvedCount[c.id] ?? 0,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold text-gold tracking-tight">Client Status</h1>
        <div className="h-px w-20 bg-gradient-to-r from-gold to-transparent mt-2" />
        <p className="text-on-surface-variant text-sm mt-3">
          Drag clients between stages to track progress. Click a card to view details.
        </p>
      </div>

      <ClientKanban clients={kanbanClients as any} />
    </div>
  );
}
