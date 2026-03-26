"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { FeedbackModal } from "./feedback-modal";
import { PostDateFeedback } from "./post-date-feedback";
import { AlertDismissButton } from "@/components/alert-dismiss-button";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface OverviewClientProps {
  clientId: string;
  clientName: string;
  pendingOpportunities: any[];
  recentApproved: any[];
  kpiSummary: any;
  declinedDates: any[];
  alerts: any[];
  actions: any[];
  candidates: any[];
}

export function OverviewClient({
  clientId,
  clientName,
  pendingOpportunities,
  recentApproved,
  declinedDates,
  kpiSummary,
  alerts,
  actions,
  candidates,
}: OverviewClientProps) {
  const [showDeclined, setShowDeclined] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);

  return (
    <div className="space-y-10">
      {/* 1. Header with notification bell */}
      <section>
        <div className="flex items-start justify-between">
          <div>
            <div className="h-1 w-16 bg-gradient-to-r from-gold to-gold-dark rounded-full mb-4" />
            <h1 className="font-heading text-3xl font-bold text-gold tracking-tight">
              Dates
            </h1>
            <p className="text-on-surface-variant text-sm mt-1">{clientName}</p>
          </div>
          {alerts.length > 0 && (
            <button
              onClick={() => setShowAlerts((v) => !v)}
              className="relative p-2"
            >
              <span className="material-symbols-outlined text-gold text-[30px]" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}>notifications</span>
              <span className="absolute top-0 right-0 w-4 h-4 bg-gold rounded-full flex items-center justify-center text-[9px] text-black font-bold">{alerts.length}</span>
            </button>
          )}
        </div>
        {showAlerts && alerts.length > 0 && (
          <div className="mt-4 space-y-2">
            {alerts.map((alert) => (
              <div key={alert.id} className="bg-surface-container-low p-4 rounded-xl flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  {alert.title && <p className="text-on-surface text-sm font-medium">{alert.title}</p>}
                  {alert.message && <p className="text-on-surface-variant text-xs mt-0.5">{alert.message}</p>}
                  {!alert.title && !alert.message && <p className="text-on-surface-variant text-sm">New notification</p>}
                </div>
                <AlertDismissButton alertId={alert.id} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 2. Pending Dates — top priority */}
      <section className="space-y-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-on-surface-variant text-xs uppercase tracking-widest">
            Pending Your Approval
          </h2>
          <div className="h-px w-32 bg-gradient-to-r from-gold to-transparent" />
        </div>

        {pendingOpportunities.length > 0 ? (
          pendingOpportunities.map((opp) => (
            <PendingDateCard
              key={opp.id}
              opportunity={opp}
              clientId={clientId}
            />
          ))
        ) : (
          <div className="bg-surface-container-low p-10 rounded-2xl text-center space-y-3">
            <span
              className="material-symbols-outlined text-gold text-4xl"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}
            >
              event_available
            </span>
            <p className="text-on-surface text-sm font-heading italic">
              No dates pending — your matchmaker is working on new opportunities
            </p>
          </div>
        )}
      </section>

      {/* 3. Recently Approved (expandable cards matching mobile) */}
      {recentApproved.length > 0 && (
        <section className="space-y-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-on-surface-variant text-xs uppercase tracking-widest">
              Recently Approved
            </h2>
            <div className="h-px w-24 bg-gradient-to-r from-gold to-transparent" />
          </div>

          <div className="space-y-3">
            {recentApproved.map((opp) => {
              const photoUrl = opp.candidate_photo_url || (opp.candidate_photos && opp.candidate_photos[0]);
              const dateInPast = opp.proposed_day ? new Date(opp.proposed_day + "T23:59:59") < new Date() : false;
              const hasTexted = !!opp.client_texted_at;
              const phoneSharedAt = opp.phone_shared_at ? new Date(opp.phone_shared_at) : null;
              const hoursSinceShared = phoneSharedAt ? Math.floor((Date.now() - phoneSharedAt.getTime()) / (1000 * 60 * 60)) : null;
              const isUrgent = hoursSinceShared !== null && hoursSinceShared >= 5;

              return (
                <DesktopApprovedCard
                  key={opp.id}
                  opp={opp}
                  photoUrl={photoUrl}
                  dateInPast={dateInPast}
                  hasTexted={hasTexted}
                  isUrgent={isUrgent}
                  hoursSinceShared={hoursSinceShared}
                  clientId={clientId}
                />
              );
            })}
          </div>

          <p className="text-on-surface-variant text-xs italic pl-1">
            Approved dates are automatically added to your Taste Calibration preferences
          </p>
        </section>
      )}

      {/* 4. Declined Dates (expandable cards matching mobile) */}
      {declinedDates.length > 0 && (
        <section className="space-y-3">
          <button
            type="button"
            onClick={() => setShowDeclined((v) => !v)}
            className="flex items-center gap-2 group"
          >
            <h2 className="text-on-surface-variant text-xs uppercase tracking-widest">Declined Dates</h2>
            <span className="material-symbols-outlined text-on-surface-variant text-lg transition-transform duration-300" style={{ transform: showDeclined ? "rotate(0deg)" : "rotate(-90deg)", fontVariationSettings: "'FILL' 0, 'wght' 300" }}>expand_more</span>
            <span className="text-on-surface-variant text-xs">({declinedDates.length})</span>
          </button>

          {showDeclined && (
            <div className="space-y-3">
              {declinedDates.map((opp) => {
                const photoUrl = opp.candidate_photo_url || (opp.candidate_photos && opp.candidate_photos[0]);
                return <DesktopDeclinedCard key={opp.id} opp={opp} photoUrl={photoUrl} />;
              })}
              <p className="text-on-surface-variant text-xs italic pl-1">This feedback helps your matchmaker refine targeting</p>
            </div>
          )}
        </section>
      )}

      {/* 5. Active Candidates */}
      {candidates.length > 0 && (
        <section className="space-y-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-on-surface-variant text-xs uppercase tracking-widest">Active Candidates</h2>
            <div className="h-px w-24 bg-gradient-to-r from-gold to-transparent" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {candidates.map((c: any) => (
              <div key={c.id} className="bg-surface-container-low p-4 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-on-surface text-sm font-medium font-heading">{c.full_name}</p>
                  <p className="text-on-surface-variant text-xs mt-0.5">{[c.age && `Age ${c.age}`, c.source_app].filter(Boolean).join(" · ")}</p>
                </div>
                <Badge variant="outline" className={`text-[9px] uppercase tracking-widest ${c.status === "approved" ? "border-gold/30 text-gold" : c.status === "declined" ? "border-error-red/30 text-error-red" : "border-outline-variant/30 text-outline"}`}>
                  {c.status?.replace(/_/g, " ")}
                </Badge>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Concierge Insight */}
      <section className="bg-surface-container-low p-8 rounded-2xl shadow-xl relative overflow-hidden space-y-5">
        <div className="absolute top-0 left-0 w-1 h-full bg-gold opacity-50" />
        <h2 className="text-on-surface-variant text-xs uppercase tracking-widest">
          Concierge Insight
        </h2>
        <p className="text-on-surface text-sm leading-relaxed font-heading italic">
          {pendingOpportunities.length > 0
            ? `You have ${pendingOpportunities.length} date ${pendingOpportunities.length === 1 ? "opportunity" : "opportunities"} awaiting your approval. Review and respond to keep momentum.`
            : recentApproved.length > 0
              ? "Your recent approvals are being finalized. Your matchmaker will update you with confirmation details."
              : "Your matchmaker is actively working on new opportunities. Check back soon for updates."}
        </p>
      </section>
    </div>
  );
}

// ── Pending Date Card (full-width, prominent) ───────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PendingDateCard({
  opportunity,
  clientId,
}: {
  opportunity: any;
  clientId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [declineOpen, setDeclineOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [activePhoto, setActivePhoto] = useState(0);
  const router = useRouter();
  const supabase = createClient();

  const photos: string[] = [
    ...(opportunity.candidate_photo_url ? [opportunity.candidate_photo_url] : []),
    ...(opportunity.candidate_photos ?? []),
  ].filter(Boolean);

  const handleDecision = async (decision: "approved" | "declined") => {
    setLoading(true);
    await supabase
      .from("date_opportunities")
      .update({
        client_decision: decision,
        client_decision_at: new Date().toISOString(),
        decline_reason: decision === "declined" ? declineReason : null,
        status: decision,
      })
      .eq("id", opportunity.id);

    setLoading(false);
    router.refresh();
  };

  return (
    <div className="p-px rounded-2xl bg-gradient-to-br from-gold to-gold-dark">
      <div className="bg-surface-container-lowest rounded-[0.95rem] p-6 space-y-5">
        {/* Candidate Header */}
        <div className="flex justify-between items-start">
          <div>
            <p className="font-heading text-2xl font-bold text-gold">
              {opportunity.candidate_name}
            </p>
            {opportunity.candidate_age && (
              <p className="text-on-surface-variant text-sm mt-0.5">
                Age {opportunity.candidate_age}
              </p>
            )}
          </div>
          {opportunity.dating_apps?.app_name && (
            <Badge
              variant="outline"
              className="text-[10px] uppercase tracking-widest border-outline-variant/30 text-outline"
            >
              {opportunity.dating_apps.app_name}
            </Badge>
          )}
        </div>

        {/* Photo Carousel */}
        {photos.length > 0 && (
          <div className="relative rounded-xl overflow-hidden">
            <div
              className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
              style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
              onScroll={(e) => {
                const el = e.currentTarget;
                setActivePhoto(Math.round(el.scrollLeft / el.clientWidth));
              }}
            >
              {photos.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`${opportunity.candidate_name} photo ${i + 1}`}
                  className="w-full h-[300px] object-cover flex-shrink-0 snap-center"
                />
              ))}
            </div>
            {photos.length > 1 && (
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                {photos.map((_, i) => (
                  <div key={i} className={`h-1.5 rounded-full transition-all ${i === activePhoto ? "w-5 bg-gold" : "w-1.5 bg-white/40"}`} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* No photo placeholder */}
        {photos.length === 0 && (
          <div className="rounded-xl bg-surface-container h-[200px] flex flex-col items-center justify-center gap-2">
            <span className="material-symbols-outlined text-4xl text-outline/30" style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>person</span>
            <p className="text-on-surface-variant text-xs">Photos pending from matchmaker</p>
          </div>
        )}

        {/* Date Details Grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          {opportunity.day_determined ? (
            <>
              {opportunity.proposed_day && (
                <div>
                  <p className="text-on-surface-variant text-xs uppercase tracking-widest mb-1">
                    Day
                  </p>
                  <p className="text-on-surface">
                    {new Date(opportunity.proposed_day).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>
              )}
              {opportunity.proposed_time && (
                <div>
                  <p className="text-on-surface-variant text-xs uppercase tracking-widest mb-1">
                    Time
                  </p>
                  <p className="text-on-surface">{opportunity.proposed_time}</p>
                </div>
              )}
            </>
          ) : (
            <div className="col-span-2">
              <p className="text-gold text-xs uppercase tracking-widest">
                Day to be finalized
              </p>
            </div>
          )}

          {opportunity.venues?.venue_name && (
            <div>
              <p className="text-on-surface-variant text-xs uppercase tracking-widest mb-1">
                Venue
              </p>
              <p className="text-on-surface">{opportunity.venues.venue_name}</p>
            </div>
          )}

          {opportunity.phone_number && (
            <div>
              <p className="text-on-surface-variant text-xs uppercase tracking-widest mb-1">
                Phone
              </p>
              <p className="text-on-surface">{opportunity.phone_number}</p>
            </div>
          )}
        </div>

        {/* Matchmaker Notes */}
        {opportunity.memorable_detail && (
          <div className="bg-surface-container p-4 rounded-xl">
            <p className="text-on-surface-variant text-xs uppercase tracking-widest mb-2">
              Matchmaker Notes
            </p>
            <p className="text-on-surface text-sm leading-relaxed">
              {opportunity.memorable_detail}
            </p>
          </div>
        )}

        {/* Prewritten Text */}
        {opportunity.prewritten_text && (
          <div className="bg-surface-container p-4 rounded-xl">
            <p className="text-on-surface-variant text-xs uppercase tracking-widest mb-2">
              Suggested Opening
            </p>
            <p className="text-on-surface text-sm italic leading-relaxed">
              &ldquo;{opportunity.prewritten_text}&rdquo;
            </p>
          </div>
        )}

        {/* Approve / Decline */}
        {!declineOpen ? (
          <div className="space-y-3 pt-2">
            <Button
              onClick={() => handleDecision("approved")}
              disabled={loading}
              className="w-full gold-gradient text-on-gold font-semibold rounded-full h-12 text-base"
            >
              {loading ? "..." : "Approve"}
            </Button>
            <Button
              onClick={() => setDeclineOpen(true)}
              disabled={loading}
              variant="outline"
              className="w-full rounded-full h-12 border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-high"
            >
              Decline
            </Button>
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            <Textarea
              placeholder="Reason for declining (optional — helps your matchmaker refine targeting)"
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              className="bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-outline"
              rows={3}
            />
            <div className="flex gap-3">
              <Button
                onClick={() => handleDecision("declined")}
                disabled={loading}
                variant="outline"
                className="flex-1 rounded-full h-10 border-error-red/30 text-error-red hover:bg-error-container/10"
              >
                {loading ? "..." : "Confirm Decline"}
              </Button>
              <Button
                onClick={() => {
                  setDeclineOpen(false);
                  setDeclineReason("");
                }}
                variant="ghost"
                className="text-on-surface-variant text-sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Desktop Declined Card ────────────────────────────────────────────
function DesktopDeclinedCard({ opp, photoUrl }: { opp: any; photoUrl: string | null }) {
  const [expanded, setExpanded] = useState(false);
  const dateStr = opp.proposed_day ? new Date(opp.proposed_day + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : "Day TBD";

  return (
    <div className="bg-surface-container-low rounded-2xl overflow-hidden opacity-80">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center gap-4 p-5 text-left">
        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 grayscale">
          {photoUrl ? <img src={photoUrl} alt={opp.candidate_name} className="w-full h-full object-cover" /> : (
            <div className="w-full h-full bg-surface-container-high flex items-center justify-center">
              <span className="material-symbols-outlined text-on-surface-variant text-lg" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}>person</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-on-surface text-sm font-medium font-heading truncate">{opp.candidate_name}{opp.candidate_age ? `, ${opp.candidate_age}` : ""}</p>
          <p className="text-on-surface-variant text-xs">{dateStr}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full bg-error-red/15 text-error-red border border-error-red/30">Declined</span>
          <span className={`material-symbols-outlined text-on-surface-variant text-lg transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}>expand_more</span>
        </div>
      </button>
      <div className={`grid transition-all duration-300 ease-in-out ${expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <div className="px-5 pb-5 border-t border-outline-variant/10 space-y-4">
            {photoUrl && <div className="mt-4 rounded-xl overflow-hidden"><img src={photoUrl} alt={opp.candidate_name} className="w-full h-[280px] object-cover grayscale" /></div>}
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              {opp.candidate_profession && <div><p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-0.5">Profession</p><p className="text-on-surface text-sm font-medium">{opp.candidate_profession}</p></div>}
              {opp.candidate_location && <div><p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-0.5">Location</p><p className="text-on-surface text-sm font-medium">{opp.candidate_location}</p></div>}
              {opp.candidate_education && <div><p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-0.5">Education</p><p className="text-on-surface text-sm font-medium">{opp.candidate_education}</p></div>}
            </div>
            {opp.memorable_detail && <div><p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-1">About Her</p><p className="text-on-surface text-sm leading-relaxed">{opp.memorable_detail}</p></div>}
            {opp.decline_reason && (
              <div className="bg-error-red/5 border border-error-red/15 rounded-xl p-3">
                <p className="text-error-red text-[10px] uppercase tracking-widest mb-1">Decline Reason</p>
                <p className="text-on-surface text-sm leading-relaxed">{opp.decline_reason}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Desktop Approved Card (expandable, matches mobile) ──────────────
function DesktopApprovedCard({ opp, photoUrl, dateInPast, hasTexted, isUrgent, hoursSinceShared, clientId }: {
  opp: any; photoUrl: string | null; dateInPast: boolean; hasTexted: boolean; isUrgent: boolean; hoursSinceShared: number | null; clientId: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [texted, setTexted] = useState(hasTexted);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editDay, setEditDay] = useState(opp.proposed_day ?? "");
  const [editTime, setEditTime] = useState(opp.proposed_time?.slice(0, 5) ?? "");
  const [editVenue, setEditVenue] = useState("");
  const supabase = createClient();

  const dateStr = opp.proposed_day ? new Date(opp.proposed_day + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : "Day TBD";

  const handleMarkTexted = async () => { setTexted(true); await supabase.from("date_opportunities").update({ client_texted_at: new Date().toISOString() }).eq("id", opp.id); };
  const handleSaveEdit = async () => {
    setSaving(true);
    const updates: any = {};
    if (editDay) updates.proposed_day = editDay;
    if (editTime) updates.proposed_time = editTime;
    if (editVenue) updates.notes = (opp.notes ? opp.notes + "\n" : "") + `Client venue suggestion: ${editVenue}`;
    await supabase.from("date_opportunities").update(updates).eq("id", opp.id);
    setSaving(false); setEditing(false);
  };

  return (
    <div className="bg-surface-container-low rounded-2xl overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center gap-4 p-5 text-left hover:bg-surface-container-low/80 transition-colors">
        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-transparent hover:ring-gold/30 transition-all">
          {photoUrl ? <img src={photoUrl} alt={opp.candidate_name} className="w-full h-full object-cover" /> : (
            <div className="w-full h-full bg-gold/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-gold text-lg" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}>person</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-on-surface text-sm font-medium font-heading truncate">{opp.candidate_name}{opp.candidate_age ? `, ${opp.candidate_age}` : ""}</p>
          <p className="text-on-surface-variant text-xs">{dateStr}{opp.venues?.venue_name ? ` · ${opp.venues.venue_name}` : ""}</p>
          {opp.candidate_profession && <p className="text-on-surface-variant text-xs truncate">{opp.candidate_profession}</p>}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {!dateInPast && opp.phone_number && !texted && (
            <span className="text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full bg-error-red/15 text-error-red border border-error-red/30">Text Now</span>
          )}
          {!dateInPast && texted && (
            <span className="text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full bg-gold/15 text-gold border border-gold/30">Texted</span>
          )}
          {!dateInPast && !opp.phone_number && (
            <span className="text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full bg-gold/15 text-gold border border-gold/30">Approved</span>
          )}
          {dateInPast && (
            <span className="text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full bg-gold/15 text-gold border border-gold/30">Feedback</span>
          )}
          <span className={`material-symbols-outlined text-on-surface-variant text-lg transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}>expand_more</span>
        </div>
      </button>
      <div className={`grid transition-all duration-300 ease-in-out ${expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <div className="px-5 pb-5 border-t border-outline-variant/10 space-y-4">
            {(() => { const photos: string[] = []; if (opp.candidate_photo_url) photos.push(opp.candidate_photo_url); if (Array.isArray(opp.candidate_photos)) opp.candidate_photos.forEach((p: string) => { if (p && !photos.includes(p)) photos.push(p); }); return photos.length > 0 ? <div className="mt-4 rounded-xl overflow-hidden"><img src={photos[0]} alt={opp.candidate_name} className="w-full h-[280px] object-cover" /></div> : null; })()}
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              {opp.candidate_profession && <div><p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-0.5">Profession</p><p className="text-on-surface text-sm font-medium">{opp.candidate_profession}</p></div>}
              {opp.candidate_location && <div><p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-0.5">Location</p><p className="text-on-surface text-sm font-medium">{opp.candidate_location}</p></div>}
              {opp.candidate_education && <div><p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-0.5">Education</p><p className="text-on-surface text-sm font-medium">{opp.candidate_education}</p></div>}
              {opp.venues?.venue_name && <div><p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-0.5">Venue</p><p className="text-on-surface text-sm font-medium">{opp.venues.venue_name}</p></div>}
            </div>
            {opp.memorable_detail && <div><p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-1">About Her</p><p className="text-on-surface text-sm leading-relaxed">{opp.memorable_detail}</p></div>}
            {/* Text Now / Texted / Feedback */}
            {!dateInPast && opp.phone_number && !texted && (
              <div className={`rounded-xl p-4 flex items-center justify-between ${isUrgent ? "bg-error-red/10 border border-error-red/20" : "bg-surface-container"}`}>
                <div>
                  <p className={`text-sm font-semibold ${isUrgent ? "text-error-red" : "text-on-surface"}`}>{isUrgent ? "Text her now — don't lose momentum" : "Text her to confirm"}</p>
                  <p className="text-on-surface-variant text-xs mt-0.5">Best between 10am – 9pm{hoursSinceShared !== null ? ` · ${hoursSinceShared}h ago` : ""}</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); handleMarkTexted(); }} className={`font-semibold rounded-full px-5 py-2.5 text-sm ${isUrgent ? "bg-error-red text-white" : "gold-gradient text-on-gold"}`}>Text Now</button>
              </div>
            )}
            {!dateInPast && texted && <div className="bg-surface-container rounded-xl p-3 flex items-center gap-2"><span className="material-symbols-outlined text-gold/40 text-sm" style={{ fontVariationSettings: "'FILL' 1, 'wght' 300" }}>check_circle</span><p className="text-on-surface-variant text-sm">Texted — good luck!</p></div>}
            {dateInPast && <PostDateFeedback opportunity={opp} clientId={clientId} />}
            {/* Edit */}
            {!editing ? (
              <button onClick={(e) => { e.stopPropagation(); setEditing(true); }} className="flex items-center gap-1.5 text-on-surface-variant text-xs hover:text-gold transition-colors">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>edit_calendar</span>
                Change day, time, or venue (any changes you make)
              </button>
            ) : (
              <div className="bg-surface-container rounded-xl p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-gold text-[10px] uppercase tracking-widest mb-1">Day</p><input type="date" value={editDay} onChange={(e) => setEditDay(e.target.value)} className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-3 py-2 text-on-surface text-sm focus:border-gold outline-none [color-scheme:dark]" /></div>
                  <div><p className="text-gold text-[10px] uppercase tracking-widest mb-1">Time</p><input type="time" value={editTime} onChange={(e) => setEditTime(e.target.value)} className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-3 py-2 text-on-surface text-sm focus:border-gold outline-none [color-scheme:dark]" /></div>
                </div>
                <div><p className="text-gold text-[10px] uppercase tracking-widest mb-1">Suggest a Venue</p><input type="text" value={editVenue} onChange={(e) => setEditVenue(e.target.value)} placeholder="e.g. The Violet Hour..." className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-3 py-2 text-on-surface text-sm placeholder:text-outline focus:border-gold outline-none" /></div>
                <div className="flex gap-2">
                  <button onClick={() => setEditing(false)} className="flex-1 border border-outline-variant/20 text-on-surface-variant rounded-full h-10 text-sm">Cancel</button>
                  <button onClick={handleSaveEdit} disabled={saving} className="flex-1 gold-gradient text-on-gold font-semibold rounded-full h-10 text-sm disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

