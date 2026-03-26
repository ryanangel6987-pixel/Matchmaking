export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MatchmakerProfile } from "@/components/matchmaker/matchmaker-profile";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, full_name, avatar_url, whatsapp_number, bio")
    .eq("auth_user_id", user.id)
    .single();

  if (!profile || profile.role !== "matchmaker") redirect("/login");

  const { data: availability } = await supabase
    .from("matchmaker_availability")
    .select("*")
    .eq("profile_id", profile.id)
    .single();

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-heading font-bold text-gold tracking-tight">My Profile</h1>
        <p className="text-on-surface-variant text-sm mt-1">Manage your profile photo, contact info, and bio.</p>
      </div>

      <MatchmakerProfile
        profile={profile}
        authUserId={user.id}
        availability={availability}
      />
    </div>
  );
}
