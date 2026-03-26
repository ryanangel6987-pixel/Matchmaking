"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { CollapsibleSection, TagList } from "./section-header";
import { Badge } from "@/components/ui/badge";
import { CustomSelect } from "@/components/ui/custom-select";
import { createClient } from "@/lib/supabase/client";

const ASSET_TYPES = [
  { value: "ex", label: "Pictures Of Exes" },
  { value: "ideal", label: "Ideal Type" },
  { value: "aspirational", label: "Aspirational References" },
] as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SectionVisualPreferences({
  assets: initialAssets,
  clientId,
}: {
  assets: any[];
  clientId: string;
}) {
  const [assets, setAssets] = useState(initialAssets);
  const [selectedType, setSelectedType] = useState<string>("ex");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [physicalNotes, setPhysicalNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesLoaded, setNotesLoaded] = useState(false);

  if (!notesLoaded) {
    const sb = createClient();
    sb.from("preferences").select("physical_preferences").eq("client_id", clientId).single().then(({ data }) => {
      if (data?.physical_preferences?.notes) setPhysicalNotes(data.physical_preferences.notes);
      setNotesLoaded(true);
    });
  }

  const savePhysicalNotes = async () => {
    setSavingNotes(true);
    const sb = createClient();
    await sb.from("preferences").upsert({
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
    if (!files || files.length === 0) {
      setError("Please select a file to upload.");
      return;
    }

    const file = files[0];

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed.");
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError("File must be under 10MB.");
      return;
    }

    setUploading(true);

    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const storagePath = `preference_assets/${clientId}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("preference_assets")
        .upload(storagePath, file);

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("preference_assets").getPublicUrl(storagePath);

      // Insert into preference_assets table
      const { data: newAsset, error: insertError } = await supabase
        .from("preference_assets")
        .insert({
          client_id: clientId,
          asset_type: selectedType,
          storage_path: storagePath,
          storage_url: publicUrl,
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      // Add to local state
      setAssets((prev) => [newAsset, ...prev]);

      // Reset form
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Upload failed. Please try again.";
      setError(message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="bg-surface-container-low p-8 rounded-2xl shadow-xl relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-1 h-full bg-gold opacity-30 group-hover:opacity-100 transition-opacity duration-500" />

      <CollapsibleSection
        title="Section D — Visual Preferences"
        subtitle="Reference images & visual calibration"
        defaultOpen={false}
      >
        <div className="space-y-8">
          {/* Image Grid — always show all three categories */}
          {[
            { label: "Pictures Of Exes", items: exes },
            { label: "Ideal Type", items: ideals },
            { label: "Aspirational References", items: aspirational },
          ].map(({ label, items }) => (
            <div key={label}>
              <p className="text-on-surface-variant text-xs uppercase tracking-widest mb-4">
                {label}
              </p>
              {items.length === 0 ? (
                <p className="text-on-surface-variant/40 text-sm">&mdash;</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {items.map((asset) => (
                    <div
                      key={asset.id}
                      className="relative group/card rounded-xl overflow-hidden"
                    >
                      {asset.storage_url ? (
                        <Image
                          src={asset.storage_url}
                          alt={asset.notes || "Reference"}
                          width={300}
                          height={400}
                          className="w-full h-48 object-cover grayscale group-hover/card:grayscale-0 transition-all duration-700"
                        />
                      ) : (
                        <div className="w-full h-48 bg-surface-container-high flex items-center justify-center">
                          <span
                            className="material-symbols-outlined text-4xl text-outline"
                            style={{
                              fontVariationSettings:
                                "'FILL' 0, 'wght' 200",
                            }}
                          >
                            image
                          </span>
                        </div>
                      )}
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                        <Badge
                          variant="outline"
                          className="text-[10px] uppercase tracking-widest border-gold/30 text-gold"
                        >
                          {asset.asset_type}
                        </Badge>
                        {asset.tags && asset.tags.length > 0 && (
                          <div className="mt-2">
                            <TagList items={asset.tags} />
                          </div>
                        )}
                      </div>
                      {asset.notes && (
                        <div className="absolute top-2 right-2 bg-surface-container/80 backdrop-blur-sm px-2 py-1 rounded-lg">
                          <span className="text-[10px] text-on-surface-variant">
                            {asset.notes}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Physical Preference Notes */}
          <div className="pt-4 border-t border-outline/10 space-y-3">
            <p className="text-on-surface-variant text-xs uppercase tracking-widest">Physical Preference Notes</p>
            <textarea
              value={physicalNotes}
              onChange={(e) => setPhysicalNotes(e.target.value)}
              placeholder="Describe your physical type preferences — hair color, body type, style, anything that helps your matchmaker..."
              rows={3}
              className="w-full bg-surface-container border border-outline-variant/20 rounded-lg px-3 py-2 text-on-surface text-sm focus:border-gold focus:ring-1 focus:ring-gold outline-none resize-none"
            />
            <button onClick={savePhysicalNotes} disabled={savingNotes} className="gold-gradient text-on-gold font-semibold rounded-full px-6 py-2 text-xs disabled:opacity-50">
              {savingNotes ? "Saving..." : "Save Notes"}
            </button>
          </div>

          {/* Upload Form */}
          <div className="pt-4 border-t border-outline/10">
            <p className="text-on-surface-variant text-xs uppercase tracking-widest mb-4">
              Upload Reference Photo
            </p>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Type Selector */}
                <div className="flex-shrink-0">
                  <label className="text-on-surface-variant text-xs mb-1.5 block">
                    Category
                  </label>
                  <CustomSelect
                    value={selectedType}
                    onChange={(v) => setSelectedType(v)}
                    options={ASSET_TYPES.map((t) => ({ value: t.value, label: t.label }))}
                    className="bg-surface-container text-on-surface text-sm rounded-xl px-4 py-2.5 border border-outline/20 focus:border-gold/50 focus:outline-none transition-colors min-w-[220px]"
                  />
                </div>

                {/* File Input */}
                <div className="flex-1">
                  <label className="text-on-surface-variant text-xs mb-1.5 block">
                    Image
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="block w-full text-sm text-on-surface-variant
                      file:mr-4 file:py-2.5 file:px-4
                      file:rounded-xl file:border-0
                      file:text-sm file:font-medium
                      file:bg-surface-container file:text-on-surface
                      file:cursor-pointer
                      hover:file:bg-surface-container-high
                      file:transition-colors"
                  />
                </div>
              </div>

              {error && (
                <p className="text-error-red text-sm">{error}</p>
              )}

              <button
                type="submit"
                disabled={uploading}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-300
                  bg-gradient-to-r from-gold to-gold-dark text-surface
                  hover:shadow-lg hover:shadow-gold/20
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <span
                      className="material-symbols-outlined text-base animate-spin"
                      style={{
                        fontVariationSettings: "'FILL' 0, 'wght' 300",
                      }}
                    >
                      progress_activity
                    </span>
                    Uploading...
                  </>
                ) : (
                  <>
                    <span
                      className="material-symbols-outlined text-base"
                      style={{
                        fontVariationSettings: "'FILL' 0, 'wght' 300",
                      }}
                    >
                      cloud_upload
                    </span>
                    Upload Photo
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
}
