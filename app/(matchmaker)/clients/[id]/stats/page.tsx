export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StatsUploadClient } from "@/components/matchmaker/stats-upload-client";
import { ClientSubNav } from "@/components/matchmaker/client-sub-nav";

export default async function StatsPage({ params }: { params: Promise<{ id: string }> }) {
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

  const [{ data: datingApps }, { data: history }] = await Promise.all([
    supabase.from("dating_apps").select("*").eq("is_active", true),
    supabase.from("daily_app_stats").select("*, dating_apps(app_name)").eq("client_id", clientId).order("stat_date", { ascending: false }).limit(30),
  ]);

  return (
    <div className="space-y-8">
      <ClientSubNav clientId={clientId} />
      <StatsUploadClient
        clientId={clientId}
        clientName={(client.profiles as any)?.full_name ?? "Client"}
        matchmakerProfileId={profile.id}
        datingApps={datingApps ?? []}
        history={history ?? []}
      />
    </div>
  );
}
