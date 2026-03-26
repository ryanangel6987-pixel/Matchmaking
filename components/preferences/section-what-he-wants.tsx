"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CollapsibleSection, DataRow, TagList } from "./section-header";
import { CustomSelect } from "@/components/ui/custom-select";

const KIDS_LABELS: Record<string, string> = {
  wants_kids: "Wants kids",
  no_kids: "Doesn't want kids",
  open: "Open to either",
  has_kids_ok: "OK if she has kids",
  no_preference: "No preference",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SectionWhatHeWants({ preferences, clientId }: { preferences: any; clientId: string }) {
  const data = preferences ?? {};
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    target_age_min: data.target_age_min ?? "",
    target_age_max: data.target_age_max ?? "",
    max_distance_miles: data.max_distance_miles ?? "",
    education_preference: data.education_preference ?? "",
    relationship_intent: data.relationship_intent ?? "",
    date_frequency: data.date_frequency ?? "",
    kids_preference: data.kids_preference ?? "",
    profession_preferences: (data.profession_preferences ?? []).join(", "),
    deal_breakers: (data.deal_breakers ?? []).join(", "),
    target_notes: data.target_notes ?? "",
  });

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      client_id: clientId,
      target_age_min: form.target_age_min ? parseInt(form.target_age_min) : null,
      target_age_max: form.target_age_max ? parseInt(form.target_age_max) : null,
      max_distance_miles: form.max_distance_miles ? parseInt(form.max_distance_miles) : null,
      education_preference: form.education_preference || null,
      relationship_intent: form.relationship_intent || null,
      date_frequency: form.date_frequency || null,
      kids_preference: form.kids_preference || null,
      profession_preferences: form.profession_preferences
        ? form.profession_preferences.split(",").map((s: string) => s.trim()).filter(Boolean)
        : null,
      deal_breakers: form.deal_breakers
        ? form.deal_breakers.split(",").map((s: string) => s.trim()).filter(Boolean)
        : null,
      target_notes: form.target_notes || null,
    };
    await supabase
      .from("preferences")
      .upsert(payload, { onConflict: "client_id" });
    setSaving(false);
    setEditing(false);
  };

  const inputClass = "w-full bg-surface-container border border-outline-variant/20 rounded-lg px-3 py-1.5 text-on-surface text-sm focus:border-gold focus:ring-1 focus:ring-gold outline-none";
  const labelClass = "text-on-surface-variant text-xs mb-1 block";

  return (
    <div className="bg-surface-container-low p-8 rounded-2xl shadow-xl relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-1 h-full bg-gold opacity-30 group-hover:opacity-100 transition-opacity duration-500" />

      <CollapsibleSection title="Section B — What He Wants" subtitle="Target preferences">
        <div className="flex justify-end mb-4">
          {!editing ? (
            <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-gold text-xs hover:text-gold-light transition-colors">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>edit</span>
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="text-on-surface-variant text-xs hover:text-on-surface transition-colors px-3 py-1">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="gold-gradient text-on-gold font-semibold rounded-full px-4 py-1 text-xs disabled:opacity-50">
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          )}
        </div>

        {editing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <label className={labelClass}>Target Age Range (Min)</label>
              <input type="number" value={form.target_age_min} onChange={(e) => update("target_age_min", e.target.value)} placeholder="e.g. 25" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Target Age Range (Max)</label>
              <input type="number" value={form.target_age_max} onChange={(e) => update("target_age_max", e.target.value)} placeholder="e.g. 35" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Max Distance (miles)</label>
              <input type="number" value={form.max_distance_miles} onChange={(e) => update("max_distance_miles", e.target.value)} placeholder="e.g. 25" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Education Preference</label>
              <input type="text" value={form.education_preference} onChange={(e) => update("education_preference", e.target.value)} placeholder="e.g. College degree preferred" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Relationship Intent</label>
              <CustomSelect
                value={form.relationship_intent}
                onChange={(v) => update("relationship_intent", v)}
                options={[
                  { value: "", label: "Select..." },
                  { value: "casual", label: "Casual" },
                  { value: "serious", label: "Serious" },
                  { value: "marriage", label: "Marriage" },
                  { value: "open", label: "Open" },
                ]}
                placeholder="Select..."
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Date Frequency</label>
              <CustomSelect
                value={form.date_frequency}
                onChange={(v) => update("date_frequency", v)}
                options={[
                  { value: "", label: "Select..." },
                  { value: "weekly", label: "Weekly" },
                  { value: "bi-weekly", label: "Bi-weekly" },
                  { value: "monthly", label: "Monthly" },
                  { value: "flexible", label: "Flexible" },
                ]}
                placeholder="Select..."
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Kids</label>
              <CustomSelect
                value={form.kids_preference}
                onChange={(v) => update("kids_preference", v)}
                options={[
                  { value: "", label: "Select..." },
                  { value: "wants_kids", label: "Wants kids" },
                  { value: "no_kids", label: "Doesn't want kids" },
                  { value: "open", label: "Open to either" },
                  { value: "has_kids_ok", label: "OK if she has kids" },
                  { value: "no_preference", label: "No preference" },
                ]}
                placeholder="Select..."
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Profession Preferences (comma-separated)</label>
              <input type="text" value={form.profession_preferences} onChange={(e) => update("profession_preferences", e.target.value)} placeholder="e.g. Finance, Tech, Medicine" className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Deal-Breakers (comma-separated)</label>
              <input type="text" value={form.deal_breakers} onChange={(e) => update("deal_breakers", e.target.value)} placeholder="e.g. Smoking, Long distance" className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Notes</label>
              <textarea value={form.target_notes} onChange={(e) => update("target_notes", e.target.value)} rows={3} placeholder="Additional targeting context for your matchmaker..." className={inputClass + " resize-none"} />
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Core Demographics */}
              <div className="space-y-4">
                <DataRow
                  label="Target Age Range"
                  value={
                    data.target_age_min && data.target_age_max
                      ? `${data.target_age_min} — ${data.target_age_max}`
                      : null
                  }
                />
                <DataRow
                  label="Max Distance"
                  value={
                    data.max_distance_miles
                      ? `${data.max_distance_miles} mi`
                      : null
                  }
                />
                <DataRow
                  label="Education"
                  value={data.education_preference}
                />
                <DataRow
                  label="Relationship Intent"
                  value={data.relationship_intent}
                />
                <DataRow
                  label="Date Frequency"
                  value={data.date_frequency}
                />
                <DataRow
                  label="Kids"
                  value={data.kids_preference ? KIDS_LABELS[data.kids_preference] ?? data.kids_preference : null}
                />
              </div>

              {/* Tags */}
              <div className="space-y-6">
                <div>
                  <p className="text-on-surface-variant text-sm mb-3">
                    Profession Preferences
                  </p>
                  <TagList items={data.profession_preferences} />
                </div>

                <div>
                  <p className="text-on-surface-variant text-sm mb-3">
                    Deal-Breakers
                  </p>
                  <TagList items={data.deal_breakers} />
                </div>
              </div>
            </div>

            {/* Notes section */}
            <div className="mt-6 pt-6 border-t border-outline-variant/15">
              <p className="text-on-surface-variant text-sm mb-2">Notes</p>
              <p className="text-on-surface text-sm leading-relaxed">
                {data.target_notes ?? <span className="text-on-surface-variant/40">No additional notes. Your matchmaker can add targeting context here.</span>}
              </p>
            </div>
          </>
        )}
      </CollapsibleSection>
    </div>
  );
}
