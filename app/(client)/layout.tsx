export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ClientNav } from "@/components/client-nav";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, avatar_url")
    .eq("auth_user_id", user.id)
    .single();

  if (!profile || profile.role !== "client") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Desktop sidebar */}
      <ClientNav
        userName={profile.full_name}
        avatarUrl={profile.avatar_url}
      />

      {/* Main content */}
      <main className="flex-1 lg:ml-64 pb-20 lg:pb-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
