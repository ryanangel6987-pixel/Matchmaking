"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface UpcomingEngagementsProps {
  opportunities: any[];
}

export function UpcomingEngagements({ opportunities }: UpcomingEngagementsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (opportunities.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-on-surface-variant text-xs uppercase tracking-widest flex items-center gap-2">
        <span
          className="material-symbols-outlined text-gold text-base"
          style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}
        >
          event
        </span>
        Upcoming Engagements
      </h2>
      <div className="space-y-3">
        {opportunities.map((opp) => {
          const hasDay = !!opp.proposed_day;
          const hasTime = !!opp.proposed_time;
          const photoUrl = opp.candidate_photo_url || (opp.candidate_photos && opp.candidate_photos[0]);
          const allPhotos = buildPhotoList(opp);
          const expanded = expandedId === opp.id;
          const heightDisplay = opp.candidate_height_inches
            ? `${Math.floor(opp.candidate_height_inches / 12)}'${opp.candidate_height_inches % 12}"`
            : null;

          return (
            <div key={opp.id} className="bg-surface-container-low rounded-2xl shadow-xl overflow-hidden">
              {/* Collapsed row — original layout */}
              <button
                onClick={() => setExpandedId(expanded ? null : opp.id)}
                className="w-full p-5 flex items-center justify-between group relative text-left hover:bg-surface-container-low/80 transition-colors"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-gold opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="flex items-center gap-4 min-w-0 flex-1">
                  {/* Left: Date info */}
                  <div className="flex flex-col items-center flex-shrink-0 w-14">
                    {hasDay ? (
                      <>
                        <p className="text-gold text-lg font-heading font-bold leading-tight">
                          {new Date(opp.proposed_day + "T12:00:00").toLocaleDateString("en-US", { weekday: "short" })}
                        </p>
                        <p className="text-on-surface-variant text-xs leading-tight">
                          {new Date(opp.proposed_day + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                      </>
                    ) : (
                      <p className="text-outline text-xs text-center">Day TBD</p>
                    )}
                    {hasTime && (
                      <p className="text-on-surface-variant text-[10px] mt-0.5">{formatTime(opp.proposed_time)}</p>
                    )}
                  </div>

                  {/* Middle: Candidate info */}
                  <div className="min-w-0 flex-1">
                    <p className="text-on-surface text-sm font-medium font-heading truncate">
                      {opp.candidate_name?.replace(/\.$/, "")}{opp.candidate_age ? `, ${opp.candidate_age}` : ""}
                    </p>
                    {opp.candidate_profession && (
                      <p className="text-on-surface-variant text-xs mt-0.5 truncate">{opp.candidate_profession}</p>
                    )}
                    {opp.candidate_location && (
                      <p className="text-on-surface-variant text-xs mt-0.5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>location_on</span>
                        {opp.candidate_location}
                      </p>
                    )}
                    {opp.venues?.venue_name && (
                      <p className="text-gold text-xs mt-0.5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>restaurant</span>
                        {opp.venues.venue_name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Text status + Photo + chevron */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  {/* Texted indicator */}
                  {opp.phone_number && (
                    opp.client_texted_at ? (
                      <span className="material-symbols-outlined text-gold/40 text-lg" style={{ fontVariationSettings: "'FILL' 1, 'wght' 300" }} title="Texted">check_circle</span>
                    ) : (() => {
                      const sharedAt = opp.phone_shared_at ? new Date(opp.phone_shared_at) : null;
                      const hours = sharedAt ? Math.floor((Date.now() - sharedAt.getTime()) / (1000 * 60 * 60)) : null;
                      const urgent = hours !== null && hours >= 5;
                      return (
                        <span className={`material-symbols-outlined text-lg ${urgent ? "text-error-red/70 animate-pulse" : "text-on-surface-variant/40"}`} style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }} title={urgent ? "Text her now!" : "Text pending"}>
                          {urgent ? "sms_failed" : "sms"}
                        </span>
                      );
                    })()
                  )}
                  <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-transparent group-hover:ring-gold/30 transition-all">
                    {photoUrl ? (
                      <img src={photoUrl} alt={opp.candidate_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gold/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-gold text-lg" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}>person</span>
                      </div>
                    )}
                  </div>
                  <span className={`material-symbols-outlined text-on-surface-variant text-lg transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}>
                    expand_more
                  </span>
                </div>
              </button>

              {/* Expanded details */}
              <div className={`grid transition-all duration-300 ease-in-out ${expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                <div className="overflow-hidden">
                  <ExpandedDetails opp={opp} allPhotos={allPhotos} heightDisplay={heightDisplay} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ExpandedDetails({ opp, allPhotos, heightDisplay }: { opp: any; allPhotos: string[]; heightDisplay: string | null }) {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [texted, setTexted] = useState(!!opp.client_texted_at);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editDay, setEditDay] = useState(opp.proposed_day ?? "");
  const [editTime, setEditTime] = useState(opp.proposed_time?.slice(0, 5) ?? "");
  const [editVenue, setEditVenue] = useState("");
  const supabase = createClient();

  const phoneSharedAt = opp.phone_shared_at ? new Date(opp.phone_shared_at) : null;
  const hoursSinceShared = phoneSharedAt ? Math.floor((Date.now() - phoneSharedAt.getTime()) / (1000 * 60 * 60)) : null;
  const isUrgent = hoursSinceShared !== null && hoursSinceShared >= 5;

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

  return (
    <div className="px-5 pb-5 pt-0 border-t border-outline-variant/10">
      {/* Photo gallery */}
      {allPhotos.length > 0 && (
        <div className="mt-4 relative rounded-xl overflow-hidden">
          <div
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
            style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
            onScroll={(e) => {
              const el = e.currentTarget;
              setActivePhotoIndex(Math.round(el.scrollLeft / el.clientWidth));
            }}
          >
            {allPhotos.map((url, i) => (
              <img key={i} src={url} alt={`${opp.candidate_name} photo ${i + 1}`} className="w-full h-[280px] object-cover flex-shrink-0 snap-center" />
            ))}
          </div>
          {allPhotos.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
              {allPhotos.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all ${i === activePhotoIndex ? "w-5 bg-gold" : "w-1.5 bg-white/40"}`} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Details grid */}
      <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3">
        {opp.candidate_profession && <DetailField label="Profession" value={opp.candidate_profession} />}
        {opp.candidate_location && <DetailField label="Location" value={opp.candidate_location} />}
        {opp.candidate_education && <DetailField label="Education" value={opp.candidate_education} />}
        {heightDisplay && <DetailField label="Height" value={heightDisplay} />}
        {opp.candidate_ethnicity && <DetailField label="Ethnicity" value={opp.candidate_ethnicity} />}
        {opp.venues?.venue_name && <DetailField label="Venue" value={opp.venues.venue_name} />}
        {opp.candidate_has_kids != null && <DetailField label="Has Kids" value={opp.candidate_has_kids === "yes" ? "Yes" : "No"} />}
      </div>

      {opp.memorable_detail && (
        <div className="mt-4">
          <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-1">About Her</p>
          <p className="text-on-surface text-sm leading-relaxed">{opp.memorable_detail}</p>
        </div>
      )}

      {opp.notes && (
        <div className="mt-3">
          <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-1">Matchmaker Notes</p>
          <p className="text-on-surface text-sm leading-relaxed">{opp.notes}</p>
        </div>
      )}

      {opp.prewritten_text && (
        <div className="mt-3 bg-surface-container p-3 rounded-xl">
          <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-1">Suggested Opening</p>
          <p className="text-on-surface text-sm italic leading-relaxed">&ldquo;{opp.prewritten_text}&rdquo;</p>
        </div>
      )}

      {/* Text confirmation */}
      {opp.phone_number && (
        <div className="mt-4">
          {!texted ? (
            <div className={`rounded-xl p-4 flex items-center justify-between ${isUrgent ? "bg-error-red/10 border border-error-red/20" : "bg-surface-container"}`}>
              <div>
                <p className={`text-sm font-semibold ${isUrgent ? "text-error-red" : "text-on-surface"}`}>
                  {isUrgent ? "Text her now — don't lose momentum" : "Text her to confirm"}
                </p>
                <p className="text-on-surface-variant text-xs mt-0.5">
                  Best between 10am – 9pm{hoursSinceShared !== null ? ` · ${hoursSinceShared}h ago` : ""}
                </p>
              </div>
              <button onClick={handleMarkTexted} className={`font-semibold rounded-full px-5 py-2.5 text-sm ${isUrgent ? "bg-error-red text-white" : "gold-gradient text-on-gold"}`}>
                Text Now
              </button>
            </div>
          ) : (
            <div className="bg-surface-container rounded-xl p-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-gold/40 text-sm" style={{ fontVariationSettings: "'FILL' 1, 'wght' 300" }}>check_circle</span>
              <p className="text-on-surface-variant text-sm">Texted — good luck!</p>
            </div>
          )}
        </div>
      )}

      {/* Edit date/time/venue */}
      <div className="mt-4">
        {!editing ? (
          <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-on-surface-variant text-xs hover:text-gold transition-colors">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>edit_calendar</span>
            Change day, time, or venue (any changes you make)
          </button>
        ) : (
          <div className="bg-surface-container rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-gold text-[10px] uppercase tracking-widest mb-1">Day</p>
                <input type="date" value={editDay} onChange={(e) => setEditDay(e.target.value)} className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-3 py-2 text-on-surface text-sm focus:border-gold outline-none [color-scheme:dark]" />
              </div>
              <div>
                <p className="text-gold text-[10px] uppercase tracking-widest mb-1">Time</p>
                <input type="time" value={editTime} onChange={(e) => setEditTime(e.target.value)} className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-3 py-2 text-on-surface text-sm focus:border-gold outline-none [color-scheme:dark]" />
              </div>
            </div>
            <div>
              <p className="text-gold text-[10px] uppercase tracking-widest mb-1">Suggest a Venue</p>
              <input type="text" value={editVenue} onChange={(e) => setEditVenue(e.target.value)} placeholder="e.g. The Violet Hour, RPM Italian..." className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-3 py-2 text-on-surface text-sm placeholder:text-outline focus:border-gold outline-none" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="flex-1 border border-outline-variant/20 text-on-surface-variant rounded-full h-10 text-sm hover:bg-surface-container-high transition-colors">Cancel</button>
              <button onClick={handleSaveEdit} disabled={saving} className="flex-1 gold-gradient text-on-gold font-semibold rounded-full h-10 text-sm disabled:opacity-50">
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-on-surface text-sm font-medium">{value}</p>
    </div>
  );
}

function buildPhotoList(opp: any): string[] {
  const photos: string[] = [];
  if (opp.candidate_photo_url) photos.push(opp.candidate_photo_url);
  if (Array.isArray(opp.candidate_photos)) {
    for (const p of opp.candidate_photos) {
      if (p && !photos.includes(p)) photos.push(p);
    }
  }
  return photos;
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(":");
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
}
