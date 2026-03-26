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
export function ProfileClient({ clientId, photos }: { clientId: string; photos: any[] }) {
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
    { key: "curated", label: "Curated by Us", icon: "auto_fix_high", count: curatedPhotos.length },
    { key: "live", label: "Live Profiles", icon: "rocket_launch", count: livePhotos.length },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-heading font-bold text-gold tracking-tight">
          Profiles &amp; Uploads
        </h1>
        <div className="h-px w-24 bg-gradient-to-r from-gold to-transparent" />
      </div>

      {/* Process steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface-container-low p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-gold/30" />
          <span className="text-gold font-heading font-bold text-3xl opacity-20 absolute top-3 right-4">1</span>
          <span className="material-symbols-outlined text-gold text-2xl mb-3 block" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>cloud_upload</span>
          <p className="text-on-surface text-sm font-medium font-heading mb-1">Upload</p>
          <p className="text-on-surface-variant text-sm leading-relaxed">Upload your best photos. The more variety, the better your profiles will perform.</p>
        </div>
        <div className="bg-surface-container-low p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-gold/30" />
          <span className="text-gold font-heading font-bold text-3xl opacity-20 absolute top-3 right-4">2</span>
          <span className="material-symbols-outlined text-gold text-2xl mb-3 block" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>auto_fix_high</span>
          <p className="text-on-surface text-sm font-medium font-heading mb-1">Curation &amp; Creation</p>
          <p className="text-on-surface-variant text-sm leading-relaxed">Your matchmaker reviews, edits, and selects the strongest shots. We also add curated images to increase match quality.</p>
        </div>
        <div className="bg-surface-container-low p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-gold/30" />
          <span className="text-gold font-heading font-bold text-3xl opacity-20 absolute top-3 right-4">3</span>
          <span className="material-symbols-outlined text-gold text-2xl mb-3 block" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>verified</span>
          <p className="text-on-surface text-sm font-medium font-heading mb-1">Your Approval</p>
          <p className="text-on-surface-variant text-sm leading-relaxed">You review and approve the final selection. Nothing goes live without your sign-off.</p>
        </div>
      </div>

      <div className="bg-gold/5 border border-gold/15 rounded-xl px-5 py-3 flex items-center gap-3">
        <span className="material-symbols-outlined text-gold text-xl" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>schedule</span>
        <p className="text-on-surface-variant text-sm">
          <span className="text-gold font-semibold">Timeline:</span> The full process typically takes up to <span className="text-on-surface font-medium">7 days</span>{" "}from upload. You&apos;ll be notified when your curated photos are ready.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex rounded-xl bg-surface-container-low p-1 gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab.key
                ? "bg-gold/10 text-gold"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
            }`}
          >
            <span
              className="material-symbols-outlined text-lg"
              style={{ fontVariationSettings: activeTab === tab.key ? "'FILL' 1, 'wght' 400" : "'FILL' 0, 'wght' 300" }}
            >
              {tab.icon}
            </span>
            <span className="hidden sm:inline">{tab.label}</span>
            {tab.count > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
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
        <div className="space-y-6">
          {/* Section 1: Face & Body Shots */}
          <div className="bg-surface-container-low rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-gold text-xl" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>face</span>
                </div>
                <div>
                  <p className="text-on-surface text-sm font-medium font-heading">Face &amp; Body Shots</p>
                  <p className="text-on-surface-variant text-xs">2–3 clear face photos + 1–2 full body shots</p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <div className="bg-surface-container rounded-lg px-3 py-1.5 flex items-center gap-1.5 text-xs text-on-surface-variant">
                  <span className="material-symbols-outlined text-gold text-sm" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>photo_camera</span>
                  Front-facing, well-lit
                </div>
                <div className="bg-surface-container rounded-lg px-3 py-1.5 flex items-center gap-1.5 text-xs text-on-surface-variant">
                  <span className="material-symbols-outlined text-gold text-sm" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>smartphone</span>
                  iPhone or professional
                </div>
              </div>
            </div>
            <div className="border-2 border-dashed border-outline-variant/20 rounded-xl p-6 text-center hover:border-gold/40 transition-colors duration-300">
              <span className="material-symbols-outlined text-3xl text-outline/40 mb-2 block" style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>face</span>
              <p className="text-on-surface-variant text-sm mb-3">Face &amp; body photos</p>
              <label>
                <input type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" disabled={uploading} />
                <span className="inline-flex items-center justify-center gold-gradient text-on-gold font-semibold rounded-full cursor-pointer px-5 py-2 text-xs">
                  {uploading ? "Uploading..." : "Select Files"}
                </span>
              </label>
            </div>
          </div>

          {/* Section 2: Profile & Lifestyle Photos (merged) */}
          <div className="bg-surface-container-low rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-gold text-xl" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>collections</span>
              </div>
              <div>
                <p className="text-on-surface text-sm font-medium font-heading">Profile &amp; Lifestyle Photos</p>
                <p className="text-on-surface-variant text-xs">Current dating app photos + lifestyle shots</p>
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
                  <span className="text-on-surface-variant text-[11px]">{cat.label}</span>
                </div>
              ))}
            </div>
            <div className="border-2 border-dashed border-outline-variant/20 rounded-xl p-6 text-center hover:border-gold/40 transition-colors duration-300">
              <span className="material-symbols-outlined text-3xl text-outline/40 mb-2 block" style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>collections</span>
              <p className="text-on-surface-variant text-sm mb-3">Profile &amp; lifestyle photos</p>
              <label>
                <input type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" disabled={uploading} />
                <span className="inline-flex items-center justify-center gold-gradient text-on-gold font-semibold rounded-full cursor-pointer px-5 py-2 text-xs">
                  {uploading ? "Uploading..." : "Select Files"}
                </span>
              </label>
            </div>
          </div>

          <div className="bg-surface-container rounded-xl p-4 flex items-start gap-3">
            <span className="material-symbols-outlined text-gold text-lg mt-0.5" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>lightbulb</span>
            <p className="text-on-surface-variant text-xs">
              Natural lighting, no heavy filters, and clear shots work best. Don&apos;t have enough? No problem — we&apos;ll curate some for you.
            </p>
          </div>

          {/* Uploaded photos grid */}
          {uploadedPhotos.length > 0 && (
            <div>
              <p className="text-on-surface-variant text-xs uppercase tracking-widest mb-3">Your Uploaded Photos ({uploadedPhotos.length})</p>
              <PhotoGrid photos={uploadedPhotos} />
            </div>
          )}
        </div>
      )}

      {activeTab === "curated" && (
        <div className="space-y-4">
          {curatedPhotos.length === 0 ? (
            <div className="bg-surface-container-low rounded-2xl p-10 text-center space-y-3">
              <span className="material-symbols-outlined text-5xl text-outline/30 block" style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>auto_fix_high</span>
              <p className="text-on-surface font-heading font-medium text-lg">No curated photos yet</p>
              <p className="text-on-surface-variant text-sm max-w-md mx-auto">
                Once you upload your photos, your matchmaker will review, enhance, and curate the best selection for your profiles. We also create additional images to maximize your match quality.
              </p>
              <p className="text-gold text-xs font-medium mt-2">You&apos;ll be notified by email when photos are ready for your approval.</p>
            </div>
          ) : (
            <>
              <div className="bg-gold/5 border border-gold/15 rounded-xl px-5 py-3">
                <p className="text-on-surface-variant text-sm">
                  These photos have been curated and enhanced by your matchmaker. Review each one below — <span className="text-gold font-semibold">approve to go live, or request changes with a note</span>.
                </p>
              </div>
              <CuratedPhotoReview photos={curatedPhotos} clientId={clientId} />
            </>
          )}
        </div>
      )}

      {activeTab === "live" && (
        <div className="space-y-4">
          {livePhotos.length === 0 ? (
            <div className="bg-surface-container-low rounded-2xl p-10 text-center space-y-3">
              <span className="material-symbols-outlined text-5xl text-outline/30 block" style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>rocket_launch</span>
              <p className="text-on-surface font-heading font-medium text-lg">No live photos yet</p>
              <p className="text-on-surface-variant text-sm max-w-md mx-auto">
                Once you approve your curated photos, your matchmaker will push them live to your dating profiles. Check back here to see what&apos;s currently active.
              </p>
            </div>
          ) : (
            <>
              <div className="bg-gold/5 border border-gold/15 rounded-xl px-5 py-3">
                <p className="text-on-surface-variant text-sm">
                  These photos are currently <span className="text-gold font-semibold">live on your dating profiles</span>.
                </p>
              </div>
              <PhotoGrid photos={livePhotos} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CuratedPhotoReview({ photos }: { photos: any[]; clientId: string }) {
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {photos.map((photo) => (
        <div key={photo.id} className="bg-surface-container-low rounded-2xl overflow-hidden">
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
            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => handleApprove(photo.id)}
                disabled={processing === photo.id}
                className="flex-1 flex items-center justify-center gap-2 gold-gradient text-on-gold font-semibold rounded-full py-2.5 text-xs hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}>check_circle</span>
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
                className="flex items-center justify-center gap-2 border border-outline-variant/20 text-on-surface-variant rounded-full px-4 py-2.5 text-xs hover:border-gold/40 hover:text-on-surface transition-all disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>edit_note</span>
                Request Changes
              </button>
            </div>

            {/* Note input */}
            {noteOpen === photo.id && (
              <div className="space-y-2">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Leave a note for your matchmaker — explain why or request specific changes..."
                  rows={3}
                  className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-3 py-2 text-on-surface text-sm placeholder:text-outline focus:border-gold focus:ring-1 focus:ring-gold outline-none resize-none"
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => { setNoteOpen(null); setNoteText(""); }}
                    className="text-on-surface-variant text-xs hover:text-on-surface transition-colors px-3 py-1.5"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleRequestChanges(photo.id)}
                    disabled={!noteText.trim() || processing === photo.id}
                    className="gold-gradient text-on-gold font-semibold rounded-full px-4 py-1.5 text-xs hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    Send Feedback
                  </button>
                </div>
              </div>
            )}

            {/* Existing feedback */}
            {photo.feedback && noteOpen !== photo.id && (
              <div className="bg-surface-container rounded-lg p-3">
                <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-1">Your Note</p>
                <p className="text-on-surface text-xs">{photo.feedback}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PhotoGrid({ photos }: { photos: any[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {photos.map((photo) => {
        const st = statusLabels[photo.status] ?? statusLabels.uploaded;
        return (
          <div
            key={photo.id}
            className="relative group rounded-xl overflow-hidden bg-surface-container-high"
          >
            {photo.storage_url ? (
              <Image
                src={photo.storage_url}
                alt="Profile asset"
                width={300}
                height={400}
                className="w-full h-56 object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
              />
            ) : (
              <div className="w-full h-56 flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-4xl text-outline/30"
                  style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}
                >
                  image
                </span>
              </div>
            )}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3">
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
