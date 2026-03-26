"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { CredentialVault } from "@/components/credential-vault";
import { CustomSelect } from "@/components/ui/custom-select";

const healthColors: Record<string, string> = {
  active: "text-gold border-gold/30 bg-gold/10",
  paused: "text-neutral border-outline-variant/30",
  shadowbanned: "text-error-red border-error-red/30",
  banned: "text-error-red border-error-red/50 bg-error-container/10",
  needs_verification: "text-gold border-gold/30",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface AccessClientProps {
  clientId: string;
  credentials: any[];
  datingApps: any[];
  communication: any;
  matchmakerName: string | null;
  matchmakerWhatsApp: string | null;
  matchmakerAvailability: any;
  accountHealth: any[];
  supportNotes: any[];
}

export function AccessClient({
  clientId,
  credentials,
  datingApps,
  communication,
  matchmakerName,
  matchmakerWhatsApp,
  matchmakerAvailability,
  accountHealth,
  supportNotes,
}: AccessClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [showAddCred, setShowAddCred] = useState(false);
  const [credApp, setCredApp] = useState("");
  const [credUsername, setCredUsername] = useState("");
  const [credPassword, setCredPassword] = useState("");
  const [credPhone, setCredPhone] = useState("");
  const [credNotes, setCredNotes] = useState("");
  const [credWasBanned, setCredWasBanned] = useState(false);
  const [credBanNotes, setCredBanNotes] = useState("");
  const [credBannedPhotos, setCredBannedPhotos] = useState(false);
  const [noExistingApps, setNoExistingApps] = useState(false);
  const [credSaving, setCredSaving] = useState(false);
  const [credError, setCredError] = useState("");

  const handleAddCredential = async () => {
    if (!credApp) {
      setCredError("Please select a dating app.");
      return;
    }
    if (!noExistingApps && (!credUsername || !credPassword)) {
      setCredError("Username and password are required for existing accounts.");
      return;
    }
    setCredSaving(true);
    setCredError("");
    const { error } = await supabase.from("credentials").insert({
      client_id: clientId,
      app_id: credApp,
      encrypted_username: credUsername || "pending_setup",
      encrypted_password: credPassword || "pending_setup",
      associated_phone: credPhone || null,
      status: noExistingApps ? "needs_creation" : "active",
      notes: credNotes || null,
      was_banned: credWasBanned,
      ban_notes: credBanNotes || null,
      banned_photos_reused: credBannedPhotos,
    });
    setCredSaving(false);
    if (error) {
      setCredError(error.message);
    } else {
      setCredApp("");
      setCredUsername("");
      setCredPassword("");
      setCredPhone("");
      setCredNotes("");
      setCredWasBanned(false);
      setCredBanNotes("");
      setCredBannedPhotos(false);
      setNoExistingApps(false);
      setShowAddCred(false);
      router.refresh();
    }
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-heading font-bold text-gold tracking-tight">
          Credentials Vault
        </h1>
        <p className="text-on-surface-variant text-sm">
          Management of elite digital footprints and verified access to the world&apos;s most exclusive physical estates.
        </p>
        <div className="h-px w-32 bg-gradient-to-r from-gold to-transparent" />
      </div>

      {/* A. Credential Vault */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-on-surface-variant text-xs uppercase tracking-widest">
            Credential Vault
          </h2>
          <button
            onClick={() => setShowAddCred(!showAddCred)}
            className="flex items-center gap-1.5 text-gold text-xs hover:text-gold-light transition-colors"
          >
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>
              {showAddCred ? "close" : "add_circle"}
            </span>
            {showAddCred ? "Cancel" : "Add Credentials"}
          </button>
        </div>

        {showAddCred && (
          <div className="bg-surface-container-low p-6 rounded-2xl shadow-xl space-y-5">
            {/* Plan info */}
            <div className="bg-gold/5 border border-gold/15 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-gold text-lg" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>info</span>
                <p className="text-gold text-xs font-semibold uppercase tracking-wider">Profile Setup by Plan</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                <div className="flex items-start gap-2">
                  <span className="text-gold text-sm mt-0.5">&#9672;</span>
                  <div>
                    <p className="text-on-surface text-sm font-medium">Monthly Plan</p>
                    <p className="text-on-surface-variant text-xs">1 dating app — fresh profile built and optimized</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-gold text-sm mt-0.5">&#9672;</span>
                  <div>
                    <p className="text-on-surface text-sm font-medium">3-Month Plan</p>
                    <p className="text-on-surface-variant text-xs">2–3 dating apps — fresh profiles built and managed</p>
                  </div>
                </div>
              </div>
              <p className="text-on-surface-variant text-[10px] mt-1">Your matchmaker will set up fresh, optimized profiles on your selected apps. Add any existing credentials below or request new account creation.</p>
            </div>

            {/* App selection */}
            <div className="space-y-2">
              <label className="text-gold text-xs uppercase tracking-wider">Dating App *</label>
              <CustomSelect
                value={credApp}
                onChange={(v) => setCredApp(v)}
                options={[{ value: "", label: "Select app..." }, ...datingApps.map((app: any) => ({ value: app.id, label: app.app_name }))]}
                placeholder="Select app..."
                className="w-full border border-outline-variant/20 rounded-lg px-3 py-2.5 text-sm focus:border-gold focus:ring-1 focus:ring-gold outline-none"
              />
            </div>

            {/* Other app name */}
            {datingApps.find((a: any) => a.id === credApp)?.app_name === "Other" && (
              <div className="space-y-2">
                <label className="text-gold text-xs uppercase tracking-wider">App Name *</label>
                <input
                  type="text"
                  value={credNotes.startsWith("App: ") ? credNotes.slice(5) : ""}
                  onChange={(e) => setCredNotes(e.target.value ? `App: ${e.target.value}` : "")}
                  placeholder="Which app? (e.g. Feeld, OkCupid...)"
                  className="w-full bg-surface-container border border-outline-variant/20 rounded-lg px-3 py-2 text-on-surface text-sm placeholder:text-outline focus:border-gold focus:ring-1 focus:ring-gold outline-none"
                />
                <p className="text-outline text-[10px]">This app is not currently supported by our service. Your matchmaker will review.</p>
              </div>
            )}

            {/* No existing account toggle */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={noExistingApps}
                onChange={(e) => setNoExistingApps(e.target.checked)}
                className="w-4 h-4 rounded border-outline-variant/30 bg-surface-container text-gold focus:ring-gold accent-[#e6c487]"
              />
              <span className="text-on-surface text-sm">I don&apos;t have an account yet — please create one for me</span>
            </label>

            {/* Credentials (hidden if no existing account) */}
            {!noExistingApps && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-gold text-xs uppercase tracking-wider">Username / Email *</label>
                  <input
                    type="text"
                    value={credUsername}
                    onChange={(e) => setCredUsername(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full bg-surface-container border border-outline-variant/20 rounded-lg px-3 py-2 text-on-surface text-sm placeholder:text-outline focus:border-gold focus:ring-1 focus:ring-gold outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-gold text-xs uppercase tracking-wider">Password *</label>
                  <input
                    type="password"
                    value={credPassword}
                    onChange={(e) => setCredPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-surface-container border border-outline-variant/20 rounded-lg px-3 py-2 text-on-surface text-sm placeholder:text-outline focus:border-gold focus:ring-1 focus:ring-gold outline-none"
                  />
                </div>
              </div>
            )}

            {/* Phone number */}
            <div className="space-y-2">
              <label className="text-gold text-xs uppercase tracking-wider">Phone Number on Account</label>
              <input
                type="tel"
                value={credPhone}
                onChange={(e) => setCredPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="w-full bg-surface-container border border-outline-variant/20 rounded-lg px-3 py-2 text-on-surface text-sm placeholder:text-outline focus:border-gold focus:ring-1 focus:ring-gold outline-none"
              />
              <p className="text-outline text-[10px]">The phone number linked to this dating app account</p>
            </div>

            {/* Ban history */}
            <div className="bg-surface-container rounded-xl p-4 space-y-3">
              <p className="text-on-surface-variant text-xs uppercase tracking-widest">Account History</p>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={credWasBanned}
                  onChange={(e) => setCredWasBanned(e.target.checked)}
                  className="w-4 h-4 rounded border-outline-variant/30 bg-surface-container text-gold focus:ring-gold accent-[#e6c487]"
                />
                <span className="text-on-surface text-sm">I was previously banned or shadowbanned on this app</span>
              </label>

              {credWasBanned && (
                <div className="space-y-3 pl-7">
                  <div className="space-y-2">
                    <label className="text-gold text-xs uppercase tracking-wider">Ban Details</label>
                    <textarea
                      value={credBanNotes}
                      onChange={(e) => setCredBanNotes(e.target.value)}
                      placeholder="When were you banned? What reason was given? Any details that may help..."
                      rows={3}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-3 py-2 text-on-surface text-sm placeholder:text-outline focus:border-gold focus:ring-1 focus:ring-gold outline-none resize-none"
                    />
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={credBannedPhotos}
                      onChange={(e) => setCredBannedPhotos(e.target.checked)}
                      className="w-4 h-4 rounded border-outline-variant/30 bg-surface-container text-gold focus:ring-gold accent-[#e6c487]"
                    />
                    <span className="text-on-surface text-sm">Photos from banned account may have been reused</span>
                  </label>

                  {credBannedPhotos && (
                    <div className="bg-error-red/10 border border-error-red/20 rounded-lg p-3">
                      <p className="text-error-red text-xs">
                        <span className="material-symbols-outlined text-sm align-middle mr-1" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}>warning</span>
                        Important: Reusing photos from a banned account can trigger automatic detection. Your matchmaker will ensure fresh photos are used for this app.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-gold text-xs uppercase tracking-wider">Additional Notes</label>
              <input
                type="text"
                value={credNotes}
                onChange={(e) => setCredNotes(e.target.value)}
                placeholder="Anything else your matchmaker should know..."
                className="w-full bg-surface-container border border-outline-variant/20 rounded-lg px-3 py-2 text-on-surface text-sm placeholder:text-outline focus:border-gold focus:ring-1 focus:ring-gold outline-none"
              />
            </div>

            {credError && <p className="text-error-red text-xs">{credError}</p>}
            <button
              onClick={handleAddCredential}
              disabled={credSaving}
              className="gold-gradient text-on-gold font-semibold rounded-full px-6 py-2.5 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {credSaving ? "Saving..." : "Save Credentials"}
            </button>
          </div>
        )}

        <CredentialVault credentials={credentials} />
      </section>

      {/* B. Assigned Matchmaker */}
      <section className="bg-surface-container-low p-6 rounded-2xl shadow-xl space-y-5">
        <h2 className="text-on-surface-variant text-xs uppercase tracking-widest">
          Assigned Matchmaker
        </h2>

        {/* Matchmaker name + WhatsApp */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gold/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-gold text-xl" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>support_agent</span>
            </div>
            <div>
              <p className="text-on-surface text-sm font-medium font-heading">
                {matchmakerName ?? "Not assigned"}
              </p>
              <p className="text-on-surface-variant text-xs mt-0.5">Your dedicated concierge</p>
            </div>
          </div>
          {matchmakerWhatsApp ? (
            <a
              href={`https://wa.me/${matchmakerWhatsApp.replace(/\D/g, "")}?text=Hi%2C%20I%20need%20assistance%20with%20my%20account.`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 gold-gradient text-on-gold font-semibold rounded-full px-4 py-2 text-xs hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}>chat</span>
              WhatsApp 24/7
            </a>
          ) : (
            <Badge variant="outline" className="text-[10px] uppercase tracking-widest border-outline-variant/30 text-outline">
              No WhatsApp set
            </Badge>
          )}
        </div>

        {/* Availability schedule */}
        {matchmakerAvailability ? (
          <div className="bg-surface-container rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-on-surface-variant text-xs">Working days:</span>
              <div className="flex gap-1.5">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => {
                  const abbr: Record<string, string> = { Monday: "M", Tuesday: "T", Wednesday: "W", Thursday: "Th", Friday: "F", Saturday: "Sa", Sunday: "Su" };
                  const isWorking = (matchmakerAvailability.working_days ?? []).includes(day);
                  return (
                    <span
                      key={day}
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-bold ${
                        isWorking
                          ? "bg-gold/15 text-gold border border-gold/30"
                          : "bg-surface-container-low text-outline/40"
                      }`}
                    >
                      {abbr[day]}
                    </span>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-on-surface">
                <span className="material-symbols-outlined text-gold text-sm" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>schedule</span>
                {matchmakerAvailability.start_time?.slice(0, 5)} – {matchmakerAvailability.end_time?.slice(0, 5)}
              </span>
              <span className="text-on-surface-variant">
                {matchmakerAvailability.timezone?.replace("America/", "").replace(/_/g, " ")}
              </span>
            </div>
            {matchmakerAvailability.notes && (
              <p className="text-on-surface-variant text-xs italic">{matchmakerAvailability.notes}</p>
            )}
          </div>
        ) : (
          <p className="text-on-surface-variant text-xs">Your matchmaker works 5 days a week. Availability details will be updated shortly.</p>
        )}

        {/* How it works */}
        <div className="bg-gold/5 border border-gold/15 rounded-xl p-4 space-y-1.5">
          <p className="text-on-surface-variant text-xs leading-relaxed">
            <span className="text-gold font-semibold">How it works:</span>{" "}Your dedicated matchmaker operates on a 5-day work week. They actively manage your profiles, source matches, and coordinate date opportunities during their working hours.
          </p>
          <p className="text-on-surface-variant text-xs leading-relaxed">
            Any messages or feedback sent via WhatsApp outside working hours will be addressed first thing on their next working day.
          </p>
        </div>
      </section>

      {/* C. Secure Communications */}
      <section className="bg-surface-container-low p-6 rounded-2xl shadow-xl">
        <h2 className="text-on-surface-variant text-xs uppercase tracking-widest mb-4">
          Secure Communications
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-on-surface text-sm font-medium capitalize">
              {communication?.preferred_communication_channel ?? "Not set"}
            </p>
            <p className="text-on-surface-variant text-xs mt-1">Primary channel</p>
          </div>
          <Badge
            variant="outline"
            className={`text-[10px] uppercase tracking-widest ${
              communication?.communication_channel_verified
                ? "text-gold border-gold/30"
                : "text-outline border-outline-variant/30"
            }`}
          >
            {communication?.communication_channel_verified ? "Verified" : "Unverified"}
          </Badge>
        </div>
      </section>

      {/* D. Account Health */}
      {accountHealth.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-on-surface-variant text-xs uppercase tracking-widest">
            Account Health
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accountHealth.map((ah) => (
              <div key={ah.id} className="bg-surface-container-low p-4 rounded-xl flex items-center justify-between">
                <p className="text-on-surface text-sm font-medium">
                  {ah.dating_apps?.app_name ?? "App"}
                </p>
                <Badge variant="outline" className={`text-[10px] uppercase tracking-widest ${healthColors[ah.status] ?? ""}`}>
                  {ah.status.replace(/_/g, " ")}
                </Badge>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* E. Legal / Usage Notes */}
      {accountHealth.some((ah) => ah.ban_notes || ah.restricted_use_notes || ah.platform_risk_notes) && (
        <section className="bg-surface-container-low p-6 rounded-2xl shadow-xl">
          <h2 className="text-on-surface-variant text-xs uppercase tracking-widest mb-4">
            Legal / Usage Notes
          </h2>
          <div className="space-y-3">
            {accountHealth
              .filter((ah) => ah.ban_notes || ah.restricted_use_notes || ah.platform_risk_notes)
              .map((ah) => (
                <div key={ah.id} className="space-y-1">
                  <p className="text-on-surface text-sm font-medium">{ah.dating_apps?.app_name}</p>
                  {ah.ban_notes && <p className="text-error-red text-xs">Ban: {ah.ban_notes}</p>}
                  {ah.restricted_use_notes && <p className="text-on-surface-variant text-xs">Restricted: {ah.restricted_use_notes}</p>}
                  {ah.platform_risk_notes && <p className="text-on-surface-variant text-xs">Risk: {ah.platform_risk_notes}</p>}
                </div>
              ))}
          </div>
        </section>
      )}

      {/* F. Support Notes */}
      {supportNotes.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-on-surface-variant text-xs uppercase tracking-widest">
            Support Notes
          </h2>
          <div className="space-y-3">
            {supportNotes.map((note) => (
              <div key={note.id} className="bg-surface-container-low p-4 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-[9px] uppercase tracking-widest border-outline-variant/30 text-outline">
                    {note.note_type}
                  </Badge>
                  <span className="text-outline text-[10px]">
                    {new Date(note.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-on-surface text-sm leading-relaxed">{note.content}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
