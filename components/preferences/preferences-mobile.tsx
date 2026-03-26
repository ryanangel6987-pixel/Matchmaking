"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CustomSelect } from "@/components/ui/custom-select";
import { Badge } from "@/components/ui/badge";
import { DateHistorySlider } from "./date-history-slider";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface PreferencesMobileProps {
  clientId: string;
  onboarding: any;
  preferences: any;
  preferenceAssets: any[];
  approvedType: any;
  candidates: any[];
  datingApps: any[];
  venues: any[];
  availability: any[];
  searchAreas: any[];
  approvedDates: any[];
  declinedDates: any[];
}

/* ─── Constants ────────────────────────────────────────────────── */

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAY_ABBR: Record<string, string> = { Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed", Thursday: "Thu", Friday: "Fri", Saturday: "Sat", Sunday: "Sun" };

const VENUE_CATEGORIES = ["Cocktail Bar", "Restaurant"];

const KIDS_LABELS: Record<string, string> = {
  wants_kids: "Wants kids",
  no_kids: "Doesn't want kids",
  open: "Open to either",
  has_kids_ok: "OK if she has kids",
  no_preference: "No preference",
};

const ASSET_TYPES = [
  { value: "ex", label: "Pictures Of Exes" },
  { value: "ideal", label: "Ideal Type" },
  { value: "aspirational", label: "Aspirational References" },
] as const;

const statusConfig: Record<string, { label: string; className: string }> = {
  candidate: { label: "Candidate", className: "bg-surface-bright/40 border-outline-variant/30 text-neutral" },
  date_closed: { label: "Date Closed", className: "bg-gold/20 border-gold/30 text-gold" },
  pending_client_approval: { label: "Pending Approval", className: "bg-surface-bright/40 border-outline-variant/30 text-neutral" },
  approved: { label: "Approved", className: "bg-gold/20 border-gold/30 text-gold" },
  declined: { label: "Declined", className: "bg-error-container/20 border-error-red/30 text-error-red" },
  archived: { label: "Archived", className: "bg-surface-bright/40 border-outline-variant/30 text-outline" },
};

const ICON_STYLE = { fontVariationSettings: "'FILL' 0, 'wght' 300" };
const ICON_FILLED = { fontVariationSettings: "'FILL' 1, 'wght' 400" };

const TABS = [
  { label: "About You", icon: "person" },
  { label: "Preferences", icon: "favorite" },
  { label: "Logistics", icon: "calendar_month" },
];

/* ─── Shared sub-components ────────────────────────────────────── */

function FieldRow({ icon, label, value }: { icon: string; label: string; value: string | number | null | undefined }) {
  return (
    <div className="flex items-center justify-between border-b border-outline-variant/10 py-4 min-h-[52px]">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span className="material-symbols-outlined text-gold text-lg flex-shrink-0" style={ICON_STYLE}>{icon}</span>
        <span className="text-on-surface-variant text-[14px]">{label}</span>
      </div>
      <span className={`text-right max-w-[50%] text-[16px] ${value ? "text-on-surface font-medium" : "text-on-surface-variant/30"}`}>
        {value ?? "\u2014"}
      </span>
    </div>
  );
}

function TagList({ items, color = "gold" }: { items: string[] | null | undefined; color?: "gold" | "red" }) {
  if (!items || items.length === 0) {
    return <span className="text-on-surface-variant/40 text-[13px]">None specified</span>;
  }
  const colorClasses = color === "gold"
    ? "bg-gold/10 text-gold border-gold/20"
    : "bg-error-red/10 text-error-red border-error-red/20";
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className={`px-3 py-1.5 rounded-full border text-[11px] uppercase tracking-widest ${colorClasses}`}>
          {item}
        </span>
      ))}
    </div>
  );
}

