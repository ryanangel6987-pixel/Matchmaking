export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function AdminClientsPage() {
  const supabase = await createClient();

  const { data: clients } = await supabase
    .from("clients")
    .select("id, onboarding_status, created_at, profiles!clients_profile_id_fkey(full_name), matchmaker:profiles!clients_assigned_matchmaker_id_fkey(full_name)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin" className="text-gold text-xs uppercase tracking-widest hover:text-gold-light transition-colors">← Admin</Link>
          <h1 className="text-3xl font-heading font-bold text-gold tracking-tight mt-2">All Clients</h1>
        </div>
      </div>

      {!clients || clients.length === 0 ? (
        <p className="text-on-surface-variant">No clients in the system.</p>
      ) : (
        <div className="space-y-3">
          {clients.map((client) => (
            <Link key={client.id} href={`/admin/clients/${client.id}`} className="bg-surface-container-low p-4 rounded-xl flex items-center justify-between hover:bg-surface-container-high transition-colors duration-300">
              <div>
                <p className="text-on-surface font-medium font-heading">{(client.profiles as any)?.full_name ?? "Unknown"}</p>
                <p className="text-on-surface-variant text-xs mt-0.5">
                  Matchmaker: {(client.matchmaker as any)?.full_name ?? "Unassigned"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[9px] uppercase tracking-widest border-outline-variant/30 text-outline">
                  {client.onboarding_status.replace(/_/g, " ")}
                </Badge>
                <span className="text-outline text-[10px]">{new Date(client.created_at).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
