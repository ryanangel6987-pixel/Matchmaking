export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import AuditLogViewer from "@/components/admin/audit-log-viewer";

export default async function AdminAuditPage() {
  const supabase = await createClient();

  const { data: logs } = await supabase
    .from("audit_logs")
    .select("*, profiles:user_id(full_name)")
    .order("created_at", { ascending: false })
    .limit(500);

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin" className="text-gold text-xs uppercase tracking-widest hover:text-gold-light transition-colors">← Admin</Link>
        <h1 className="text-3xl font-heading font-bold text-gold tracking-tight mt-2">Audit Log</h1>
      </div>

      <AuditLogViewer logs={logs ?? []} />
    </div>
  );
}
