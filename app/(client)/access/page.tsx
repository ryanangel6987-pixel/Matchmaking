export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AccessResponsive } from "@/components/access/access-responsive";

export default async function AccessPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles").select("id").eq("auth_user_id", user.id).single();
  if (!profile) redirect("/login");

  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("profile_id", profile.id)
    .single();

  if (!client) {
    return (
      <div className="space-y-6">
        <h1 className="font-heading text-3xl font-bold text-gold tracking-tight">Credentials Vault</h1>
        <p className="text-on-surface-variant">Your account is being set up.</p>
      </div>
    );
  }

  // Fetch matchmaker info separately to avoid column issues
  const { data: clientWithMatchmaker } = await supabase
    .from("clients")
    .select("assigned_matchmaker_id")
    .eq("id", client.id)
    .single();

  let matchmakerName: string | null = null;
  let matchmakerWhatsApp: string | null = null;
  let matchmakerAvailability: any = null;

  if (clientWithMatchmaker?.assigned_matchmaker_id) {
    const mmId = clientWithMatchmaker.assigned_matchmaker_id;
    const [{ data: matchmaker }, { data: avail }] = await Promise.all([
      supabase.from("profiles").select("full_name").eq("id", mmId).single(),
      supabase.from("matchmaker_availability").select("*").eq("profile_id", mmId).single(),
    ]);
    matchmakerName = matchmaker?.full_name ?? null;
    matchmakerAvailability = avail;
    try {
      const { data: mm2 } = await supabase
        .from("profiles")
        .select("whatsapp_number")
        .eq("id", mmId)
        .single();
      matchmakerWhatsApp = (mm2 as any)?.whatsapp_number ?? null;
    } catch {
      // Column may not exist yet
    }
  }

  const [
    { data: credentials },
    { data: onboarding },
    { data: accountHealth },
    { data: supportNotes },
    { data: datingApps },
  ] = await Promise.all([
    supabase
      .from("credentials")
      .select("*, dating_apps(app_name)")
      .eq("client_id", client.id),
    supabase
      .from("onboarding_data")
      .select("preferred_communication_channel, communication_channel_verified")
      .eq("client_id", client.id)
      .single(),
    supabase
      .from("account_health")
      .select("*, dating_apps(app_name)")
      .eq("client_id", client.id),
    supabase
      .from("support_notes")
      .select("*")
      .eq("client_id", client.id)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("dating_apps")
      .select("id, app_name")
      .eq("is_active", true),
  ]);

  return (
    <AccessResponsive
      clientId={client.id}
      credentials={credentials ?? []}
      datingApps={datingApps ?? []}
      communication={onboarding}
      matchmakerName={matchmakerName}
      matchmakerWhatsApp={matchmakerWhatsApp}
      matchmakerAvailability={matchmakerAvailability}
      accountHealth={accountHealth ?? []}
      supportNotes={supportNotes ?? []}
    />
  );
}
