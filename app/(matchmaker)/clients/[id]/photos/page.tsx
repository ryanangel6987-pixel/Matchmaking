export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { PhotoReviewCard } from "@/components/matchmaker/photo-review-card";
import { ClientSubNav } from "@/components/matchmaker/client-sub-nav";

export default async function PhotosPage({ params }: { params: Promise<{ id: string }> }) {
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

  const clientName = (client.profiles as any)?.full_name ?? "Unknown Client";

  // Fetch all photos for this client
  const { data: photos } = await supabase
    .from("photos")
    .select("*")
    .eq("client_id", clientId)
    .order("slot_number", { ascending: true });

  const statusCounts = (photos ?? []).reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href={`/clients/${clientId}`} className="text-gold text-xs uppercase tracking-widest hover:text-gold-light transition-colors">
            &larr; Back to {clientName}
          </Link>
          <h1 className="text-3xl font-heading font-bold text-gold tracking-tight mt-2">Photo Review</h1>
          <p className="text-on-surface-variant text-xs mt-1">
            {(photos ?? []).length} photo{(photos ?? []).length !== 1 ? "s" : ""}
            {statusCounts.pending_review ? ` \u00b7 ${statusCounts.pending_review} pending review` : ""}
            {statusCounts.approved ? ` \u00b7 ${statusCounts.approved} approved` : ""}
            {statusCounts.live ? ` \u00b7 ${statusCounts.live} live` : ""}
          </p>
        </div>
      </div>

      <ClientSubNav clientId={clientId} />

      {/* Status Legend */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: "Uploaded", color: "border-outline-variant/30 text-outline" },
          { label: "Pending Review", color: "border-outline-variant/30 text-outline" },
          { label: "Approved", color: "border-gold/30 text-gold" },
          { label: "Live", color: "border-gold/30 text-gold" },
          { label: "Changes Requested", color: "border-error-red/30 text-error-red" },
          { label: "Archived", color: "border-outline-variant/30 text-outline" },
        ].map((s) => (
          <Badge key={s.label} variant="outline" className={`text-[9px] uppercase tracking-widest ${s.color}`}>
            {s.label}
          </Badge>
        ))}
      </div>

      {/* Photo Grid */}
      {(photos ?? []).length === 0 ? (
        <div className="bg-surface-container-low p-12 rounded-2xl text-center">
          <span className="material-symbols-outlined text-5xl text-outline/40 mb-4 block" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>photo_library</span>
          <p className="text-on-surface-variant text-sm">No photos uploaded yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos!.map((photo) => (
            <PhotoReviewCard
              key={photo.id}
              photo={photo}
              matchmakerProfileId={profile.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
