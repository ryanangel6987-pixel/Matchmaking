"use client";

import { useState, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface PreferencesEditorProps {
  clientId: string;
  preferences: any | null;
}

function TagInput({ label, tags, onChange }: { label: string; tags: string[]; onChange: (tags: string[]) => void }) {
  const [input, setInput] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const value = input.trim();
      if (value && !tags.includes(value)) {
        onChange([...tags, value]);
      }
      setInput("");
    }
    if (e.key === "Backspace" && input === "" && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <Label className="text-gold text-xs uppercase tracking-wider">{label}</Label>
      <div className="flex flex-wrap gap-2 p-3 bg-surface-container border border-outline-variant/20 rounded-xl min-h-[48px] items-center">
        {tags.map((tag, i) => (
          <span key={i} className="inline-flex items-center gap-1 bg-gold/15 text-gold text-xs px-3 py-1 rounded-full">
            {tag}
            <button type="button" onClick={() => removeTag(i)} className="text-gold/60 hover:text-gold ml-0.5">
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? "Type and press Enter" : ""}
          className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-on-surface text-sm placeholder:text-outline"
        />
      </div>
    </div>
  );
}

export function PreferencesEditor({ clientId, preferences }: PreferencesEditorProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Correct column names from preferences table
  const [ageMin, setAgeMin] = useState(String(preferences?.target_age_min ?? ""));
  const [ageMax, setAgeMax] = useState(String(preferences?.target_age_max ?? ""));
  const [maxDistance, setMaxDistance] = useState(String(preferences?.max_distance_miles ?? ""));
  const [physParsed, setPhysParsed] = useState<Record<string, any>>(
    preferences?.physical_preferences && typeof preferences.physical_preferences === "object"
      ? (preferences.physical_preferences as Record<string, any>)
      : {}
  );
  const updatePhysPref = (key: string, value: any) => {
    setPhysParsed((prev) => ({ ...prev, [key]: value }));
  };
  const [education, setEducation] = useState(preferences?.education_preference ?? "");
  const [professions, setProfessions] = useState<string[]>(preferences?.profession_preferences ?? []);
  const [dealBreakers, setDealBreakers] = useState<string[]>(preferences?.deal_breakers ?? []);
  const [relationshipIntent, setRelationshipIntent] = useState(preferences?.relationship_intent ?? "");
  const [dateFrequency, setDateFrequency] = useState(preferences?.date_frequency ?? "");
  const [kidsPreference, setKidsPreference] = useState(preferences?.kids_preference ?? "");
  const [targetNotes, setTargetNotes] = useState(preferences?.target_notes ?? "");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    const min = ageMin ? parseInt(ageMin) : null;
    const max = ageMax ? parseInt(ageMax) : null;
    const dist = maxDistance ? parseInt(maxDistance) : null;

    if (min !== null && (min < 18 || min > 99)) {
      errors.ageMin = "Age min must be between 18 and 99";
    }
    if (max !== null && (max < 18 || max > 99)) {
      errors.ageMax = "Age max must be between 18 and 99";
    }
    if (min !== null && max !== null && min > max) {
      errors.ageMin = "Age min must be less than or equal to age max";
    }
    if (dist !== null && (dist <= 0 || dist > 500)) {
      errors.maxDistance = "Max distance must be between 1 and 500";
    }
    return errors;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setLoading(true);
    setError("");
    setSuccess(false);

    // Clean up physParsed — remove empty arrays and null values
    const cleanPhys = Object.fromEntries(
      Object.entries(physParsed).filter(([, v]) => v !== null && v !== "" && !(Array.isArray(v) && v.length === 0))
    );

    const payload = {
      client_id: clientId,
      target_age_min: ageMin ? parseInt(ageMin) : null,
      target_age_max: ageMax ? parseInt(ageMax) : null,
      max_distance_miles: maxDistance ? parseInt(maxDistance) : null,
      physical_preferences: Object.keys(cleanPhys).length > 0 ? cleanPhys : null,
      education_preference: education || null,
      profession_preferences: professions.length > 0 ? professions : null,
      deal_breakers: dealBreakers.length > 0 ? dealBreakers : null,
      relationship_intent: relationshipIntent || null,
      date_frequency: dateFrequency || null,
      kids_preference: kidsPreference || null,
      target_notes: targetNotes || null,
    };

    const { error: upsertError } = preferences?.id
      ? await supabase.from("preferences").update(payload).eq("id", preferences.id)
      : await supabase.from("preferences").insert(payload);

    if (upsertError) {
      setError(upsertError.message);
      toast.error("Failed to save preferences", { description: upsertError.message });
    } else {
      setSuccess(true);
      toast.success("Preferences saved");
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSave} className="bg-surface-container-low p-8 rounded-2xl shadow-xl space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <span className="material-symbols-outlined text-2xl text-gold" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>tune</span>
        <h2 className="font-heading text-xl font-bold text-on-surface">Dating Preferences</h2>
      </div>

      {/* Age Range + Distance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className="text-gold text-xs uppercase tracking-wider">Age Min</Label>
          <Input type="number" min="18" max="99" value={ageMin} onChange={(e) => setAgeMin(e.target.value)} className="bg-surface-container border-outline-variant/20 text-on-surface" />
          {fieldErrors.ageMin && <p className="text-error-red text-xs mt-1">{fieldErrors.ageMin}</p>}
        </div>
        <div className="space-y-2">
          <Label className="text-gold text-xs uppercase tracking-wider">Age Max</Label>
          <Input type="number" min="18" max="99" value={ageMax} onChange={(e) => setAgeMax(e.target.value)} className="bg-surface-container border-outline-variant/20 text-on-surface" />
          {fieldErrors.ageMax && <p className="text-error-red text-xs mt-1">{fieldErrors.ageMax}</p>}
        </div>
        <div className="space-y-2">
          <Label className="text-gold text-xs uppercase tracking-wider">Max Distance (miles)</Label>
          <Input type="number" min="0" value={maxDistance} onChange={(e) => setMaxDistance(e.target.value)} className="bg-surface-container border-outline-variant/20 text-on-surface" />
          {fieldErrors.maxDistance && <p className="text-error-red text-xs mt-1">{fieldErrors.maxDistance}</p>}
        </div>
      </div>

      {/* Relationship Intent + Date Frequency + Kids Preference */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className="text-gold text-xs uppercase tracking-wider">Relationship Intent</Label>
          <Input value={relationshipIntent} onChange={(e) => setRelationshipIntent(e.target.value)} placeholder="e.g. Long-term, Casual, Open" className="bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-outline" />
        </div>
        <div className="space-y-2">
          <Label className="text-gold text-xs uppercase tracking-wider">Date Frequency</Label>
          <Input value={dateFrequency} onChange={(e) => setDateFrequency(e.target.value)} placeholder="e.g. Weekly, Bi-weekly" className="bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-outline" />
        </div>
        <div className="space-y-2">
          <Label className="text-gold text-xs uppercase tracking-wider">Kids Preference</Label>
          <Input value={kidsPreference} onChange={(e) => setKidsPreference(e.target.value)} placeholder="e.g. wants_kids, no_kids, open" className="bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-outline" />
        </div>
      </div>

      {/* Education */}
      <div className="space-y-2">
        <Label className="text-gold text-xs uppercase tracking-wider">Education Preference</Label>
        <Input value={education} onChange={(e) => setEducation(e.target.value)} placeholder="e.g. Bachelor's, Master's, PhD" className="bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-outline" />
      </div>

      {/* Tag inputs */}
      <TagInput label="Profession Preferences" tags={professions} onChange={setProfessions} />
      <TagInput label="Deal Breakers" tags={dealBreakers} onChange={setDealBreakers} />

      {/* Physical Preferences (structured form instead of raw JSON) */}
      <div className="space-y-4 border-t border-outline-variant/15 pt-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="material-symbols-outlined text-lg text-gold" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>accessibility_new</span>
          <h3 className="font-heading text-base font-semibold text-on-surface">Physical Preferences</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-gold text-xs uppercase tracking-wider">Height Min (inches)</Label>
            <Input type="number" min="48" max="84" value={physParsed.height_min ?? ""} onChange={(e) => updatePhysPref("height_min", e.target.value ? parseInt(e.target.value) : null)} placeholder="e.g. 60 (5'0&quot;)" className="bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-outline" />
          </div>
          <div className="space-y-2">
            <Label className="text-gold text-xs uppercase tracking-wider">Height Max (inches)</Label>
            <Input type="number" min="48" max="84" value={physParsed.height_max ?? ""} onChange={(e) => updatePhysPref("height_max", e.target.value ? parseInt(e.target.value) : null)} placeholder="e.g. 72 (6'0&quot;)" className="bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-outline" />
          </div>
        </div>

        <TagInput label="Body Types" tags={physParsed.body_types ?? []} onChange={(tags) => updatePhysPref("body_types", tags)} />
        <TagInput label="Ethnicities" tags={physParsed.ethnicities ?? []} onChange={(tags) => updatePhysPref("ethnicities", tags)} />

        <div className="space-y-2">
          <Label className="text-gold text-xs uppercase tracking-wider">Additional Physical Notes</Label>
          <Textarea value={physParsed.notes ?? ""} onChange={(e) => updatePhysPref("notes", e.target.value || null)} placeholder="Any other physical preference details..." rows={2} className="bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-outline" />
        </div>
      </div>

      {/* Target Notes */}
      <div className="space-y-2">
        <Label className="text-gold text-xs uppercase tracking-wider">Target Notes</Label>
        <Textarea value={targetNotes} onChange={(e) => setTargetNotes(e.target.value)} placeholder="Any additional notes about what the client is looking for..." rows={3} className="bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-outline" />
      </div>

      {error && <p className="text-error-red text-sm">{error}</p>}
      {success && <p className="text-gold text-sm">Preferences saved successfully.</p>}

      <Button type="submit" disabled={loading} className="w-full gold-gradient text-on-gold font-semibold rounded-full h-12">
        {loading ? "Saving..." : "Save Preferences"}
      </Button>
    </form>
  );
}
