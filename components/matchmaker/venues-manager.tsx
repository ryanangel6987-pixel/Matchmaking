"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface VenuesManagerProps {
  clientId: string;
  venues: any[];
}

export function VenuesManager({ clientId, venues }: VenuesManagerProps) {
  const router = useRouter();
  const supabase = createClient();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  // New venue form state
  const [name, setName] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [vibe, setVibe] = useState("");
  const [dateType, setDateType] = useState("");
  const [notes, setNotes] = useState("");

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editNeighborhood, setEditNeighborhood] = useState("");
  const [editVibe, setEditVibe] = useState("");
  const [editDateType, setEditDateType] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [editFieldErrors, setEditFieldErrors] = useState<Record<string, string>>({});

  const validateAdd = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (!name || name.trim().length < 2) {
      errors.name = "Name is required (min 2 characters)";
    }
    if (!neighborhood || neighborhood.trim().length === 0) {
      errors.neighborhood = "Neighborhood is required";
    }
    return errors;
  };

  const validateEdit = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (!editName || editName.trim().length < 2) {
      errors.editName = "Name is required (min 2 characters)";
    }
    if (!editNeighborhood || editNeighborhood.trim().length === 0) {
      errors.editNeighborhood = "Neighborhood is required";
    }
    return errors;
  };

  const resetForm = () => {
    setName("");
    setNeighborhood("");
    setVibe("");
    setDateType("");
    setNotes("");
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateAdd();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setLoading(true);
    setError("");

    const { error: insertError } = await supabase
      .from("venues")
      .insert({
        client_id: clientId,
        name,
        neighborhood: neighborhood || null,
        vibe: vibe || null,
        date_type: dateType || null,
        notes: notes || null,
      });

    if (insertError) {
      setError(insertError.message);
    } else {
      resetForm();
      setShowForm(false);
      router.refresh();
    }
    setLoading(false);
  };

  const handleToggleActive = async (venueId: string, currentActive: boolean) => {
    await supabase.from("venues").update({ is_active: !currentActive }).eq("id", venueId);
    router.refresh();
  };

  const handleToggleAvoided = async (venueId: string, currentAvoided: boolean) => {
    await supabase.from("venues").update({ is_avoided: !currentAvoided }).eq("id", venueId);
    router.refresh();
  };

  const handleDelete = async (venueId: string) => {
    if (!confirm("Delete this venue? This cannot be undone.")) return;
    await supabase.from("venues").delete().eq("id", venueId);
    router.refresh();
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const startEdit = (venue: any) => {
    setEditingId(venue.id);
    setEditName(venue.name);
    setEditNeighborhood(venue.neighborhood ?? "");
    setEditVibe(venue.vibe ?? "");
    setEditDateType(venue.date_type ?? "");
    setEditNotes(venue.notes ?? "");
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (venueId: string) => {
    const errors = validateEdit();
    setEditFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setLoading(true);
    setError("");

    const { error: updateError } = await supabase
      .from("venues")
      .update({
        name: editName,
        neighborhood: editNeighborhood || null,
        vibe: editVibe || null,
        date_type: editDateType || null,
        notes: editNotes || null,
      })
      .eq("id", venueId);

    if (updateError) {
      setError(updateError.message);
    } else {
      setEditingId(null);
      router.refresh();
    }
    setLoading(false);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getStatusBadge = (venue: any) => {
    if (venue.is_avoided) {
      return <Badge variant="outline" className="text-[9px] uppercase tracking-widest border-error-red/30 text-error-red">Avoided</Badge>;
    }
    if (venue.is_active) {
      return <Badge variant="outline" className="text-[9px] uppercase tracking-widest border-emerald-400/30 text-emerald-400">Active</Badge>;
    }
    return <Badge variant="outline" className="text-[9px] uppercase tracking-widest border-outline-variant/30 text-outline">Inactive</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-2xl text-gold" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>location_on</span>
          <h2 className="font-heading text-xl font-bold text-on-surface">Venues</h2>
          <span className="text-on-surface-variant text-sm">({venues.length})</span>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gold-gradient text-on-gold font-semibold rounded-full">
          {showForm ? "Cancel" : "+ Add Venue"}
        </Button>
      </div>

      {/* Add Venue Form */}
      {showForm && (
        <form onSubmit={handleAdd} className="bg-surface-container-low p-8 rounded-2xl shadow-xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gold text-xs uppercase tracking-wider">Name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. The NoMad" className="bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-outline" />
              {fieldErrors.name && <p className="text-error-red text-xs mt-1">{fieldErrors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-gold text-xs uppercase tracking-wider">Neighborhood *</Label>
              <Input value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} placeholder="e.g. Flatiron, West Village" className="bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-outline" />
              {fieldErrors.neighborhood && <p className="text-error-red text-xs mt-1">{fieldErrors.neighborhood}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gold text-xs uppercase tracking-wider">Vibe</Label>
              <Input value={vibe} onChange={(e) => setVibe(e.target.value)} placeholder="e.g. Cozy, Upscale, Casual" className="bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-outline" />
            </div>
            <div className="space-y-2">
              <Label className="text-gold text-xs uppercase tracking-wider">Date Type</Label>
              <Input value={dateType} onChange={(e) => setDateType(e.target.value)} placeholder="e.g. First Date, Dinner, Drinks" className="bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-outline" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-gold text-xs uppercase tracking-wider">Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Reservation tips, best times, seating preferences..." rows={2} className="bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-outline" />
          </div>

          {error && <p className="text-error-red text-sm">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full gold-gradient text-on-gold font-semibold rounded-full h-12">
            {loading ? "Adding..." : "Add Venue"}
          </Button>
        </form>
      )}

      {/* Venues List */}
      {venues.length === 0 ? (
        <div className="bg-surface-container-low p-8 rounded-2xl text-center">
          <p className="text-on-surface-variant/60 text-sm">No venues yet. Add one to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {venues.map((v) => (
            <div key={v.id} className="bg-surface-container-low p-5 rounded-2xl space-y-3">
              {editingId === v.id ? (
                /* Inline Edit Form */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gold text-xs uppercase tracking-wider">Name *</Label>
                      <Input value={editName} onChange={(e) => setEditName(e.target.value)} required className="bg-surface-container border-outline-variant/20 text-on-surface" />
                      {editFieldErrors.editName && <p className="text-error-red text-xs mt-1">{editFieldErrors.editName}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gold text-xs uppercase tracking-wider">Neighborhood *</Label>
                      <Input value={editNeighborhood} onChange={(e) => setEditNeighborhood(e.target.value)} className="bg-surface-container border-outline-variant/20 text-on-surface" />
                      {editFieldErrors.editNeighborhood && <p className="text-error-red text-xs mt-1">{editFieldErrors.editNeighborhood}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gold text-xs uppercase tracking-wider">Vibe</Label>
                      <Input value={editVibe} onChange={(e) => setEditVibe(e.target.value)} className="bg-surface-container border-outline-variant/20 text-on-surface" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gold text-xs uppercase tracking-wider">Date Type</Label>
                      <Input value={editDateType} onChange={(e) => setEditDateType(e.target.value)} className="bg-surface-container border-outline-variant/20 text-on-surface" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gold text-xs uppercase tracking-wider">Notes</Label>
                    <Textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={2} className="bg-surface-container border-outline-variant/20 text-on-surface" />
                  </div>
                  {error && <p className="text-error-red text-sm">{error}</p>}
                  <div className="flex gap-3">
                    <Button onClick={() => handleSaveEdit(v.id)} disabled={loading} className="gold-gradient text-on-gold font-semibold rounded-full">
                      {loading ? "Saving..." : "Save"}
                    </Button>
                    <Button type="button" variant="outline" onClick={cancelEdit} className="rounded-full border-outline-variant/30 text-on-surface-variant">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                /* Display Mode */
                <>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <p className="text-on-surface font-medium font-heading text-lg">{v.name}</p>
                        {getStatusBadge(v)}
                      </div>
                      <div className="flex items-center gap-3 flex-wrap text-xs text-on-surface-variant">
                        {v.neighborhood && (
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">pin_drop</span>
                            {v.neighborhood}
                          </span>
                        )}
                        {v.vibe && (
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">mood</span>
                            {v.vibe}
                          </span>
                        )}
                        {v.date_type && (
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                            {v.date_type}
                          </span>
                        )}
                      </div>
                      {v.notes && (
                        <p className="text-on-surface-variant text-xs mt-1">{v.notes}</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-1 border-t border-outline-variant/10">
                    <button
                      type="button"
                      onClick={() => startEdit(v)}
                      className="text-gold/60 hover:text-gold transition-colors flex items-center gap-1 text-xs"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(v.id, v.is_active)}
                      className="text-on-surface-variant/60 hover:text-on-surface-variant transition-colors flex items-center gap-1 text-xs"
                    >
                      <span className="material-symbols-outlined text-[16px]">{v.is_active ? "toggle_on" : "toggle_off"}</span>
                      {v.is_active ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleAvoided(v.id, v.is_avoided)}
                      className={`transition-colors flex items-center gap-1 text-xs ${v.is_avoided ? "text-error-red/80 hover:text-error-red" : "text-on-surface-variant/60 hover:text-on-surface-variant"}`}
                    >
                      <span className="material-symbols-outlined text-[16px]">{v.is_avoided ? "block" : "do_not_disturb_on"}</span>
                      {v.is_avoided ? "Unavoid" : "Avoid"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(v.id)}
                      className="text-error-red/60 hover:text-error-red transition-colors flex items-center gap-1 text-xs"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
