export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { VenuesManager } from "@/components/matchmaker/venues-manager";
import { ClientSubNav } from "@/components/matchmaker/client-sub-nav";

export default async function VenuesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: clientId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles").select("id").eq("auth_user_id", user.id).single();
  if (!profile) redirect("/login");

  // Verify matchmaker assignment
  const { data: client } = await supabase
    .from("clients")
    .select("id, profiles!clients_profile_id_fkey(full_name)")
    .eq("id", clientId)
    .eq("assigned_matchmaker_id", profile.id)
    .single();

  if (!client) redirect("/clients");

  const clientName = (client.profiles as any)?.full_name ?? "Client";

  // Fetch all venues for this client
  const { data: venues } = await supabase
    .from("venues")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <Link href={`/clients/${clientId}`} className="text-gold text-xs uppercase tracking-widest hover:text-gold-light transition-colors">
          ← Back to {clientName}
        </Link>
        <h1 className="text-3xl font-heading font-bold text-gold tracking-tight mt-2">Venues</h1>
        <p className="text-on-surface-variant text-sm mt-1">Manage date venues and locations for {clientName}</p>
      </div>

      <ClientSubNav clientId={clientId} />

      {/* Venues Manager */}
      <VenuesManager clientId={clientId} venues={venues ?? []} />
    </div>
  );
}
