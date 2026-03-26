"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { showSuccess } from "@/lib/toast";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function PostDateFeedback({ opportunity, clientId }: { opportunity: any; clientId: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [wantSecondDate, setWantSecondDate] = useState<boolean | null>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Don't show if date is not in the past or feedback already submitted
  const dateInPast = opportunity.proposed_day
    ? new Date(opportunity.proposed_day + "T23:59:59") < new Date()
    : false;

  if (!dateInPast || opportunity.feedback_status === "submitted") {
    return null;
  }

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);

    const { error } = await supabase
      .from("date_opportunities")
      .update({
        feedback_status: "submitted",
        feedback_rating: rating,
        feedback_notes: notes || null,
        feedback_want_second_date: wantSecondDate,
        feedback_submitted_at: new Date().toISOString(),
        date_completed_at: new Date().toISOString(),
      })
      .eq("id", opportunity.id);

    setSubmitting(false);

    if (!error) {
      setSubmitted(true);
      showSuccess("Feedback submitted — thank you!");
      router.refresh();
    }
  };

  if (submitted) {
    return (
      <div className="bg-surface-container-low rounded-2xl p-6 text-center space-y-2">
        <span
          className="material-symbols-outlined text-gold text-3xl"
          style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}
        >
          check_circle
        </span>
        <p className="text-on-surface font-heading text-sm">Feedback submitted</p>
        <p className="text-on-surface-variant text-xs">Your matchmaker will review your notes.</p>
      </div>
    );
  }

  const displayRating = hoverRating || rating;

  return (
    <div className="bg-surface-container-low rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-5 pb-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="material-symbols-outlined text-gold text-lg"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
          >
            rate_review
          </span>
          <h3 className="font-heading text-on-surface text-base">How did it go?</h3>
        </div>
        <p className="text-on-surface-variant text-xs">
          Your date with <span className="text-gold font-medium">{opportunity.candidate_name}</span>
        </p>
      </div>

      <div className="p-5 space-y-5">
        {/* Star rating */}
        <div className="space-y-2">
          <p className="text-gold text-[10px] uppercase tracking-widest font-semibold">Rating</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-110 active:scale-95"
              >
                <span
                  className={`material-symbols-outlined text-2xl ${
                    star <= displayRating ? "text-gold" : "text-outline/30"
                  }`}
                  style={{
                    fontVariationSettings: `'FILL' ${star <= displayRating ? 1 : 0}, 'wght' 300`,
                  }}
                >
                  star
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Would you see her again? */}
        <div className="space-y-2">
          <p className="text-gold text-[10px] uppercase tracking-widest font-semibold">
            Would you see her again?
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setWantSecondDate(true)}
              className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all ${
                wantSecondDate === true
                  ? "gold-gradient text-on-gold"
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setWantSecondDate(false)}
              className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all ${
                wantSecondDate === false
                  ? "bg-error-red/20 text-error-red border border-error-red/30"
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              No
            </button>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <p className="text-gold text-[10px] uppercase tracking-widest font-semibold">Notes</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything your matchmaker should know..."
            rows={3}
            className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface text-sm placeholder:text-outline resize-none focus:border-gold/50 outline-none transition-colors"
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting || rating === 0}
          className="w-full gold-gradient text-on-gold font-semibold rounded-full h-12 text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
              Submitting...
            </>
          ) : (
            <>
              <span
                className="material-symbols-outlined text-base"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
              >
                send
              </span>
              Submit Feedback
            </>
          )}
        </button>
      </div>
    </div>
  );
}
