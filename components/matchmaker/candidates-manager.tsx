"use client";

import { useState, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CustomSelect } from "@/components/ui/custom-select";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface CandidatesManagerProps {
  clientId: string;
  candidates: any[];
}

const STATUS_OPTIONS = [
  "candidate",
  "date_closed",
  "pending_client_approval",
  "approved",
  "declined",
  "archived",
];

const STATUS_COLORS: Record<string, string> = {
  candidate: "border-outline-variant/30 text-outline",
  date_closed: "border-gold/30 text-gold",
  pending_client_approval: "border-amber-400/30 text-amber-400",
  approved: "border-emerald-400/30 text-emerald-400",
  declined: "border-error-red/30 text-error-red",
  archived: "border-outline-variant/20 text-outline/50",
};

function CandidateTagInput({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [input, setInput] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const value = input.trim();
      if (value && !tags.includes(value)) {
        onChange([...tags, value]);
      }
      setInput("");
    }
    if (e.key === "Backspace" && input === "" && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-wrap gap-2 p-3 bg-surface-container border border-outline-variant/20 rounded-xl min-h-[48px] items-center">
      {tags.map((tag, i) => (
        <span key={i} className="inline-flex items-center gap-1 bg-gold/15 text-gold text-xs px-3 py-1 rounded-full">
          {tag}
          <button type="button" onClick={() => removeTag(i)} className="text-gold/60 hover:text-gold ml-0.5">
            <span className="material-symbols-outlined text-[14px]">close</span>
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? "Type and press Enter" : ""}
        className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-on-surface text-sm placeholder:text-outline"
      />
    </div>
  );
}

export function CandidatesManager({ clientId, candidates }: CandidatesManagerProps) {
  const router = useRouter();
  const supabase = createClient();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // New candidate form state
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [sourceApp, setSourceApp] = useState("");
  const [archetypeTags, setArchetypeTags] = useState<string[]>([]);
  const [matchmakerNotes, setMatchmakerNotes] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (!fullName || fullName.trim().length < 2) {
      errors.fullName = "Full name is required (min 2 characters)";
    }
    if (age) {
      const ageNum = parseInt(age);
      if (isNaN(ageNum) || ageNum < 18 || ageNum > 99) {
        errors.age = "Age must be between 18 and 99";
      }
    }
    if (!sourceApp || sourceApp.trim().length === 0) {
      errors.sourceApp = "Source app is required";
    }
    return errors;
  };

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setLoading(true);
    setError("");
    setSuccess(false);

    const { error: insertError } = await supabase
      .from("candidates")
      .insert({
        client_id: clientId,
        full_name: fullName,
        age: age ? parseInt(age) : null,
        source_app: sourceApp || null,
        archetype_tags: archetypeTags.length > 0 ? archetypeTags : null,
        status: "candidate",
        matchmaker_notes: matchmakerNotes || null,
      });

    if (insertError) {
      setError(insertError.message);
    } else {
      setSuccess(true);
      setFullName("");
      setAge("");
      setSourceApp("");
      setArchetypeTags([]);
      setMatchmakerNotes("");
      setShowForm(false);
      router.refresh();
    }
    setLoading(false);
  };

  const handleStatusChange = async (candidateId: string, newStatus: string) => {
    await supabase.from("candidates").update({ status: newStatus }).eq("id", candidateId);
    router.refresh();
  };

  const handleDelete = async (candidateId: string) => {
    if (!confirm("Delete this candidate? This cannot be undone.")) return;
    await supabase.from("candidates").delete().eq("id", candidateId);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-2xl text-gold" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>group</span>
          <h2 className="font-heading text-xl font-bold text-on-surface">Candidates</h2>
          <span className="text-on-surface-variant text-sm">({candidates.length})</span>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gold-gradient text-on-gold font-semibold rounded-full">
          {showForm ? "Cancel" : "+ Add Candidate"}
        </Button>
      </div>

      {/* Add Candidate Form */}
      {showForm && (
        <form onSubmit={handleAddCandidate} className="bg-surface-container-low p-8 rounded-2xl shadow-xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-gold text-xs uppercase tracking-wider">Full Name *</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required className="bg-surface-container border-outline-variant/20 text-on-surface" />
              {fieldErrors.fullName && <p className="text-error-red text-xs mt-1">{fieldErrors.fullName}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-gold text-xs uppercase tracking-wider">Age</Label>
              <Input type="number" min="18" max="99" value={age} onChange={(e) => setAge(e.target.value)} className="bg-surface-container border-outline-variant/20 text-on-surface" />
              {fieldErrors.age && <p className="text-error-red text-xs mt-1">{fieldErrors.age}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-gold text-xs uppercase tracking-wider">Source App *</Label>
              <Input value={sourceApp} onChange={(e) => setSourceApp(e.target.value)} placeholder="e.g. Hinge, Bumble" className="bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-outline" />
              {fieldErrors.sourceApp && <p className="text-error-red text-xs mt-1">{fieldErrors.sourceApp}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gold text-xs uppercase tracking-wider">Archetype Tags</Label>
            <CandidateTagInput tags={archetypeTags} onChange={setArchetypeTags} />
          </div>

          <div className="space-y-2">
            <Label className="text-gold text-xs uppercase tracking-wider">Matchmaker Notes</Label>
            <Textarea value={matchmakerNotes} onChange={(e) => setMatchmakerNotes(e.target.value)} placeholder="Internal notes about this candidate..." rows={2} className="bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-outline" />
          </div>

          {error && <p className="text-error-red text-sm">{error}</p>}
          {success && <p className="text-gold text-sm">Candidate added.</p>}

          <Button type="submit" disabled={loading} className="w-full gold-gradient text-on-gold font-semibold rounded-full h-12">
            {loading ? "Adding..." : "Add Candidate"}
          </Button>
        </form>
      )}

      {/* Candidates List */}
      {candidates.length === 0 ? (
        <div className="bg-surface-container-low p-8 rounded-2xl text-center">
          <p className="text-on-surface-variant/60 text-sm">No candidates yet. Add one to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {candidates.map((c) => (
            <div key={c.id} className="bg-surface-container-low p-5 rounded-2xl space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <p className="text-on-surface font-medium font-heading text-lg">{c.full_name}</p>
                    {c.age && <span className="text-on-surface-variant text-sm">{c.age} yrs</span>}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {c.source_app && (
                      <span className="text-on-surface-variant text-xs">{c.source_app}</span>
                    )}
                    {c.archetype_tags?.map((tag: string, i: number) => (
                      <span key={i} className="bg-gold/10 text-gold text-[10px] px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                  {c.matchmaker_notes && (
                    <p className="text-on-surface-variant text-xs mt-1">{c.matchmaker_notes}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className={`text-[9px] uppercase tracking-widest ${STATUS_COLORS[c.status] ?? STATUS_COLORS.candidate}`}>
                    {c.status.replace(/_/g, " ")}
                  </Badge>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-1 border-t border-outline-variant/10">
                <CustomSelect
                  value={c.status}
                  onChange={(v) => handleStatusChange(c.id, v)}
                  options={STATUS_OPTIONS.map((s) => ({ value: s, label: s.replace(/_/g, " ") }))}
                  className="bg-surface-container border border-outline-variant/20 text-on-surface rounded-xl px-3 py-2 text-xs"
                />
                <button
                  type="button"
                  onClick={() => handleDelete(c.id)}
                  className="text-error-red/60 hover:text-error-red transition-colors flex items-center gap-1 text-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
