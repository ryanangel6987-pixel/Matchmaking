"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface SupportNotesManagerProps {
  clientId: string;
  authorId: string;
  notes: any[];
}

export function SupportNotesManager({ clientId, authorId, notes }: SupportNotesManagerProps) {
  const router = useRouter();
  const supabase = createClient();
  const [noteText, setNoteText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setLoading(true);
    setError("");

    const { error: insertError } = await supabase
      .from("support_notes")
      .insert({
        client_id: clientId,
        author_id: authorId,
        note_text: noteText.trim(),
      });

    if (insertError) {
      setError(insertError.message);
      toast.error("Failed to add note");
    } else {
      setNoteText("");
      toast.success("Note added");
      router.refresh();
    }
    setLoading(false);
  };

  const handleDelete = async (noteId: string) => {
    if (!confirm("Delete this note? This cannot be undone.")) return;
    const { error: deleteError } = await supabase
      .from("support_notes")
      .delete()
      .eq("id", noteId);

    if (deleteError) {
      setError(deleteError.message);
    } else {
      router.refresh();
    }
  };

  const formatTimestamp = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Add Note Form */}
      <form onSubmit={handleAdd} className="bg-surface-container-low p-6 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="material-symbols-outlined text-2xl text-gold" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>sticky_note_2</span>
          <h2 className="font-heading text-xl font-bold text-on-surface">Add Note</h2>
        </div>
        <Textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Write a support note..."
          rows={3}
          required
          className="bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-outline"
        />
        {error && <p className="text-error-red text-sm">{error}</p>}
        <Button type="submit" disabled={loading || !noteText.trim()} className="gold-gradient text-on-gold font-semibold rounded-full">
          {loading ? "Saving..." : "Add Note"}
        </Button>
      </form>

      {/* Notes List */}
      {notes.length === 0 ? (
        <div className="bg-surface-container-low p-8 rounded-2xl text-center">
          <p className="text-on-surface-variant/60 text-sm">No notes yet. Add one above to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => {
            const authorName = (note.profiles as any)?.full_name ?? "Unknown";
            const isOwner = note.author_id === authorId;

            return (
              <div key={note.id} className="bg-surface-container-low p-5 rounded-2xl space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-gold/60" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>person</span>
                      <span className="text-gold text-xs font-medium uppercase tracking-wider">{authorName}</span>
                      <span className="text-outline text-[10px]">&middot;</span>
                      <span className="text-on-surface-variant text-[10px] tracking-wide">{formatTimestamp(note.created_at)}</span>
                    </div>
                    <p className="text-on-surface text-sm whitespace-pre-wrap leading-relaxed">{note.note_text}</p>
                  </div>
                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => handleDelete(note.id)}
                      className="text-error-red/60 hover:text-error-red transition-colors flex items-center gap-1 text-xs ml-4 shrink-0"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                      Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
