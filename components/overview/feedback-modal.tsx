"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function FeedbackModal({ opportunity, clientId }: { opportunity: any; clientId: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [preferenceUpdate, setPreferenceUpdate] = useState("");
  const [venueFeedback, setVenueFeedback] = useState("");
  const [avoidanceNotes, setAvoidanceNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await supabase.from("optional_date_feedback").insert({
      date_opportunity_id: opportunity.id,
      client_id: clientId,
      notes: notes || null,
      preference_update: preferenceUpdate || null,
      venue_feedback: venueFeedback || null,
      avoidance_notes: avoidanceNotes || null,
    });

    setLoading(false);
    setOpen(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="w-full flex items-center justify-center gap-2 gold-gradient text-on-gold font-semibold rounded-full h-10 text-sm hover:opacity-90 transition-opacity">
        <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>rate_review</span>
        Add Feedback
      </DialogTrigger>
      <DialogContent className="bg-surface-container-low border-outline-variant/20 text-on-surface max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-gold">
            Post-Date Notes — {opportunity.candidate_name}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label className="text-gold text-xs uppercase tracking-wider">Notes from the date</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="How did it go?" rows={2} className="bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-outline" />
          </div>
          <div className="space-y-2">
            <Label className="text-gold text-xs uppercase tracking-wider">Preference updates</Label>
            <Textarea value={preferenceUpdate} onChange={(e) => setPreferenceUpdate(e.target.value)} placeholder="Any changes to what you're looking for?" rows={2} className="bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-outline" />
          </div>
          <div className="space-y-2">
            <Label className="text-gold text-xs uppercase tracking-wider">Venue feedback</Label>
            <Textarea value={venueFeedback} onChange={(e) => setVenueFeedback(e.target.value)} placeholder="How was the venue?" rows={1} className="bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-outline" />
          </div>
          <div className="space-y-2">
            <Label className="text-gold text-xs uppercase tracking-wider">Avoidance notes</Label>
            <Textarea value={avoidanceNotes} onChange={(e) => setAvoidanceNotes(e.target.value)} placeholder='e.g. "no more lawyers"' rows={1} className="bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-outline" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading} className="flex-1 gold-gradient text-on-gold font-semibold rounded-full h-10">
              {loading ? "Saving..." : "Submit Feedback"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="text-on-surface-variant">
              Skip
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
