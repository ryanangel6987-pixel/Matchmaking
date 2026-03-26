export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PreferencesEditor } from "@/components/matchmaker/preferences-editor";
import { ApprovedTypeEditor } from "@/components/matchmaker/approved-type-editor";
import { CandidatesManager } from "@/components/matchmaker/candidates-manager";
import { ClientSubNav } from "@/components/matchmaker/client-sub-nav";

export default async function PreferencesPage({ params }: { params: Promise<{ id: string }> }) {
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

  // Fetch all preference-related data
  const [
    { data: preferences },
    { data: approvedType },
    { data: preferenceAssets },
    { data: candidates },
    { data: searchAreas },
    { data: availability },
  ] = await Promise.all([
    supabase.from("preferences").select("*").eq("client_id", clientId).single(),
    supabase.from("approved_type").select("*").eq("client_id", clientId).single(),
    supabase.from("preference_assets").select("*").eq("client_id", clientId).order("created_at", { ascending: false }),
    supabase.from("candidates").select("*").eq("client_id", clientId).order("created_at", { ascending: false }),
    supabase.from("client_search_areas").select("*").eq("client_id", clientId).order("sort_order"),
    supabase.from("client_availability").select("*").eq("client_id", clientId),
  ]);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <Link href={`/clients/${clientId}`} className="text-gold text-xs uppercase tracking-widest hover:text-gold-light transition-colors">
          ← Back to {clientName}
        </Link>
        <h1 className="text-3xl font-heading font-bold text-gold tracking-tight mt-2">Preferences & Type</h1>
        <p className="text-on-surface-variant text-sm mt-1">Manage preferences, approved type, and candidates for {clientName}</p>
      </div>

      <ClientSubNav clientId={clientId} />

      {/* Preferences Editor */}
      <PreferencesEditor clientId={clientId} preferences={preferences} />

      {/* Approved Type Editor */}
      <ApprovedTypeEditor clientId={clientId} approvedType={approvedType} />

      {/* Candidates Manager */}
      <CandidatesManager clientId={clientId} candidates={candidates ?? []} />

      {/* Client Search Areas (read-only for matchmaker) */}
      {searchAreas && searchAreas.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-on-surface-variant text-xs uppercase tracking-widest">Client Search Areas</h2>
          <div className="space-y-2">
            {searchAreas.map((area: any) => (
              <div key={area.id} className="bg-surface-container-low p-4 rounded-xl flex items-center gap-3">
                <span className="material-symbols-outlined text-gold text-lg" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>pin_drop</span>
                <div>
                  <p className="text-on-surface text-sm font-medium">{area.location_name}</p>
                  <p className="text-on-surface-variant text-xs">+ {area.radius_miles} miles</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Client Availability (read-only for matchmaker) */}
      {availability && availability.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-on-surface-variant text-xs uppercase tracking-widest">Client Availability</h2>
          <div className="flex flex-wrap gap-2">
            {availability.map((slot: any) => (
              <div key={slot.id} className="bg-surface-container-low px-4 py-2 rounded-xl">
                <p className="text-gold text-xs font-medium">{slot.day_of_week}</p>
                <p className="text-on-surface-variant text-xs">{slot.start_time?.slice(0, 5)} – {slot.end_time?.slice(0, 5)}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
