export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileResponsive } from "@/components/profile/profile-responsive";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles").select("id").eq("auth_user_id", user.id).single();
  if (!profile) redirect("/login");

  const { data: client } = await supabase
    .from("clients").select("id").eq("profile_id", profile.id).single();

  if (!client) {
    return (
      <div className="space-y-6">
        <h1 className="font-heading text-3xl font-bold text-gold tracking-tight">Active Profile</h1>
        <p className="text-on-surface-variant">Your account is being set up.</p>
      </div>
    );
  }

  const { data: photos } = await supabase
    .from("photos")
    .select("*")
    .eq("client_id", client.id)
    .order("created_at", { ascending: false });

  return <ProfileResponsive clientId={client.id} photos={photos ?? []} />;
}
