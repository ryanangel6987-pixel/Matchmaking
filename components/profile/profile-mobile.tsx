"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

const statusLabels: Record<string, { label: string; color: string }> = {
  uploaded: { label: "Uploaded", color: "text-neutral border-outline-variant/30" },
  pending_review: { label: "Pending Review", color: "text-gold border-gold/30" },
  changes_requested: { label: "Changes Requested", color: "text-error-red border-error-red/30" },
  approved: { label: "Approved", color: "text-gold border-gold/30" },
  live: { label: "Live", color: "text-gold border-gold/50 bg-gold/10" },
  archived: { label: "Archived", color: "text-outline border-outline-variant/20" },
};

type Tab = "uploads" | "curated" | "live";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ProfileMobile({ clientId, photos }: { clientId: string; photos: any[] }) {
  const [activeTab, setActiveTab] = useState<Tab>("uploads");
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const uploadedPhotos = photos.filter((p) => ["uploaded", "pending_review", "changes_requested"].includes(p.status));
  const curatedPhotos = photos.filter((p) => p.status === "approved");
  const livePhotos = photos.filter((p) => p.status === "live");

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const filePath = `${clientId}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("photos")
        .upload(filePath, file);

      if (uploadError) continue;

      const { data: urlData } = supabase.storage.from("photos").getPublicUrl(filePath);

      await supabase.from("photos").insert({
        client_id: clientId,
        file_path: filePath,
        storage_url: urlData.publicUrl,
        status: "uploaded",
      });
    }
    setUploading(false);
    router.refresh();
  }, [clientId, supabase, router]);

  const tabs: { key: Tab; label: string; icon: string; count: number }[] = [
    { key: "uploads", label: "Your Uploads", icon: "cloud_upload", count: uploadedPhotos.length },
    { key: "curated", label: "Curated", icon: "auto_fix_high", count: curatedPhotos.length },
    { key: "live", label: "Live", icon: "rocket_launch", count: livePhotos.length },
  ];

  return (
    <div className="space-y-4 pb-24">
      {/* Tab Navigation — full width, equal sizing */}
      <div className="grid grid-cols-3 rounded-xl bg-surface-container-low p-1 gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex flex-col items-center justify-center gap-1 py-2.5 px-1 rounded-lg text-[13px] font-medium transition-all duration-200 ${
              activeTab === tab.key
                ? "bg-gold/10 text-gold"
                : "text-on-surface-variant"
            }`}
          >
            <span
              className="material-symbols-outlined text-lg"
              style={{ fontVariationSettings: activeTab === tab.key ? "'FILL' 1, 'wght' 400" : "'FILL' 0, 'wght' 300" }}
            >
              {tab.icon}
            </span>
            <span className="leading-none">{tab.label}</span>
            {tab.count > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none ${
                activeTab === tab.key ? "bg-gold/20 text-gold" : "bg-surface-container text-on-surface-variant"
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "uploads" && (
        <div className="space-y-5">
          {/* Upload section: Face & Body Shots */}
          <div className="bg-surface-container-low rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-gold text-base" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>face</span>
              </div>
              <div>
                <p className="text-on-surface text-[16px] font-medium font-heading">Face &amp; Body Shots</p>
                <p className="text-on-surface-variant text-[13px]">2–3 clear face photos + 1–2 full body shots</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <div className="bg-surface-container rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 text-[13px] text-on-surface-variant">
                <span className="material-symbols-outlined text-gold text-sm" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>photo_camera</span>
                Front-facing, well-lit
              </div>
              <div className="bg-surface-container rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 text-[13px] text-on-surface-variant">
                <span className="material-symbols-outlined text-gold text-sm" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>smartphone</span>
                iPhone or professional
              </div>
            </div>
            <label className="block">
              <input type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" disabled={uploading} />
              <span className="flex items-center justify-center w-full h-12 gold-gradient text-on-gold font-semibold rounded-xl cursor-pointer text-[16px]">
                {uploading ? "Uploading..." : "Select Files"}
              </span>
            </label>
          </div>

          {/* Upload section: Profile & Lifestyle Photos */}
          <div className="bg-surface-container-low rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-gold text-base" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>collections</span>
              </div>
              <div>
                <p className="text-on-surface text-[16px] font-medium font-heading">Profile &amp; Lifestyle Photos</p>
                <p className="text-on-surface-variant text-[13px]">Current dating app photos + lifestyle shots</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: "Current Profiles", icon: "account_circle" },
                { label: "Career & Suited", icon: "business_center" },
                { label: "Dining Out", icon: "restaurant" },
                { label: "Travel", icon: "flight" },
                { label: "Animals", icon: "pets" },
                { label: "Social", icon: "groups" },
                { label: "Hobbies", icon: "sports_tennis" },
              ].map((cat) => (
                <div key={cat.label} className="bg-surface-container rounded-full px-3 py-1.5 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-gold text-sm" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>{cat.icon}</span>
                  <span className="text-on-surface-variant text-[13px]">{cat.label}</span>
                </div>
              ))}
            </div>
            <label className="block">
              <input type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" disabled={uploading} />
              <span className="flex items-center justify-center w-full h-12 gold-gradient text-on-gold font-semibold rounded-xl cursor-pointer text-[16px]">
                {uploading ? "Uploading..." : "Select Files"}
              </span>
            </label>
          </div>

          {/* Tip */}
          <div className="bg-surface-container rounded-xl p-3.5 flex items-start gap-2.5">
            <span className="material-symbols-outlined text-gold text-lg mt-0.5 shrink-0" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>lightbulb</span>
            <p className="text-on-surface-variant text-[13px] leading-relaxed">
              Natural lighting, no heavy filters, and clear shots work best. Don&apos;t have enough? No problem — we&apos;ll curate some for you.
            </p>
          </div>

          {/* Uploaded photos grid — 2 columns */}
          {uploadedPhotos.length > 0 && (
            <div>
              <p className="text-on-surface-variant text-[13px] uppercase tracking-widest mb-3">Your Uploaded Photos ({uploadedPhotos.length})</p>
              <MobilePhotoGrid photos={uploadedPhotos} />
            </div>
          )}
        </div>
      )}

      {activeTab === "curated" && (
        <div className="space-y-4">
          {curatedPhotos.length === 0 ? (
            <div className="bg-surface-container-low rounded-2xl p-8 text-center space-y-3">
              <span className="material-symbols-outlined text-5xl text-outline/30 block" style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>auto_fix_high</span>
              <p className="text-on-surface font-heading font-medium text-[22px]">No curated photos yet</p>
              <p className="text-on-surface-variant text-[16px] leading-relaxed">
                Once you upload your photos, your matchmaker will review, enhance, and curate the best selection for your profiles.
              </p>
              <p className="text-gold text-[13px] font-medium mt-2">You&apos;ll be notified by email when photos are ready.</p>
            </div>
          ) : (
            <>
              <div className="bg-gold/5 border border-gold/15 rounded-xl px-4 py-3">
                <p className="text-on-surface-variant text-[16px] leading-relaxed">
                  These photos have been curated by your matchmaker. <span className="text-gold font-semibold">Approve to go live, or request changes</span>.
                </p>
              </div>
              <MobileCuratedPhotoReview photos={curatedPhotos} clientId={clientId} />
            </>
          )}
        </div>
      )}

      {activeTab === "live" && (
        <div className="space-y-4">
          {livePhotos.length === 0 ? (
            <div className="bg-surface-container-low rounded-2xl p-8 text-center space-y-3">
              <span className="material-symbols-outlined text-5xl text-outline/30 block" style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>rocket_launch</span>
              <p className="text-on-surface font-heading font-medium text-[22px]">No live photos yet</p>
              <p className="text-on-surface-variant text-[16px] leading-relaxed">
                Once you approve your curated photos, your matchmaker will push them live to your dating profiles.
              </p>
            </div>
          ) : (
            <>
              <div className="bg-gold/5 border border-gold/15 rounded-xl px-4 py-3">
                <p className="text-on-surface-variant text-[16px] leading-relaxed">
                  These photos are currently <span className="text-gold font-semibold">live on your dating profiles</span>.
                </p>
              </div>
              <MobilePhotoGrid photos={livePhotos} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function MobileCuratedPhotoReview({ photos }: { photos: any[]; clientId: string }) {
  const [noteOpen, setNoteOpen] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleApprove = async (photoId: string) => {
    setProcessing(photoId);
    await supabase
      .from("photos")
      .update({ status: "live" })
      .eq("id", photoId);
    setProcessing(null);
    router.refresh();
  };

  const handleRequestChanges = async (photoId: string) => {
    if (!noteText.trim()) {
      setNoteOpen(photoId);
      return;
    }
    setProcessing(photoId);
    await supabase
      .from("photos")
      .update({ status: "changes_requested", feedback: noteText.trim() })
      .eq("id", photoId);
    setProcessing(null);
    setNoteOpen(null);
    setNoteText("");
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {photos.map((photo) => (
        <div key={photo.id} className="bg-surface-container-low rounded-2xl overflow-hidden">
          {/* Full-width photo card */}
          <div className="relative">
            {photo.storage_url ? (
              <Image
                src={photo.storage_url}
                alt="Curated photo"
                width={600}
                height={400}
                className="w-full h-64 object-cover"
              />
            ) : (
              <div className="w-full h-64 flex items-center justify-center bg-surface-container-high">
                <span className="material-symbols-outlined text-5xl text-outline/30" style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>image</span>
              </div>
            )}
            <div className="absolute top-3 left-3">
              <Badge variant="outline" className="text-[9px] uppercase tracking-widest text-gold border-gold/30 bg-black/50 backdrop-blur-sm">
                Curated by matchmaker
              </Badge>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {/* Large approve/decline buttons — 48px height */}
            <button
              onClick={() => handleApprove(photo.id)}
              disabled={processing === photo.id}
              className="w-full flex items-center justify-center gap-2 gold-gradient text-on-gold font-semibold rounded-xl h-12 text-[16px] hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}>check_circle</span>
              {processing === photo.id ? "Processing..." : "Approve & Go Live"}
            </button>
            <button
              onClick={() => {
                if (noteOpen === photo.id) {
                  handleRequestChanges(photo.id);
                } else {
                  setNoteOpen(photo.id);
                  setNoteText("");
                }
              }}
              disabled={processing === photo.id}
              className="w-full flex items-center justify-center gap-2 border border-outline-variant/20 text-on-surface-variant rounded-xl h-12 text-[16px] hover:border-gold/40 hover:text-on-surface transition-all disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>edit_note</span>
              Request Changes
            </button>

            {/* Note input */}
            {noteOpen === photo.id && (
              <div className="space-y-2">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Leave a note for your matchmaker..."
                  rows={3}
                  className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-3 py-2.5 text-on-surface text-[16px] placeholder:text-outline focus:border-gold focus:ring-1 focus:ring-gold outline-none resize-none"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => { setNoteOpen(null); setNoteText(""); }}
                    className="flex-1 text-on-surface-variant text-[16px] hover:text-on-surface transition-colors py-2.5 border border-outline-variant/20 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleRequestChanges(photo.id)}
                    disabled={!noteText.trim() || processing === photo.id}
                    className="flex-1 gold-gradient text-on-gold font-semibold rounded-xl py-2.5 text-[16px] hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    Send Feedback
                  </button>
                </div>
              </div>
            )}

            {/* Existing feedback */}
            {photo.feedback && noteOpen !== photo.id && (
              <div className="bg-surface-container rounded-lg p-3">
                <p className="text-on-surface-variant text-[13px] uppercase tracking-widest mb-1">Your Note</p>
                <p className="text-on-surface text-[16px]">{photo.feedback}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function MobilePhotoGrid({ photos }: { photos: any[] }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {photos.map((photo) => {
        const st = statusLabels[photo.status] ?? statusLabels.uploaded;
        return (
          <div
            key={photo.id}
            className="relative rounded-xl overflow-hidden bg-surface-container-high"
          >
            {photo.storage_url ? (
              <Image
                src={photo.storage_url}
                alt="Profile asset"
                width={300}
                height={400}
                className="w-full h-44 object-cover"
              />
            ) : (
              <div className="w-full h-44 flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-4xl text-outline/30"
                  style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}
                >
                  image
                </span>
              </div>
            )}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2.5">
              <Badge variant="outline" className={`text-[9px] uppercase tracking-widest ${st.color}`}>
                {st.label}
              </Badge>
            </div>
            {photo.feedback && (
              <div className="absolute top-2 right-2 bg-surface-container/80 backdrop-blur-sm px-2 py-1 rounded-lg max-w-[80%]">
                <p className="text-[10px] text-on-surface-variant truncate">{photo.feedback}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
