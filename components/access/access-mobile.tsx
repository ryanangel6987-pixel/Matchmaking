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
interface AccessMobileProps {
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

function CollapsibleSection({
  title,
  icon,
  defaultOpen = false,
  children,
}: {
  title: string;
  icon: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="bg-surface-container-low rounded-2xl shadow-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4"
      >
        <div className="flex items-center gap-2.5">
          <span
            className="material-symbols-outlined text-gold text-xl"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
          >
            {icon}
          </span>
          <h2 className="text-[13px] text-on-surface-variant uppercase tracking-widest font-medium">
            {title}
          </h2>
        </div>
        <span
          className="material-symbols-outlined text-on-surface-variant text-xl transition-transform duration-300"
          style={{
            fontVariationSettings: "'FILL' 0, 'wght' 300",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          expand_more
        </span>
      </button>
      {open && <div className="px-5 pb-5 space-y-4">{children}</div>}
    </section>
  );
}

export function AccessMobile({
  clientId,
  credentials,
  datingApps,
  communication,
  matchmakerName,
  matchmakerWhatsApp,
  matchmakerAvailability,
  accountHealth,
  supportNotes,
}: AccessMobileProps) {
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
  const [signingOut, setSigningOut] = useState(false);

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

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="space-y-5 pb-24">
      {/* Header */}
      <div className="flex flex-col gap-1.5 px-1">
        <h1 className="text-[22px] font-heading font-bold text-gold tracking-tight">
          Credentials Vault
        </h1>
        <p className="text-on-surface-variant text-[13px] leading-relaxed">
          Manage your digital footprints and verified access.
        </p>
        <div className="h-px w-20 bg-gradient-to-r from-gold to-transparent" />
      </div>

      {/* A. Matchmaker Card — top priority on mobile */}
      <section className="bg-surface-container-low rounded-2xl shadow-xl p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-full bg-gold/10 flex items-center justify-center">
            <span
              className="material-symbols-outlined text-gold text-2xl"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
            >
              support_agent
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-on-surface text-[16px] font-medium font-heading truncate">
              {matchmakerName ?? "Not assigned"}
            </p>
            <p className="text-on-surface-variant text-[13px]">
              Your dedicated concierge
            </p>
          </div>
        </div>

        {/* Full-width WhatsApp button */}
        {matchmakerWhatsApp ? (
          <a
            href={`https://wa.me/${matchmakerWhatsApp.replace(/\D/g, "")}?text=Hi%2C%20I%20need%20assistance%20with%20my%20account.`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full h-12 gold-gradient text-on-gold font-semibold rounded-full text-[16px] hover:opacity-90 transition-opacity"
          >
            <span
              className="material-symbols-outlined text-xl"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}
            >
              chat
            </span>
            WhatsApp 24/7
          </a>
        ) : (
          <div className="flex items-center justify-center w-full h-12 rounded-full border border-outline-variant/20">
            <span className="text-outline text-[13px] uppercase tracking-widest">
              No WhatsApp set
            </span>
          </div>
        )}

        {/* Working days as compact circles */}
        {matchmakerAvailability && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant text-[13px]">Working days</span>
              <div className="flex gap-1">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(
                  (day) => {
                    const abbr: Record<string, string> = {
                      Monday: "M",
                      Tuesday: "T",
                      Wednesday: "W",
                      Thursday: "Th",
                      Friday: "F",
                      Saturday: "Sa",
                      Sunday: "Su",
                    };
                    const isWorking = (
                      matchmakerAvailability.working_days ?? []
                    ).includes(day);
                    return (
                      <span
                        key={day}
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-bold ${
                          isWorking
                            ? "bg-gold/15 text-gold border border-gold/30"
                            : "bg-surface-container text-outline/40"
                        }`}
                      >
                        {abbr[day]}
                      </span>
                    );
                  }
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 text-[13px]">
              <span className="flex items-center gap-1.5 text-on-surface">
                <span
                  className="material-symbols-outlined text-gold text-sm"
                  style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
                >
                  schedule
                </span>
                {matchmakerAvailability.start_time?.slice(0, 5)} &ndash;{" "}
                {matchmakerAvailability.end_time?.slice(0, 5)}
              </span>
              <span className="text-on-surface-variant">
                {matchmakerAvailability.timezone
                  ?.replace("America/", "")
                  .replace(/_/g, " ")}
              </span>
            </div>
            {matchmakerAvailability.notes && (
              <p className="text-on-surface-variant text-[13px] italic">
                {matchmakerAvailability.notes}
              </p>
            )}
          </div>
        )}

        {!matchmakerAvailability && (
          <p className="text-on-surface-variant text-[13px]">
            Availability details will be updated shortly.
          </p>
        )}
      </section>

      {/* B. Credential Vault */}
      <CollapsibleSection title="Credential Vault" icon="lock" defaultOpen={true}>
        <div className="flex items-center justify-end mb-1">
          <button
            onClick={() => setShowAddCred(!showAddCred)}
            className="flex items-center gap-1.5 text-gold text-[13px] hover:text-gold-light transition-colors"
          >
            <span
              className="material-symbols-outlined text-base"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
            >
              {showAddCred ? "close" : "add_circle"}
            </span>
            {showAddCred ? "Cancel" : "Add Credentials"}
          </button>
        </div>

        {showAddCred && (
          <div className="space-y-4">
            {/* Plan info — simplified */}
            <div className="bg-gold/5 border border-gold/15 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-gold text-lg"
                  style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
                >
                  info
                </span>
                <p className="text-gold text-[13px] font-semibold uppercase tracking-wider">
                  Profile Setup
                </p>
              </div>
              <div className="space-y-2 mt-1">
                <div className="flex items-start gap-2">
                  <span className="text-gold text-sm mt-0.5">&#9672;</span>
                  <p className="text-on-surface-variant text-[13px]">
                    <span className="text-on-surface font-medium">Monthly:</span> 1 app
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-gold text-sm mt-0.5">&#9672;</span>
                  <p className="text-on-surface-variant text-[13px]">
                    <span className="text-on-surface font-medium">3-Month:</span> 2-3 apps
                  </p>
                </div>
              </div>
            </div>

            {/* App selection */}
            <div className="space-y-2">
              <label className="text-gold text-[13px] uppercase tracking-wider">
                Dating App *
              </label>
              <CustomSelect
                value={credApp}
                onChange={(v) => setCredApp(v)}
                options={[
                  { value: "", label: "Select app..." },
                  ...datingApps.map((app: any) => ({
                    value: app.id,
                    label: app.app_name,
                  })),
                ]}
                placeholder="Select app..."
                className="w-full border border-outline-variant/20 rounded-lg px-3 py-3 text-[16px] focus:border-gold focus:ring-1 focus:ring-gold outline-none"
              />
            </div>

            {/* Other app name */}
            {datingApps.find((a: any) => a.id === credApp)?.app_name ===
              "Other" && (
              <div className="space-y-2">
                <label className="text-gold text-[13px] uppercase tracking-wider">
                  App Name *
                </label>
                <input
                  type="text"
                  value={
                    credNotes.startsWith("App: ") ? credNotes.slice(5) : ""
                  }
                  onChange={(e) =>
                    setCredNotes(
                      e.target.value ? `App: ${e.target.value}` : ""
                    )
                  }
                  placeholder="Which app? (e.g. Feeld, OkCupid...)"
                  className="w-full bg-surface-container border border-outline-variant/20 rounded-lg px-3 py-3 text-on-surface text-[16px] placeholder:text-outline focus:border-gold focus:ring-1 focus:ring-gold outline-none"
                />
              </div>
            )}

            {/* No existing account toggle */}
            <label className="flex items-center gap-3 cursor-pointer py-1">
              <input
                type="checkbox"
                checked={noExistingApps}
                onChange={(e) => setNoExistingApps(e.target.checked)}
                className="w-5 h-5 rounded border-outline-variant/30 bg-surface-container text-gold focus:ring-gold accent-[#e6c487]"
              />
              <span className="text-on-surface text-[16px]">
                No account yet — create one for me
              </span>
            </label>

            {/* Credentials — stacked single column */}
            {!noExistingApps && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-gold text-[13px] uppercase tracking-wider">
                    Username / Email *
                  </label>
                  <input
                    type="text"
                    value={credUsername}
                    onChange={(e) => setCredUsername(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full bg-surface-container border border-outline-variant/20 rounded-lg px-3 py-3 text-on-surface text-[16px] placeholder:text-outline focus:border-gold focus:ring-1 focus:ring-gold outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-gold text-[13px] uppercase tracking-wider">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={credPassword}
                    onChange={(e) => setCredPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-surface-container border border-outline-variant/20 rounded-lg px-3 py-3 text-on-surface text-[16px] placeholder:text-outline focus:border-gold focus:ring-1 focus:ring-gold outline-none"
                  />
                </div>
              </div>
            )}

            {/* Phone number */}
            <div className="space-y-2">
              <label className="text-gold text-[13px] uppercase tracking-wider">
                Phone Number on Account
              </label>
              <input
                type="tel"
                value={credPhone}
                onChange={(e) => setCredPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="w-full bg-surface-container border border-outline-variant/20 rounded-lg px-3 py-3 text-on-surface text-[16px] placeholder:text-outline focus:border-gold focus:ring-1 focus:ring-gold outline-none"
              />
              <p className="text-outline text-[11px]">
                The phone number linked to this dating app account
              </p>
            </div>

            {/* Ban history */}
            <div className="bg-surface-container rounded-xl p-4 space-y-3">
              <p className="text-on-surface-variant text-[13px] uppercase tracking-widest">
                Account History
              </p>
              <label className="flex items-center gap-3 cursor-pointer py-1">
                <input
                  type="checkbox"
                  checked={credWasBanned}
                  onChange={(e) => setCredWasBanned(e.target.checked)}
                  className="w-5 h-5 rounded border-outline-variant/30 bg-surface-container text-gold focus:ring-gold accent-[#e6c487]"
                />
                <span className="text-on-surface text-[16px]">
                  Previously banned or shadowbanned
                </span>
              </label>

              {credWasBanned && (
                <div className="space-y-3 pl-8">
                  <div className="space-y-2">
                    <label className="text-gold text-[13px] uppercase tracking-wider">
                      Ban Details
                    </label>
                    <textarea
                      value={credBanNotes}
                      onChange={(e) => setCredBanNotes(e.target.value)}
                      placeholder="When were you banned? What reason was given?"
                      rows={3}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-3 py-3 text-on-surface text-[16px] placeholder:text-outline focus:border-gold focus:ring-1 focus:ring-gold outline-none resize-none"
                    />
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer py-1">
                    <input
                      type="checkbox"
                      checked={credBannedPhotos}
                      onChange={(e) => setCredBannedPhotos(e.target.checked)}
                      className="w-5 h-5 rounded border-outline-variant/30 bg-surface-container text-gold focus:ring-gold accent-[#e6c487]"
                    />
                    <span className="text-on-surface text-[16px]">
                      Banned photos may have been reused
                    </span>
                  </label>

                  {credBannedPhotos && (
                    <div className="bg-error-red/10 border border-error-red/20 rounded-lg p-3">
                      <p className="text-error-red text-[13px]">
                        <span
                          className="material-symbols-outlined text-sm align-middle mr-1"
                          style={{
                            fontVariationSettings: "'FILL' 1, 'wght' 400",
                          }}
                        >
                          warning
                        </span>
                        Reusing photos from a banned account can trigger
                        detection. Your matchmaker will ensure fresh photos are
                        used.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-gold text-[13px] uppercase tracking-wider">
                Additional Notes
              </label>
              <input
                type="text"
                value={credNotes}
                onChange={(e) => setCredNotes(e.target.value)}
                placeholder="Anything else your matchmaker should know..."
                className="w-full bg-surface-container border border-outline-variant/20 rounded-lg px-3 py-3 text-on-surface text-[16px] placeholder:text-outline focus:border-gold focus:ring-1 focus:ring-gold outline-none"
              />
            </div>

            {credError && (
              <p className="text-error-red text-[13px]">{credError}</p>
            )}
            <button
              onClick={handleAddCredential}
              disabled={credSaving}
              className="w-full h-12 gold-gradient text-on-gold font-semibold rounded-full text-[16px] hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {credSaving ? "Saving..." : "Save Credentials"}
            </button>
          </div>
        )}

        <CredentialVault credentials={credentials} />
      </CollapsibleSection>

      {/* C. Secure Communications */}
      <CollapsibleSection title="Communications" icon="forum" defaultOpen={false}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-on-surface text-[16px] font-medium capitalize">
              {communication?.preferred_communication_channel ?? "Not set"}
            </p>
            <p className="text-on-surface-variant text-[13px] mt-0.5">
              Primary channel
            </p>
          </div>
          <Badge
            variant="outline"
            className={`text-[10px] uppercase tracking-widest ${
              communication?.communication_channel_verified
                ? "text-gold border-gold/30"
                : "text-outline border-outline-variant/30"
            }`}
          >
            {communication?.communication_channel_verified
              ? "Verified"
              : "Unverified"}
          </Badge>
        </div>
      </CollapsibleSection>

      {/* D. Account Health — stacked cards */}
      {accountHealth.length > 0 && (
        <CollapsibleSection title="Account Health" icon="monitor_heart" defaultOpen={false}>
          <div className="space-y-3">
            {accountHealth.map((ah) => (
              <div
                key={ah.id}
                className="bg-surface-container rounded-xl p-4 flex items-center justify-between"
              >
                <p className="text-on-surface text-[16px] font-medium">
                  {ah.dating_apps?.app_name ?? "App"}
                </p>
                <Badge
                  variant="outline"
                  className={`text-[10px] uppercase tracking-widest ${
                    healthColors[ah.status] ?? ""
                  }`}
                >
                  {ah.status.replace(/_/g, " ")}
                </Badge>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* E. Legal / Usage Notes */}
      {accountHealth.some(
        (ah) =>
          ah.ban_notes || ah.restricted_use_notes || ah.platform_risk_notes
      ) && (
        <CollapsibleSection title="Legal / Usage Notes" icon="gavel" defaultOpen={false}>
          <div className="space-y-3">
            {accountHealth
              .filter(
                (ah) =>
                  ah.ban_notes ||
                  ah.restricted_use_notes ||
                  ah.platform_risk_notes
              )
              .map((ah) => (
                <div key={ah.id} className="space-y-1">
                  <p className="text-on-surface text-[16px] font-medium">
                    {ah.dating_apps?.app_name}
                  </p>
                  {ah.ban_notes && (
                    <p className="text-error-red text-[13px]">
                      Ban: {ah.ban_notes}
                    </p>
                  )}
                  {ah.restricted_use_notes && (
                    <p className="text-on-surface-variant text-[13px]">
                      Restricted: {ah.restricted_use_notes}
                    </p>
                  )}
                  {ah.platform_risk_notes && (
                    <p className="text-on-surface-variant text-[13px]">
                      Risk: {ah.platform_risk_notes}
                    </p>
                  )}
                </div>
              ))}
          </div>
        </CollapsibleSection>
      )}

      {/* F. Support Notes */}
      {supportNotes.length > 0 && (
        <CollapsibleSection title="Support Notes" icon="sticky_note_2" defaultOpen={false}>
          <div className="space-y-3">
            {supportNotes.map((note) => (
              <div
                key={note.id}
                className="bg-surface-container rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge
                    variant="outline"
                    className="text-[10px] uppercase tracking-widest border-outline-variant/30 text-outline"
                  >
                    {note.note_type}
                  </Badge>
                  <span className="text-outline text-[11px]">
                    {new Date(note.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-on-surface text-[16px] leading-relaxed">
                  {note.content}
                </p>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* G. Sign Out */}
      <div className="pt-4">
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="w-full h-12 flex items-center justify-center gap-2 rounded-full border border-outline-variant/20 text-on-surface-variant text-[16px] font-medium hover:border-error-red/40 hover:text-error-red transition-colors disabled:opacity-50"
        >
          <span
            className="material-symbols-outlined text-xl"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
          >
            logout
          </span>
          {signingOut ? "Signing out..." : "Sign Out"}
        </button>
      </div>
    </div>
  );
}
