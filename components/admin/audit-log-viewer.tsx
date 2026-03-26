"use client";

import { useMemo, useState } from "react";
import { CustomSelect } from "@/components/ui/custom-select";

interface AuditLog {
  id: string;
  created_at: string;
  action_type: string;
  target_table: string;
  profiles: { full_name: string } | null;
}

interface AuditLogViewerProps {
  logs: AuditLog[];
}

export default function AuditLogViewer({ logs }: AuditLogViewerProps) {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [actionType, setActionType] = useState("");
  const [targetTable, setTargetTable] = useState("");

  const uniqueActions = useMemo(
    () => [...new Set(logs.map((l) => l.action_type).filter(Boolean))].sort(),
    [logs],
  );

  const uniqueTables = useMemo(
    () => [...new Set(logs.map((l) => l.target_table).filter(Boolean))].sort(),
    [logs],
  );

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      if (dateFrom) {
        const logDate = new Date(log.created_at);
        const from = new Date(dateFrom);
        from.setHours(0, 0, 0, 0);
        if (logDate < from) return false;
      }
      if (dateTo) {
        const logDate = new Date(log.created_at);
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        if (logDate > to) return false;
      }
      if (userSearch) {
        const name = (log.profiles as any)?.full_name ?? "System";
        if (!name.toLowerCase().includes(userSearch.toLowerCase())) return false;
      }
      if (actionType && log.action_type !== actionType) return false;
      if (targetTable && log.target_table !== targetTable) return false;
      return true;
    });
  }, [logs, dateFrom, dateTo, userSearch, actionType, targetTable]);

  const hasFilters = dateFrom || dateTo || userSearch || actionType || targetTable;

  function clearFilters() {
    setDateFrom("");
    setDateTo("");
    setUserSearch("");
    setActionType("");
    setTargetTable("");
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-surface-container-low rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-gold text-xl">filter_list</span>
            <h2 className="font-heading font-semibold text-on-surface">Filters</h2>
          </div>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-on-surface-variant hover:text-gold transition-colors"
            >
              <span className="material-symbols-outlined text-base">clear</span>
              Clear filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Date from */}
          <div>
            <label className="block text-xs text-on-surface-variant mb-1">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant/20 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-gold/50 transition-colors [color-scheme:dark]"
            />
          </div>

          {/* Date to */}
          <div>
            <label className="block text-xs text-on-surface-variant mb-1">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant/20 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-gold/50 transition-colors [color-scheme:dark]"
            />
          </div>

          {/* User search */}
          <div>
            <label className="block text-xs text-on-surface-variant mb-1">User</label>
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search by name…"
              className="w-full bg-surface-container border border-outline-variant/20 rounded-lg px-3 py-2 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-gold/50 transition-colors"
            />
          </div>

          {/* Action type */}
          <div>
            <label className="block text-xs text-on-surface-variant mb-1">Action</label>
            <CustomSelect
              value={actionType}
              onChange={(v) => setActionType(v)}
              options={[{ value: "", label: "All actions" }, ...uniqueActions.map((a) => ({ value: a, label: a }))]}
              placeholder="All actions"
              className="w-full bg-surface-container border border-outline-variant/20 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-gold/50 transition-colors"
            />
          </div>

          {/* Target table */}
          <div>
            <label className="block text-xs text-on-surface-variant mb-1">Table</label>
            <CustomSelect
              value={targetTable}
              onChange={(v) => setTargetTable(v)}
              options={[{ value: "", label: "All tables" }, ...uniqueTables.map((t) => ({ value: t, label: t }))]}
              placeholder="All tables"
              className="w-full bg-surface-container border border-outline-variant/20 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-gold/50 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Count */}
      <p className="text-sm text-on-surface-variant">
        Showing <span className="text-on-surface font-medium">{filtered.length}</span> of{" "}
        <span className="text-on-surface font-medium">{logs.length}</span>
      </p>

      {/* Log entries */}
      {filtered.length === 0 ? (
        <p className="text-on-surface-variant">No audit entries match the current filters.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((log) => (
            <div
              key={log.id}
              className="bg-surface-container-low p-3 rounded-xl flex items-center justify-between text-sm"
            >
              <div>
                <span className="text-on-surface">
                  {(log.profiles as any)?.full_name ?? "System"}
                </span>
                <span className="text-on-surface-variant mx-2">&rarr;</span>
                <span className="text-gold">{log.action_type}</span>
                <span className="text-on-surface-variant ml-2">on {log.target_table}</span>
              </div>
              <span className="text-outline text-xs shrink-0 ml-4">
                {new Date(log.created_at).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