function SectionCard({ icon, title, editHref, children }: { icon: string; title: string; editHref?: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface-container-low rounded-2xl mx-1">
      {/* Section header */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gold/15 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-gold text-[18px]" style={ICON_STYLE}>{icon}</span>
          </div>
          <h2 className="text-[18px] font-heading font-bold text-on-surface tracking-tight">{title}</h2>
        </div>
        {editHref && (
          <Link href={editHref} className="flex items-center gap-1 text-gold text-[13px] font-medium hover:text-gold-light transition-colors">
            <span className="material-symbols-outlined text-sm" style={ICON_STYLE}>edit</span>
            Edit
          </Link>
        )}
      </div>
      {/* Content */}
      <div className="px-5 pb-6 space-y-4">{children}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 0: About You
   ═══════════════════════════════════════════════════════════════════ */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TabAboutYou({ onboarding, clientId }: { onboarding: any; clientId: string }) {
  const data = onboarding ?? {};
  const router = useRouter();
  const supabase = createClient();
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState(data.full_name ?? "");
  const [age, setAge] = useState(data.age?.toString() ?? "");
  const [city, setCity] = useState(data.city ?? "");
  const [neighborhood, setNeighborhood] = useState(data.neighborhood ?? "");
  const [profession, setProfession] = useState(data.profession ?? "");
  const [title, setTitle] = useState(data.title ?? "");
  const [heightInches, setHeightInches] = useState(data.height_inches?.toString() ?? "");
  const [drinksAlcohol, setDrinksAlcohol] = useState(data.drinks_alcohol ?? "");
  const [hasKids, setHasKids] = useState(data.has_kids ?? "");
  const [kidsDetails, setKidsDetails] = useState(data.kids_details ?? "");
  const [education, setEducation] = useState(Array.isArray(data.education) ? data.education.join(", ") : (data.education ?? ""));
  const [personalitySummary, setPersonalitySummary] = useState(data.personality_summary ?? "");
  const [lifestyleNotes, setLifestyleNotes] = useState(data.lifestyle_notes ?? "");
  const [clientNotes, setClientNotes] = useState(data.client_notes ?? "");

  const aboutInputClass = "w-full bg-surface-container border-0 border-b border-outline-variant/20 px-3 py-3 text-on-surface text-[16px] focus:border-gold outline-none rounded-lg";

  const saveAboutYou = async () => {
    setSaving(true);
    const educationArr = education.split(",").map((s: string) => s.trim()).filter(Boolean);
    const payload = {
      client_id: clientId,
      full_name: fullName || null,
      age: age ? parseInt(age) : null,
      city: city || null,
      neighborhood: neighborhood || null,
      profession: profession || null,
      title: title || null,
      height_inches: heightInches ? parseInt(heightInches) : null,
      drinks_alcohol: drinksAlcohol || null,
      has_kids: hasKids || null,
      kids_details: hasKids === "yes" ? (kidsDetails || null) : null,
      education: educationArr.length > 0 ? educationArr : null,
      personality_summary: personalitySummary || null,
      lifestyle_notes: lifestyleNotes || null,
      client_notes: clientNotes || null,
    };
    await supabase.from("onboarding_data").upsert(payload, { onConflict: "client_id" });
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      {/* Card 1: Basic Info */}
      <SectionCard icon="person" title="Basic Info">
        <div className="space-y-4">
          <div>
            <p className="text-gold text-[11px] uppercase tracking-widest mb-1 flex items-center gap-1.5"><span className="material-symbols-outlined text-sm" style={ICON_STYLE}>badge</span>FULL NAME</p>
            <input className={aboutInputClass} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" />
          </div>
          <div>
            <p className="text-gold text-[11px] uppercase tracking-widest mb-1 flex items-center gap-1.5"><span className="material-symbols-outlined text-sm" style={ICON_STYLE}>cake</span>AGE</p>
            <input className={aboutInputClass} type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Age" />
          </div>
          <div>
            <p className="text-gold text-[11px] uppercase tracking-widest mb-1 flex items-center gap-1.5"><span className="material-symbols-outlined text-sm" style={ICON_STYLE}>location_city</span>CITY</p>
            <input className={aboutInputClass} value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
          </div>
          <div>
            <p className="text-gold text-[11px] uppercase tracking-widest mb-1 flex items-center gap-1.5"><span className="material-symbols-outlined text-sm" style={ICON_STYLE}>location_on</span>NEIGHBORHOOD</p>
            <input className={aboutInputClass} value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} placeholder="Neighborhood" />
          </div>
          <div>
            <p className="text-gold text-[11px] uppercase tracking-widest mb-1 flex items-center gap-1.5"><span className="material-symbols-outlined text-sm" style={ICON_STYLE}>height</span>HEIGHT</p>
            <CustomSelect value={heightInches} onChange={setHeightInches} options={[
              { value: "65", label: "5'5\"" }, { value: "66", label: "5'6\"" }, { value: "67", label: "5'7\"" },
              { value: "68", label: "5'8\"" }, { value: "69", label: "5'9\"" }, { value: "70", label: "5'10\"" },
              { value: "71", label: "5'11\"" }, { value: "72", label: "6'0\"" }, { value: "73", label: "6'1\"" },
              { value: "74", label: "6'2\"" }, { value: "75", label: "6'3\"" }, { value: "76", label: "6'4\"" },
              { value: "77", label: "6'5\"" }, { value: "78", label: "6'6\"" },
            ]} placeholder="Select height..." />
          </div>
          <button onClick={saveAboutYou} disabled={saving} className="w-full h-[48px] gold-gradient text-on-gold font-semibold rounded-xl text-[16px] disabled:opacity-50 mt-2">
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </SectionCard>

      {/* Card 2: Career & Lifestyle */}
      <SectionCard icon="work" title="Career & Lifestyle">
        <div className="space-y-4">
          <div>
            <p className="text-gold text-[11px] uppercase tracking-widest mb-1 flex items-center gap-1.5"><span className="material-symbols-outlined text-sm" style={ICON_STYLE}>work</span>FIELD</p>
            <input className={aboutInputClass} value={profession} onChange={(e) => setProfession(e.target.value)} placeholder="e.g. Finance, Tech, Medicine" />
          </div>
          <div>
            <p className="text-gold text-[11px] uppercase tracking-widest mb-1 flex items-center gap-1.5"><span className="material-symbols-outlined text-sm" style={ICON_STYLE}>id_card</span>JOB TITLE</p>
            <input className={aboutInputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Job title" />
          </div>
          <div>
            <p className="text-gold text-[11px] uppercase tracking-widest mb-1 flex items-center gap-1.5"><span className="material-symbols-outlined text-sm" style={ICON_STYLE}>school</span>EDUCATION</p>
            <input className={aboutInputClass} value={education} onChange={(e) => setEducation(e.target.value)} placeholder="Comma-separated, e.g. NYU, MBA" />
          </div>
          <div>
            <p className="text-gold text-[11px] uppercase tracking-widest mb-1 flex items-center gap-1.5"><span className="material-symbols-outlined text-sm" style={ICON_STYLE}>local_bar</span>DRINKS</p>
            <CustomSelect value={drinksAlcohol} onChange={setDrinksAlcohol} options={[{ value: "yes", label: "Yes" }, { value: "sometimes", label: "Sometimes" }, { value: "never", label: "Never" }]} placeholder="Select..." />
          </div>
          <div>
            <p className="text-gold text-[11px] uppercase tracking-widest mb-1 flex items-center gap-1.5"><span className="material-symbols-outlined text-sm" style={ICON_STYLE}>child_care</span>HAS KIDS</p>
            <CustomSelect value={hasKids} onChange={setHasKids} options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }, { value: "prefer_not_to_say", label: "Prefer not to say" }]} placeholder="Select..." />
          </div>
          {hasKids === "yes" && (
            <div>
              <p className="text-gold text-[11px] uppercase tracking-widest mb-1 flex items-center gap-1.5"><span className="material-symbols-outlined text-sm" style={ICON_STYLE}>family_restroom</span>KIDS DETAILS</p>
              <input className={aboutInputClass} value={kidsDetails} onChange={(e) => setKidsDetails(e.target.value)} placeholder="e.g. 2 kids, ages 5 and 8" />
            </div>
          )}
          <button onClick={saveAboutYou} disabled={saving} className="w-full h-[48px] gold-gradient text-on-gold font-semibold rounded-xl text-[16px] disabled:opacity-50 mt-2">
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </SectionCard>

      {/* Card 3: About You */}
      <SectionCard icon="psychology" title="About You">
        <div className="space-y-4">
          <div>
            <p className="text-gold text-[11px] uppercase tracking-widest mb-1 flex items-center gap-1.5"><span className="material-symbols-outlined text-sm" style={ICON_STYLE}>psychology</span>PERSONALITY SUMMARY</p>
            <textarea className={`${aboutInputClass} min-h-[100px] resize-none`} value={personalitySummary} onChange={(e) => setPersonalitySummary(e.target.value)} placeholder="Brief personality summary..." />
          </div>
          <div>
            <p className="text-gold text-[11px] uppercase tracking-widest mb-1 flex items-center gap-1.5"><span className="material-symbols-outlined text-sm" style={ICON_STYLE}>self_improvement</span>LIFESTYLE &amp; HOBBIES</p>
            <textarea className={`${aboutInputClass} min-h-[100px] resize-none`} value={lifestyleNotes} onChange={(e) => setLifestyleNotes(e.target.value)} placeholder="Lifestyle, hobbies, interests..." />
          </div>
          <div>
            <p className="text-gold text-[11px] uppercase tracking-widest mb-1 flex items-center gap-1.5"><span className="material-symbols-outlined text-sm" style={ICON_STYLE}>note</span>ADDITIONAL NOTES</p>
            <textarea className={`${aboutInputClass} min-h-[100px] resize-none`} value={clientNotes} onChange={(e) => setClientNotes(e.target.value)} placeholder="Any additional notes..." />
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <p className="text-gold text-[11px] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm" style={ICON_STYLE}>phone_iphone</span>
                Dating Apps Used
              </p>
              <TagList items={data.dating_apps_used} />
            </div>
          </div>

          <button onClick={saveAboutYou} disabled={saving} className="w-full h-[48px] gold-gradient text-on-gold font-semibold rounded-xl text-[16px] disabled:opacity-50">
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </SectionCard>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 1: What He Wants
   ═══════════════════════════════════════════════════════════════════ */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TabWhatHeWants({ preferences, clientId }: { preferences: any; clientId: string }) {
  const data = preferences ?? {};
  const router = useRouter();
  const supabase = createClient();
  const [saving, setSaving] = useState(false);

  const [targetAgeMin, setTargetAgeMin] = useState(data.target_age_min?.toString() ?? "");
  const [targetAgeMax, setTargetAgeMax] = useState(data.target_age_max?.toString() ?? "");
  const [maxDistance, setMaxDistance] = useState(data.max_distance_miles?.toString() ?? "");
  const [educationPref, setEducationPref] = useState(data.education_preference ?? "");
  const [relationshipIntent, setRelationshipIntent] = useState(data.relationship_intent ?? "");
  const [dateFrequency, setDateFrequency] = useState(data.date_frequency ?? "");
  const [kidsPref, setKidsPref] = useState(data.kids_preference ?? "");
  const [professionPrefs, setProfessionPrefs] = useState(Array.isArray(data.profession_preferences) ? data.profession_preferences.join(", ") : (data.profession_preferences ?? ""));
  const [dealBreakers, setDealBreakers] = useState(Array.isArray(data.deal_breakers) ? data.deal_breakers.join(", ") : (data.deal_breakers ?? ""));
  const [targetNotes, setTargetNotes] = useState(data.target_notes ?? "");

  const wantsInputClass = "w-full bg-surface-container border-0 border-b border-outline-variant/20 px-4 py-3 text-on-surface text-[16px] focus:border-gold outline-none";

  const saveWhatHeWants = async () => {
    setSaving(true);
    const profArr = professionPrefs.split(",").map((s: string) => s.trim()).filter(Boolean);
    const dealArr = dealBreakers.split(",").map((s: string) => s.trim()).filter(Boolean);
    await supabase.from("preferences").upsert({
      client_id: clientId,
      target_age_min: targetAgeMin ? parseInt(targetAgeMin) : null,
      target_age_max: targetAgeMax ? parseInt(targetAgeMax) : null,
      max_distance_miles: maxDistance ? parseInt(maxDistance) : null,
      education_preference: educationPref || null,
      relationship_intent: relationshipIntent || null,
      date_frequency: dateFrequency || null,
      kids_preference: kidsPref || null,
      profession_preferences: profArr.length > 0 ? profArr : null,
      deal_breakers: dealArr.length > 0 ? dealArr : null,
      target_notes: targetNotes || null,
    }, { onConflict: "client_id" });
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      {/* Card 1: Target Demographics */}
      <SectionCard icon="tune" title="Target Demographics">
        <div className="space-y-4">
          <div>
            <p className="text-gold text-[11px] uppercase tracking-widest mb-1 flex items-center gap-1.5"><span className="material-symbols-outlined text-sm" style={ICON_STYLE}>date_range</span>TARGET AGE MIN</p>
            <input className={wantsInputClass} type="number" value={targetAgeMin} onChange={(e) => setTargetAgeMin(e.target.value)} placeholder="e.g. 25" />
          </div>
          <div>
            <p className="text-gold text-[11px] uppercase tracking-widest mb-1 flex items-center gap-1.5"><span className="material-symbols-outlined text-sm" style={ICON_STYLE}>date_range</span>TARGET AGE MAX</p>
            <input className={wantsInputClass} type="number" value={targetAgeMax} onChange={(e) => setTargetAgeMax(e.target.value)} placeholder="e.g. 35" />
          </div>
          <div>
            <p className="text-gold text-[11px] uppercase tracking-widest mb-1 flex items-center gap-1.5"><span className="material-symbols-outlined text-sm" style={ICON_STYLE}>social_distance</span>MAX DISTANCE (MILES)</p>
            <input className={wantsInputClass} type="number" value={maxDistance} onChange={(e) => setMaxDistance(e.target.value)} placeholder="e.g. 25" />
          </div>
          <div>
            <p className="text-gold text-[11px] uppercase tracking-widest mb-1 flex items-center gap-1.5"><span className="material-symbols-outlined text-sm" style={ICON_STYLE}>school</span>EDUCATION PREFERENCE</p>
            <input className={wantsInputClass} value={educationPref} onChange={(e) => setEducationPref(e.target.value)} placeholder="e.g. Bachelor's or higher" />
          </div>
          <div>
            <p className="text-gold text-[11px] uppercase tracking-widest mb-1 flex items-center gap-1.5"><span className="material-symbols-outlined text-sm" style={ICON_STYLE}>child_care</span>KIDS PREFERENCE</p>
            <CustomSelect value={kidsPref} onChange={setKidsPref} options={[
              { value: "wants_kids", label: "Wants kids" }, { value: "no_kids", label: "Doesn't want kids" },
              { value: "open", label: "Open to either" }, { value: "has_kids_ok", label: "OK if she has kids" },
              { value: "no_preference", label: "No preference" },
            ]} placeholder="Select..." />
          </div>
          <button onClick={saveWhatHeWants} disabled={saving} className="w-full h-[48px] gold-gradient text-on-gold font-semibold rounded-xl text-[16px] disabled:opacity-50 mt-2">
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </SectionCard>

      {/* Card 2: Dating Preferences */}
      <SectionCard icon="favorite" title="Dating Preferences">
        <div className="space-y-4">
          <div>
            <p className="text-gold text-[11px] uppercase tracking-widest mb-1 flex items-center gap-1.5"><span className="material-symbols-outlined text-sm" style={ICON_STYLE}>favorite</span>RELATIONSHIP INTENT</p>
            <CustomSelect value={relationshipIntent} onChange={setRelationshipIntent} options={[
              { value: "short_term", label: "Short-term" }, { value: "open_to_long", label: "Open to long-term" },
              { value: "long_term", label: "Long-term relationship" }, { value: "marriage", label: "Marriage" },
              { value: "casual", label: "Casual dating" }, { value: "open", label: "Open to anything" },
            ]} placeholder="Select..." />
          </div>
          <div>
            <p className="text-gold text-[11px] uppercase tracking-widest mb-1 flex items-center gap-1.5"><span className="material-symbols-outlined text-sm" style={ICON_STYLE}>event_repeat</span>DATE FREQUENCY</p>
            <CustomSelect value={dateFrequency} onChange={setDateFrequency} options={[
              { value: "1_per_week", label: "1 per week" }, { value: "2_per_week", label: "2 per week" },
              { value: "1_per_month", label: "1 per month" }, { value: "2_per_month", label: "2 per month" },
              { value: "as_available", label: "As available" },
            ]} placeholder="Select..." />
          </div>
          <div>
            <p className="text-gold text-[11px] uppercase tracking-widest mb-1 flex items-center gap-1.5"><span className="material-symbols-outlined text-sm" style={ICON_STYLE}>work</span>PROFESSION PREFERENCES</p>
            <input className={wantsInputClass} value={professionPrefs} onChange={(e) => setProfessionPrefs(e.target.value)} placeholder="Comma-separated, e.g. Doctor, Lawyer" />
          </div>
          <div>
            <p className="text-gold text-[11px] uppercase tracking-widest mb-1 flex items-center gap-1.5"><span className="material-symbols-outlined text-sm" style={ICON_STYLE}>block</span>DEAL-BREAKERS</p>
            <input className={wantsInputClass} value={dealBreakers} onChange={(e) => setDealBreakers(e.target.value)} placeholder="Comma-separated deal-breakers" />
          </div>
          <div>
            <p className="text-gold text-[11px] uppercase tracking-widest mb-1 flex items-center gap-1.5"><span className="material-symbols-outlined text-sm" style={ICON_STYLE}>note</span>NOTES</p>
            <textarea className={`${wantsInputClass} min-h-[80px] resize-none`} value={targetNotes} onChange={(e) => setTargetNotes(e.target.value)} placeholder="Additional notes for your matchmaker..." />
          </div>
          <button onClick={saveWhatHeWants} disabled={saving} className="w-full h-[48px] gold-gradient text-on-gold font-semibold rounded-xl text-[16px] disabled:opacity-50 mt-2">
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </SectionCard>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 2: Logistics (Interactive)
   ═══════════════════════════════════════════════════════════════════ */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TabLogistics({ onboarding, clientId, availability, searchAreas }: { onboarding: any; clientId: string; availability: any[]; searchAreas: any[] }) {
  const data = onboarding ?? {};
  const router = useRouter();
  const supabase = createClient();

  // ── Availability ──
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

  // ── Specific Dates ──
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
    setBlockedDates((prev) => prev.filter((d) => d !== newAvailDate));
    setAvailableDates((prev) => [...prev, newAvailDate].sort());
    setNewAvailDate("");
  };

  const addBlockedDate = () => {
    if (!newBlockedDate || blockedDates.includes(newBlockedDate)) return;
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

  // ── Search Areas ──
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

  // ── Venue Preferences ──
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

  const inputClass = "w-full bg-surface-container border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface text-[16px] focus:border-gold focus:ring-1 focus:ring-gold outline-none";

  return (
    <div className="space-y-4">
      {/* ═══ WEEKLY AVAILABILITY ═══ */}
      <SectionCard icon="calendar_month" title="Weekly Availability">
        <p className="text-on-surface-variant text-[13px]">Tap a day to mark available, then set your time window.</p>

        <div className="grid grid-cols-4 gap-2">
          {DAYS.map((day) => {
            const isActive = slots.some((s) => s.day === day);
            return (
              <button
                key={day}
                onClick={() => toggleDay(day)}
                className={`flex flex-col items-center py-3 rounded-xl text-[13px] font-medium min-h-[48px] transition-all ${
                  isActive
                    ? "bg-gold/15 text-gold border border-gold/30"
                    : "bg-surface-container text-on-surface-variant active:bg-surface-container-high border border-transparent"
                }`}
              >
                <span className="font-bold">{DAY_ABBR[day]}</span>
                {isActive && (
                  <span className="material-symbols-outlined text-[10px] mt-1" style={ICON_FILLED}>check_circle</span>
                )}
              </button>
            );
          })}
        </div>

        {slots.length > 0 && (
          <div className="space-y-2">
            {slots
              .sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day))
              .map((slot) => (
              <div key={slot.day} className="bg-surface-container rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-on-surface text-[13px] font-medium">{DAY_ABBR[slot.day]}</span>
                  <button onClick={() => toggleDay(slot.day)} className="min-h-[48px] min-w-[48px] flex items-center justify-center text-on-surface-variant hover:text-error-red transition-colors">
                    <span className="material-symbols-outlined text-base" style={ICON_STYLE}>close</span>
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={slot.start}
                    onChange={(e) => updateSlot(slot.day, "start", e.target.value)}
                    className="flex-1 bg-surface-container-low border border-outline-variant/20 rounded-xl px-3 py-2.5 text-on-surface text-[16px] focus:border-gold outline-none [color-scheme:dark]"
                  />
                  <span className="text-on-surface-variant text-[13px]">to</span>
                  <input
                    type="time"
                    value={slot.end}
                    onChange={(e) => updateSlot(slot.day, "end", e.target.value)}
                    className="flex-1 bg-surface-container-low border border-outline-variant/20 rounded-xl px-3 py-2.5 text-on-surface text-[16px] focus:border-gold outline-none [color-scheme:dark]"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {slots.length === 0 && (
          <p className="text-on-surface-variant/40 text-[13px] text-center py-3">No days selected. Tap days above to set your availability.</p>
        )}

        <button onClick={saveAvailability} disabled={savingAvail} className="w-full min-h-[48px] gold-gradient text-on-gold font-semibold rounded-xl text-[16px] disabled:opacity-50">
          {savingAvail ? "Saving..." : "Save Availability"}
        </button>
      </SectionCard>

      {/* ═══ SPECIFIC DATES ═══ */}
      <SectionCard icon="event_available" title="Specific Dates">
        <p className="text-on-surface-variant text-[13px]">Add specific dates you&apos;re available or unavailable.</p>

        {/* Available dates */}
        <div className="space-y-2">
          <p className="text-on-surface-variant text-[13px] font-medium">I&apos;m available on:</p>
          <div className="flex flex-col gap-2">
            <input type="date" value={newAvailDate} onChange={(e) => setNewAvailDate(e.target.value)} className={inputClass + " [color-scheme:dark]"} />
            <button onClick={addAvailableDate} disabled={!newAvailDate} className="w-full min-h-[48px] gold-gradient text-on-gold font-semibold rounded-xl text-[16px] disabled:opacity-50">
              Add Available Date
            </button>
          </div>
          {availableDates.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
              {availableDates.map((date) => (
                <span key={date} className="inline-flex items-center gap-1.5 bg-gold/15 text-gold border border-gold/30 rounded-full px-3 py-1.5 text-[13px] font-medium">
                  {formatDatePill(date)}
                  <button onClick={() => removeAvailableDate(date)} className="min-w-[24px] min-h-[24px] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[12px]" style={ICON_STYLE}>close</span>
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Blocked dates */}
        <div className="space-y-2">
          <p className="text-on-surface-variant text-[13px] font-medium">I&apos;m NOT available on:</p>
          <div className="flex flex-col gap-2">
            <input type="date" value={newBlockedDate} onChange={(e) => setNewBlockedDate(e.target.value)} className={inputClass + " [color-scheme:dark]"} />
            <button onClick={addBlockedDate} disabled={!newBlockedDate} className="w-full min-h-[48px] bg-error-red/15 text-error-red border border-error-red/30 font-semibold rounded-xl text-[16px] disabled:opacity-50 active:bg-error-red/25 transition-colors">
              Add Blocked Date
            </button>
          </div>
          {blockedDates.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
              {blockedDates.map((date) => (
                <span key={date} className="inline-flex items-center gap-1.5 bg-error-red/15 text-error-red border border-error-red/30 rounded-full px-3 py-1.5 text-[13px] font-medium">
                  {formatDatePill(date)}
                  <button onClick={() => removeBlockedDate(date)} className="min-w-[24px] min-h-[24px] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[12px]" style={ICON_STYLE}>close</span>
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <button onClick={saveSpecificDates} disabled={savingDates} className="w-full min-h-[48px] gold-gradient text-on-gold font-semibold rounded-xl text-[16px] disabled:opacity-50">
          {savingDates ? "Saving..." : "Save Dates"}
        </button>
      </SectionCard>

      {/* ═══ SEARCH AREAS ═══ */}
      <SectionCard icon="location_on" title="Search Areas">
        <p className="text-on-surface-variant text-[13px]">Add your preferred locations and search radius. Minimum 10 miles. <span className="text-on-surface-variant/60">(up to 3)</span></p>

        {areas.map((area, idx) => (
          <div key={idx} className="bg-surface-container rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="material-symbols-outlined text-gold text-lg flex-shrink-0" style={ICON_STYLE}>pin_drop</span>
                <p className="text-on-surface text-[16px] font-medium truncate">{area.location}</p>
              </div>
              <button onClick={() => removeArea(idx)} className="min-h-[48px] min-w-[48px] flex items-center justify-center text-on-surface-variant hover:text-error-red transition-colors">
                <span className="material-symbols-outlined text-base" style={ICON_STYLE}>delete</span>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-on-surface-variant text-[13px]">Radius:</span>
              <input
                type="number"
                value={area.radius}
                onChange={(e) => updateRadius(idx, parseInt(e.target.value) || 10)}
                min={10}
                max={200}
                className="w-20 bg-surface-container-low border border-outline-variant/20 rounded-xl px-3 py-2.5 text-on-surface text-[16px] focus:border-gold outline-none"
              />
              <span className="text-on-surface-variant text-[13px]">miles</span>
            </div>
          </div>
        ))}

        {areas.length < 3 && (
          <div className="space-y-2">
            <input type="text" value={newArea} onChange={(e) => setNewArea(e.target.value)} placeholder="e.g. Chicago, Manhattan..." className={inputClass} />
            <div className="flex items-center gap-2">
              <span className="text-on-surface-variant text-[13px]">Radius:</span>
              <input type="number" value={newRadius} onChange={(e) => setNewRadius(parseInt(e.target.value) || 25)} min={10} max={200} className="w-20 bg-surface-container border border-outline-variant/20 rounded-xl px-3 py-2.5 text-on-surface text-[16px] focus:border-gold outline-none" />
              <span className="text-on-surface-variant text-[13px]">mi</span>
            </div>
            <button onClick={addArea} disabled={!newArea.trim()} className="w-full min-h-[48px] gold-gradient text-on-gold font-semibold rounded-xl text-[16px] disabled:opacity-50">
              Add Area
            </button>
          </div>
        )}

        <button onClick={saveAreas} disabled={savingAreas} className="w-full min-h-[48px] gold-gradient text-on-gold font-semibold rounded-xl text-[16px] disabled:opacity-50">
          {savingAreas ? "Saving..." : "Save Areas"}
        </button>

        <div className="bg-gold/5 border border-gold/15 rounded-xl p-4">
          <p className="text-on-surface-variant text-[13px]">
            <span className="text-gold font-semibold">Tip:</span>{" "}If you&apos;re in the suburbs, set your nearest major city as a search area. A radius under 10 miles significantly reduces match options.
          </p>
        </div>
      </SectionCard>

      {/* ═══ VENUE PREFERENCES ═══ */}
      <SectionCard icon="local_bar" title="Venue Preferences">
        <div>
          <p className="text-on-surface-variant text-[13px] mb-2">What kind of venues do you prefer for first dates?</p>
          <div className="flex flex-wrap gap-2">
            {VENUE_CATEGORIES.map((cat) => {
              const isSelected = venueCategories.includes(cat);
              return (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`px-4 py-2.5 rounded-full text-[13px] font-medium min-h-[44px] transition-all ${
                    isSelected
                      ? "bg-gold/15 text-gold border border-gold/30"
                      : "bg-surface-container text-on-surface-variant active:bg-surface-container-high border border-transparent"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
          <div className="bg-gold/5 border border-gold/15 rounded-xl p-3 mt-3">
            <p className="text-on-surface-variant text-[12px] leading-relaxed">
              <span className="text-gold font-semibold">First date rule:</span>{" "}The first date should strictly be drinks or dinner — conversion drops by 80% with other activities. Coffee, karaoke, and outings work for follow-up dates.
            </p>
          </div>
        </div>

        <div>
          <p className="text-on-surface-variant text-[13px] mb-2">Specific venue suggestions (optional)</p>
          <textarea
            value={venueSuggestions}
            onChange={(e) => setVenueSuggestions(e.target.value)}
            placeholder="e.g. The Violet Hour, RPM Italian..."
            rows={3}
            className={inputClass + " resize-none"}
          />
        </div>

        <button onClick={saveVenuePrefs} disabled={savingVenues} className="w-full min-h-[48px] gold-gradient text-on-gold font-semibold rounded-xl text-[16px] disabled:opacity-50">
          {savingVenues ? "Saving..." : "Save Venues"}
        </button>
      </SectionCard>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 3: Visual Preferences
   ═══════════════════════════════════════════════════════════════════ */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TabVisualPreferences({ assets: initialAssets, clientId }: { assets: any[]; clientId: string }) {
  const [assets, setAssets] = useState(initialAssets);
  const [selectedType, setSelectedType] = useState<string>("ex");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [physicalNotes, setPhysicalNotes] = useState(
    typeof initialAssets === "object" && "_physicalNotes" in (initialAssets as any) ? "" : ""
  );
  const [savingNotes, setSavingNotes] = useState(false);

  // Load physical notes from preferences on mount
  const [notesLoaded, setNotesLoaded] = useState(false);
  if (!notesLoaded) {
    const supabaseInit = createClient();
    supabaseInit.from("preferences").select("physical_preferences").eq("client_id", clientId).single().then(({ data }) => {
      if (data?.physical_preferences?.notes) setPhysicalNotes(data.physical_preferences.notes);
      setNotesLoaded(true);
    });
  }

  const savePhysicalNotes = async () => {
    setSavingNotes(true);
    const supabase = createClient();
    await supabase.from("preferences").upsert({
      client_id: clientId,
      physical_preferences: { notes: physicalNotes },
    }, { onConflict: "client_id" });
    setSavingNotes(false);
  };

  const exes = assets.filter((a) => a.asset_type === "ex");
  const ideals = assets.filter((a) => a.asset_type === "ideal");
  const aspirational = assets.filter((a) => a.asset_type === "aspirational");

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const files = fileInputRef.current?.files;
    if (!files || files.length === 0) { setError("Please select a file."); return; }
    const file = files[0];
    if (!file.type.startsWith("image/")) { setError("Only images allowed."); return; }
    if (file.size > 10 * 1024 * 1024) { setError("File must be under 10MB."); return; }

    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const storagePath = `preference_assets/${clientId}/${fileName}`;
      const { error: uploadError } = await supabase.storage.from("preference_assets").upload(storagePath, file);
      if (uploadError) throw new Error(uploadError.message);
      const { data: { publicUrl } } = supabase.storage.from("preference_assets").getPublicUrl(storagePath);
      const { data: newAsset, error: insertError } = await supabase
        .from("preference_assets")
        .insert({ client_id: clientId, asset_type: selectedType, storage_path: storagePath, storage_url: publicUrl })
        .select()
        .single();
      if (insertError) throw new Error(insertError.message);
      setAssets((prev) => [newAsset, ...prev]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <SectionCard icon="photo_library" title="Visual Preferences">
      <div className="space-y-6 px-4">
        {[
          { label: "Pictures Of Exes", items: exes },
          { label: "Ideal Type", items: ideals },
          { label: "Aspirational References", items: aspirational },
        ].map(({ label, items }) => (
          <div key={label}>
            <p className="text-gold text-[11px] uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm" style={ICON_STYLE}>photo_library</span>
              {label}
            </p>
            {items.length === 0 ? (
              <p className="text-on-surface-variant/40 text-[16px]">&mdash;</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {items.map((asset) => (
                  <div key={asset.id} className="relative rounded-xl overflow-hidden">
                    {asset.storage_url ? (
                      <Image
                        src={asset.storage_url}
                        alt={asset.notes || "Reference"}
                        width={200}
                        height={260}
                        className="w-full h-40 object-cover"
                      />
                    ) : (
                      <div className="w-full h-40 bg-surface-container-high flex items-center justify-center">
                        <span className="material-symbols-outlined text-3xl text-outline" style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>image</span>
                      </div>
                    )}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <Badge variant="outline" className="text-[9px] uppercase tracking-widest border-gold/30 text-gold">
                        {asset.asset_type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Physical Preference Notes */}
        <div className="pt-4 border-t border-outline/10 space-y-3">
          <p className="text-gold text-[11px] uppercase tracking-widest flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm" style={ICON_STYLE}>edit_note</span>
            Physical Preference Notes
          </p>
          <textarea
            value={physicalNotes}
            onChange={(e) => setPhysicalNotes(e.target.value)}
            placeholder="Describe your physical type preferences — hair color, body type, style, anything that helps your matchmaker..."
            rows={4}
            className="w-full bg-surface-container border-0 border-b border-outline-variant/20 px-3 py-3 text-on-surface text-[16px] focus:border-gold outline-none rounded-lg resize-none"
          />
          <button onClick={savePhysicalNotes} disabled={savingNotes} className="w-full h-[48px] gold-gradient text-on-gold font-semibold rounded-xl text-[16px] disabled:opacity-50">
            {savingNotes ? "Saving..." : "Save Notes"}
          </button>
        </div>

        {/* Upload */}
        <div className="pt-4 border-t border-outline/10 space-y-3">
          <p className="text-gold text-[11px] uppercase tracking-widest flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm" style={ICON_STYLE}>cloud_upload</span>
            Upload Reference Photo
          </p>
          <form onSubmit={handleUpload} className="space-y-3">
            <div>
              <label className="text-on-surface-variant text-[13px] mb-1.5 block">Category</label>
              <CustomSelect
                value={selectedType}
                onChange={(v) => setSelectedType(v)}
                options={ASSET_TYPES.map((t) => ({ value: t.value, label: t.label }))}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-on-surface-variant text-[13px] mb-1.5 block">Image</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="block w-full text-[16px] text-on-surface-variant
                  file:mr-4 file:py-2.5 file:px-4
                  file:rounded-xl file:border-0
                  file:text-[16px] file:font-medium
                  file:bg-surface-container file:text-on-surface
                  file:cursor-pointer"
              />
            </div>
            {error && <p className="text-error-red text-[13px]">{error}</p>}
            <button
              type="submit"
              disabled={uploading}
              className="w-full min-h-[48px] gold-gradient text-on-gold font-semibold rounded-xl text-[16px] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <span className="material-symbols-outlined text-base animate-spin" style={ICON_STYLE}>progress_activity</span>
                  Uploading...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base" style={ICON_STYLE}>cloud_upload</span>
                  Upload Photo
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </SectionCard>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 4: Approved Type
   ═══════════════════════════════════════════════════════════════════ */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TabApprovedType({ approvedType }: { approvedType: any }) {
  const data = approvedType ?? {};

  return (
    <SectionCard icon="verified" title="Approved Type">
      <div className="space-y-5 px-4">
        <div>
          <p className="text-gold text-[11px] uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm" style={ICON_STYLE}>category</span>
            Target Archetype
          </p>
          <p className="text-on-surface text-[16px] leading-relaxed font-heading">
            {data.target_archetype ?? <span className="text-on-surface-variant/40">&mdash;</span>}
          </p>
        </div>
        <div>
          <p className="text-gold text-[11px] uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm" style={ICON_STYLE}>priority_high</span>
            What to Prioritize
          </p>
          <p className="text-on-surface text-[16px] leading-relaxed">
            {data.what_to_prioritize ?? <span className="text-on-surface-variant/40">&mdash;</span>}
          </p>
        </div>
        <div>
          <p className="text-gold text-[11px] uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm" style={ICON_STYLE}>do_not_disturb</span>
            What to Avoid
          </p>
          <p className="text-on-surface text-[16px] leading-relaxed">
            {data.what_to_avoid ?? <span className="text-on-surface-variant/40">&mdash;</span>}
          </p>
        </div>
        <div>
          <p className="text-gold text-[11px] uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm" style={ICON_STYLE}>target</span>
            Targeting Notes
          </p>
          <p className="text-on-surface text-[16px] leading-relaxed">
            {data.targeting_notes ?? <span className="text-on-surface-variant/40">&mdash;</span>}
          </p>
        </div>
      </div>
    </SectionCard>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 5: Candidates
   ═══════════════════════════════════════════════════════════════════ */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CandidateCard({ candidate }: { candidate: any }) {
  const status = statusConfig[candidate.status] ?? statusConfig.candidate;

  return (
    <div className="relative rounded-2xl overflow-hidden">
      {candidate.photo_url ? (
        <Image
          src={candidate.photo_url}
          alt={candidate.name || "Candidate"}
          width={400}
          height={500}
          className="w-full h-[300px] object-cover"
        />
      ) : (
        <div className="w-full h-[300px] bg-surface-container-high flex items-center justify-center">
          <span className="material-symbols-outlined text-5xl text-outline/30" style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>person</span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
      <div className="absolute bottom-0 left-0 p-4 w-full">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-gold-light font-heading text-xl font-bold">{candidate.name || "Unknown"}</p>
            <p className="text-on-surface-variant text-[13px] uppercase tracking-widest mt-0.5">
              {[candidate.archetype_descriptor, candidate.age ? `${candidate.age}` : null].filter(Boolean).join(", ")}
            </p>
            {candidate.dating_apps?.app_name && (
              <p className="text-outline text-[10px] uppercase tracking-widest mt-0.5">via {candidate.dating_apps.app_name}</p>
            )}
          </div>
          <Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-widest backdrop-blur-md px-2.5 py-1 rounded-full ${status.className}`}>
            {status.label}
          </Badge>
        </div>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TabCandidates({ candidates }: { candidates: any[] }) {
  const activeCandidates = candidates.filter((c) => c.status !== "archived" && c.status !== "declined");

  return (
    <SectionCard icon="group" title="Candidates">
      <div className="px-4">
        {candidates.length === 0 ? (
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-4xl text-outline/30 mb-3 block" style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>group</span>
            <p className="text-on-surface-variant/60 text-[16px]">No candidates in the pipeline yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-on-surface-variant text-[11px] uppercase tracking-[0.2em] text-right">
              Active: {String(activeCandidates.length).padStart(2, "0")} / Total: {String(candidates.length).padStart(2, "0")}
            </p>
            {candidates.map((candidate) => (
              <CandidateCard key={candidate.id} candidate={candidate} />
            ))}
          </div>
        )}
      </div>
    </SectionCard>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 6: Venues
   ═══════════════════════════════════════════════════════════════════ */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TabVenues({ venues }: { venues: any[] }) {
  const activeVenues = venues.filter((v: any) => v.is_active && !v.is_avoided);
  const avoidedVenues = venues.filter((v: any) => v.is_avoided);

  return (
    <SectionCard icon="pin_drop" title="Venues">
      <div className="px-4">
        {activeVenues.length === 0 && avoidedVenues.length === 0 ? (
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-4xl text-outline/30 mb-3 block" style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>pin_drop</span>
            <p className="text-on-surface-variant/60 text-[16px]">No venues added yet.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {activeVenues.length > 0 && (
              <div>
                <p className="text-gold text-[11px] uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm" style={ICON_STYLE}>check_circle</span>
                  Approved Venues
                </p>
                <div className="space-y-2">
                  {activeVenues.map((venue: any) => (
                    <div key={venue.id} className="bg-surface-container rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-gold text-lg mt-0.5 flex-shrink-0" style={ICON_STYLE}>restaurant</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-on-surface text-[16px] font-medium font-heading">{venue.name}</p>
                          <p className="text-on-surface-variant text-[13px] mt-0.5">
                            {[venue.neighborhood, venue.vibe, venue.date_type].filter(Boolean).join(" \u00B7 ")}
                          </p>
                          {venue.notes && (
                            <p className="text-on-surface-variant text-[13px] mt-2">{venue.notes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {avoidedVenues.length > 0 && (
              <div>
                <p className="text-error-red text-[11px] uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm" style={ICON_STYLE}>block</span>
                  Avoided Venues
                </p>
                <div className="space-y-2">
                  {avoidedVenues.map((venue: any) => (
                    <div key={venue.id} className="bg-surface-container p-3 rounded-xl flex items-center gap-3 opacity-60">
                      <span className="material-symbols-outlined text-error-red text-[16px]" style={ICON_STYLE}>block</span>
                      <span className="text-on-surface-variant text-[16px]">{venue.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </SectionCard>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════ */

export function PreferencesMobile({
  clientId,
  onboarding,
  preferences,
  preferenceAssets,
  approvedType,
  candidates,
  datingApps,
  venues,
  availability,
  searchAreas,
  approvedDates,
  declinedDates,
}: PreferencesMobileProps) {
  const [activeTab, setActiveTab] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="pb-8">
      {/* ── Tab bar (matches desktop) ── */}
      <div className="px-4 pt-2 pb-2">
        <div className="flex rounded-xl bg-surface-container-low p-1 gap-1">
          {TABS.map((tab, i) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(i)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-lg text-[13px] font-medium transition-all duration-200 min-h-[48px] ${
                activeTab === i
                  ? "bg-gold/10 text-gold"
                  : "text-on-surface-variant"
              }`}
            >
              <span
                className="material-symbols-outlined text-lg"
                style={{ fontVariationSettings: activeTab === i ? "'FILL' 1, 'wght' 400" : "'FILL' 0, 'wght' 300" }}
              >
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content Area ── */}
      <div className="mt-3 px-0">
        {activeTab === 0 && (
          <TabAboutYou onboarding={onboarding} clientId={clientId} />
        )}
        {activeTab === 1 && (
          <>
            <TabWhatHeWants preferences={preferences} clientId={clientId} />
            <div className="mt-4">
              <TabVisualPreferences assets={preferenceAssets} clientId={clientId} />
            </div>
            {(approvedDates.length > 0 || declinedDates.length > 0) && (
              <div className="mt-4">
                <SectionCard icon="history" title="Date History">
                  <DateHistorySlider
                    approvedDates={approvedDates}
                    declinedDates={declinedDates}
                    preferences={preferences}
                    isMobile
                  />
                </SectionCard>
              </div>
            )}
          </>
        )}
        {activeTab === 2 && (
          <>
            <TabLogistics onboarding={onboarding} clientId={clientId} availability={availability} searchAreas={searchAreas} />
          </>
        )}
      </div>

    </div>
  );
}
