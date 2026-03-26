export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ClientsList } from "@/components/admin/clients-list";

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
        <ClientsList clients={clients as any} />
      )}
    </div>
  );
}
