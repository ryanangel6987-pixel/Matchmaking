"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { CustomSelect } from "@/components/ui/custom-select";

interface MatchmakerPhotoUploadProps {
  clientId: string;
  matchmakerProfileId: string;
}

const CATEGORY_OPTIONS = [
  { value: "curated", label: "Curated" },
  { value: "face_body", label: "Face / Body" },
  { value: "lifestyle", label: "Lifestyle" },
];

export function MatchmakerPhotoUpload({ clientId, matchmakerProfileId }: MatchmakerPhotoUploadProps) {
  const router = useRouter();
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState("curated");
  const [error, setError] = useState("");
  const [successCount, setSuccessCount] = useState(0);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError("");
    setSuccessCount(0);
    let uploaded = 0;

    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const storagePath = `photos/${clientId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("photos")
        .upload(storagePath, file);

      if (uploadErr) {
        setError(`Failed to upload ${file.name}: ${uploadErr.message}`);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from("photos")
        .getPublicUrl(storagePath);

      const { error: insertErr } = await supabase
        .from("photos")
        .insert({
          client_id: clientId,
          storage_path: `photos/${storagePath}`,
          storage_url: urlData.publicUrl,
          status: "approved",
          photo_category: category,
          reviewed_by: matchmakerProfileId,
          reviewed_at: new Date().toISOString(),
        });

      if (insertErr) {
        setError(`Failed to save record for ${file.name}: ${insertErr.message}`);
        continue;
      }

      uploaded++;
    }

    setSuccessCount(uploaded);
    setUploading(false);
    // Reset the file input
    e.target.value = "";
    if (uploaded > 0) {
      router.refresh();
    }
  };

  return (
    <div className="bg-surface-container-low p-6 rounded-2xl shadow-xl space-y-4">
      <div className="flex items-center gap-3">
        <span
          className="material-symbols-outlined text-gold text-xl"
          style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
        >
          add_photo_alternate
        </span>
        <h2 className="text-on-surface font-heading font-semibold text-sm tracking-wide">
          Upload Photos
        </h2>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
        <div className="space-y-2 w-full sm:w-48">
          <label className="text-gold text-xs uppercase tracking-wider block">Category</label>
          <CustomSelect
            value={category}
            onChange={(v) => setCategory(v)}
            options={CATEGORY_OPTIONS}
            placeholder="Select category"
            className="w-full bg-surface-container border border-outline-variant/20 text-on-surface rounded-xl px-4 py-3 text-sm"
          />
        </div>

        <div className="flex-1 w-full">
          <label className="cursor-pointer block">
            <div className="border-2 border-dashed border-outline-variant/20 rounded-xl p-4 text-center hover:border-gold/40 transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                disabled={uploading}
                onChange={handleUpload}
              />
              <span
                className="material-symbols-outlined text-2xl text-outline/40 mb-1 block"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}
              >
                cloud_upload
              </span>
              <p className="text-on-surface-variant text-xs">
                {uploading
                  ? "Uploading..."
                  : "Click to select photos (auto-approved)"}
              </p>
            </div>
          </label>
        </div>
      </div>

      {error && <p className="text-error-red text-xs">{error}</p>}
      {successCount > 0 && !uploading && (
        <p className="text-gold text-xs">
          {successCount} photo{successCount !== 1 ? "s" : ""} uploaded and approved.
        </p>
      )}
    </div>
  );
}
