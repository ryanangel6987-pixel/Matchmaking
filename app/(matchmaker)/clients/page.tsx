export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MatchmakerClientsSearch } from "@/components/matchmaker/clients-search";
import { ClientKanban } from "@/components/matchmaker/client-kanban";
import { ClientsViewToggle } from "@/components/matchmaker/clients-view-toggle";

export default async function MatchmakerClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  const isKanban = view === "kanban";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles").select("id").eq("auth_user_id", user.id).single();
  if (!profile) redirect("/login");

  const { data: clients } = await supabase
    .from("clients")
    .select("id, onboarding_status, created_at, profiles!clients_profile_id_fkey(full_name, avatar_url)")
    .eq("assigned_matchmaker_id", profile.id)
    .order("created_at", { ascending: false });

  // For kanban view, fetch additional data per client to categorize them
  let kanbanClients: any[] = [];
  if (isKanban && clients && clients.length > 0) {
    const clientIds = clients.map((c) => c.id);

    const [{ data: livePhotos }, { data: dateOpps }] = await Promise.all([
      supabase
        .from("photos")
        .select("client_id")
        .in("client_id", clientIds)
        .eq("status", "live"),
      supabase
        .from("date_opportunities")
        .select("client_id, status")
        .in("client_id", clientIds),
    ]);

    const livePhotoClients = new Set(
      (livePhotos ?? []).map((p: any) => p.client_id)
    );
    const dateOppClients = new Set(
      (dateOpps ?? []).map((o: any) => o.client_id)
    );
    const pendingOrApprovedClients = new Set(
      (dateOpps ?? [])
        .filter(
          (o: any) =>
            o.status === "pending_client_approval" || o.status === "approved"
        )
        .map((o: any) => o.client_id)
    );

    kanbanClients = clients.map((c) => ({
      ...c,
      has_live_photos: livePhotoClients.has(c.id),
      has_date_opportunity: dateOppClients.has(c.id),
      has_pending_or_approved: pendingOrApprovedClients.has(c.id),
    }));
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-gold tracking-tight">My Clients</h1>
            <div className="h-px w-20 bg-gradient-to-r from-gold to-transparent mt-2" />
          </div>
          <ClientsViewToggle isKanban={isKanban} />
        </div>
      </div>

      {!clients || clients.length === 0 ? (
        <p className="text-on-surface-variant">No clients assigned yet.</p>
      ) : isKanban ? (
        <ClientKanban clients={kanbanClients as any} />
      ) : (
        <MatchmakerClientsSearch clients={clients as any} />
      )}
    </div>
  );
}
