export const dynamic = "force-dynamic";
export const metadata = { title: "Applications | Admin" };

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ApplicationsCRM } from "@/components/admin/applications-crm";

export default async function ApplicationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("auth_user_id", user.id)
    .single();

  if (!profile || profile.role !== "admin") redirect("/login");

  const { data: applications } = await supabase
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold text-gold tracking-tight">Applications</h1>
        <div className="h-px w-20 bg-gradient-to-r from-gold to-transparent mt-2" />
        <p className="text-on-surface-variant text-sm mt-3">
          Review, score, and activate incoming applications.
        </p>
      </div>

      <ApplicationsCRM applications={applications ?? []} adminProfileId={profile.id} />
    </div>
  );
}
