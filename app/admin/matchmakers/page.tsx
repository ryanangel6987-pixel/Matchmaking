export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminMatchmakersPage() {
  const supabase = await createClient();

  const { data: matchmakers } = await supabase
    .from("profiles")
    .select("id, full_name, created_at")
    .eq("role", "matchmaker")
    .order("created_at", { ascending: false });

  // Get client counts per matchmaker
  const counts: Record<string, number> = {};
  if (matchmakers) {
    const { data: clients } = await supabase
      .from("clients")
      .select("assigned_matchmaker_id");

    if (clients) {
      for (const c of clients) {
        if (c.assigned_matchmaker_id) {
          counts[c.assigned_matchmaker_id] = (counts[c.assigned_matchmaker_id] ?? 0) + 1;
        }
      }
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin" className="text-gold text-xs uppercase tracking-widest hover:text-gold-light transition-colors">← Admin</Link>
        <h1 className="text-3xl font-heading font-bold text-gold tracking-tight mt-2">Matchmakers</h1>
      </div>

      {!matchmakers || matchmakers.length === 0 ? (
        <p className="text-on-surface-variant">No matchmakers in the system.</p>
      ) : (
        <div className="space-y-3">
          {matchmakers.map((mm) => (
            <Link key={mm.id} href={`/admin/matchmakers/${mm.id}`} className="bg-surface-container-low p-4 rounded-xl flex items-center justify-between hover:bg-surface-container-high transition-colors block">
              <div>
                <p className="text-on-surface font-medium font-heading">{mm.full_name}</p>
                <p className="text-on-surface-variant text-xs mt-0.5">
                  Since {new Date(mm.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-gold font-heading text-lg font-bold">{counts[mm.id] ?? 0}</p>
                <p className="text-on-surface-variant text-[10px] uppercase tracking-widest">Clients</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
