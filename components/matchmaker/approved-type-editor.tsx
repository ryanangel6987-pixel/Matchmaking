"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface ApprovedTypeEditorProps {
  clientId: string;
  approvedType: any | null;
}

export function ApprovedTypeEditor({ clientId, approvedType }: ApprovedTypeEditorProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [targetArchetype, setTargetArchetype] = useState(approvedType?.target_archetype ?? "");
  const [whatToPrioritize, setWhatToPrioritize] = useState(approvedType?.what_to_prioritize ?? "");
  const [whatToAvoid, setWhatToAvoid] = useState(approvedType?.what_to_avoid ?? "");
  const [notes, setNotes] = useState(approvedType?.notes ?? "");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const payload = {
      client_id: clientId,
      target_archetype: targetArchetype || null,
      what_to_prioritize: whatToPrioritize || null,
      what_to_avoid: whatToAvoid || null,
      notes: notes || null,
    };

    const { error: upsertError } = approvedType?.id
      ? await supabase.from("approved_type").update(payload).eq("id", approvedType.id)
      : await supabase.from("approved_type").insert(payload);

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
        <span className="material-symbols-outlined text-2xl text-gold" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>person_check</span>
        <h2 className="font-heading text-xl font-bold text-on-surface">Approved Type</h2>
      </div>

      <div className="space-y-2">
        <Label className="text-gold text-xs uppercase tracking-wider">Target Archetype</Label>
        <Textarea value={targetArchetype} onChange={(e) => setTargetArchetype(e.target.value)} placeholder="Describe the ideal partner archetype..." rows={3} className="bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-outline" />
      </div>

      <div className="space-y-2">
        <Label className="text-gold text-xs uppercase tracking-wider">What to Prioritize</Label>
        <Textarea value={whatToPrioritize} onChange={(e) => setWhatToPrioritize(e.target.value)} placeholder="Key traits, values, or qualities to seek..." rows={3} className="bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-outline" />
      </div>

      <div className="space-y-2">
        <Label className="text-gold text-xs uppercase tracking-wider">What to Avoid</Label>
        <Textarea value={whatToAvoid} onChange={(e) => setWhatToAvoid(e.target.value)} placeholder="Dealbreakers or red flags to watch for..." rows={3} className="bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-outline" />
      </div>

      <div className="space-y-2">
        <Label className="text-gold text-xs uppercase tracking-wider">Notes</Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional notes about the approved type..." rows={2} className="bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-outline" />
      </div>

      {error && <p className="text-error-red text-sm">{error}</p>}
      {success && <p className="text-gold text-sm">Approved type saved successfully.</p>}

      <Button type="submit" disabled={loading} className="w-full gold-gradient text-on-gold font-semibold rounded-full h-12">
        {loading ? "Saving..." : "Save Approved Type"}
      </Button>
    </form>
  );
}
