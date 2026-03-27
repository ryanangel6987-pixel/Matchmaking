"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface PhotoReviewCardProps {
  photo: {
    id: string;
    client_id: string;
    storage_path?: string;
    storage_url?: string;
    file_path?: string;
    status: string;
    slot_number?: number | null;
    photo_category?: string | null;
    review_notes?: string | null;
    feedback?: string | null;
    reviewed_by?: string | null;
    approved_at?: string | null;
    created_at: string;
    updated_at: string;
  };
  matchmakerProfileId: string;
}

const STATUS_CONFIG: Record<string, { badge: string; icon: string }> = {
  uploaded:          { badge: "border-outline-variant/30 text-outline", icon: "cloud_upload" },
  pending_review:    { badge: "border-outline-variant/30 text-outline", icon: "pending" },
  approved:          { badge: "border-gold/30 text-gold", icon: "check_circle" },
  live:              { badge: "border-gold/30 text-gold", icon: "public" },
  changes_requested: { badge: "border-error-red/30 text-error-red", icon: "edit_note" },
  archived:          { badge: "border-outline-variant/30 text-outline", icon: "archive" },
};

export function PhotoReviewCard({ photo, matchmakerProfileId }: PhotoReviewCardProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [reviewNotes, setReviewNotes] = useState(photo.review_notes ?? photo.feedback ?? "");

  const config = STATUS_CONFIG[photo.status] ?? STATUS_CONFIG.uploaded;

  // Build Supabase storage public URL — support both storage_url and storage_path
  const photoUrl = photo.storage_url
    ? photo.storage_url
    : photo.storage_path
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${photo.storage_path}`
      : null;

  const updateStatus = async (newStatus: string, notes?: string) => {
    setLoading(true);
    const updateData: Record<string, unknown> = {
      status: newStatus,
      reviewed_by: matchmakerProfileId,
      ...(newStatus === "approved" ? { approved_at: new Date().toISOString() } : {}),
      ...(newStatus === "live" ? { live_at: new Date().toISOString() } : {}),
    };
    if (notes !== undefined) {
      updateData.review_notes = notes;
    }
    await supabase
      .from("photos")
      .update(updateData)
      .eq("id", photo.id);
    setLoading(false);
    setShowNotes(false);
    router.refresh();
  };

  const handleRequestChanges = () => {
    if (!showNotes) {
      setShowNotes(true);
      return;
    }
    updateStatus("changes_requested", reviewNotes);
  };

  return (
    <div className="bg-surface-container-low rounded-2xl shadow-xl overflow-hidden flex flex-col">
      {/* Photo */}
      <div className="relative aspect-[4/5] bg-surface-container">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt={`Photo slot ${photo.slot_number ?? "?"}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span
              className="material-symbols-outlined text-6xl text-outline/30"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
            >
              image
            </span>
          </div>
        )}

        {/* Slot number badge */}
        {photo.slot_number != null && (
          <div className="absolute top-3 left-3 bg-surface/80 backdrop-blur-sm rounded-full px-3 py-1">
            <span className="text-on-surface text-xs font-medium">Slot {photo.slot_number}</span>
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
          <Badge variant="outline" className={`text-[9px] uppercase tracking-widest backdrop-blur-sm bg-surface/60 ${config.badge}`}>
            <span
              className="material-symbols-outlined text-xs mr-1"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 400", fontSize: "12px" }}
            >
              {config.icon}
            </span>
            {photo.status.replace(/_/g, " ")}
          </Badge>
          {/* Photo category badge */}
          {photo.photo_category && photo.photo_category !== "general" && (
            <Badge variant="outline" className="text-[9px] uppercase tracking-widest backdrop-blur-sm bg-surface/60 border-gold/30 text-gold">
              <span
                className="material-symbols-outlined text-xs mr-1"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 300", fontSize: "12px" }}
              >
                {photo.photo_category === "face_body" ? "face" : photo.photo_category === "lifestyle" ? "collections" : photo.photo_category === "current_profile" ? "account_circle" : photo.photo_category === "curated" ? "auto_fix_high" : "image"}
              </span>
              {photo.photo_category.replace(/_/g, " ")}
            </Badge>
          )}
        </div>
      </div>

      {/* Info + Actions */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Metadata */}
        <div className="text-on-surface-variant text-[10px] uppercase tracking-widest">
          Uploaded {new Date(photo.created_at).toLocaleDateString("en-US")}
          {photo.approved_at && (
            <span> &middot; Reviewed {new Date(photo.approved_at).toLocaleDateString("en-US")}</span>
          )}
        </div>

        {/* Existing review notes */}
        {photo.review_notes && !showNotes && (
          <div className="bg-surface-container p-3 rounded-xl">
            <p className="text-on-surface-variant text-xs leading-relaxed">{photo.review_notes}</p>
          </div>
        )}

        {/* Notes input for Request Changes */}
        {showNotes && (
          <div className="space-y-2">
            <Textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Describe what changes are needed..."
              rows={3}
              className="bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-outline text-sm"
            />
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 mt-auto">
          {(photo.status === "uploaded" || photo.status === "pending_review" || photo.status === "changes_requested") && (
            <Button
              onClick={() => updateStatus("approved")}
              disabled={loading}
              size="sm"
              className="gold-gradient text-on-gold font-semibold rounded-full text-xs flex-1"
            >
              <span className="material-symbols-outlined text-sm mr-1" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400", fontSize: "14px" }}>check</span>
              Approve
            </Button>
          )}

          {(photo.status === "uploaded" || photo.status === "pending_review") && (
            <Button
              onClick={handleRequestChanges}
              disabled={loading}
              variant="outline"
              size="sm"
              className="rounded-full text-xs border-error-red/30 text-error-red hover:bg-error-red/10 flex-1"
            >
              <span className="material-symbols-outlined text-sm mr-1" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400", fontSize: "14px" }}>edit_note</span>
              {showNotes ? "Submit Notes" : "Request Changes"}
            </Button>
          )}

          {photo.status === "approved" && (
            <Button
              onClick={() => updateStatus("live")}
              disabled={loading}
              size="sm"
              className="gold-gradient text-on-gold font-semibold rounded-full text-xs flex-1"
            >
              <span className="material-symbols-outlined text-sm mr-1" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400", fontSize: "14px" }}>public</span>
              Set Live
            </Button>
          )}

          {photo.status !== "archived" && (
            <Button
              onClick={() => updateStatus("archived")}
              disabled={loading}
              variant="outline"
              size="sm"
              className="rounded-full text-xs border-outline-variant/20 text-on-surface-variant hover:bg-surface-container"
            >
              <span className="material-symbols-outlined text-sm mr-1" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400", fontSize: "14px" }}>archive</span>
              Archive
            </Button>
          )}

          {showNotes && (
            <Button
              onClick={() => setShowNotes(false)}
              variant="outline"
              size="sm"
              className="rounded-full text-xs border-outline-variant/20 text-on-surface-variant"
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
