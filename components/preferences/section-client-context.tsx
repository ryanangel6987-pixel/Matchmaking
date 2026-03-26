"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CollapsibleSection, TagList } from "./section-header";
import { CustomSelect } from "@/components/ui/custom-select";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SectionClientContext({ onboarding, clientId }: { onboarding: any; clientId: string }) {
  const data = onboarding ?? {};
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    full_name: data.full_name ?? "",
    age: data.age ?? "",
    city: data.city ?? "",
    neighborhood: data.neighborhood ?? "",
    profession: data.profession ?? "",
    title: data.title ?? "",
    height_inches: data.height_inches ?? "",
    has_kids: data.has_kids ?? "",
    kids_details: data.kids_details ?? "",
    drinks_alcohol: data.drinks_alcohol ?? "sometimes",
    education: (data.education ?? []).join(", "),
    personality_summary: data.personality_summary ?? "",
    lifestyle_notes: data.lifestyle_notes ?? "",
    client_notes: data.client_notes ?? "",
  });

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    await supabase
      .from("onboarding_data")
      .upsert({
        client_id: clientId,
        full_name: form.full_name || null,
        age: form.age ? parseInt(form.age) : null,
        city: form.city || null,
        neighborhood: form.neighborhood || null,
        profession: form.profession || null,
        title: form.title || null,
        height_inches: form.height_inches ? parseInt(form.height_inches) : null,
        has_kids: form.has_kids || null,
        kids_details: form.kids_details || null,
        drinks_alcohol: form.drinks_alcohol || null,
        education: form.education ? form.education.split(",").map((s: string) => s.trim()).filter(Boolean) : null,
        personality_summary: form.personality_summary || null,
        lifestyle_notes: form.lifestyle_notes || null,
        client_notes: form.client_notes || null,
      }, { onConflict: "client_id" });
    setSaving(false);
    setEditing(false);
  };

  const heightDisplay = data.height_inches
    ? `${Math.floor(data.height_inches / 12)}'${data.height_inches % 12}"`
    : null;

  const kidsDisplay = data.has_kids === "yes" ? (data.kids_details ? `Yes — ${data.kids_details}` : "Yes") : data.has_kids === "no" ? "No" : data.has_kids === "prefer_not_to_say" ? "Prefer not to say" : null;

  const inputClass = "w-full bg-surface-container border border-outline-variant/20 rounded-lg px-3 py-1.5 text-on-surface text-sm focus:border-gold focus:ring-1 focus:ring-gold outline-none";
  const labelClass = "text-on-surface-variant text-xs mb-1 block";
  const valueClass = "text-gold font-heading text-sm";
  const emptyClass = "text-on-surface-variant/40 text-sm";

  const Row = ({ label, value }: { label: string; value: string | number | null | undefined }) => (
    <div className="flex justify-between items-end border-b border-outline-variant/15 pb-2">
      <span className="text-on-surface-variant text-sm">{label}</span>
      <span className={value ? valueClass : emptyClass}>{value ?? "—"}</span>
    </div>
  );

  return (
    <div className="bg-surface-container-low p-8 rounded-2xl shadow-xl relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-1 h-full bg-gold opacity-30 group-hover:opacity-100 transition-opacity duration-500" />

      <CollapsibleSection title="Section A — Client Context" subtitle="Who he is">
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
              <label className={labelClass}>Full Name</label>
              <input type="text" value={form.full_name} onChange={(e) => update("full_name", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Age</label>
              <input type="number" value={form.age} onChange={(e) => update("age", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>City</label>
              <input type="text" value={form.city} onChange={(e) => update("city", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Neighborhood</label>
              <input type="text" value={form.neighborhood} onChange={(e) => update("neighborhood", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Field / Industry</label>
              <input type="text" value={form.profession} onChange={(e) => update("profession", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Job Title</label>
              <input type="text" value={form.title} onChange={(e) => update("title", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Height (inches)</label>
              <input type="number" value={form.height_inches} onChange={(e) => update("height_inches", e.target.value)} placeholder="e.g. 72 for 6'0&quot;" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Drinks Alcohol</label>
              <CustomSelect
                value={form.drinks_alcohol}
                onChange={(v) => update("drinks_alcohol", v)}
                options={[
                  { value: "yes", label: "Yes" },
                  { value: "sometimes", label: "Sometimes" },
                  { value: "never", label: "Never" },
                ]}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Kids</label>
              <CustomSelect
                value={form.has_kids}
                onChange={(v) => update("has_kids", v)}
                options={[
                  { value: "", label: "Select..." },
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                  { value: "prefer_not_to_say", label: "Prefer not to say" },
                ]}
                placeholder="Select..."
                className={inputClass}
              />
            </div>
            {form.has_kids === "yes" && (
              <div>
                <label className={labelClass}>Kids Details</label>
                <input type="text" value={form.kids_details} onChange={(e) => update("kids_details", e.target.value)} placeholder="e.g. 2 kids, ages 5 and 8" className={inputClass} />
              </div>
            )}
            <div className="md:col-span-2">
              <label className={labelClass}>Education (colleges / universities, comma-separated)</label>
              <input type="text" value={form.education} onChange={(e) => update("education", e.target.value)} placeholder="e.g. NYU, Columbia Business School" className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Personality Summary</label>
              <textarea value={form.personality_summary} onChange={(e) => update("personality_summary", e.target.value)} rows={2} className={inputClass + " resize-none"} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Lifestyle Notes</label>
              <textarea value={form.lifestyle_notes} onChange={(e) => update("lifestyle_notes", e.target.value)} rows={2} className={inputClass + " resize-none"} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Additional Notes</label>
              <textarea value={form.client_notes} onChange={(e) => update("client_notes", e.target.value)} rows={3} placeholder="Anything else about you that your matchmaker should know..." className={inputClass + " resize-none"} />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {/* Column 1 */}
            <div className="space-y-4">
              <Row label="Full Name" value={data.full_name} />
              <Row label="Age" value={data.age} />
              <Row label="Location" value={[data.city, data.neighborhood].filter(Boolean).join(", ") || null} />
              <Row label="Field" value={data.profession} />
              <Row label="Job Title" value={data.title} />
              <Row label="Height" value={heightDisplay} />
              <Row label="Drinks" value={data.drinks_alcohol ? data.drinks_alcohol.charAt(0).toUpperCase() + data.drinks_alcohol.slice(1) : null} />
              <Row label="Kids" value={kidsDisplay} />
            </div>

            {/* Column 2 */}
            <div className="space-y-5">
              <div>
                <p className="text-on-surface-variant text-sm mb-2">Education</p>
                <TagList items={data.education} />
              </div>
              <div>
                <p className="text-on-surface-variant text-sm mb-2">Dating Apps Used</p>
                <TagList items={data.dating_apps_used} />
              </div>
              <div>
                <p className="text-on-surface-variant text-sm mb-2">Open To</p>
                <TagList items={data.dating_apps_open_to} />
              </div>
              <div>
                <p className="text-on-surface-variant text-sm mb-2">Hobbies &amp; Interests</p>
                <TagList items={data.hobbies_and_interests} />
              </div>
              <div>
                <p className="text-on-surface-variant text-sm mb-2">Personality Summary</p>
                <p className="text-on-surface text-sm leading-relaxed">
                  {data.personality_summary ?? <span className="text-on-surface-variant/40">—</span>}
                </p>
              </div>
              <div>
                <p className="text-on-surface-variant text-sm mb-2">Lifestyle Notes</p>
                <p className="text-on-surface text-sm leading-relaxed">
                  {data.lifestyle_notes ?? <span className="text-on-surface-variant/40">—</span>}
                </p>
              </div>
              {(data.client_notes) && (
                <div>
                  <p className="text-on-surface-variant text-sm mb-2">Additional Notes</p>
                  <p className="text-on-surface text-sm leading-relaxed">{data.client_notes}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CollapsibleSection>
    </div>
  );
}
