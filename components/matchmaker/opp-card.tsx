"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CustomSelect } from "@/components/ui/custom-select";
import { editOpportunitySchema, type EditOpportunityInput } from "@/lib/schemas/opportunity";
import { toast } from "sonner";

interface OppCardProps {
  opp: any;
  photoUrl: string | null;
  datingApps: any[];
  venues: any[];
  onStatusChange: (id: string, status: string) => void;
}

export function OppCard({ opp, photoUrl, datingApps, venues, onStatusChange }: OppCardProps) {
  const router = useRouter();
  const supabase = createClient();
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditOpportunityInput>({
    resolver: zodResolver(editOpportunitySchema),
    defaultValues: {
      candidateName: opp.candidate_name ?? "",
      candidateAge: opp.candidate_age?.toString() ?? "",
      candidateProfession: opp.candidate_profession ?? "",
      candidateLocation: opp.candidate_location ?? "",
      candidateEducation: opp.candidate_education ?? "",
      phoneNumber: opp.phone_number ?? "",
      memorableDetail: opp.memorable_detail ?? "",
      dayDetermined: opp.day_determined ?? false,
      proposedDay: opp.proposed_day ?? "",
      proposedTime: opp.proposed_time ?? "",
      venueId: opp.venue_id ?? "",
      prewrittenText: opp.prewritten_text ?? "",
      notes: opp.notes ?? "",
      candidatePhotoUrl: opp.candidate_photo_url ?? "",
    },
  });

  const dayDetermined = watch("dayDetermined");

  const onSave = async (data: EditOpportunityInput) => {
    const { error } = await supabase
      .from("date_opportunities")
      .update({
        candidate_name: data.candidateName,
        candidate_age: data.candidateAge ? parseInt(data.candidateAge) : null,
        candidate_profession: data.candidateProfession || null,
        candidate_location: data.candidateLocation || null,
        candidate_education: data.candidateEducation || null,
        phone_number: data.phoneNumber || null,
        memorable_detail: data.memorableDetail || null,
        day_determined: data.dayDetermined,
        proposed_day: data.dayDetermined && data.proposedDay ? data.proposedDay : null,
        proposed_time: data.dayDetermined && data.proposedTime ? data.proposedTime : null,
        venue_id: data.venueId || null,
        prewritten_text: data.prewrittenText || null,
        notes: data.notes || null,
        candidate_photo_url: data.candidatePhotoUrl || null,
      })
      .eq("id", opp.id);

    if (error) {
      toast.error("Failed to save", { description: error.message });
    } else {
      toast.success("Opportunity updated");
      setEditing(false);
      router.refresh();
    }
  };

  const handleCancel = () => {
    setEditing(false);
    reset();
  };

  const dateStr = opp.proposed_day
    ? new Date(opp.proposed_day + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
    : "Day TBD";

  const decisionClass = opp.client_decision === "approved"
    ? "bg-gold/15 text-gold border border-gold/30"
    : opp.client_decision === "declined"
    ? "bg-error-red/15 text-error-red border border-error-red/30"
    : "bg-outline-variant/20 text-on-surface-variant border border-outline-variant/20";

  return (
    <div className="bg-surface-container-low rounded-2xl overflow-hidden">
      {/* Collapsed header */}
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center gap-4 p-4 text-left hover:bg-surface-container-low/80 transition-colors">
        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gold/10 flex items-center justify-center">
          {photoUrl ? (
            <img src={photoUrl} alt={opp.candidate_name} className="w-full h-full object-cover" />
          ) : (
            <span className="material-symbols-outlined text-gold text-base" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}>person</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-on-surface text-sm font-medium font-heading truncate">
            {opp.candidate_name}{opp.candidate_age ? `, ${opp.candidate_age}` : ""}
          </p>
          <p className="text-on-surface-variant text-xs truncate">
            {opp.dating_apps?.app_name && `${opp.dating_apps.app_name} · `}{dateStr}{opp.venues?.venue_name ? ` · ${opp.venues.venue_name}` : ""}
          </p>
        </div>
        <span className={`text-[9px] uppercase tracking-widest font-bold px-2 py-1 rounded-full shrink-0 ${decisionClass}`}>
          {opp.client_decision}
        </span>
        <span className={`material-symbols-outlined text-on-surface-variant text-lg transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}>expand_more</span>
      </button>

      {/* Expanded content */}
      <div className={`grid transition-all duration-300 ease-in-out ${expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <div className="px-4 pb-4 border-t border-outline-variant/10 space-y-4">
            {editing ? (
              /* ── EDIT MODE ── */
              <form onSubmit={handleSubmit(onSave)} className="mt-3 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-gold text-xs uppercase tracking-wider">Name *</Label>
                    <Input {...register("candidateName")} className="bg-surface-container border-outline-variant/20 text-on-surface" />
                    {errors.candidateName && <p className="text-error-red text-xs">{errors.candidateName.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-gold text-xs uppercase tracking-wider">Age</Label>
                    <Input type="number" {...register("candidateAge")} className="bg-surface-container border-outline-variant/20 text-on-surface" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-gold text-xs uppercase tracking-wider">Profession</Label>
                    <Input {...register("candidateProfession")} className="bg-surface-container border-outline-variant/20 text-on-surface" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-gold text-xs uppercase tracking-wider">Location</Label>
                    <Input {...register("candidateLocation")} className="bg-surface-container border-outline-variant/20 text-on-surface" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-gold text-xs uppercase tracking-wider">Education</Label>
                    <Input {...register("candidateEducation")} className="bg-surface-container border-outline-variant/20 text-on-surface" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-gold text-xs uppercase tracking-wider">Phone</Label>
                    <Input {...register("phoneNumber")} className="bg-surface-container border-outline-variant/20 text-on-surface" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-gold text-xs uppercase tracking-wider">Photo URL</Label>
                    <Input {...register("candidatePhotoUrl")} placeholder="https://..." className="bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-outline" />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-gold text-xs uppercase tracking-wider">Memorable Detail</Label>
                  <Textarea {...register("memorableDetail")} rows={2} className="bg-surface-container border-outline-variant/20 text-on-surface" />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={dayDetermined} onChange={(e) => setValue("dayDetermined", e.target.checked)} className="accent-[#e6c487]" />
                  <span className="text-on-surface text-sm">Day determined</span>
                </label>

                {dayDetermined && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-gold text-xs uppercase tracking-wider">Day</Label>
                      <Input type="date" {...register("proposedDay")} className="bg-surface-container border-outline-variant/20 text-on-surface" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-gold text-xs uppercase tracking-wider">Time</Label>
                      <Input type="time" {...register("proposedTime")} className="bg-surface-container border-outline-variant/20 text-on-surface" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-gold text-xs uppercase tracking-wider">Venue</Label>
                      <CustomSelect
                        value={watch("venueId") ?? ""}
                        onChange={(v) => setValue("venueId", v)}
                        options={[{ value: "", label: "Select venue" }, ...venues.map((v) => ({ value: v.id, label: v.venue_name }))]}
                        placeholder="Select venue"
                        className="w-full bg-surface-container border border-outline-variant/20 text-on-surface rounded-xl px-4 py-3 text-sm"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <Label className="text-gold text-xs uppercase tracking-wider">Prewritten Text</Label>
                  <Textarea {...register("prewrittenText")} rows={2} className="bg-surface-container border-outline-variant/20 text-on-surface" />
                </div>
                <div className="space-y-1">
                  <Label className="text-gold text-xs uppercase tracking-wider">Notes</Label>
                  <Textarea {...register("notes")} rows={2} className="bg-surface-container border-outline-variant/20 text-on-surface" />
                </div>

                <div className="flex gap-2 pt-1">
                  <Button type="submit" disabled={isSubmitting} className="gold-gradient text-on-gold font-semibold rounded-full text-xs">
                    {isSubmitting ? "Saving..." : "Save"}
                  </Button>
                  <Button type="button" onClick={handleCancel} variant="outline" size="sm" className="rounded-full text-xs border-outline-variant/20 text-on-surface-variant">
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              /* ── READ-ONLY MODE ── */
              <>
                {photoUrl && (
                  <div className="mt-3 rounded-xl overflow-hidden">
                    <img src={photoUrl} alt={opp.candidate_name} className="w-full h-[200px] object-cover" />
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                  {opp.candidate_profession && <div><p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-0.5">Profession</p><p className="text-on-surface text-sm">{opp.candidate_profession}</p></div>}
                  {opp.candidate_location && <div><p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-0.5">Location</p><p className="text-on-surface text-sm">{opp.candidate_location}</p></div>}
                  {opp.candidate_education && <div><p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-0.5">Education</p><p className="text-on-surface text-sm">{opp.candidate_education}</p></div>}
                  {opp.phone_number && <div><p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-0.5">Phone</p><p className="text-on-surface text-sm">{opp.phone_number}</p></div>}
                  {opp.venues?.venue_name && <div><p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-0.5">Venue</p><p className="text-on-surface text-sm">{opp.venues.venue_name}</p></div>}
                  <div><p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-0.5">Status</p><p className="text-on-surface text-sm">{opp.status.replace(/_/g, " ")}</p></div>
                </div>

                {opp.memorable_detail && (
                  <div><p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-1">About Her</p><p className="text-on-surface text-sm leading-relaxed">{opp.memorable_detail}</p></div>
                )}
                {opp.prewritten_text && (
                  <div className="bg-surface-container p-3 rounded-xl">
                    <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-1">Suggested Opening</p>
                    <p className="text-on-surface text-sm italic">&ldquo;{opp.prewritten_text}&rdquo;</p>
                  </div>
                )}
                {opp.notes && (
                  <div><p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-1">Notes</p><p className="text-on-surface text-sm leading-relaxed">{opp.notes}</p></div>
                )}
                {opp.decline_reason && (
                  <div className="bg-error-red/5 border border-error-red/15 rounded-xl p-3">
                    <p className="text-error-red text-[10px] uppercase tracking-widest mb-1">Decline Reason</p>
                    <p className="text-on-surface text-sm">{opp.decline_reason}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button onClick={() => setEditing(true)} variant="outline" size="sm" className="text-xs rounded-full border-gold/30 text-gold hover:bg-gold/10">
                    <span className="material-symbols-outlined text-sm mr-1" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400", fontSize: "14px" }}>edit</span>
                    Edit
                  </Button>
                  {opp.status === "lead" && (
                    <Button onClick={() => onStatusChange(opp.id, "date_closed")} variant="outline" size="sm" className="text-xs rounded-full border-outline-variant/20 text-on-surface-variant">
                      Advance to Date Closed
                    </Button>
                  )}
                  {opp.status === "date_closed" && (
                    <Button onClick={() => onStatusChange(opp.id, "pending_client_approval")} variant="outline" size="sm" className="text-xs rounded-full border-gold/30 text-gold">
                      Send to Client
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
