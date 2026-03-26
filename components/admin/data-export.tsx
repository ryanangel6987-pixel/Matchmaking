"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ExportType = "clients" | "kpi" | "audit";

function escapeCSVField(val: unknown): string {
  const str = val == null ? "" : String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCSV(headers: string[], keys: string[], rows: Record<string, unknown>[]): string {
  const lines = [
    headers.map(escapeCSVField).join(","),
    ...rows.map((row) => keys.map((k) => escapeCSVField(row[k])).join(",")),
  ];
  return lines.join("\n");
}

function downloadCSV(filename: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function DataExport() {
  const [loading, setLoading] = useState<ExportType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const exportClients = async () => {
    setLoading("clients");
    setError(null);
    try {
      // clients -> profiles (client name via profile_id) + profiles (matchmaker name via assigned_matchmaker_id)
      const { data, error: fetchError } = await supabase
        .from("clients")
        .select(
          `id,
           onboarding_status,
           created_at,
           profiles!clients_profile_id_fkey(full_name, auth_user_id),
           matchmaker:profiles!clients_assigned_matchmaker_id_fkey(full_name)`
        );

      if (fetchError) throw new Error(fetchError.message);
      if (!data || data.length === 0) throw new Error("No client data found.");

      const rows = data.map((c: Record<string, unknown>) => {
        const clientProfile = c.profiles as Record<string, unknown> | null;
        const matchmakerProfile = c.matchmaker as Record<string, unknown> | null;
        return {
          Name: clientProfile?.full_name ?? "N/A",
          // Email requires SUPABASE_SERVICE_ROLE_KEY to query auth.users — using auth_user_id as fallback
          Email: clientProfile?.auth_user_id ?? "N/A",
          "Onboarding Status": c.onboarding_status ?? "N/A",
          Matchmaker: matchmakerProfile?.full_name ?? "Unassigned",
          "Created Date": c.created_at
            ? new Date(c.created_at as string).toLocaleDateString()
            : "N/A",
        };
      });

      const headers = ["Name", "Email", "Onboarding Status", "Matchmaker", "Created Date"];
      const csv = toCSV(headers, headers, rows);
      downloadCSV("clients-export.csv", csv);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to export clients.");
    } finally {
      setLoading(null);
    }
  };

  const exportKPI = async () => {
    setLoading("kpi");
    setError(null);
    try {
      // client_kpi_summary is a VIEW — no FK joins available, so fetch names separately
      const [kpiResult, clientsResult] = await Promise.all([
        supabase
          .from("client_kpi_summary")
          .select(
            "client_id, total_swipes, total_matches, total_conversations, total_dates_closed, dates_approved, match_rate, conversation_rate, close_rate"
          ),
        supabase
          .from("clients")
          .select("id, profiles!clients_profile_id_fkey(full_name)"),
      ]);

      if (kpiResult.error) throw new Error(kpiResult.error.message);
      if (!kpiResult.data || kpiResult.data.length === 0)
        throw new Error("No KPI data found.");

      // Build a lookup map: client_id -> full_name
      const nameMap = new Map<string, string>();
      if (clientsResult.data) {
        for (const c of clientsResult.data as Record<string, unknown>[]) {
          const profile = c.profiles as Record<string, unknown> | null;
          if (profile?.full_name) {
            nameMap.set(c.id as string, profile.full_name as string);
          }
        }
      }

      const rows = kpiResult.data.map((row: Record<string, unknown>) => {
        return {
          "Client Name": nameMap.get(row.client_id as string) ?? "N/A",
          "Total Swipes": row.total_swipes ?? 0,
          "Total Matches": row.total_matches ?? 0,
          "Total Conversations": row.total_conversations ?? 0,
          "Total Dates Closed": row.total_dates_closed ?? 0,
          "Dates Approved": row.dates_approved ?? 0,
          "Match Rate": row.match_rate ?? 0,
          "Conversation Rate": row.conversation_rate ?? 0,
          "Close Rate": row.close_rate ?? 0,
        };
      });

      const headers = [
        "Client Name",
        "Total Swipes",
        "Total Matches",
        "Total Conversations",
        "Total Dates Closed",
        "Dates Approved",
        "Match Rate",
        "Conversation Rate",
        "Close Rate",
      ];
      const csv = toCSV(headers, headers, rows);
      downloadCSV("kpi-export.csv", csv);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to export KPI data.");
    } finally {
      setLoading(null);
    }
  };

  const exportAudit = async () => {
    setLoading("audit");
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("audit_logs")
        .select(
          `id,
           action_type,
           target_table,
           created_at,
           profiles:user_id(full_name)`
        )
        .order("created_at", { ascending: false })
        .limit(5000);

      if (fetchError) throw new Error(fetchError.message);
      if (!data || data.length === 0) throw new Error("No audit log data found.");

      const rows = data.map((row: Record<string, unknown>) => {
        const profile = row.profiles as Record<string, unknown> | null;
        return {
          User: profile?.full_name ?? "Unknown",
          "Action Type": row.action_type ?? "",
          "Target Table": row.target_table ?? "",
          Timestamp: row.created_at
            ? new Date(row.created_at as string).toLocaleString()
            : "N/A",
        };
      });

      const headers = ["User", "Action Type", "Target Table", "Timestamp"];
      const csv = toCSV(headers, headers, rows);
      downloadCSV("audit-log-export.csv", csv);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to export audit log.");
    } finally {
      setLoading(null);
    }
  };

  const exports: {
    type: ExportType;
    label: string;
    description: string;
    icon: string;
    handler: () => Promise<void>;
  }[] = [
    {
      type: "clients",
      label: "Export Clients",
      description: "Name, Email, Onboarding Status, Matchmaker, Created Date",
      icon: "group",
      handler: exportClients,
    },
    {
      type: "kpi",
      label: "Export KPI Data",
      description: "Client Name, Swipes, Matches, Conversations, Dates, Rates",
      icon: "analytics",
      handler: exportKPI,
    },
    {
      type: "audit",
      label: "Export Audit Log",
      description: "User, Action Type, Target Table, Timestamp (up to 5,000 rows)",
      icon: "history",
      handler: exportAudit,
    },
  ];

  return (
    <div className="bg-surface-container-low rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <span
          className="material-symbols-outlined text-gold text-xl"
          style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
        >
          download
        </span>
        <h3 className="text-on-surface font-semibold text-base">Data Export</h3>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-3">
          <span
            className="material-symbols-outlined text-red-400 text-lg shrink-0"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
          >
            error
          </span>
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-400/60 hover:text-red-400 transition-colors"
          >
            <span
              className="material-symbols-outlined text-lg"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
            >
              close
            </span>
          </button>
        </div>
      )}

      <div className="space-y-3">
        {exports.map((exp) => (
          <button
            key={exp.type}
            onClick={exp.handler}
            disabled={loading !== null}
            className="w-full flex items-center gap-4 bg-surface-container-highest/50 rounded-xl px-4 py-3 hover:bg-surface-container-high transition-colors duration-200 disabled:opacity-50 text-left group"
          >
            <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
              <span
                className={`material-symbols-outlined text-lg text-gold ${
                  loading === exp.type ? "animate-spin" : ""
                }`}
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
              >
                {loading === exp.type ? "progress_activity" : exp.icon}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-on-surface text-sm font-medium">{exp.label}</p>
              <p className="text-on-surface-variant text-xs">{exp.description}</p>
            </div>
            <span
              className="material-symbols-outlined text-lg text-outline group-hover:text-gold transition-colors duration-200"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
            >
              download
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
