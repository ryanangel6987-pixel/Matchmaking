"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface DatingApp {
  id: string;
  app_name: string;
  description: string | null;
  is_active: boolean;
}

interface DatingAppManagerProps {
  apps: DatingApp[];
}

export function DatingAppManager({ apps: initialApps }: DatingAppManagerProps) {
  const [apps, setApps] = useState<DatingApp[]>(initialApps);
  const [pending, setPending] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [adding, setAdding] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  const handleToggle = async (appId: string, currentActive: boolean) => {
    setPending(appId);
    const newActive = !currentActive;
    const { error } = await supabase
      .from("dating_apps")
      .update({ is_active: newActive })
      .eq("id", appId);
    if (!error) {
      setApps((prev) =>
        prev.map((app) =>
          app.id === appId ? { ...app, is_active: newActive } : app
        )
      );
    }
    setPending(null);
  };

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setAdding(true);
    const { data, error } = await supabase
      .from("dating_apps")
      .insert({ app_name: newName.trim(), description: newDesc.trim() || null })
      .select("id, app_name, description, is_active")
      .single();
    if (!error && data) {
      setApps((prev) => [...prev, data]);
      setNewName("");
      setNewDesc("");
    }
    setAdding(false);
  };

  const startEdit = (app: DatingApp) => {
    setEditingId(app.id);
    setEditName(app.app_name);
    setEditDesc(app.description ?? "");
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editName.trim()) return;
    setPending(editingId);
    const { error } = await supabase
      .from("dating_apps")
      .update({ app_name: editName.trim(), description: editDesc.trim() || null })
      .eq("id", editingId);
    if (!error) {
      setApps((prev) =>
        prev.map((app) =>
          app.id === editingId
            ? { ...app, app_name: editName.trim(), description: editDesc.trim() || null }
            : app
        )
      );
    }
    setEditingId(null);
    setPending(null);
  };

  const handleDelete = async (appId: string) => {
    setPending(appId);
    const { error } = await supabase.from("dating_apps").delete().eq("id", appId);
    if (!error) {
      setApps((prev) => prev.filter((app) => app.id !== appId));
    }
    setDeleteConfirm(null);
    setPending(null);
  };

  return (
    <div className="space-y-4">
      {/* Existing apps */}
      <div className="space-y-3">
        {apps.map((app) => (
          <div
            key={app.id}
            className="bg-surface-container-highest/50 rounded-xl px-4 py-3"
          >
            {editingId === app.id ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-surface-container-low text-on-surface text-sm rounded-lg px-3 py-2 border border-outline-variant/30 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/50"
                  placeholder="App name"
                />
                <input
                  type="text"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full bg-surface-container-low text-on-surface text-sm rounded-lg px-3 py-2 border border-outline-variant/30 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/50"
                  placeholder="Description (optional)"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveEdit}
                    disabled={pending === app.id}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-gold to-gold/80 text-surface hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span
                    className="material-symbols-outlined text-lg text-gold shrink-0"
                    style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
                  >
                    apps
                  </span>
                  <div className="min-w-0">
                    <p className="text-on-surface text-sm font-medium truncate">
                      {app.app_name}
                    </p>
                    {app.description && (
                      <p className="text-on-surface-variant text-xs truncate">
                        {app.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {/* Edit button */}
                  <button
                    onClick={() => startEdit(app)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-container-high transition-colors"
                    title="Edit"
                  >
                    <span
                      className="material-symbols-outlined text-sm text-on-surface-variant"
                      style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
                    >
                      edit
                    </span>
                  </button>
                  {/* Delete button */}
                  {deleteConfirm === app.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(app.id)}
                        disabled={pending === app.id}
                        className="px-2 py-1 rounded-lg text-[10px] font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-2 py-1 rounded-lg text-[10px] font-medium text-on-surface-variant hover:text-on-surface transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(app.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-500/10 transition-colors"
                      title="Delete"
                    >
                      <span
                        className="material-symbols-outlined text-sm text-on-surface-variant hover:text-red-400"
                        style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
                      >
                        delete
                      </span>
                    </button>
                  )}
                  {/* Toggle */}
                  <button
                    onClick={() => handleToggle(app.id, app.is_active)}
                    disabled={pending === app.id}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                      app.is_active
                        ? "bg-gold"
                        : "bg-surface-container-highest"
                    } ${pending === app.id ? "opacity-50" : ""}`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                        app.is_active ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {apps.length === 0 && (
          <p className="text-on-surface-variant text-sm text-center py-4">
            No dating apps configured.
          </p>
        )}
      </div>

      {/* Add new app */}
      <div className="border-t border-outline-variant/10 pt-4 space-y-3">
        <p className="text-on-surface-variant text-[10px] uppercase tracking-widest font-medium">
          Add New App
        </p>
        <div className="space-y-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full bg-surface-container-low text-on-surface text-sm rounded-lg px-3 py-2 border border-outline-variant/30 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/50"
            placeholder="App name"
          />
          <input
            type="text"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            className="w-full bg-surface-container-low text-on-surface text-sm rounded-lg px-3 py-2 border border-outline-variant/30 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/50"
            placeholder="Description (optional)"
          />
          <button
            onClick={handleAdd}
            disabled={adding || !newName.trim()}
            className="w-full px-4 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-gold to-gold/80 text-surface hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span
              className="material-symbols-outlined text-base"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
            >
              add
            </span>
            {adding ? "Adding..." : "Add Dating App"}
          </button>
        </div>
      </div>
    </div>
  );
}
