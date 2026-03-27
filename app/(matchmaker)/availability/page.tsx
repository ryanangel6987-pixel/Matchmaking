export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AvailabilityEditor } from "@/components/matchmaker/availability-editor";

export default async function AvailabilityPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("auth_user_id", user.id)
    .single();

  if (!profile || profile.role !== "matchmaker") redirect("/login");

  const { data: availability } = await supabase
    .from("matchmaker_availability")
    .select("*")
    .eq("profile_id", profile.id)
    .maybeSingle();

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-heading font-bold text-gold tracking-tight">Availability</h1>
        <p className="text-on-surface-variant text-sm mt-1">Set your working days, hours, and timezone so clients and admins know when you're available.</p>
      </div>

      <AvailabilityEditor profileId={profile.id} availability={availability} />
    </div>
  );
}
