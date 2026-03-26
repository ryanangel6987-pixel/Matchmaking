"use client";

import { useState, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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

  const [ageMin, setAgeMin] = useState(String(preferences?.age_range_min ?? ""));
  const [ageMax, setAgeMax] = useState(String(preferences?.age_range_max ?? ""));
  const [maxDistance, setMaxDistance] = useState(String(preferences?.max_distance_miles ?? ""));
  const [heightMin, setHeightMin] = useState(String(preferences?.height_range_min ?? ""));
  const [heightMax, setHeightMax] = useState(String(preferences?.height_range_max ?? ""));
  const [ethnicities, setEthnicities] = useState<string[]>(preferences?.preferred_ethnicities ?? []);
  const [bodyTypes, setBodyTypes] = useState<string[]>(preferences?.preferred_body_types ?? []);
  const [education, setEducation] = useState(preferences?.preferred_education ?? "");
  const [professions, setProfessions] = useState<string[]>(preferences?.preferred_professions ?? []);
  const [additionalNotes, setAdditionalNotes] = useState(preferences?.additional_notes ?? "");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    const min = ageMin ? parseInt(ageMin) : null;
    const max = ageMax ? parseInt(ageMax) : null;
    const dist = maxDistance ? parseInt(maxDistance) : null;
    const hMin = heightMin ? parseInt(heightMin) : null;
    const hMax = heightMax ? parseInt(heightMax) : null;

    if (min !== null && (min < 18 || min > 99)) {
      errors.ageMin = "Age min must be between 18 and 99";
    }
    if (max !== null && (max < 18 || max > 99)) {
      errors.ageMax = "Age max must be between 18 and 99";
    }
    if (min !== null && max !== null && min > max) {
      errors.ageMin = "Age min must be less than or equal to age max";
    }
    if (min !== null && max !== null && max < min) {
      errors.ageMax = "Age max must be greater than or equal to age min";
    }
    if (dist !== null && (dist <= 0 || dist > 500)) {
      errors.maxDistance = "Max distance must be between 1 and 500";
    }
    if (hMin !== null && hMax !== null && hMin > hMax) {
      errors.heightMin = "Height min must be less than or equal to height max";
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

    const payload = {
      client_id: clientId,
      age_range_min: ageMin ? parseInt(ageMin) : null,
      age_range_max: ageMax ? parseInt(ageMax) : null,
      max_distance_miles: maxDistance ? parseInt(maxDistance) : null,
      height_range_min: heightMin ? parseInt(heightMin) : null,
      height_range_max: heightMax ? parseInt(heightMax) : null,
      preferred_ethnicities: ethnicities.length > 0 ? ethnicities : null,
      preferred_body_types: bodyTypes.length > 0 ? bodyTypes : null,
      preferred_education: education || null,
      preferred_professions: professions.length > 0 ? professions : null,
      additional_notes: additionalNotes || null,
    };

    const { error: upsertError } = preferences?.id
      ? await supabase.from("preferences").update(payload).eq("id", preferences.id)
      : await supabase.from("preferences").insert(payload);

    if (upsertError) {
      setError(upsertError.message);
    } else {
      setSuccess(true);
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

      {/* Age Range */}
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

      {/* Height Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-gold text-xs uppercase tracking-wider">Height Min (inches)</Label>
          <Input type="number" min="48" max="96" value={heightMin} onChange={(e) => setHeightMin(e.target.value)} className="bg-surface-container border-outline-variant/20 text-on-surface" />
          {fieldErrors.heightMin && <p className="text-error-red text-xs mt-1">{fieldErrors.heightMin}</p>}
        </div>
        <div className="space-y-2">
          <Label className="text-gold text-xs uppercase tracking-wider">Height Max (inches)</Label>
          <Input type="number" min="48" max="96" value={heightMax} onChange={(e) => setHeightMax(e.target.value)} className="bg-surface-container border-outline-variant/20 text-on-surface" />
          {fieldErrors.heightMax && <p className="text-error-red text-xs mt-1">{fieldErrors.heightMax}</p>}
        </div>
      </div>

      {/* Tag inputs */}
      <TagInput label="Preferred Ethnicities" tags={ethnicities} onChange={setEthnicities} />
      <TagInput label="Preferred Body Types" tags={bodyTypes} onChange={setBodyTypes} />

      {/* Education */}
      <div className="space-y-2">
        <Label className="text-gold text-xs uppercase tracking-wider">Preferred Education</Label>
        <Input value={education} onChange={(e) => setEducation(e.target.value)} placeholder="e.g. Bachelor's, Master's, PhD" className="bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-outline" />
      </div>

      <TagInput label="Preferred Professions" tags={professions} onChange={setProfessions} />

      {/* Notes */}
      <div className="space-y-2">
        <Label className="text-gold text-xs uppercase tracking-wider">Additional Notes</Label>
        <Textarea value={additionalNotes} onChange={(e) => setAdditionalNotes(e.target.value)} placeholder="Any additional preference notes..." rows={3} className="bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-outline" />
      </div>

      {error && <p className="text-error-red text-sm">{error}</p>}
      {success && <p className="text-gold text-sm">Preferences saved successfully.</p>}

      <Button type="submit" disabled={loading} className="w-full gold-gradient text-on-gold font-semibold rounded-full h-12">
        {loading ? "Saving..." : "Save Preferences"}
      </Button>
    </form>
  );
}
