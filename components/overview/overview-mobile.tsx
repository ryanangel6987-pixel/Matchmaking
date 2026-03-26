"use client";

import { useState, useRef, useCallback } from "react";
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
  declinedDates: any[];
  kpiSummary: any;
  alerts: any[];
  actions: any[];
  candidates: any[];
}

// ── Mobile Approved Card (matches Recently Closed style) ────────────
function MobileApprovedCard({
  opp, photoUrl, dateInPast, hasTexted, isUrgent, hoursSinceShared, clientId,
}: {
  opp: any; photoUrl: string | null; dateInPast: boolean; hasTexted: boolean;
  isUrgent: boolean; hoursSinceShared: number | null; clientId: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [texted, setTexted] = useState(hasTexted);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editDay, setEditDay] = useState(opp.proposed_day ?? "");
  const [editTime, setEditTime] = useState(opp.proposed_time?.slice(0, 5) ?? "");
  const [editVenue, setEditVenue] = useState("");
  const supabase = createClient();
  const router = useRouter();

  const handleMarkTexted = async () => {
    setTexted(true);
    await supabase.from("date_opportunities").update({ client_texted_at: new Date().toISOString() }).eq("id", opp.id);
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    const updates: any = {};
    if (editDay) updates.proposed_day = editDay;
    if (editTime) updates.proposed_time = editTime;
    if (editVenue) updates.notes = (opp.notes ? opp.notes + "\n" : "") + `Client venue suggestion: ${editVenue}`;
    await supabase.from("date_opportunities").update(updates).eq("id", opp.id);
    setSaving(false);
    setEditing(false);
  };

  const dateStr = opp.proposed_day
    ? new Date(opp.proposed_day + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
    : "Day TBD";

  return (
    <div className="bg-surface-container-low rounded-2xl overflow-hidden">
      {/* Collapsed row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left min-h-[64px]"
      >
        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-transparent">
          {photoUrl ? (
            <img src={photoUrl} alt={opp.candidate_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gold/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-gold text-lg" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}>person</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-on-surface text-[15px] font-medium font-heading truncate">
            {opp.candidate_name}{opp.candidate_age ? `, ${opp.candidate_age}` : ""}
          </p>
          <p className="text-on-surface-variant text-[12px]">{dateStr}{opp.venues?.venue_name ? ` · ${opp.venues.venue_name}` : ""}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Action badge: Text Now (red) or Texted (gold) or Feedback */}
          {!dateInPast && opp.phone_number && !texted && (
            <span className="text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full bg-error-red/15 text-error-red border border-error-red/30">
              Text Now
            </span>
          )}
          {!dateInPast && texted && (
            <span className="text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full bg-gold/15 text-gold border border-gold/30">
              Texted
            </span>
          )}
          {!dateInPast && !opp.phone_number && (
            <span className="text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full bg-gold/15 text-gold border border-gold/30">
              Approved
            </span>
          )}
          {dateInPast && (
            <span className="text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full bg-gold/15 text-gold border border-gold/30">
              Feedback
            </span>
          )}
          <span className={`material-symbols-outlined text-on-surface-variant text-lg transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}>
            expand_more
          </span>
        </div>
      </button>

      {/* Expanded details */}
      <div className={`grid transition-all duration-300 ease-in-out ${expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pt-0 border-t border-outline-variant/10 space-y-4">
            {/* Photo gallery */}
            {(() => {
              const photos: string[] = [];
              if (opp.candidate_photo_url) photos.push(opp.candidate_photo_url);
              if (Array.isArray(opp.candidate_photos)) opp.candidate_photos.forEach((p: string) => { if (p && !photos.includes(p)) photos.push(p); });
              return photos.length > 0 ? (
                <div className="mt-3 rounded-xl overflow-hidden">
                  <img src={photos[0]} alt={opp.candidate_name} className="w-full h-[240px] object-cover" />
                </div>
              ) : null;
            })()}

            {/* Details */}
            <div className="grid grid-cols-2 gap-3">
              {opp.candidate_profession && <div><p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-0.5">Profession</p><p className="text-on-surface text-[14px] font-medium">{opp.candidate_profession}</p></div>}
              {opp.candidate_location && <div><p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-0.5">Location</p><p className="text-on-surface text-[14px] font-medium">{opp.candidate_location}</p></div>}
              {opp.candidate_education && <div><p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-0.5">Education</p><p className="text-on-surface text-[14px] font-medium">{opp.candidate_education}</p></div>}
              {opp.venues?.venue_name && <div><p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-0.5">Venue</p><p className="text-on-surface text-[14px] font-medium">{opp.venues.venue_name}</p></div>}
            </div>

            {opp.memorable_detail && (
              <div>
                <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-1">About Her</p>
                <p className="text-on-surface text-[14px] leading-relaxed">{opp.memorable_detail}</p>
              </div>
            )}

            {/* Text Now / Texted / Feedback */}
            {!dateInPast && opp.phone_number && !texted && (
              <div className={`rounded-xl p-4 ${isUrgent ? "bg-error-red/10 border border-error-red/20" : "bg-surface-container"}`}>
                <p className={`text-[14px] font-semibold ${isUrgent ? "text-error-red" : "text-on-surface"}`}>
                  {isUrgent ? "Text her now — don't lose momentum" : "Text her to confirm"}
                </p>
                <p className="text-on-surface-variant text-[12px] mt-0.5">Best between 10am – 9pm{hoursSinceShared !== null ? ` · ${hoursSinceShared}h ago` : ""}</p>
                <button onClick={(e) => { e.stopPropagation(); handleMarkTexted(); }} className={`w-full mt-3 font-semibold rounded-full h-12 text-[16px] ${isUrgent ? "bg-error-red text-white" : "gold-gradient text-on-gold"}`}>
                  Text Now
                </button>
              </div>
            )}

            {!dateInPast && texted && (
              <div className="bg-surface-container rounded-xl p-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-gold/40 text-sm" style={{ fontVariationSettings: "'FILL' 1, 'wght' 300" }}>check_circle</span>
                <p className="text-on-surface-variant text-[14px]">Texted — good luck!</p>
              </div>
            )}

            {dateInPast && (
              <PostDateFeedback opportunity={opp} clientId={clientId} />
            )}

            {/* Edit day/time/venue */}
            {!editing ? (
              <button onClick={(e) => { e.stopPropagation(); setEditing(true); }} className="flex items-center gap-1.5 text-on-surface-variant text-[13px]">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>edit_calendar</span>
                Change day, time, or venue (any changes you make)
              </button>
            ) : (
              <div className="bg-surface-container rounded-xl p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-gold text-[10px] uppercase tracking-widest mb-1">Day</p>
                    <input type="date" value={editDay} onChange={(e) => setEditDay(e.target.value)} className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-3 py-2.5 text-on-surface text-[14px] focus:border-gold outline-none [color-scheme:dark]" />
                  </div>
                  <div>
                    <p className="text-gold text-[10px] uppercase tracking-widest mb-1">Time</p>
                    <input type="time" value={editTime} onChange={(e) => setEditTime(e.target.value)} className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-3 py-2.5 text-on-surface text-[14px] focus:border-gold outline-none [color-scheme:dark]" />
                  </div>
                </div>
                <div>
                  <p className="text-gold text-[10px] uppercase tracking-widest mb-1">Suggest a Venue</p>
                  <input type="text" value={editVenue} onChange={(e) => setEditVenue(e.target.value)} placeholder="e.g. The Violet Hour..." className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-3 py-2.5 text-on-surface text-[14px] placeholder:text-outline focus:border-gold outline-none" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditing(false)} className="flex-1 border border-outline-variant/20 text-on-surface-variant rounded-full h-12 text-[14px]">Cancel</button>
                  <button onClick={handleSaveEdit} disabled={saving} className="flex-1 gold-gradient text-on-gold font-semibold rounded-full h-12 text-[14px] disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Mobile Declined Card (expandable, no texting) ───────────────────
function MobileDeclinedCard({ opp, photoUrl }: { opp: any; photoUrl: string | null }) {
  const [expanded, setExpanded] = useState(false);

  const dateStr = opp.proposed_day
    ? new Date(opp.proposed_day + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
    : "Day TBD";

  return (
    <div className="bg-surface-container-low rounded-2xl overflow-hidden opacity-80">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left min-h-[64px]"
      >
        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 grayscale">
          {photoUrl ? (
            <img src={photoUrl} alt={opp.candidate_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-surface-container-high flex items-center justify-center">
              <span className="material-symbols-outlined text-on-surface-variant text-lg" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}>person</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-on-surface text-[15px] font-medium font-heading truncate">
            {opp.candidate_name}{opp.candidate_age ? `, ${opp.candidate_age}` : ""}
          </p>
          <p className="text-on-surface-variant text-[12px]">{dateStr}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full bg-error-red/15 text-error-red border border-error-red/30">
            Declined
          </span>
          <span className={`material-symbols-outlined text-on-surface-variant text-lg transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}>
            expand_more
          </span>
        </div>
      </button>

      <div className={`grid transition-all duration-300 ease-in-out ${expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pt-0 border-t border-outline-variant/10 space-y-4">
            {photoUrl && (
              <div className="mt-3 rounded-xl overflow-hidden">
                <img src={photoUrl} alt={opp.candidate_name} className="w-full h-[240px] object-cover grayscale" />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {opp.candidate_profession && <div><p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-0.5">Profession</p><p className="text-on-surface text-[14px] font-medium">{opp.candidate_profession}</p></div>}
              {opp.candidate_location && <div><p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-0.5">Location</p><p className="text-on-surface text-[14px] font-medium">{opp.candidate_location}</p></div>}
              {opp.candidate_education && <div><p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-0.5">Education</p><p className="text-on-surface text-[14px] font-medium">{opp.candidate_education}</p></div>}
            </div>

            {opp.memorable_detail && (
              <div>
                <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-1">About Her</p>
                <p className="text-on-surface text-[14px] leading-relaxed">{opp.memorable_detail}</p>
              </div>
            )}

            {opp.decline_reason && (
              <div className="bg-error-red/5 border border-error-red/15 rounded-xl p-3">
                <p className="text-error-red text-[10px] uppercase tracking-widest mb-1">Decline Reason</p>
                <p className="text-on-surface text-[14px] leading-relaxed">{opp.decline_reason}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Collapsible Section ──────────────────────────────────────────────
function CollapsibleSection({
  title,
  defaultOpen = true,
  count,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  count?: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="space-y-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full min-h-[44px] py-1"
      >
        <div className="flex items-center gap-2">
          <h2 className="text-on-surface-variant text-[13px] uppercase tracking-widest">
            {title}
          </h2>
          {count !== undefined && (
            <span className="text-on-surface-variant text-[13px]">
              ({count})
            </span>
          )}
        </div>
        <span
          className="material-symbols-outlined text-on-surface-variant text-[20px] transition-transform duration-300"
          style={{
            transform: open ? "rotate(0deg)" : "rotate(-90deg)",
            fontVariationSettings: "'FILL' 0, 'wght' 300",
          }}
        >
          expand_more
        </span>
      </button>
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: open ? "2000px" : "0px",
          opacity: open ? 1 : 0,
        }}
      >
        {children}
      </div>
    </section>
  );
}

// ── Mobile Pending Date Card ─────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function MobilePendingDateCard({
  opportunity,
  clientId,
}: {
  opportunity: any;
  clientId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [declineMode, setDeclineMode] = useState(false);
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
    setSheetOpen(false);
    setDeclineMode(false);
    router.refresh();
  };

  return (
    <>
      {/* Card */}
      <div
        className="flex-shrink-0 w-full snap-center"
        style={{ scrollSnapAlign: "center" }}
      >
        <div className="p-px rounded-2xl bg-gradient-to-br from-gold to-gold-dark mx-0">
          <div className="bg-surface-container-lowest rounded-[0.95rem] p-4 space-y-4">
            {/* Candidate header */}
            <div className="flex justify-between items-start">
              <div>
                <p className="font-heading text-[22px] font-bold text-gold leading-tight">
                  {opportunity.candidate_name}
                </p>
                {opportunity.candidate_age && (
                  <p className="text-on-surface-variant text-[13px] mt-0.5">
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
              <div className="relative rounded-xl overflow-hidden -mx-1">
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
                      className="w-full h-[280px] object-cover flex-shrink-0 snap-center"
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

            {photos.length === 0 && (
              <div className="rounded-xl bg-surface-container h-[160px] flex flex-col items-center justify-center gap-2 -mx-1">
                <span className="material-symbols-outlined text-4xl text-outline/30" style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>person</span>
                <p className="text-on-surface-variant text-[12px]">Photos pending from matchmaker</p>
              </div>
            )}

            {/* Date details — vertical stack */}
            <div className="space-y-3 text-[16px]">
              {opportunity.day_determined ? (
                <>
                  {opportunity.proposed_day && (
                    <div>
                      <p className="text-on-surface-variant text-[13px] uppercase tracking-widest mb-0.5">
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
                      <p className="text-on-surface-variant text-[13px] uppercase tracking-widest mb-0.5">
                        Time
                      </p>
                      <p className="text-on-surface">
                        {opportunity.proposed_time}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gold text-[13px] uppercase tracking-widest">
                  Day to be finalized
                </p>
              )}

              {opportunity.venues?.venue_name && (
                <div>
                  <p className="text-on-surface-variant text-[13px] uppercase tracking-widest mb-0.5">
                    Venue
                  </p>
                  <p className="text-on-surface">
                    {opportunity.venues.venue_name}
                  </p>
                </div>
              )}

              {opportunity.phone_number && (
                <div>
                  <p className="text-on-surface-variant text-[13px] uppercase tracking-widest mb-0.5">
                    Phone
                  </p>
                  <p className="text-on-surface">{opportunity.phone_number}</p>
                </div>
              )}
            </div>

            {/* Matchmaker notes */}
            {opportunity.memorable_detail && (
              <div className="bg-surface-container p-4 rounded-xl">
                <p className="text-on-surface-variant text-[13px] uppercase tracking-widest mb-2">
                  Matchmaker Notes
                </p>
                <p className="text-on-surface text-[16px] leading-relaxed">
                  {opportunity.memorable_detail}
                </p>
              </div>
            )}

            {/* Suggested opening */}
            {opportunity.prewritten_text && (
              <div className="bg-surface-container p-4 rounded-xl">
                <p className="text-on-surface-variant text-[13px] uppercase tracking-widest mb-2">
                  Suggested Opening
                </p>
                <p className="text-on-surface text-[16px] italic leading-relaxed">
                  &ldquo;{opportunity.prewritten_text}&rdquo;
                </p>
              </div>
            )}

            {/* Respond button — opens bottom sheet */}
            <Button
              onClick={() => setSheetOpen(true)}
              className="w-full gold-gradient text-on-gold font-semibold rounded-2xl h-[48px] text-[16px]"
            >
              Respond
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom sheet overlay */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              if (!loading) {
                setSheetOpen(false);
                setDeclineMode(false);
              }
            }}
          />
          {/* Sheet */}
          <div className="relative w-full bg-surface-container-low rounded-t-3xl p-6 pb-10 space-y-5 animate-in slide-in-from-bottom duration-300">
            <div className="w-10 h-1 bg-outline-variant/40 rounded-full mx-auto" />
            <p className="font-heading text-[22px] font-bold text-gold text-center">
              {opportunity.candidate_name}
            </p>

            {!declineMode ? (
              <div className="space-y-3">
                <Button
                  onClick={() => handleDecision("approved")}
                  disabled={loading}
                  className="w-full gold-gradient text-on-gold font-semibold rounded-2xl h-[48px] text-[16px]"
                >
                  {loading ? "..." : "Approve Date"}
                </Button>
                <Button
                  onClick={() => setDeclineMode(true)}
                  disabled={loading}
                  variant="outline"
                  className="w-full rounded-2xl h-[48px] text-[16px] border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-high"
                >
                  Decline
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Textarea
                  placeholder="Reason for declining (optional — helps your matchmaker refine targeting)"
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  className="bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-outline text-[16px] min-h-[80px]"
                  rows={3}
                />
                <Button
                  onClick={() => handleDecision("declined")}
                  disabled={loading}
                  variant="outline"
                  className="w-full rounded-2xl h-[48px] text-[16px] border-error-red/30 text-error-red hover:bg-error-container/10"
                >
                  {loading ? "..." : "Confirm Decline"}
                </Button>
                <Button
                  onClick={() => setDeclineMode(false)}
                  variant="ghost"
                  className="w-full h-[44px] text-on-surface-variant text-[16px]"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ── Main Mobile Component ────────────────────────────────────────────
export function OverviewMobile({
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
  const [showAlerts, setShowAlerts] = useState(false);
  // Scroll indicator for pending opportunities
  const [activeOpp, setActiveOpp] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleOppScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    setActiveOpp(idx);
  }, []);

  return (
    <div className="pb-24">
      {/* 1. Header with notification bell */}
      <div className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md pt-4 pb-3 px-1 -mx-1">
        <div className="flex items-start justify-between">
          <div>
            <div className="h-1 w-12 bg-gradient-to-r from-gold to-gold-dark rounded-full mb-3" />
            <h1 className="font-heading text-[22px] font-bold text-gold tracking-tight">
              Dates
            </h1>
            <p className="text-on-surface-variant text-[13px] mt-0.5">
              {clientName}
            </p>
          </div>
          {alerts.length > 0 && (
            <button
              onClick={() => setShowAlerts((v) => !v)}
              className="relative p-2 mt-1"
            >
              <span className="material-symbols-outlined text-gold text-[30px]" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}>notifications</span>
              <span className="absolute top-0 right-0 w-4 h-4 bg-gold rounded-full flex items-center justify-center text-[9px] text-black font-bold">{alerts.length}</span>
            </button>
          )}
        </div>
        <div className="h-px mt-3 bg-gradient-to-r from-gold/40 to-transparent" />

        {/* Alert dropdown */}
        {showAlerts && alerts.length > 0 && (
          <div className="mt-3 space-y-2">
            {alerts.map((alert) => (
              <div key={alert.id} className="bg-surface-container-low p-4 rounded-2xl flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  {alert.title && <p className="text-on-surface text-[14px] font-medium">{alert.title}</p>}
                  {alert.message && <p className="text-on-surface-variant text-[13px] mt-0.5">{alert.message}</p>}
                  {!alert.title && !alert.message && <p className="text-on-surface-variant text-[13px]">New notification</p>}
                </div>
                <AlertDismissButton alertId={alert.id} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-6 mt-5">
        {/* 2. Pending Dates */}
        <section className="space-y-3">
          <h2 className="text-on-surface-variant text-[13px] uppercase tracking-widest">
            Pending Your Approval
          </h2>

          {pendingOpportunities.length > 0 ? (
            <>
              {pendingOpportunities.length === 1 ? (
                <MobilePendingDateCard
                  opportunity={pendingOpportunities[0]}
                  clientId={clientId}
                />
              ) : (
                <>
                  <div
                    ref={scrollContainerRef}
                    onScroll={handleOppScroll}
                    className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2 -mx-1 px-1"
                    style={{
                      scrollSnapType: "x mandatory",
                      WebkitOverflowScrolling: "touch",
                    }}
                  >
                    {pendingOpportunities.map((opp) => (
                      <div key={opp.id} className="w-full flex-shrink-0">
                        <MobilePendingDateCard
                          opportunity={opp}
                          clientId={clientId}
                        />
                      </div>
                    ))}
                  </div>
                  {/* Dot indicators */}
                  <div className="flex justify-center gap-2 pt-2">
                    {pendingOpportunities.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          i === activeOpp
                            ? "w-6 bg-gold"
                            : "w-1.5 bg-outline-variant/40"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="bg-surface-container-low p-8 rounded-2xl text-center space-y-3">
              <span
                className="material-symbols-outlined text-gold text-3xl"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}
              >
                event_available
              </span>
              <p className="text-on-surface text-[16px] font-heading italic leading-relaxed">
                No dates pending — your matchmaker is working on new
                opportunities
              </p>
            </div>
          )}
        </section>

        {/* 3. Recently Approved (expandable cards like Recently Closed) */}
        {recentApproved.length > 0 && (
          <CollapsibleSection title="Recently Approved" defaultOpen={true}>
            <div className="space-y-3">
              {recentApproved.map((opp) => {
                const photoUrl = opp.candidate_photo_url || (opp.candidate_photos && opp.candidate_photos[0]);
                const dateInPast = opp.proposed_day ? new Date(opp.proposed_day + "T23:59:59") < new Date() : false;
                const hasTexted = !!opp.client_texted_at;
                const phoneSharedAt = opp.phone_shared_at ? new Date(opp.phone_shared_at) : null;
                const hoursSinceShared = phoneSharedAt ? Math.floor((Date.now() - phoneSharedAt.getTime()) / (1000 * 60 * 60)) : null;
                const isUrgent = hoursSinceShared !== null && hoursSinceShared >= 5;

                return (
                  <MobileApprovedCard
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
            <p className="text-on-surface-variant text-[13px] italic mt-3 pl-1">
              Approved dates are automatically added to your Taste Calibration
              preferences
            </p>
          </CollapsibleSection>
        )}

        {/* 4. Declined Dates (expandable cards) */}
        {declinedDates.length > 0 && (
          <CollapsibleSection
            title="Declined Dates"
            defaultOpen={false}
            count={declinedDates.length}
          >
            <div className="space-y-3">
              {declinedDates.map((opp) => {
                const photoUrl = opp.candidate_photo_url || (opp.candidate_photos && opp.candidate_photos[0]);
                return <MobileDeclinedCard key={opp.id} opp={opp} photoUrl={photoUrl} />;
              })}
              <p className="text-on-surface-variant text-[13px] italic pl-1">
                This feedback helps your matchmaker refine targeting
              </p>
            </div>
          </CollapsibleSection>
        )}


        {/* 6. Concierge Insight */}
        <section className="bg-surface-container-low p-5 rounded-2xl shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-gold opacity-50" />
          <h2 className="text-on-surface-variant text-[13px] uppercase tracking-widest mb-3">
            Concierge Insight
          </h2>
          <p className="text-on-surface text-[16px] leading-relaxed font-heading italic pl-3">
            {pendingOpportunities.length > 0
              ? `You have ${pendingOpportunities.length} date ${
                  pendingOpportunities.length === 1
                    ? "opportunity"
                    : "opportunities"
                } awaiting your approval. Review and respond to keep momentum.`
              : recentApproved.length > 0
                ? "Your recent approvals are being finalized. Your matchmaker will update you with confirmation details."
                : "Your matchmaker is actively working on new opportunities. Check back soon for updates."}
          </p>
        </section>
      </div>
    </div>
  );
}
