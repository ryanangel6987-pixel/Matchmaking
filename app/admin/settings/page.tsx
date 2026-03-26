export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { DatingAppManager } from "@/components/admin/dating-app-manager";
import { DataExport } from "@/components/admin/data-export";

export default async function AdminSettingsPage() {
  const supabase = await createClient();

  const [
    { data: datingApps },
    { count: totalUsers },
    { count: totalAuditEntries },
    { count: totalClients },
  ] = await Promise.all([
    supabase
      .from("dating_apps")
      .select("id, app_name, description, is_active")
      .order("app_name"),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("audit_logs").select("*", { count: "exact", head: true }),
    supabase.from("clients").select("*", { count: "exact", head: true }),
  ]);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-heading font-bold text-gold tracking-tight">
          Settings
        </h1>
        <div className="h-px w-20 bg-gradient-to-r from-gold to-transparent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dating Apps Management */}
        <section className="bg-surface-container-low rounded-2xl shadow-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
              <span
                className="material-symbols-outlined text-xl text-gold"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
              >
                apps
              </span>
            </div>
            <div>
              <h2 className="font-heading text-lg font-semibold text-on-surface">
                Dating Apps
              </h2>
              <p className="text-on-surface-variant text-xs">
                Manage available dating platforms
              </p>
            </div>
          </div>
          <DatingAppManager apps={datingApps ?? []} />
        </section>

        {/* Platform Stats */}
        <section className="bg-surface-container-low rounded-2xl shadow-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
              <span
                className="material-symbols-outlined text-xl text-gold"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
              >
                monitoring
              </span>
            </div>
            <div>
              <h2 className="font-heading text-lg font-semibold text-on-surface">
                Platform Stats
              </h2>
              <p className="text-on-surface-variant text-xs">
                Read-only platform summary
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between bg-surface-container-highest/50 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-base text-gold"
                  style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
                >
                  person
                </span>
                <span className="text-on-surface-variant text-sm">
                  Total Users (Profiles)
                </span>
              </div>
              <span className="font-heading text-lg font-bold text-on-surface">
                {totalUsers ?? 0}
              </span>
            </div>

            <div className="flex items-center justify-between bg-surface-container-highest/50 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-base text-gold"
                  style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
                >
                  group
                </span>
                <span className="text-on-surface-variant text-sm">
                  Total Clients
                </span>
              </div>
              <span className="font-heading text-lg font-bold text-on-surface">
                {totalClients ?? 0}
              </span>
            </div>

            <div className="flex items-center justify-between bg-surface-container-highest/50 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-base text-gold"
                  style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
                >
                  history
                </span>
                <span className="text-on-surface-variant text-sm">
                  Total Audit Entries
                </span>
              </div>
              <span className="font-heading text-lg font-bold text-on-surface">
                {totalAuditEntries ?? 0}
              </span>
            </div>

            <div className="flex items-center justify-between bg-surface-container-highest/50 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-base text-gold"
                  style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
                >
                  apps
                </span>
                <span className="text-on-surface-variant text-sm">
                  Dating Apps Configured
                </span>
              </div>
              <span className="font-heading text-lg font-bold text-on-surface">
                {datingApps?.length ?? 0}
              </span>
            </div>

            <div className="flex items-center justify-between bg-surface-container-highest/50 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-base text-gold"
                  style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
                >
                  storage
                </span>
                <span className="text-on-surface-variant text-sm">
                  Database
                </span>
              </div>
              <span className="font-heading text-sm font-bold text-gold">
                Supabase (PostgreSQL)
              </span>
            </div>
          </div>
        </section>

        {/* Data Export */}
        <section className="bg-surface-container-low rounded-2xl shadow-xl p-6 space-y-4 lg:col-span-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
              <span
                className="material-symbols-outlined text-xl text-gold"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
              >
                download
              </span>
            </div>
            <div>
              <h2 className="font-heading text-lg font-semibold text-on-surface">
                Data Export
              </h2>
              <p className="text-on-surface-variant text-xs">
                Download CSV exports of platform data
              </p>
            </div>
          </div>
          <DataExport />
        </section>
      </div>
    </div>
  );
}
