export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { UnifiedPipeline, type PipelineEntry } from "@/components/admin/unified-pipeline";

export default async function PipelinePage() {
  const supabase = await createClient();

  // Fetch applications (pre-activation) and clients (post-activation) in parallel
  const [
    { data: applications },
    { data: clients },
    { data: matchmakers },
    { data: dateOpps },
  ] = await Promise.all([
    // All pending/non-activated applications
    supabase
      .from("applications")
      .select("id, full_name, email, phone, city, profession, lead_tier, lead_score, pipeline_stage, status, created_at")
      .in("status", ["pending", "auto_disqualified"])
      .order("created_at", { ascending: false }),
    // All clients with profiles
    supabase
      .from("clients")
      .select("id, profile_id, assigned_matchmaker_id, onboarding_status, created_at, updated_at, admin_pipeline_stage, profiles!inner(full_name)")
      .order("created_at", { ascending: false }),
    // Matchmaker names
    supabase
      .from("profiles")
      .select("id, full_name")
      .eq("role", "matchmaker"),
    // Date opportunities for approved counts
    supabase
      .from("date_opportunities")
      .select("client_id, client_decision"),
  ]);

  // Build matchmaker name lookup
  const mmNames: Record<string, string> = {};
  (matchmakers ?? []).forEach((mm: any) => {
    if (mm.full_name) mmNames[mm.id] = mm.full_name;
  });

  // Build approved dates count
  const approvedMap: Record<string, number> = {};
  (dateOpps ?? []).forEach((d: any) => {
    if (d.client_decision === "approved") {
      approvedMap[d.client_id] = (approvedMap[d.client_id] || 0) + 1;
    }
  });

  // Build unified entries
  const entries: PipelineEntry[] = [];

  // Add applications
  (applications ?? []).forEach((app: any) => {
    entries.push({
      id: app.id,
      type: "application",
      name: app.full_name ?? "Unknown",
      stage: app.pipeline_stage ?? "new_signup",
      created_at: app.created_at,
      updated_at: app.created_at,
      profession: app.profession,
      city: app.city,
      lead_tier: app.lead_tier,
      lead_score: app.lead_score,
      email: app.email,
      phone: app.phone,
      status: app.status,
    });
  });

  // Add clients
  (clients ?? []).forEach((c: any) => {
    entries.push({
      id: c.id,
      type: "client",
      name: c.profiles?.full_name ?? "Unknown",
      stage: c.admin_pipeline_stage ?? "onboarding_complete",
      created_at: c.created_at,
      updated_at: c.updated_at,
      matchmaker_name: c.assigned_matchmaker_id ? mmNames[c.assigned_matchmaker_id] ?? null : null,
      approved_dates: approvedMap[c.id] ?? 0,
      onboarding_status: c.onboarding_status,
    });
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-on-surface flex items-center gap-3">
          <span className="material-symbols-outlined text-gold text-3xl" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>
            view_kanban
          </span>
          Pipeline
        </h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Track every lead from application to first date
        </p>
      </div>

      <UnifiedPipeline entries={entries} />
    </div>
  );
}
