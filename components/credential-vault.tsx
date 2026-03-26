"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Badge } from "@/components/ui/badge";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface CredentialVaultProps {
  credentials: any[];
  datingApps?: any[];
}

const statusColors: Record<string, string> = {
  active: "text-gold border-gold/30 bg-gold/10",
  inactive: "text-outline border-outline-variant/30",
  expired: "text-error-red border-error-red/30",
  revoked: "text-error-red border-error-red/50 bg-error-container/10",
};

const AUTO_HIDE_MS = 30_000;

export function CredentialVault({ credentials }: CredentialVaultProps) {
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

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
          // Auto-hide after 30s
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

  // Cleanup timers on unmount
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
    value && value !== "pending_setup" ? "\u2022".repeat(Math.min(value.length, 12)) : "\u2014";

  if (credentials.length === 0) {
    return (
      <p className="text-on-surface-variant/60 text-sm">
        No credentials stored.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {credentials.map((cred) => {
        const isRevealed = revealed[cred.id] ?? false;
        const appName = cred.dating_apps?.app_name ?? "App";

        return (
          <div
            key={cred.id}
            className="bg-surface-container-low p-6 rounded-2xl shadow-xl relative overflow-hidden group"
          >
            {/* Gold accent bar */}
            <div className="absolute top-0 left-0 w-1 h-full bg-gold opacity-30 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Header row */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-lg font-bold text-on-surface">
                {appName}
              </h3>
              <div className="flex items-center gap-2">
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
                <span
                  className="material-symbols-outlined text-gold"
                  style={{
                    fontVariationSettings: `'FILL' ${isRevealed ? 0 : 1}, 'wght' 400`,
                  }}
                >
                  {isRevealed ? "lock_open" : "lock"}
                </span>
              </div>
            </div>

            {/* Username row */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-0.5">
                    Username
                  </p>
                  <p className="text-on-surface text-sm font-mono">
                    {isRevealed ? (cred.encrypted_username ?? cred.username ?? "\u2014") : mask(cred.encrypted_username ?? cred.username)}
                  </p>
                </div>
                {isRevealed && (cred.encrypted_username ?? cred.username) && (
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(cred.encrypted_username ?? cred.username, `user-${cred.id}`)
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

              {/* Password row */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-0.5">
                    Password
                  </p>
                  <p className="text-on-surface text-sm font-mono">
                    {isRevealed
                      ? (cred.encrypted_password ?? cred.password_encrypted ?? "\u2014")
                      : mask(cred.encrypted_password ?? cred.password_encrypted)}
                  </p>
                </div>
                {isRevealed && (cred.encrypted_password ?? cred.password_encrypted) && (
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        cred.encrypted_password ?? cred.password_encrypted,
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

            {/* Phone number */}
            {cred.associated_phone && (
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-outline-variant/10">
                <div>
                  <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-0.5">
                    Phone
                  </p>
                  <p className="text-on-surface text-sm">
                    {isRevealed ? cred.associated_phone : mask(cred.associated_phone)}
                  </p>
                </div>
                {isRevealed && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(cred.associated_phone, `phone-${cred.id}`)}
                    className="text-gold/60 hover:text-gold transition-colors p-1"
                    title="Copy phone"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {copied === `phone-${cred.id}` ? "check" : "content_copy"}
                    </span>
                  </button>
                )}
              </div>
            )}

            {/* Ban history */}
            {cred.was_banned && (
              <div className="mt-3 pt-3 border-t border-outline-variant/10">
                <div className="bg-error-red/10 border border-error-red/20 rounded-lg p-3 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-error-red text-sm" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}>warning</span>
                    <p className="text-error-red text-xs font-medium">Previously Banned</p>
                  </div>
                  {cred.ban_notes && <p className="text-on-surface-variant text-xs">{cred.ban_notes}</p>}
                  {cred.banned_photos_reused && (
                    <p className="text-error-red text-[10px] uppercase tracking-widest mt-1">Photos may have been reused</p>
                  )}
                </div>
              </div>
            )}

            {/* Needs creation badge */}
            {cred.status === "needs_creation" && (
              <div className="mt-3 pt-3 border-t border-outline-variant/10">
                <div className="bg-gold/10 border border-gold/20 rounded-lg p-3">
                  <p className="text-gold text-xs">
                    <span className="material-symbols-outlined text-sm align-middle mr-1" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>add_circle</span>
                    Account creation requested — your matchmaker will set this up.
                  </p>
                </div>
              </div>
            )}

            {/* Notes */}
            {cred.notes && isRevealed && (
              <p className="text-on-surface-variant text-xs mt-3 italic">
                {cred.notes}
              </p>
            )}

            {/* Reveal toggle button */}
            <button
              type="button"
              onClick={() => toggle(cred.id)}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-full text-xs font-semibold transition-all duration-300 border border-outline-variant/20 hover:border-gold/40 text-on-surface-variant hover:text-gold"
            >
              <span
                className="material-symbols-outlined text-[18px]"
                style={{
                  fontVariationSettings: "'FILL' 0, 'wght' 300",
                }}
              >
                {isRevealed ? "visibility_off" : "visibility"}
              </span>
              {isRevealed ? "Hide Credentials" : "Reveal Credentials"}
            </button>

            {/* Auto-hide indicator */}
            {isRevealed && (
              <p className="text-outline text-[10px] text-center mt-1">
                Auto-hides in 30 seconds
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
