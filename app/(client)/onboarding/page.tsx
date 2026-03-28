"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MultiSelectPills, SingleSelectPills } from "@/components/ui/multi-select-pills";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface FormData {
  // Section A – About You
  full_name: string;
  age: number | "";
  city: string;
  neighborhood: string;
  profession: string;
  title: string;
  height_inches: number | "";
  own_ethnicity: string;
  own_body_type: string;
  dating_apps_used: string[];
  dating_apps_open_to: string[];
  hobbies_and_interests: string[];
  surprising_fact: string;
  personality_summary: string;
  lifestyle_notes: string;

  // Section B – Your Type
  target_age_min: number | "";
  target_age_max: number | "";
  target_max_distance_miles: number | "";
  target_physical_preferences: {
    height: string;
    body_types: string[];
    ethnicities: string[];
  };
  target_education_preference: string;
  target_profession_preferences: string[];
  target_deal_breakers: string[];
  target_relationship_intent: string;
  target_date_frequency: string;

  // Section C – Logistics
  days_available: string[];
  preferred_date_times: string[];
  blackout_dates: string[];
  preferred_first_date_style: string;
  preferred_neighborhoods: string[];
  venues_to_use: string[];
  venues_to_avoid: string[];
  budget_comfort: string;
  preferred_communication_channel: string;
  communication_channel_verified: boolean;
  target_30_day_outcome: string;
  prior_matchmaker_experience: string;
  anything_else: string;

  // Section D – Final Details
  ai_enhancement_consent: boolean;
  photo_exclusions: string[];
  previous_apps: string[];
  previous_services: string[];
}

const ETHNICITY_OPTIONS = [
  "White / Caucasian",
  "Black / African American",
  "East Asian (Chinese, Japanese, Korean)",
  "South Asian (Indian, Pakistani, Bengali)",
  "Southeast Asian (Filipino, Vietnamese, Thai)",
  "Middle Eastern / North African",
  "Hispanic / Latino",
  "Pacific Islander",
  "Mixed / Multiracial",
  "Other",
  "No Preference",
];

const BODY_TYPE_OPTIONS = [
  "Slim",
  "Athletic / Fit",
  "Average",
  "Curvy",
  "Muscular",
  "Plus Size",
  "Petite",
  "No Preference",
];

const INITIAL_DATA: FormData = {
  full_name: "",
  age: "",
  city: "",
  neighborhood: "",
  profession: "",
  title: "",
  height_inches: "",
  own_ethnicity: "",
  own_body_type: "",
  dating_apps_used: [],
  dating_apps_open_to: [],
  hobbies_and_interests: [],
  surprising_fact: "",
  personality_summary: "",
  lifestyle_notes: "",

  target_age_min: "",
  target_age_max: "",
  target_max_distance_miles: "",
  target_physical_preferences: { height: "", body_types: [], ethnicities: [] },
  target_education_preference: "",
  target_profession_preferences: [],
  target_deal_breakers: [],
  target_relationship_intent: "",
  target_date_frequency: "",

  days_available: [],
  preferred_date_times: [],
  blackout_dates: [],
  preferred_first_date_style: "",
  preferred_neighborhoods: [],
  venues_to_use: [],
  venues_to_avoid: [],
  budget_comfort: "",
  preferred_communication_channel: "text",
  communication_channel_verified: false,
  target_30_day_outcome: "",
  prior_matchmaker_experience: "",
  anything_else: "",

  ai_enhancement_consent: true,
  photo_exclusions: [],
  previous_apps: [],
  previous_services: [],
};

const STEPS = [
  { label: "About You", icon: "person" },
  { label: "Your Type", icon: "favorite" },
  { label: "Logistics", icon: "calendar_month" },
  { label: "Final Details", icon: "verified" },
];

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const COMM_CHANNELS = [
  { value: "text", label: "Text Message" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "slack", label: "Slack" },
  { value: "email", label: "Email" },
];

