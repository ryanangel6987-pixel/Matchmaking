"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CollapsibleSection, DataRow } from "./section-header";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAY_ABBR: Record<string, string> = { Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed", Thursday: "Thu", Friday: "Fri", Saturday: "Sat", Sunday: "Sun" };

const VENUE_CATEGORIES = [
  "Cocktail Bar",
  "Restaurant",
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface SectionProps {
  onboarding: any;
  clientId: string;
  availability: any[];
  searchAreas: any[];
}

export function SectionOperationalNotes({ onboarding, clientId, availability, searchAreas }: SectionProps) {
  const data = onboarding ?? {};
  const router = useRouter();
  const supabase = createClient();

  // ── Availability state ─────────────────────────────────────────
  const [slots, setSlots] = useState<{ day: string; start: string; end: string }[]>(
    availability.map((a: any) => ({ day: a.day_of_week, start: a.start_time?.slice(0, 5) ?? "18:00", end: a.end_time?.slice(0, 5) ?? "22:00" }))
  );
  const [savingAvail, setSavingAvail] = useState(false);

  const toggleDay = (day: string) => {
    const existing = slots.filter((s) => s.day === day);
    if (existing.length > 0) {
      setSlots(slots.filter((s) => s.day !== day));
    } else {
      setSlots([...slots, { day, start: "18:00", end: "22:00" }]);
    }
  };

  const updateSlot = (day: string, field: "start" | "end", value: string) => {
    setSlots(slots.map((s) => s.day === day ? { ...s, [field]: value } : s));
  };

  const saveAvailability = async () => {
    setSavingAvail(true);
    await supabase.from("client_availability").delete().eq("client_id", clientId);
    if (slots.length > 0) {
      await supabase.from("client_availability").insert(
        slots.map((s) => ({ client_id: clientId, day_of_week: s.day, start_time: s.start, end_time: s.end }))
      );
    }
    setSavingAvail(false);
  };

  // ── Specific Dates state ──────────────────────────────────────
  const [availableDates, setAvailableDates] = useState<string[]>(
    (data.specific_available_dates ?? []).map((d: string) => d.slice(0, 10))
  );
  const [blockedDates, setBlockedDates] = useState<string[]>(
    (data.blackout_dates ?? []).map((d: string) => d.slice(0, 10))
  );
  const [newAvailDate, setNewAvailDate] = useState("");
  const [newBlockedDate, setNewBlockedDate] = useState("");
  const [savingDates, setSavingDates] = useState(false);

  const formatDatePill = (dateStr: string) => {
    const d = new Date(dateStr + "T12:00:00");
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };

  const addAvailableDate = () => {
    if (!newAvailDate || availableDates.includes(newAvailDate)) return;
    // Remove from blocked if present
    setBlockedDates((prev) => prev.filter((d) => d !== newAvailDate));
    setAvailableDates((prev) => [...prev, newAvailDate].sort());
    setNewAvailDate("");
  };

  const addBlockedDate = () => {
    if (!newBlockedDate || blockedDates.includes(newBlockedDate)) return;
    // Remove from available if present
    setAvailableDates((prev) => prev.filter((d) => d !== newBlockedDate));
    setBlockedDates((prev) => [...prev, newBlockedDate].sort());
    setNewBlockedDate("");
  };

  const removeAvailableDate = (date: string) => setAvailableDates((prev) => prev.filter((d) => d !== date));
  const removeBlockedDate = (date: string) => setBlockedDates((prev) => prev.filter((d) => d !== date));

  const saveSpecificDates = async () => {
    setSavingDates(true);
    await supabase.from("onboarding_data").upsert({
      client_id: clientId,
      specific_available_dates: availableDates.length > 0 ? availableDates : null,
      blackout_dates: blockedDates.length > 0 ? blockedDates : null,
    }, { onConflict: "client_id" });
    setSavingDates(false);
  };

  // ── Search Areas state ─────────────────────────────────────────
  const [areas, setAreas] = useState<{ id?: string; location: string; radius: number }[]>(
    searchAreas.map((a: any) => ({ id: a.id, location: a.location_name, radius: a.radius_miles }))
  );
  const [newArea, setNewArea] = useState("");
  const [newRadius, setNewRadius] = useState(25);
  const [savingAreas, setSavingAreas] = useState(false);

  const addArea = () => {
    if (!newArea.trim() || areas.length >= 3) return;
    setAreas([...areas, { location: newArea.trim(), radius: Math.max(10, newRadius) }]);
    setNewArea("");
    setNewRadius(25);
  };

  const removeArea = (idx: number) => setAreas(areas.filter((_, i) => i !== idx));

  const updateRadius = (idx: number, radius: number) => {
    setAreas(areas.map((a, i) => i === idx ? { ...a, radius: Math.max(10, radius) } : a));
  };

  const saveAreas = async () => {
    setSavingAreas(true);
    await supabase.from("client_search_areas").delete().eq("client_id", clientId);
    if (areas.length > 0) {
      await supabase.from("client_search_areas").insert(
        areas.map((a, i) => ({ client_id: clientId, location_name: a.location, radius_miles: a.radius, sort_order: i }))
      );
    }
    setSavingAreas(false);
  };

  // ── Venue preferences state ────────────────────────────────────
  const [venueCategories, setVenueCategories] = useState<string[]>(data.venue_categories ?? []);
  const [venueNoGos, setVenueNoGos] = useState<string[]>(data.venue_no_gos ?? []);
  const [venueSuggestions, setVenueSuggestions] = useState(data.venue_suggestions ?? "");
  const [savingVenues, setSavingVenues] = useState(false);

  const toggleCategory = (cat: string) => {
    setVenueCategories((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]);
  };
  const toggleNoGo = (item: string) => {
    setVenueNoGos((prev) => prev.includes(item) ? prev.filter((c) => c !== item) : [...prev, item]);
  };

  const saveVenuePrefs = async () => {
    setSavingVenues(true);
    await supabase.from("onboarding_data").upsert({
      client_id: clientId,
      venue_categories: venueCategories.length > 0 ? venueCategories : null,
      venue_no_gos: venueNoGos.length > 0 ? venueNoGos : null,
      venue_suggestions: venueSuggestions || null,
    }, { onConflict: "client_id" });
    setSavingVenues(false);
  };

  const inputClass = "w-full bg-surface-container border border-outline-variant/20 rounded-lg px-3 py-1.5 text-on-surface text-sm focus:border-gold focus:ring-1 focus:ring-gold outline-none";

  return (
    <div className="bg-surface-container-low p-8 rounded-2xl shadow-xl relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-1 h-full bg-gold opacity-30 group-hover:opacity-100 transition-opacity duration-500" />

      <CollapsibleSection title="Section C — Logistics" subtitle="Availability, locations & venue preferences">
        <div className="space-y-10">

          {/* ═══ 1. AVAILABILITY CALENDAR ════════════════════════════════ */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-gold text-lg" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>calendar_month</span>
                <h3 className="text-on-surface text-sm font-medium font-heading">Weekly Availability</h3>
              </div>
              <button onClick={saveAvailability} disabled={savingAvail} className="gold-gradient text-on-gold font-semibold rounded-full px-4 py-1.5 text-xs disabled:opacity-50">
                {savingAvail ? "Saving..." : "Save Availability"}
              </button>
            </div>
            <p className="text-on-surface-variant text-xs">Tap a day to mark available, then set your preferred time window. Your matchmaker will schedule dates within these windows.</p>

            <div className="grid grid-cols-7 gap-2">
              {DAYS.map((day) => {
                const isActive = slots.some((s) => s.day === day);
                return (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`flex flex-col items-center py-3 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? "bg-gold/15 text-gold border border-gold/30"
                        : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                    }`}
                  >
                    <span className="font-bold">{DAY_ABBR[day]}</span>
                    {isActive && (
                      <span className="material-symbols-outlined text-[10px] mt-1" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}>check_circle</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Time slots for active days */}
            {slots.length > 0 && (
              <div className="space-y-2">
                {slots
                  .sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day))
                  .map((slot) => (
                  <div key={slot.day} className="bg-surface-container rounded-xl p-3 flex items-center justify-between gap-4">
                    <span className="text-on-surface text-xs font-medium w-12">{DAY_ABBR[slot.day]}</span>
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="time"
                        value={slot.start}
                        onChange={(e) => updateSlot(slot.day, "start", e.target.value)}
                        className="bg-surface-container-low border border-outline-variant/20 rounded-lg px-2 py-1 text-on-surface text-xs focus:border-gold outline-none"
                      />
                      <span className="text-on-surface-variant text-xs">to</span>
                      <input
                        type="time"
                        value={slot.end}
                        onChange={(e) => updateSlot(slot.day, "end", e.target.value)}
                        className="bg-surface-container-low border border-outline-variant/20 rounded-lg px-2 py-1 text-on-surface text-xs focus:border-gold outline-none"
                      />
                    </div>
                    <button onClick={() => toggleDay(slot.day)} className="text-on-surface-variant hover:text-error-red transition-colors">
                      <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {slots.length === 0 && (
              <p className="text-on-surface-variant/40 text-xs text-center py-2">No days selected. Tap days above to set your availability.</p>
            )}
          </div>

          {/* ═══ 1b. SPECIFIC DATES ═════════════════════════════════════ */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-gold text-lg" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>event_available</span>
                <h3 className="text-on-surface text-sm font-medium font-heading">Specific Dates</h3>
              </div>
              <button onClick={saveSpecificDates} disabled={savingDates} className="gold-gradient text-on-gold font-semibold rounded-full px-4 py-1.5 text-xs disabled:opacity-50">
                {savingDates ? "Saving..." : "Save Dates"}
              </button>
            </div>
            <p className="text-on-surface-variant text-xs">Add specific dates you&apos;re available or unavailable, in addition to your weekly schedule.</p>

            {/* Available dates */}
            <div className="space-y-2">
              <p className="text-on-surface-variant text-xs font-medium">I&apos;m available on these specific dates</p>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={newAvailDate}
                  onChange={(e) => setNewAvailDate(e.target.value)}
                  className="bg-surface-container-low border border-outline-variant/20 rounded-lg px-3 py-1.5 text-on-surface text-xs focus:border-gold focus:ring-1 focus:ring-gold outline-none flex-1 [color-scheme:dark]"
                />
                <button
                  onClick={addAvailableDate}
                  disabled={!newAvailDate}
                  className="gold-gradient text-on-gold font-semibold rounded-full px-4 py-1.5 text-xs disabled:opacity-50"
                >
                  Add
                </button>
              </div>
              {availableDates.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {availableDates.map((date) => (
                    <span key={date} className="inline-flex items-center gap-1.5 bg-gold/15 text-gold border border-gold/30 rounded-full px-3 py-1 text-xs font-medium">
                      {formatDatePill(date)}
                      <button onClick={() => removeAvailableDate(date)} className="hover:text-gold/60 transition-colors">
                        <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>close</span>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Blocked dates */}
            <div className="space-y-2">
              <p className="text-on-surface-variant text-xs font-medium">I&apos;m NOT available on these dates</p>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={newBlockedDate}
                  onChange={(e) => setNewBlockedDate(e.target.value)}
                  className="bg-surface-container-low border border-outline-variant/20 rounded-lg px-3 py-1.5 text-on-surface text-xs focus:border-gold focus:ring-1 focus:ring-gold outline-none flex-1 [color-scheme:dark]"
                />
                <button
                  onClick={addBlockedDate}
                  disabled={!newBlockedDate}
                  className="bg-error-red/15 text-error-red border border-error-red/30 font-semibold rounded-full px-4 py-1.5 text-xs disabled:opacity-50 hover:bg-error-red/25 transition-colors"
                >
                  Add
                </button>
              </div>
              {blockedDates.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {blockedDates.map((date) => (
                    <span key={date} className="inline-flex items-center gap-1.5 bg-error-red/15 text-error-red border border-error-red/30 rounded-full px-3 py-1 text-xs font-medium">
                      {formatDatePill(date)}
                      <button onClick={() => removeBlockedDate(date)} className="hover:text-error-red/60 transition-colors">
                        <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>close</span>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {availableDates.length === 0 && blockedDates.length === 0 && (
              <p className="text-on-surface-variant/40 text-xs text-center py-2">No specific dates added yet. Use the fields above to mark individual dates.</p>
            )}
          </div>

          {/* ═══ 2. SEARCH AREAS ═════════════════════════════════════════ */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-gold text-lg" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>location_on</span>
                <h3 className="text-on-surface text-sm font-medium font-heading">Search Areas</h3>
                <span className="text-on-surface-variant text-[10px]">(up to 3)</span>
              </div>
              <button onClick={saveAreas} disabled={savingAreas} className="gold-gradient text-on-gold font-semibold rounded-full px-4 py-1.5 text-xs disabled:opacity-50">
                {savingAreas ? "Saving..." : "Save Areas"}
              </button>
            </div>
            <p className="text-on-surface-variant text-xs">Add your preferred locations and search radius. Minimum 10 miles.</p>

            {/* Existing areas */}
            {areas.map((area, idx) => (
              <div key={idx} className="bg-surface-container rounded-xl p-4 flex items-center gap-4">
                <span className="material-symbols-outlined text-gold text-lg" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>pin_drop</span>
                <div className="flex-1">
                  <p className="text-on-surface text-sm font-medium">{area.location}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-on-surface-variant text-xs">Radius:</span>
                    <input
                      type="number"
                      value={area.radius}
                      onChange={(e) => updateRadius(idx, parseInt(e.target.value) || 10)}
                      min={10}
                      max={200}
                      className="w-16 bg-surface-container-low border border-outline-variant/20 rounded-lg px-2 py-0.5 text-on-surface text-xs focus:border-gold outline-none"
                    />
                    <span className="text-on-surface-variant text-xs">miles</span>
                  </div>
                </div>
                <button onClick={() => removeArea(idx)} className="text-on-surface-variant hover:text-error-red transition-colors">
                  <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>delete</span>
                </button>
              </div>
            ))}

            {/* Add new area */}
            {areas.length < 3 && (
              <div className="bg-surface-container rounded-xl p-4 space-y-3">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newArea}
                    onChange={(e) => setNewArea(e.target.value)}
                    placeholder="e.g. Chicago, Manhattan, Brooklyn..."
                    className={inputClass + " flex-1"}
                  />
                  <div className="flex items-center gap-1.5">
                    <span className="text-on-surface-variant text-xs">+</span>
                    <input
                      type="number"
                      value={newRadius}
                      onChange={(e) => setNewRadius(parseInt(e.target.value) || 25)}
                      min={10}
                      max={200}
                      className="w-16 bg-surface-container-low border border-outline-variant/20 rounded-lg px-2 py-1.5 text-on-surface text-xs focus:border-gold outline-none"
                    />
                    <span className="text-on-surface-variant text-xs">mi</span>
                  </div>
                  <button
                    onClick={addArea}
                    disabled={!newArea.trim()}
                    className="gold-gradient text-on-gold font-semibold rounded-full px-4 py-1.5 text-xs disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            {/* Suburbs advice */}
            <div className="bg-gold/5 border border-gold/15 rounded-lg p-3">
              <p className="text-on-surface-variant text-[11px]">
                <span className="text-gold font-semibold">Tip:</span>{" "}If you&apos;re in the suburbs, we recommend setting your nearest major city as a search area. A radius under 10 miles significantly reduces match options.
              </p>
            </div>
          </div>

          {/* ═══ 3. VENUE PREFERENCES ════════════════════════════════════ */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-gold text-lg" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>local_bar</span>
                <h3 className="text-on-surface text-sm font-medium font-heading">Venue Preferences</h3>
              </div>
              <button onClick={saveVenuePrefs} disabled={savingVenues} className="gold-gradient text-on-gold font-semibold rounded-full px-4 py-1.5 text-xs disabled:opacity-50">
                {savingVenues ? "Saving..." : "Save Venues"}
              </button>
            </div>

            {/* Venue categories */}
            <div>
              <p className="text-on-surface-variant text-xs mb-2">What kind of venues do you prefer for first dates?</p>
              <div className="flex flex-wrap gap-2">
                {VENUE_CATEGORIES.map((cat) => {
                  const isSelected = venueCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-gold/15 text-gold border border-gold/30"
                          : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high border border-transparent"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* First date notice */}
            <div className="bg-gold/5 border border-gold/15 rounded-lg p-3">
              <p className="text-on-surface-variant text-[11px] leading-relaxed">
                <span className="text-gold font-semibold">First date rule:</span>{" "}The first date should strictly be drinks or dinner — conversion drops by 80% with other activities. Coffee, karaoke, and outings work for follow-up dates.
              </p>
            </div>

            {/* Specific suggestions */}
            <div>
              <p className="text-on-surface-variant text-xs mb-2">Any specific venues you&apos;d like to suggest? (optional)</p>
              <textarea
                value={venueSuggestions}
                onChange={(e) => setVenueSuggestions(e.target.value)}
                placeholder="e.g. The Violet Hour, RPM Italian, Maple & Ash..."
                rows={2}
                className={inputClass + " resize-none"}
              />
            </div>

            <div className="bg-surface-container rounded-lg p-3">
              <p className="text-on-surface-variant text-[11px]">
                <span className="text-gold font-semibold">Note:</span>{" "}First dates should be simple and conversational. We recommend cocktail bars, lounges, or casual dining — no overly adventurous or high-pressure activities.
              </p>
            </div>
          </div>

          {/* ═══ 4. ADDITIONAL NOTES ═════════════════════════════════════ */}
          {data.anything_else && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-gold text-lg" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>note</span>
                <h3 className="text-on-surface text-sm font-medium font-heading">Additional Notes</h3>
              </div>
              <p className="text-on-surface text-sm leading-relaxed">{data.anything_else}</p>
            </div>
          )}

        </div>
      </CollapsibleSection>
    </div>
  );
}
