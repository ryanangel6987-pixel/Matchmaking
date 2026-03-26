export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MatchmakerClientsSearch } from "@/components/matchmaker/clients-search";

export default async function MatchmakerClientsPage() {
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

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-heading font-bold text-gold tracking-tight">My Clients</h1>
        <div className="h-px w-20 bg-gradient-to-r from-gold to-transparent" />
      </div>

      {!clients || clients.length === 0 ? (
        <p className="text-on-surface-variant">No clients assigned yet.</p>
      ) : (
        <MatchmakerClientsSearch clients={clients as any} />
      )}
    </div>
  );
}
