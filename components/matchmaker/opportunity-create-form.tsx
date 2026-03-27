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
import { createOpportunitySchema, type CreateOpportunityInput } from "@/lib/schemas/opportunity";
import { toast } from "sonner";

interface OpportunityCreateFormProps {
  clientId: string;
  matchmakerProfileId: string;
  datingApps: any[];
  venues: any[];
  onClose: () => void;
}

export function OpportunityCreateForm({
  clientId,
  matchmakerProfileId,
  datingApps,
  venues,
  onClose,
}: OpportunityCreateFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateOpportunityInput>({
    resolver: zodResolver(createOpportunitySchema),
    defaultValues: {
      candidateName: "",
      candidateAge: "",
      candidateProfession: "",
      candidateLocation: "",
      candidateEducation: "",
      appId: datingApps[0]?.id ?? "",
      memorableDetail: "",
      phoneNumber: "",
      dayDetermined: true,
      proposedDay: "",
      proposedTime: "",
      venueId: "",
      prewrittenText: "",
      notes: "",
    },
  });

  const dayDetermined = watch("dayDetermined");
  const notes = watch("notes");

  const onSubmit = async (data: CreateOpportunityInput) => {
    const { error } = await supabase.from("date_opportunities").insert({
      client_id: clientId,
      app_id: data.appId || null,
      candidate_name: data.candidateName,
      candidate_age: data.candidateAge ? parseInt(data.candidateAge) : null,
      candidate_profession: data.candidateProfession || null,
      candidate_location: data.candidateLocation || null,
      candidate_education: data.candidateEducation || null,
      memorable_detail: data.memorableDetail || null,
      phone_number: data.phoneNumber || null,
      phone_shared_at: data.phoneNumber ? new Date().toISOString() : null,
      day_determined: data.dayDetermined,
      proposed_day: data.dayDetermined && data.proposedDay ? data.proposedDay : null,
      proposed_time: data.dayDetermined && data.proposedTime ? data.proposedTime : null,
      venue_id: data.venueId || null,
      prewritten_text: data.prewrittenText || null,
      notes: data.notes || null,
      status: "lead",
      created_by: matchmakerProfileId,
    });

    if (error) {
      toast.error("Failed to create opportunity", { description: error.message });
    } else {
      toast.success("Date opportunity created");
      onClose();
      router.refresh();
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `candidates/${clientId}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("photos").upload(path, file);
      if (!upErr) {
        const { data: urlData } = supabase.storage.from("photos").getPublicUrl(path);
        urls.push(urlData.publicUrl);
      }
    }
    if (urls.length > 0) {
      const current = notes ?? "";
      setValue("notes", current + (current ? "\n" : "") + "Photos: " + urls.join(", "));
    }
    setUploading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-surface-container-low p-6 rounded-2xl shadow-xl space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-gold text-xs uppercase tracking-wider">Candidate Name *</Label>
          <Input {...register("candidateName")} className="bg-surface-container border-outline-variant/20 text-on-surface" />
          {errors.candidateName && <p className="text-error-red text-xs">{errors.candidateName.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label className="text-gold text-xs uppercase tracking-wider">Age</Label>
          <Input type="number" {...register("candidateAge")} className="bg-surface-container border-outline-variant/20 text-on-surface" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label className="text-gold text-xs uppercase tracking-wider">Profession</Label>
          <Input {...register("candidateProfession")} placeholder="e.g. Marketing Director" className="bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-outline" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-gold text-xs uppercase tracking-wider">Location</Label>
          <Input {...register("candidateLocation")} placeholder="e.g. West Village" className="bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-outline" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-gold text-xs uppercase tracking-wider">Education</Label>
          <Input {...register("candidateEducation")} placeholder="e.g. Columbia" className="bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-outline" />
        </div>
      </div>

      {/* Photo upload */}
      <div className="space-y-1.5">
        <Label className="text-gold text-xs uppercase tracking-wider">Candidate Photos</Label>
        <label className="cursor-pointer block">
          <div className="border-2 border-dashed border-outline-variant/20 rounded-xl p-3 text-center hover:border-gold/40 transition-colors">
            <input type="file" accept="image/*" multiple className="hidden" disabled={uploading} onChange={handlePhotoUpload} />
            <span className="material-symbols-outlined text-xl text-outline/40 mb-0.5 block" style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>add_photo_alternate</span>
            <p className="text-on-surface-variant text-xs">{uploading ? "Uploading..." : "Upload profile screenshots"}</p>
          </div>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-gold text-xs uppercase tracking-wider">App</Label>
          <CustomSelect
            value={watch("appId") ?? ""}
            onChange={(v) => setValue("appId", v)}
            options={[{ value: "", label: "None" }, ...datingApps.map((app) => ({ value: app.id, label: app.app_name }))]}
            placeholder="None"
            className="w-full bg-surface-container border border-outline-variant/20 text-on-surface rounded-xl px-4 py-3 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-gold text-xs uppercase tracking-wider">Phone Number</Label>
          <Input {...register("phoneNumber")} className="bg-surface-container border-outline-variant/20 text-on-surface" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-gold text-xs uppercase tracking-wider">Memorable Detail</Label>
        <Textarea {...register("memorableDetail")} rows={2} className="bg-surface-container border-outline-variant/20 text-on-surface" />
      </div>

      {/* Day determined toggle */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={dayDetermined} onChange={(e) => setValue("dayDetermined", e.target.checked)} className="accent-[#e6c487]" />
        <span className="text-on-surface text-sm">Day determined</span>
      </label>

      {dayDetermined ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-gold text-xs uppercase tracking-wider">Proposed Day</Label>
            <Input type="date" {...register("proposedDay")} className="bg-surface-container border-outline-variant/20 text-on-surface" />
            {errors.proposedDay && <p className="text-error-red text-xs">{errors.proposedDay.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-gold text-xs uppercase tracking-wider">Proposed Time</Label>
            <Input type="time" {...register("proposedTime")} className="bg-surface-container border-outline-variant/20 text-on-surface" />
          </div>
          <div className="space-y-1.5">
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
      ) : (
        <div className="bg-surface-container p-3 rounded-xl">
          <p className="text-gold text-xs uppercase tracking-widest">Day to be finalized</p>
          <p className="text-on-surface-variant text-xs mt-1">You can add venue suggestions in notes.</p>
        </div>
      )}

      <div className="space-y-1.5">
        <Label className="text-gold text-xs uppercase tracking-wider">Prewritten Text</Label>
        <Textarea {...register("prewrittenText")} placeholder="Suggested opening message" rows={2} className="bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-outline" />
      </div>

      <div className="space-y-1.5">
        <Label className="text-gold text-xs uppercase tracking-wider">Notes</Label>
        <Textarea {...register("notes")} placeholder="Internal notes" rows={2} className="bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-outline" />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting} className="flex-1 gold-gradient text-on-gold font-semibold rounded-full h-11">
          {isSubmitting ? "Creating..." : "Create Opportunity"}
        </Button>
        <Button type="button" onClick={onClose} variant="outline" className="rounded-full border-outline-variant/20 text-on-surface-variant">
          Cancel
        </Button>
      </div>
    </form>
  );
}