/* ------------------------------------------------------------------ */
/*  Tag Input Component                                                */
/* ------------------------------------------------------------------ */

function TagInput({
  label,
  values,
  onChange,
  placeholder,
  icon,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  icon?: string;
}) {
  const [input, setInput] = useState("");

  const add = () => {
    const trimmed = input.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
      setInput("");
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-gold text-xs uppercase tracking-wider flex items-center gap-1.5">
        {icon && (
          <span
            className="material-symbols-outlined text-sm"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
          >
            {icon}
          </span>
        )}
        {label}
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="flex-1 bg-surface-container border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface text-sm placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-gold/40 transition"
        />
        <button
          type="button"
          onClick={add}
          className="px-4 py-3 bg-surface-container-high border border-outline-variant/20 rounded-xl text-gold text-sm font-medium hover:bg-surface-container-highest transition"
        >
          Add
        </button>
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {values.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1.5 bg-gold/10 text-gold text-xs px-3 py-1.5 rounded-full border border-gold/20"
            >
              {v}
              <button
                type="button"
                onClick={() => onChange(values.filter((x) => x !== v))}
                className="hover:text-error-red transition"
              >
                <span
                  className="material-symbols-outlined text-sm"
                  style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
                >
                  close
                </span>
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Text Field                                                         */
/* ------------------------------------------------------------------ */

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  icon,
}: {
  label: string;
  value: string | number | "";
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  icon?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-gold text-xs uppercase tracking-wider flex items-center gap-1.5">
        {icon && (
          <span
            className="material-symbols-outlined text-sm"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
          >
            {icon}
          </span>
        )}
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface text-sm placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-gold/40 transition"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  TextArea Field                                                     */
/* ------------------------------------------------------------------ */

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  icon?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-gold text-xs uppercase tracking-wider flex items-center gap-1.5">
        {icon && (
          <span
            className="material-symbols-outlined text-sm"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
          >
            {icon}
          </span>
        )}
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface text-sm placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-gold/40 transition resize-none"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Select Field                                                       */
/* ------------------------------------------------------------------ */

function SelectField({
  label,
  value,
  onChange,
  options,
  icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  icon?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-gold text-xs uppercase tracking-wider flex items-center gap-1.5">
        {icon && (
          <span
            className="material-symbols-outlined text-sm"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
          >
            {icon}
          </span>
        )}
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-gold/40 transition appearance-none"
      >
        <option value="">Select...</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Toggle Chip (for days, etc)                                        */
/* ------------------------------------------------------------------ */

function ToggleChips({
  label,
  options,
  selected,
  onChange,
  icon,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
  icon?: string;
}) {
  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((s) => s !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-gold text-xs uppercase tracking-wider flex items-center gap-1.5">
        {icon && (
          <span
            className="material-symbols-outlined text-sm"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
          >
            {icon}
          </span>
        )}
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                active
                  ? "bg-gold/15 text-gold border-gold/30"
                  : "bg-surface-container border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Checkbox Field                                                     */
/* ------------------------------------------------------------------ */

function CheckboxField({
  label,
  checked,
  onChange,
  description,
  icon,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  description?: string;
  icon?: string;
}) {
  return (
    <div
      className="flex items-start gap-3 cursor-pointer"
      onClick={() => onChange(!checked)}
    >
      <div
        className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition flex-shrink-0 ${
          checked
            ? "bg-gold border-gold"
            : "bg-surface-container border-outline-variant/30"
        }`}
      >
        {checked && (
          <span
            className="material-symbols-outlined text-on-gold text-sm"
            style={{ fontVariationSettings: "'FILL' 1, 'wght' 500" }}
          >
            check
          </span>
        )}
      </div>
      <div>
        <span className="text-gold text-xs uppercase tracking-wider flex items-center gap-1.5">
          {icon && (
            <span
              className="material-symbols-outlined text-sm"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
            >
              {icon}
            </span>
          )}
          {label}
        </span>
        {description && (
          <p className="text-on-surface-variant text-xs mt-1">{description}</p>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(INITIAL_DATA);
  const [clientId, setClientId] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ---- Init: load user, client, existing data ---- */
  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("auth_user_id", user.id)
        .single();

      if (!profile) {
        router.push("/login");
        return;
      }

      setProfileId(profile.id);

      const { data: client } = await supabase
        .from("clients")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

      if (!client) {
        setError("Client record not found. Please contact your matchmaker.");
        setLoading(false);
        return;
      }

      setClientId(client.id);

      // Load existing onboarding data if any
      const { data: existing } = await supabase
        .from("onboarding_data")
        .select("*")
        .eq("client_id", client.id)
        .single();

      if (existing) {
        setForm((prev) => ({
          ...prev,
          full_name: existing.full_name ?? prev.full_name,
          age: existing.age ?? prev.age,
          city: existing.city ?? prev.city,
          neighborhood: existing.neighborhood ?? prev.neighborhood,
          profession: existing.profession ?? prev.profession,
          title: existing.title ?? prev.title,
          height_inches: existing.height_inches ?? prev.height_inches,
          own_ethnicity: existing.own_ethnicity ?? prev.own_ethnicity,
          own_body_type: existing.own_body_type ?? prev.own_body_type,
          dating_apps_used: existing.dating_apps_used ?? prev.dating_apps_used,
          dating_apps_open_to:
            existing.dating_apps_open_to ?? prev.dating_apps_open_to,
          hobbies_and_interests:
            existing.hobbies_and_interests ?? prev.hobbies_and_interests,
          surprising_fact: existing.surprising_fact ?? prev.surprising_fact,
          personality_summary:
            existing.personality_summary ?? prev.personality_summary,
          lifestyle_notes: existing.lifestyle_notes ?? prev.lifestyle_notes,
          target_age_min: existing.target_age_min ?? prev.target_age_min,
          target_age_max: existing.target_age_max ?? prev.target_age_max,
          target_max_distance_miles:
            existing.target_max_distance_miles ??
            prev.target_max_distance_miles,
          target_physical_preferences: {
            height: existing.target_physical_preferences?.height ?? prev.target_physical_preferences.height,
            body_types: existing.target_physical_preferences?.body_types ??
              (existing.target_physical_preferences?.body_type ? [existing.target_physical_preferences.body_type] : prev.target_physical_preferences.body_types),
            ethnicities: existing.target_physical_preferences?.ethnicities ??
              (existing.target_physical_preferences?.ethnicity ? [existing.target_physical_preferences.ethnicity] : prev.target_physical_preferences.ethnicities),
          },
          target_education_preference:
            existing.target_education_preference ??
            prev.target_education_preference,
          target_profession_preferences:
            existing.target_profession_preferences ??
            prev.target_profession_preferences,
          target_deal_breakers:
            existing.target_deal_breakers ?? prev.target_deal_breakers,
          target_relationship_intent:
            existing.target_relationship_intent ??
            prev.target_relationship_intent,
          target_date_frequency:
            existing.target_date_frequency ?? prev.target_date_frequency,
          days_available: existing.days_available ?? prev.days_available,
          preferred_date_times:
            existing.preferred_date_times ?? prev.preferred_date_times,
          blackout_dates: existing.blackout_dates ?? prev.blackout_dates,
          preferred_first_date_style:
            existing.preferred_first_date_style ??
            prev.preferred_first_date_style,
          preferred_neighborhoods:
            existing.preferred_neighborhoods ?? prev.preferred_neighborhoods,
          venues_to_use: existing.venues_to_use ?? prev.venues_to_use,
          venues_to_avoid: existing.venues_to_avoid ?? prev.venues_to_avoid,
          budget_comfort: existing.budget_comfort ?? prev.budget_comfort,
          preferred_communication_channel:
            existing.preferred_communication_channel ??
            prev.preferred_communication_channel,
          communication_channel_verified:
            existing.communication_channel_verified ??
            prev.communication_channel_verified,
          target_30_day_outcome:
            existing.target_30_day_outcome ?? prev.target_30_day_outcome,
          prior_matchmaker_experience:
            existing.prior_matchmaker_experience ??
            prev.prior_matchmaker_experience,
          anything_else: existing.anything_else ?? prev.anything_else,
          ai_enhancement_consent:
            existing.ai_enhancement_consent ?? prev.ai_enhancement_consent,
          photo_exclusions:
            existing.photo_exclusions ?? prev.photo_exclusions,
          previous_apps: existing.previous_apps ?? prev.previous_apps,
          previous_services:
            existing.previous_services ?? prev.previous_services,
        }));
      } else {
        // Pre-fill name from profile
        setForm((prev) => ({
          ...prev,
          full_name: profile.full_name || "",
        }));
      }

      setLoading(false);
    }

    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---- Update helpers ---- */
  const updateField = useCallback(
    <K extends keyof FormData>(key: K, value: FormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const updatePhysicalPref = useCallback(
    (key: string, value: string | string[]) => {
      setForm((prev) => ({
        ...prev,
        target_physical_preferences: {
          ...prev.target_physical_preferences,
          [key]: value,
        },
      }));
    },
    []
  );

  /* ---- Submit ---- */
  const handleSubmit = async () => {
    if (!clientId || !profileId) return;
    setSubmitting(true);
    setError(null);

    // Build payload — convert "" to null for integer fields
    const payload = {
      client_id: clientId,
      full_name: form.full_name || null,
      age: form.age === "" ? null : Number(form.age),
      city: form.city || null,
      neighborhood: form.neighborhood || null,
      profession: form.profession || null,
      title: form.title || null,
      height_inches: form.height_inches === "" ? null : Number(form.height_inches),
      own_ethnicity: form.own_ethnicity || null,
      own_body_type: form.own_body_type || null,
      dating_apps_used: form.dating_apps_used,
      dating_apps_open_to: form.dating_apps_open_to,
      hobbies_and_interests: form.hobbies_and_interests,
      surprising_fact: form.surprising_fact || null,
      personality_summary: form.personality_summary || null,
      lifestyle_notes: form.lifestyle_notes || null,
      target_age_min: form.target_age_min === "" ? null : Number(form.target_age_min),
      target_age_max: form.target_age_max === "" ? null : Number(form.target_age_max),
      target_max_distance_miles:
        form.target_max_distance_miles === ""
          ? null
          : Number(form.target_max_distance_miles),
      target_physical_preferences: form.target_physical_preferences,
      target_education_preference: form.target_education_preference || null,
      target_profession_preferences: form.target_profession_preferences,
      target_deal_breakers: form.target_deal_breakers,
      target_relationship_intent: form.target_relationship_intent || null,
      target_date_frequency: form.target_date_frequency || null,
      days_available: form.days_available,
      preferred_date_times: form.preferred_date_times,
      blackout_dates: form.blackout_dates,
      preferred_first_date_style: form.preferred_first_date_style || null,
      preferred_neighborhoods: form.preferred_neighborhoods,
      venues_to_use: form.venues_to_use,
      venues_to_avoid: form.venues_to_avoid,
      budget_comfort: form.budget_comfort || null,
      preferred_communication_channel:
        form.preferred_communication_channel || null,
      communication_channel_verified: form.communication_channel_verified,
      target_30_day_outcome: form.target_30_day_outcome || null,
      prior_matchmaker_experience: form.prior_matchmaker_experience || null,
      anything_else: form.anything_else || null,
      ai_enhancement_consent: form.ai_enhancement_consent,
      photo_exclusions: form.photo_exclusions,
      previous_apps: form.previous_apps,
      previous_services: form.previous_services,
    };

    // Upsert onboarding_data
    const { error: upsertErr } = await supabase
      .from("onboarding_data")
      .upsert(payload, { onConflict: "client_id" });

    if (upsertErr) {
      setError(upsertErr.message);
      setSubmitting(false);
      return;
    }

    // Update clients.onboarding_status
    const { error: clientErr } = await supabase
      .from("clients")
      .update({ onboarding_status: "completed" })
      .eq("id", clientId);

    if (clientErr) {
      setError(clientErr.message);
      setSubmitting(false);
      return;
    }

    // Update profiles.setup_complete
    const { error: profileErr } = await supabase
      .from("profiles")
      .update({ setup_complete: true })
      .eq("id", profileId);

    if (profileErr) {
      setError(profileErr.message);
      setSubmitting(false);
      return;
    }

    // Create alert for admin/matchmaker: new client onboarded
    const clientName = form.full_name || "Unknown";
    await supabase.from("alerts").insert({
      client_id: clientId,
      alert_type: "onboarding_incomplete",
      title: "New client onboarded",
      message: `Client ${clientName} has completed onboarding and is ready for matchmaker assignment`,
    });

    // Create initial action item for matchmaker review
    await supabase.from("actions").insert({
      client_id: clientId,
      title: "Review onboarding data",
      description:
        "New client has completed onboarding. Review preferences, photos needed, and app setup.",
      status: "open",
      priority: "high",
      created_by: profileId,
    });

    // Navigate to portal
    router.push("/portal");
    router.refresh();
  };

  /* ---- Loading / Error states ---- */
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span
            className="material-symbols-outlined text-gold text-4xl animate-spin"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
          >
            progress_activity
          </span>
          <p className="text-on-surface-variant text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !clientId) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-surface-container-low rounded-2xl p-8 max-w-md text-center space-y-4">
          <span
            className="material-symbols-outlined text-error-red text-4xl"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
          >
            error
          </span>
          <p className="text-on-surface-variant">{error}</p>
        </div>
      </div>
    );
  }

  /* ---- Step content renderers ---- */
  const renderStep0 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TextField
          label="Full Name"
          value={form.full_name}
          onChange={(v) => updateField("full_name", v)}
          placeholder="John Smith"
          icon="badge"
        />
        <TextField
          label="Age"
          value={form.age}
          onChange={(v) => updateField("age", v === "" ? "" : Number(v) as any)}
          placeholder="32"
          type="number"
          icon="cake"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TextField
          label="City"
          value={form.city}
          onChange={(v) => updateField("city", v)}
          placeholder="New York"
          icon="location_city"
        />
        <TextField
          label="Neighborhood"
          value={form.neighborhood}
          onChange={(v) => updateField("neighborhood", v)}
          placeholder="West Village"
          icon="pin_drop"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TextField
          label="Profession"
          value={form.profession}
          onChange={(v) => updateField("profession", v)}
          placeholder="Software Engineer"
          icon="work"
        />
        <TextField
          label="Title"
          value={form.title}
          onChange={(v) => updateField("title", v)}
          placeholder="Senior Director"
          icon="badge"
        />
      </div>
      <TextField
        label="Height (inches)"
        value={form.height_inches}
        onChange={(v) =>
          updateField("height_inches", v === "" ? "" : Number(v) as any)
        }
        placeholder="72"
        type="number"
        icon="height"
      />
      <SingleSelectPills
        label="Your Ethnicity"
        icon="diversity_3"
        options={ETHNICITY_OPTIONS}
        selected={form.own_ethnicity}
        onChange={(v) => updateField("own_ethnicity", v)}
      />
      <SingleSelectPills
        label="Your Body Type"
        icon="accessibility_new"
        options={BODY_TYPE_OPTIONS}
        selected={form.own_body_type}
        onChange={(v) => updateField("own_body_type", v)}
      />
      <TagInput
        label="Dating Apps Used"
        values={form.dating_apps_used}
        onChange={(v) => updateField("dating_apps_used", v)}
        placeholder="Hinge, Bumble..."
        icon="apps"
      />
      <TagInput
        label="Dating Apps Open To"
        values={form.dating_apps_open_to}
        onChange={(v) => updateField("dating_apps_open_to", v)}
        placeholder="Raya, The League..."
        icon="add_circle"
      />
      <TagInput
        label="Hobbies & Interests"
        values={form.hobbies_and_interests}
        onChange={(v) => updateField("hobbies_and_interests", v)}
        placeholder="Tennis, cooking..."
        icon="interests"
      />
      <TextAreaField
        label="Surprising Fact"
        value={form.surprising_fact}
        onChange={(v) => updateField("surprising_fact", v)}
        placeholder="Something unexpected about you..."
        icon="auto_awesome"
      />
      <TextAreaField
        label="Personality Summary"
        value={form.personality_summary}
        onChange={(v) => updateField("personality_summary", v)}
        placeholder="How would your friends describe you?"
        icon="psychology"
      />
      <TextAreaField
        label="Lifestyle Notes"
        value={form.lifestyle_notes}
        onChange={(v) => updateField("lifestyle_notes", v)}
        placeholder="Work/life balance, travel frequency..."
        icon="self_improvement"
      />
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TextField
          label="Minimum Age"
          value={form.target_age_min}
          onChange={(v) =>
            updateField("target_age_min", v === "" ? "" : Number(v) as any)
          }
          placeholder="25"
          type="number"
          icon="arrow_downward"
        />
        <TextField
          label="Maximum Age"
          value={form.target_age_max}
          onChange={(v) =>
            updateField("target_age_max", v === "" ? "" : Number(v) as any)
          }
          placeholder="35"
          type="number"
          icon="arrow_upward"
        />
        <TextField
          label="Max Distance (miles)"
          value={form.target_max_distance_miles}
          onChange={(v) =>
            updateField(
              "target_max_distance_miles",
              v === "" ? "" : Number(v) as any
            )
          }
          placeholder="15"
          type="number"
          icon="social_distance"
        />
      </div>

      <div className="space-y-4 bg-surface-container-low rounded-2xl p-4">
        <p className="text-gold text-xs uppercase tracking-wider flex items-center gap-1.5">
          <span
            className="material-symbols-outlined text-sm"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
          >
            body_system
          </span>
          Physical Preferences
        </p>
        <TextField
          label="Height Preference"
          value={form.target_physical_preferences.height}
          onChange={(v) => updatePhysicalPref("height", v)}
          placeholder={"e.g. 5'4\" - 5'8\""}
        />
        <MultiSelectPills
          label="Body Types You're Attracted To"
          icon="accessibility_new"
          options={BODY_TYPE_OPTIONS}
          selected={form.target_physical_preferences.body_types}
          onChange={(v) => updatePhysicalPref("body_types", v)}
        />
        <MultiSelectPills
          label="Ethnicities You're Open To"
          icon="diversity_3"
          options={ETHNICITY_OPTIONS}
          selected={form.target_physical_preferences.ethnicities}
          onChange={(v) => updatePhysicalPref("ethnicities", v)}
        />
      </div>

      <TextField
        label="Education Preference"
        value={form.target_education_preference}
        onChange={(v) => updateField("target_education_preference", v)}
        placeholder="Bachelor's or higher"
        icon="school"
      />
      <TagInput
        label="Profession Preferences"
        values={form.target_profession_preferences}
        onChange={(v) => updateField("target_profession_preferences", v)}
        placeholder="Creative, finance..."
        icon="work"
      />
      <TagInput
        label="Deal Breakers"
        values={form.target_deal_breakers}
        onChange={(v) => updateField("target_deal_breakers", v)}
        placeholder="Smoking, no ambition..."
        icon="block"
      />
      <TextField
        label="Relationship Intent"
        value={form.target_relationship_intent}
        onChange={(v) => updateField("target_relationship_intent", v)}
        placeholder="Long-term relationship"
        icon="favorite"
      />
      <TextField
        label="Date Frequency"
        value={form.target_date_frequency}
        onChange={(v) => updateField("target_date_frequency", v)}
        placeholder="2-3 per week"
        icon="event_repeat"
      />
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <ToggleChips
        label="Days Available"
        options={DAYS}
        selected={form.days_available}
        onChange={(v) => updateField("days_available", v)}
        icon="calendar_today"
      />
      <TagInput
        label="Preferred Date Times"
        values={form.preferred_date_times}
        onChange={(v) => updateField("preferred_date_times", v)}
        placeholder="Evenings after 7pm..."
        icon="schedule"
      />
      <TagInput
        label="Blackout Dates"
        values={form.blackout_dates}
        onChange={(v) => updateField("blackout_dates", v)}
        placeholder="2026-04-15..."
        icon="event_busy"
      />
      <TextField
        label="Preferred First Date Style"
        value={form.preferred_first_date_style}
        onChange={(v) => updateField("preferred_first_date_style", v)}
        placeholder="Cocktails, coffee, dinner..."
        icon="local_bar"
      />
      <TagInput
        label="Preferred Neighborhoods"
        values={form.preferred_neighborhoods}
        onChange={(v) => updateField("preferred_neighborhoods", v)}
        placeholder="West Village, SoHo..."
        icon="map"
      />
      <TagInput
        label="Venues to Use"
        values={form.venues_to_use}
        onChange={(v) => updateField("venues_to_use", v)}
        placeholder="Dante, Via Carota..."
        icon="restaurant"
      />
      <TagInput
        label="Venues to Avoid"
        values={form.venues_to_avoid}
        onChange={(v) => updateField("venues_to_avoid", v)}
        placeholder="Places you'd rather skip..."
        icon="not_interested"
      />
      <TextField
        label="Budget Comfort"
        value={form.budget_comfort}
        onChange={(v) => updateField("budget_comfort", v)}
        placeholder="$100-200 per date"
        icon="payments"
      />
      <SelectField
        label="Preferred Communication Channel"
        value={form.preferred_communication_channel}
        onChange={(v) => updateField("preferred_communication_channel", v)}
        options={COMM_CHANNELS}
        icon="chat"
      />
      <CheckboxField
        label="Communication Channel Verified"
        checked={form.communication_channel_verified}
        onChange={(v) => updateField("communication_channel_verified", v)}
        description="I confirm my preferred communication channel is set up and ready to use."
        icon="verified"
      />
      <TextAreaField
        label="30-Day Outcome Goal"
        value={form.target_30_day_outcome}
        onChange={(v) => updateField("target_30_day_outcome", v)}
        placeholder="What does success look like in your first month?"
        icon="flag"
      />
      <TextAreaField
        label="Prior Matchmaker Experience"
        value={form.prior_matchmaker_experience}
        onChange={(v) => updateField("prior_matchmaker_experience", v)}
        placeholder="Have you used a matchmaker before? How was it?"
        icon="history"
      />
      <TextAreaField
        label="Anything Else"
        value={form.anything_else}
        onChange={(v) => updateField("anything_else", v)}
        placeholder="Anything we should know..."
        icon="more_horiz"
      />
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <CheckboxField
        label="AI Enhancement Consent"
        checked={form.ai_enhancement_consent}
        onChange={(v) => updateField("ai_enhancement_consent", v)}
        description="I consent to AI-powered profile enhancement, including copywriting assistance and photo selection suggestions."
        icon="smart_toy"
      />
      <TagInput
        label="Photo Exclusions"
        values={form.photo_exclusions}
        onChange={(v) => updateField("photo_exclusions", v)}
        placeholder="Photos you don't want used..."
        icon="hide_image"
      />
      <TagInput
        label="Previous Dating Apps"
        values={form.previous_apps}
        onChange={(v) => updateField("previous_apps", v)}
        placeholder="Hinge, Bumble..."
        icon="apps"
      />
      <TagInput
        label="Previous Dating Services"
        values={form.previous_services}
        onChange={(v) => updateField("previous_services", v)}
        placeholder="Three Day Rule, Tawkify..."
        icon="support_agent"
      />
    </div>
  );

  const stepRenderers = [renderStep0, renderStep1, renderStep2, renderStep3];

  /* ---- Render ---- */
  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="font-heading text-3xl font-bold text-gold tracking-tight">
          Welcome Aboard
        </h1>
        <p className="text-on-surface-variant text-sm">
          Tell us about yourself so we can find your perfect match.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-4">
        {/* Step indicators */}
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => (
            <div key={s.label} className="flex items-center flex-1 last:flex-none">
              <button
                type="button"
                onClick={() => i <= step && setStep(i)}
                className={`flex items-center gap-2 transition ${
                  i <= step ? "cursor-pointer" : "cursor-default"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    i < step
                      ? "gold-gradient text-on-gold"
                      : i === step
                      ? "bg-gold/15 text-gold border-2 border-gold"
                      : "bg-surface-container border border-outline-variant/30 text-on-surface-variant"
                  }`}
                >
                  {i < step ? (
                    <span
                      className="material-symbols-outlined text-lg"
                      style={{ fontVariationSettings: "'FILL' 1, 'wght' 500" }}
                    >
                      check
                    </span>
                  ) : (
                    <span
                      className="material-symbols-outlined text-lg"
                      style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
                    >
                      {s.icon}
                    </span>
                  )}
                </div>
                <span
                  className={`text-xs font-medium hidden sm:block ${
                    i <= step ? "text-gold" : "text-on-surface-variant/50"
                  }`}
                >
                  {s.label}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <div className="flex-1 mx-3 hidden sm:block">
                  <div
                    className={`h-px transition-all ${
                      i < step ? "bg-gold/40" : "bg-outline-variant/20"
                    }`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bar */}
        <div className="h-1 bg-surface-container-high rounded-full overflow-hidden">
          <div
            className="h-full gold-gradient rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-surface-container-low rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-2">
          <span
            className="material-symbols-outlined text-gold text-xl"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
          >
            {STEPS[step].icon}
          </span>
          <h2 className="font-heading text-xl font-semibold text-on-surface">
            {STEPS[step].label}
          </h2>
          <span className="text-on-surface-variant text-xs ml-auto">
            Step {step + 1} of {STEPS.length}
          </span>
        </div>

        {stepRenderers[step]()}

        {/* Error display */}
        {error && (
          <div className="bg-error-container/20 border border-error-red/30 rounded-xl p-4 flex items-center gap-3">
            <span
              className="material-symbols-outlined text-error-red"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
            >
              error
            </span>
            <p className="text-error-red text-sm">{error}</p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-outline-variant/10">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition ${
              step === 0
                ? "text-on-surface-variant/30 cursor-not-allowed"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
            }`}
          >
            <span
              className="material-symbols-outlined text-lg"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
            >
              arrow_back
            </span>
            Back
          </button>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
              className="flex items-center gap-2 gold-gradient text-on-gold font-semibold rounded-full px-8 py-3 text-sm hover:opacity-90 transition"
            >
              Next
              <span
                className="material-symbols-outlined text-lg"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
              >
                arrow_forward
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 gold-gradient text-on-gold font-semibold rounded-full px-8 py-3 text-sm hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <span
                    className="material-symbols-outlined text-lg animate-spin"
                    style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
                  >
                    progress_activity
                  </span>
                  Submitting...
                </>
              ) : (
                <>
                  Complete Setup
                  <span
                    className="material-symbols-outlined text-lg"
                    style={{ fontVariationSettings: "'FILL' 1, 'wght' 500" }}
                  >
                    check_circle
                  </span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
