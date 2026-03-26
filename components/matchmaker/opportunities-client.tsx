"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CustomSelect } from "@/components/ui/custom-select";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface OpportunitiesClientProps {
  clientId: string;
  clientName: string;
  matchmakerProfileId: string;
  datingApps: any[];
  venues: any[];
  opportunities: any[];
}

export function OpportunitiesClient({ clientId, clientName, matchmakerProfileId, datingApps, venues, opportunities }: OpportunitiesClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [candidateName, setCandidateName] = useState("");
  const [candidateAge, setCandidateAge] = useState("");
  const [candidateProfession, setCandidateProfession] = useState("");
  const [candidateLocation, setCandidateLocation] = useState("");
  const [candidateEducation, setCandidateEducation] = useState("");
  const [appId, setAppId] = useState(datingApps[0]?.id ?? "");
  const [memorableDetail, setMemorableDetail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dayDetermined, setDayDetermined] = useState(true);
  const [proposedDay, setProposedDay] = useState("");
  const [proposedTime, setProposedTime] = useState("");
  const [venueId, setVenueId] = useState("");
  const [prewrittenText, setPrewrittenText] = useState("");
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (!candidateName || candidateName.trim().length < 2) {
      errors.candidateName = "Candidate name is required (min 2 characters)";
    }
    if (dayDetermined && !phoneNumber.trim()) {
      errors.phoneNumber = "Phone number is required when day is determined";
    }
    if (dayDetermined && !proposedDay) {
      errors.proposedDay = "Proposed day is required when day is determined";
    }
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setLoading(true);
    setError("");
    setSuccess(false);

    const { error: insertError } = await supabase
      .from("date_opportunities")
      .insert({
        client_id: clientId,
        app_id: appId || null,
        candidate_name: candidateName,
        candidate_age: candidateAge ? parseInt(candidateAge) : null,
        candidate_profession: candidateProfession || null,
        candidate_location: candidateLocation || null,
        candidate_education: candidateEducation || null,
        memorable_detail: memorableDetail || null,
        phone_number: phoneNumber || null,
        phone_shared_at: phoneNumber ? new Date().toISOString() : null,
        day_determined: dayDetermined,
        proposed_day: dayDetermined && proposedDay ? proposedDay : null,
        proposed_time: dayDetermined && proposedTime ? proposedTime : null,
        venue_id: venueId || null,
        prewritten_text: prewrittenText || null,
        notes: notes || null,
        status: "lead",
        created_by: matchmakerProfileId,
      });

    if (insertError) {
      setError(insertError.message);
    } else {
      setSuccess(true);
      setCandidateName("");
      setCandidateAge("");
      setCandidateProfession("");
      setCandidateLocation("");
      setCandidateEducation("");
      setMemorableDetail("");
      setPhoneNumber("");
      setProposedDay("");
      setProposedTime("");
      setPrewrittenText("");
      setNotes("");
      setShowForm(false);
      router.refresh();
    }
    setLoading(false);
  };

  const handleStatusChange = async (oppId: string, newStatus: string) => {
    await supabase.from("date_opportunities").update({ status: newStatus }).eq("id", oppId);
    router.refresh();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Link href={`/clients/${clientId}`} className="text-gold text-xs uppercase tracking-widest hover:text-gold-light transition-colors">
            ← Back to {clientName}
          </Link>
          <h1 className="text-3xl font-heading font-bold text-gold tracking-tight mt-2">Date Opportunities</h1>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gold-gradient text-on-gold font-semibold rounded-full">
          {showForm ? "Cancel" : "+ New Opportunity"}
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-surface-container-low p-8 rounded-2xl shadow-xl space-y-6 max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gold text-xs uppercase tracking-wider">Candidate Name *</Label>
              <Input value={candidateName} onChange={(e) => setCandidateName(e.target.value)} required className="bg-surface-container border-outline-variant/20 text-on-surface" />
              {fieldErrors.candidateName && <p className="text-error-red text-xs mt-1">{fieldErrors.candidateName}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-gold text-xs uppercase tracking-wider">Age</Label>
              <Input type="number" value={candidateAge} onChange={(e) => setCandidateAge(e.target.value)} className="bg-surface-container border-outline-variant/20 text-on-surface" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-gold text-xs uppercase tracking-wider">Profession</Label>
              <Input value={candidateProfession} onChange={(e) => setCandidateProfession(e.target.value)} placeholder="e.g. Marketing Director" className="bg-surface-container border-outline-variant/20 text-on-surface" />
            </div>
            <div className="space-y-2">
              <Label className="text-gold text-xs uppercase tracking-wider">Location</Label>
              <Input value={candidateLocation} onChange={(e) => setCandidateLocation(e.target.value)} placeholder="e.g. West Village, NYC" className="bg-surface-container border-outline-variant/20 text-on-surface" />
            </div>
            <div className="space-y-2">
              <Label className="text-gold text-xs uppercase tracking-wider">Education</Label>
              <Input value={candidateEducation} onChange={(e) => setCandidateEducation(e.target.value)} placeholder="e.g. Columbia University" className="bg-surface-container border-outline-variant/20 text-on-surface" />
            </div>
          </div>

          {/* Photo upload */}
          <div className="space-y-2">
            <Label className="text-gold text-xs uppercase tracking-wider">Candidate Photos</Label>
            <div className="border-2 border-dashed border-outline-variant/20 rounded-xl p-4 text-center hover:border-gold/40 transition-colors">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  disabled={uploading}
                  onChange={async (e) => {
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
                    // Store first as main photo, rest in notes for now
                    if (urls.length > 0) {
                      setNotes((prev) => prev + (prev ? "\n" : "") + "Photos: " + urls.join(", "));
                    }
                    setUploading(false);
                  }}
                />
                <span className="material-symbols-outlined text-2xl text-outline/40 mb-1 block" style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>add_photo_alternate</span>
                <p className="text-on-surface-variant text-xs">{uploading ? "Uploading..." : "Upload her profile screenshots & conversation highlights"}</p>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gold text-xs uppercase tracking-wider">App</Label>
              <CustomSelect
                value={appId}
                onChange={(v) => setAppId(v)}
                options={[{ value: "", label: "None" }, ...datingApps.map((app) => ({ value: app.id, label: app.app_name }))]}
                placeholder="None"
                className="w-full bg-surface-container border border-outline-variant/20 text-on-surface rounded-xl px-4 py-3 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gold text-xs uppercase tracking-wider">Phone Number</Label>
              <Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="bg-surface-container border-outline-variant/20 text-on-surface" />
              {fieldErrors.phoneNumber && <p className="text-error-red text-xs mt-1">{fieldErrors.phoneNumber}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gold text-xs uppercase tracking-wider">Memorable Detail</Label>
            <Textarea value={memorableDetail} onChange={(e) => setMemorableDetail(e.target.value)} rows={2} className="bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-outline" />
          </div>

          {/* Day determined toggle */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={dayDetermined} onChange={(e) => setDayDetermined(e.target.checked)} className="accent-[#e6c487]" />
              <span className="text-on-surface text-sm">Day determined</span>
            </label>
          </div>

          {dayDetermined ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-gold text-xs uppercase tracking-wider">Proposed Day</Label>
                <Input type="date" value={proposedDay} onChange={(e) => setProposedDay(e.target.value)} className="bg-surface-container border-outline-variant/20 text-on-surface" />
                {fieldErrors.proposedDay && <p className="text-error-red text-xs mt-1">{fieldErrors.proposedDay}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-gold text-xs uppercase tracking-wider">Proposed Time</Label>
                <Input type="time" value={proposedTime} onChange={(e) => setProposedTime(e.target.value)} className="bg-surface-container border-outline-variant/20 text-on-surface" />
              </div>
              <div className="space-y-2">
                <Label className="text-gold text-xs uppercase tracking-wider">Venue</Label>
                <CustomSelect
                  value={venueId}
                  onChange={(v) => setVenueId(v)}
                  options={[{ value: "", label: "Select venue" }, ...venues.map((v) => ({ value: v.id, label: v.venue_name }))]}
                  placeholder="Select venue"
                  className="w-full bg-surface-container border border-outline-variant/20 text-on-surface rounded-xl px-4 py-3 text-sm"
                />
              </div>
            </div>
          ) : (
            <div className="bg-surface-container p-4 rounded-xl">
              <p className="text-gold text-xs uppercase tracking-widest">Day to be finalized</p>
              <p className="text-on-surface-variant text-xs mt-1">The client will see this note. You can add venue suggestions in notes.</p>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-gold text-xs uppercase tracking-wider">Prewritten Text</Label>
            <Textarea value={prewrittenText} onChange={(e) => setPrewrittenText(e.target.value)} placeholder="Suggested opening message for the client" rows={2} className="bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-outline" />
          </div>

          <div className="space-y-2">
            <Label className="text-gold text-xs uppercase tracking-wider">Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Internal notes" rows={2} className="bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-outline" />
          </div>

          {error && <p className="text-error-red text-sm">{error}</p>}
          {success && <p className="text-gold text-sm">Opportunity created.</p>}

          <Button type="submit" disabled={loading} className="w-full gold-gradient text-on-gold font-semibold rounded-full h-12">
            {loading ? "Creating..." : "Create Opportunity"}
          </Button>
        </form>
      )}

      {/* Opportunities List */}
      <section className="space-y-4">
        <h2 className="text-on-surface-variant text-xs uppercase tracking-widest">All Opportunities</h2>
        {opportunities.length === 0 ? (
          <p className="text-on-surface-variant/60 text-sm">No opportunities yet.</p>
        ) : (
          <div className="space-y-3">
            {opportunities.map((opp) => {
              const photoUrl = opp.candidate_photo_url || (opp.candidate_photos && opp.candidate_photos[0]);
              return (
                <OppCard key={opp.id} opp={opp} photoUrl={photoUrl} onStatusChange={handleStatusChange} />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

// ── Expandable Opportunity Card ─────────────────────────────────────
function OppCard({ opp, photoUrl, onStatusChange }: { opp: any; photoUrl: string | null; onStatusChange: (id: string, status: string) => void }) {
  const [expanded, setExpanded] = useState(false);

  const dateStr = opp.proposed_day
    ? new Date(opp.proposed_day + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
    : "Day TBD";

  const decisionClass = opp.client_decision === "approved" ? "bg-gold/15 text-gold border border-gold/30"
    : opp.client_decision === "declined" ? "bg-error-red/15 text-error-red border border-error-red/30"
    : "bg-outline-variant/20 text-on-surface-variant border border-outline-variant/20";

  return (
    <div className="bg-surface-container-low rounded-2xl overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center gap-4 p-4 text-left hover:bg-surface-container-low/80 transition-colors">
        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-transparent hover:ring-gold/30 transition-all">
          {photoUrl ? (
            <img src={photoUrl} alt={opp.candidate_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gold/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-gold text-lg" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}>person</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-on-surface text-sm font-medium font-heading truncate">
            {opp.candidate_name}{opp.candidate_age ? `, ${opp.candidate_age}` : ""}
          </p>
          <p className="text-on-surface-variant text-xs">
            {opp.dating_apps?.app_name && `${opp.dating_apps.app_name} · `}{dateStr}{opp.venues?.venue_name ? ` · ${opp.venues.venue_name}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[9px] uppercase tracking-widest font-bold px-2 py-1 rounded-full ${decisionClass}`}>
            {opp.client_decision}
          </span>
          <span className={`material-symbols-outlined text-on-surface-variant text-lg transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}>expand_more</span>
        </div>
      </button>

      <div className={`grid transition-all duration-300 ease-in-out ${expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <div className="px-4 pb-4 border-t border-outline-variant/10 space-y-4">
            {/* Photo */}
            {photoUrl && (
              <div className="mt-3 rounded-xl overflow-hidden">
                <img src={photoUrl} alt={opp.candidate_name} className="w-full h-[250px] object-cover" />
              </div>
            )}

            {/* Details grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {opp.candidate_profession && <div><p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-0.5">Profession</p><p className="text-on-surface text-sm font-medium">{opp.candidate_profession}</p></div>}
              {opp.candidate_location && <div><p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-0.5">Location</p><p className="text-on-surface text-sm font-medium">{opp.candidate_location}</p></div>}
              {opp.candidate_education && <div><p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-0.5">Education</p><p className="text-on-surface text-sm font-medium">{opp.candidate_education}</p></div>}
              {opp.phone_number && <div><p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-0.5">Phone</p><p className="text-on-surface text-sm font-medium">{opp.phone_number}</p></div>}
              {opp.venues?.venue_name && <div><p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-0.5">Venue</p><p className="text-on-surface text-sm font-medium">{opp.venues.venue_name}</p></div>}
              <div><p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-0.5">Status</p><p className="text-on-surface text-sm font-medium">{opp.status.replace(/_/g, " ")}</p></div>
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
            {opp.client_texted_at && (
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-gold/40 text-sm" style={{ fontVariationSettings: "'FILL' 1, 'wght' 300" }}>check_circle</span>
                <p className="text-on-surface-variant text-xs">Client texted {new Date(opp.client_texted_at).toLocaleDateString("en-US")}</p>
              </div>
            )}

            {/* Status advancement */}
            <div className="flex gap-2 pt-2">
              {opp.status === "lead" && (
                <Button onClick={() => onStatusChange(opp.id, "date_closed")} variant="outline" size="sm" className="text-xs rounded-full border-outline-variant/20 text-on-surface-variant">
                  Advance to Date Closed
                </Button>
              )}
              {opp.status === "date_closed" && (
                <Button onClick={() => onStatusChange(opp.id, "pending_client_approval")} variant="outline" size="sm" className="text-xs rounded-full border-gold/30 text-gold">
                  Send to Client for Approval
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
