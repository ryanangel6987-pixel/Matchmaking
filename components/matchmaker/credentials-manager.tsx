"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CustomSelect } from "@/components/ui/custom-select";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface CredentialsManagerProps {
  clientId: string;
  credentials: any[];
  datingApps: any[];
}

const statusOptions = ["active", "inactive", "expired", "revoked"] as const;

const statusColors: Record<string, string> = {
  active: "text-gold border-gold/30 bg-gold/10",
  inactive: "text-outline border-outline-variant/30",
  expired: "text-error-red border-error-red/30",
  revoked: "text-error-red border-error-red/50 bg-error-container/10",
};

const AUTO_HIDE_MS = 30_000;

export function CredentialsManager({
  clientId,
  credentials,
  datingApps,
}: CredentialsManagerProps) {
  const router = useRouter();
  const supabase = createClient();

  // Reveal state
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  // New credential form
  const [appId, setAppId] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<string>("active");
  const [phone, setPhone] = useState("");

  // Edit form
  const [editAppId, setEditAppId] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editStatus, setEditStatus] = useState<string>("active");
  const [editPhone, setEditPhone] = useState("");

  // --- Reveal / hide logic ---
  const hide = useCallback((id: string) => {
    setRevealed((prev) => ({ ...prev, [id]: false }));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const toggle = useCallback(
    (id: string) => {
      setRevealed((prev) => {
        const next = !prev[id];
        if (next) {
          if (timers.current[id]) clearTimeout(timers.current[id]);
          timers.current[id] = setTimeout(() => hide(id), AUTO_HIDE_MS);
        } else {
          if (timers.current[id]) {
            clearTimeout(timers.current[id]);
            delete timers.current[id];
          }
        }
        return { ...prev, [id]: next };
      });
    },
    [hide]
  );

  useEffect(() => {
    const t = timers.current;
    return () => {
      Object.values(t).forEach(clearTimeout);
    };
  }, []);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // fallback
    }
  };

  const mask = (value: string | null | undefined) =>
    value
      ? "\u2022".repeat(Math.min(value.length, 12))
      : "\u2022\u2022\u2022\u2022\u2022\u2022";

  // --- CRUD ---
  const resetForm = () => {
    setAppId("");
    setUsername("");
    setPassword("");
    setNotes("");
    setStatus("active");
    setPhone("");
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: insertError } = await supabase.from("credentials").insert({
      client_id: clientId,
      app_id: appId || null,
      encrypted_username: username,
      encrypted_password: password,
      status,
      notes: notes || null,
      associated_phone: phone || null,
    });

    if (insertError) {
      setError(insertError.message);
    } else {
      resetForm();
      setShowForm(false);
      router.refresh();
    }
    setLoading(false);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const startEdit = (cred: any) => {
    setEditingId(cred.id);
    setEditAppId(cred.app_id ?? "");
    setEditUsername(cred.encrypted_username ?? "");
    setEditPassword(cred.encrypted_password ?? "");
    setEditNotes(cred.notes ?? "");
    setEditStatus(cred.status ?? "active");
    setEditPhone(cred.associated_phone ?? "");
  };

  const cancelEdit = () => setEditingId(null);

  const handleSaveEdit = async (credId: string) => {
    setLoading(true);
    setError("");

    const { error: updateError } = await supabase
      .from("credentials")
      .update({
        app_id: editAppId || null,
        encrypted_username: editUsername,
        encrypted_password: editPassword,
        status: editStatus,
        notes: editNotes || null,
        associated_phone: editPhone || null,
      })
      .eq("id", credId);

    if (updateError) {
      setError(updateError.message);
    } else {
      setEditingId(null);
      router.refresh();
    }
    setLoading(false);
  };

  const handleDelete = async (credId: string) => {
    if (!confirm("Delete this credential? This cannot be undone.")) return;
    await supabase.from("credentials").delete().eq("id", credId);
    router.refresh();
  };

  const handleStatusUpdate = async (credId: string, newStatus: string) => {
    await supabase
      .from("credentials")
      .update({ status: newStatus })
      .eq("id", credId);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="material-symbols-outlined text-2xl text-gold"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
          >
            lock
          </span>
          <h2 className="font-heading text-xl font-bold text-on-surface">
            Credentials
          </h2>
          <span className="text-on-surface-variant text-sm">
            ({credentials.length})
          </span>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="gold-gradient text-on-gold font-semibold rounded-full"
        >
          {showForm ? "Cancel" : "+ Add Credential"}
        </Button>
      </div>

      {/* Add Form */}
      {showForm && (
        <form
          onSubmit={handleAdd}
          className="bg-surface-container-low p-8 rounded-2xl shadow-xl space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gold text-xs uppercase tracking-wider">
                Dating App *
              </Label>
              <CustomSelect
                value={appId}
                onChange={(v) => setAppId(v)}
                options={[{ value: "", label: "Select an app..." }, ...datingApps.map((app) => ({ value: app.id, label: app.app_name }))]}
                placeholder="Select an app..."
                className="w-full h-10 rounded-md bg-surface-container border border-outline-variant/20 text-on-surface px-3 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gold text-xs uppercase tracking-wider">
                Status
              </Label>
              <CustomSelect
                value={status}
                onChange={(v) => setStatus(v)}
                options={statusOptions.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))}
                className="w-full h-10 rounded-md bg-surface-container border border-outline-variant/20 text-on-surface px-3 text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gold text-xs uppercase tracking-wider">
                Username *
              </Label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="e.g. john@email.com"
                className="bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-outline"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gold text-xs uppercase tracking-wider">
                Password *
              </Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter password"
                className="bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-outline"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-gold text-xs uppercase tracking-wider">
              Associated Phone
            </Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +1 555-123-4567"
              className="bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-outline"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gold text-xs uppercase tracking-wider">
              Notes
            </Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="2FA method, recovery email, special instructions..."
              rows={2}
              className="bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-outline"
            />
          </div>

          {error && <p className="text-error-red text-sm">{error}</p>}

          <Button
            type="submit"
            disabled={loading}
            className="w-full gold-gradient text-on-gold font-semibold rounded-full h-12"
          >
            {loading ? "Adding..." : "Add Credential"}
          </Button>
        </form>
      )}

      {/* Credentials List */}
      {credentials.length === 0 ? (
        <div className="bg-surface-container-low p-8 rounded-2xl text-center">
          <p className="text-on-surface-variant/60 text-sm">
            No credentials yet. Add one to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {credentials.map((cred) => {
            const isRevealed = revealed[cred.id] ?? false;
            const appName = cred.dating_apps?.app_name ?? cred.dating_app?.app_name ?? "App";

            return (
              <div
                key={cred.id}
                className="bg-surface-container-low p-5 rounded-2xl space-y-3 relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-gold opacity-30 group-hover:opacity-100 transition-opacity duration-500" />

                {editingId === cred.id ? (
                  /* Inline Edit Form */
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-gold text-xs uppercase tracking-wider">
                          Dating App *
                        </Label>
                        <CustomSelect
                          value={editAppId}
                          onChange={(v) => setEditAppId(v)}
                          options={[{ value: "", label: "Select an app..." }, ...datingApps.map((app) => ({ value: app.id, label: app.app_name }))]}
                          placeholder="Select an app..."
                          className="w-full h-10 rounded-md bg-surface-container border border-outline-variant/20 text-on-surface px-3 text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gold text-xs uppercase tracking-wider">
                          Status
                        </Label>
                        <CustomSelect
                          value={editStatus}
                          onChange={(v) => setEditStatus(v)}
                          options={statusOptions.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))}
                          className="w-full h-10 rounded-md bg-surface-container border border-outline-variant/20 text-on-surface px-3 text-sm"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-gold text-xs uppercase tracking-wider">
                          Username *
                        </Label>
                        <Input
                          value={editUsername}
                          onChange={(e) => setEditUsername(e.target.value)}
                          required
                          className="bg-surface-container border-outline-variant/20 text-on-surface"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gold text-xs uppercase tracking-wider">
                          Password *
                        </Label>
                        <Input
                          type="password"
                          value={editPassword}
                          onChange={(e) => setEditPassword(e.target.value)}
                          required
                          className="bg-surface-container border-outline-variant/20 text-on-surface"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gold text-xs uppercase tracking-wider">
                        Associated Phone
                      </Label>
                      <Input
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="e.g. +1 555-123-4567"
                        className="bg-surface-container border-outline-variant/20 text-on-surface"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gold text-xs uppercase tracking-wider">
                        Notes
                      </Label>
                      <Textarea
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        rows={2}
                        className="bg-surface-container border-outline-variant/20 text-on-surface"
                      />
                    </div>
                    {error && <p className="text-error-red text-sm">{error}</p>}
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleSaveEdit(cred.id)}
                        disabled={loading}
                        className="gold-gradient text-on-gold font-semibold rounded-full"
                      >
                        {loading ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={cancelEdit}
                        className="rounded-full border-outline-variant/30 text-on-surface-variant"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Display Mode */
                  <>
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h3 className="font-heading text-lg font-bold text-on-surface">
                          {appName}
                        </h3>
                        {cred.status && (
                          <Badge
                            variant="outline"
                            className={`text-[9px] uppercase tracking-widest ${
                              statusColors[cred.status] ?? statusColors.active
                            }`}
                          >
                            {cred.status}
                          </Badge>
                        )}
                      </div>
                      <span
                        className="material-symbols-outlined text-gold"
                        style={{
                          fontVariationSettings: `'FILL' ${isRevealed ? 0 : 1}, 'wght' 400`,
                        }}
                      >
                        {isRevealed ? "lock_open" : "lock"}
                      </span>
                    </div>

                    {/* Credential fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-0.5">
                            Username
                          </p>
                          <p className="text-on-surface text-sm font-mono">
                            {isRevealed
                              ? cred.encrypted_username ?? "\u2014"
                              : mask(cred.encrypted_username)}
                          </p>
                        </div>
                        {isRevealed && cred.encrypted_username && (
                          <button
                            type="button"
                            onClick={() =>
                              copyToClipboard(
                                cred.encrypted_username,
                                `user-${cred.id}`
                              )
                            }
                            className="text-gold/60 hover:text-gold transition-colors p-1"
                            title="Copy username"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {copied === `user-${cred.id}`
                                ? "check"
                                : "content_copy"}
                            </span>
                          </button>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-0.5">
                            Password
                          </p>
                          <p className="text-on-surface text-sm font-mono">
                            {isRevealed
                              ? cred.encrypted_password ?? "\u2014"
                              : mask(cred.encrypted_password)}
                          </p>
                        </div>
                        {isRevealed && cred.encrypted_password && (
                          <button
                            type="button"
                            onClick={() =>
                              copyToClipboard(
                                cred.encrypted_password,
                                `pass-${cred.id}`
                              )
                            }
                            className="text-gold/60 hover:text-gold transition-colors p-1"
                            title="Copy password"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {copied === `pass-${cred.id}`
                                ? "check"
                                : "content_copy"}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Associated Phone */}
                    {cred.associated_phone && (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-0.5">
                            Phone
                          </p>
                          <p className="text-on-surface text-sm font-mono">
                            {isRevealed
                              ? cred.associated_phone
                              : mask(cred.associated_phone)}
                          </p>
                        </div>
                        {isRevealed && (
                          <button
                            type="button"
                            onClick={() =>
                              copyToClipboard(
                                cred.associated_phone,
                                `phone-${cred.id}`
                              )
                            }
                            className="text-gold/60 hover:text-gold transition-colors p-1"
                            title="Copy phone"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {copied === `phone-${cred.id}`
                                ? "check"
                                : "content_copy"}
                            </span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* Notes */}
                    {cred.notes && isRevealed && (
                      <p className="text-on-surface-variant text-xs italic">
                        {cred.notes}
                      </p>
                    )}

                    {/* Auto-hide note */}
                    {isRevealed && (
                      <p className="text-outline text-[10px]">
                        Auto-hides in 30 seconds
                      </p>
                    )}

                    {/* Actions row */}
                    <div className="flex items-center gap-3 pt-2 border-t border-outline-variant/10">
                      <button
                        type="button"
                        onClick={() => toggle(cred.id)}
                        className="text-gold/60 hover:text-gold transition-colors flex items-center gap-1 text-xs"
                      >
                        <span
                          className="material-symbols-outlined text-[16px]"
                          style={{
                            fontVariationSettings: "'FILL' 0, 'wght' 300",
                          }}
                        >
                          {isRevealed ? "visibility_off" : "visibility"}
                        </span>
                        {isRevealed ? "Hide" : "Reveal"}
                      </button>
                      <button
                        type="button"
                        onClick={() => startEdit(cred)}
                        className="text-gold/60 hover:text-gold transition-colors flex items-center gap-1 text-xs"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          edit
                        </span>
                        Edit
                      </button>
                      {/* Quick status toggle */}
                      <button
                        type="button"
                        onClick={() =>
                          handleStatusUpdate(
                            cred.id,
                            cred.status === "active" ? "inactive" : "active"
                          )
                        }
                        className="text-on-surface-variant/60 hover:text-on-surface-variant transition-colors flex items-center gap-1 text-xs"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {cred.status === "active"
                            ? "toggle_on"
                            : "toggle_off"}
                        </span>
                        {cred.status === "active" ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cred.id)}
                        className="text-error-red/60 hover:text-error-red transition-colors flex items-center gap-1 text-xs"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          delete
                        </span>
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
