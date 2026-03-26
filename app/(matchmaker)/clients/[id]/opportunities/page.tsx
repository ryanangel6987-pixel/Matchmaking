export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { OpportunitiesClient } from "@/components/matchmaker/opportunities-client";
import { ClientSubNav } from "@/components/matchmaker/client-sub-nav";

export default async function OpportunitiesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: clientId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles").select("id").eq("auth_user_id", user.id).single();
  if (!profile) redirect("/login");

  const { data: client } = await supabase
    .from("clients")
    .select("id, profiles!clients_profile_id_fkey(full_name)")
    .eq("id", clientId)
    .eq("assigned_matchmaker_id", profile.id)
    .single();

  if (!client) redirect("/clients");

  const [{ data: datingApps }, { data: venues }, { data: opportunities }] = await Promise.all([
    supabase.from("dating_apps").select("*").eq("is_active", true),
    supabase.from("venues").select("*").eq("client_id", clientId).eq("is_active", true),
    supabase.from("date_opportunities").select("*, venues(venue_name), dating_apps(app_name)").eq("client_id", clientId).order("created_at", { ascending: false }),
  ]);

  return (
    <div className="space-y-8">
      <ClientSubNav clientId={clientId} />
      <OpportunitiesClient
        clientId={clientId}
        clientName={(client.profiles as any)?.full_name ?? "Client"}
        matchmakerProfileId={profile.id}
        datingApps={datingApps ?? []}
        venues={venues ?? []}
        opportunities={opportunities ?? []}
      />
    </div>
  );
}
