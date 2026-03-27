export const dynamic = "force-dynamic";
export const metadata = { title: "Credentials | Matchmaker Portal" };

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CredentialsManager } from "@/components/matchmaker/credentials-manager";
import { ClientSubNav } from "@/components/matchmaker/client-sub-nav";

export default async function CredentialsPage({ params }: { params: Promise<{ id: string }> }) {
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clientName = (client.profiles as any)?.full_name ?? "Client";

  // Fetch credentials with dating app info
  const [{ data: credentials }, { data: datingApps }] = await Promise.all([
    supabase
      .from("credentials")
      .select("*, dating_apps(app_name)")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false }),
    supabase
      .from("dating_apps")
      .select("id, app_name")
      .eq("is_active", true)
      .order("app_name"),
  ]);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <Link href={`/clients/${clientId}`} className="text-gold text-xs uppercase tracking-widest hover:text-gold-light transition-colors">
          &larr; Back to {clientName}
        </Link>
        <h1 className="text-3xl font-heading font-bold text-gold tracking-tight mt-2">Credential Vault</h1>
        <p className="text-on-surface-variant text-sm mt-1">Manage dating app credentials for {clientName}</p>
      </div>

      <ClientSubNav clientId={clientId} />

      {/* Credentials Manager */}
      <CredentialsManager
        clientId={clientId}
        credentials={credentials ?? []}
        datingApps={datingApps ?? []}
      />
    </div>
  );
}
