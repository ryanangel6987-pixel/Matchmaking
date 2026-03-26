export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function MatchmakerClientsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles").select("id").eq("auth_user_id", user.id).single();
  if (!profile) redirect("/login");

  const { data: clients } = await supabase
    .from("clients")
    .select("id, onboarding_status, created_at, profiles!clients_profile_id_fkey(full_name, avatar_url)")
    .eq("assigned_matchmaker_id", profile.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-heading font-bold text-gold tracking-tight">My Clients</h1>
        <div className="h-px w-20 bg-gradient-to-r from-gold to-transparent" />
      </div>

      {!clients || clients.length === 0 ? (
        <p className="text-on-surface-variant">No clients assigned yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => {
            const name = (client.profiles as any)?.full_name ?? "Unknown";
            return (
              <Link
                key={client.id}
                href={`/clients/${client.id}`}
                className="bg-surface-container-low p-6 rounded-2xl shadow-xl relative overflow-hidden group hover:bg-surface-container-high transition-colors duration-300"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-gold opacity-30 group-hover:opacity-100 transition-opacity duration-500" />
                <h3 className="font-heading text-lg font-bold text-on-surface">{name}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-[9px] uppercase tracking-widest border-outline-variant/30 text-outline">
                    {client.onboarding_status.replace(/_/g, " ")}
                  </Badge>
                </div>
                <p className="text-outline text-[10px] mt-3">
                  Since {new Date(client.created_at).toLocaleDateString()}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
