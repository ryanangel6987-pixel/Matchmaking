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
  const [appId, setAppId] = useState(datingApps[0]?.id ?? "");
  const [memorableDetail, setMemorableDetail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dayDetermined, setDayDetermined] = useState(true);
  const [proposedDay, setProposedDay] = useState("");
  const [proposedTime, setProposedTime] = useState("");
  const [venueId, setVenueId] = useState("");
  const [prewrittenText, setPrewrittenText] = useState("");
  const [notes, setNotes] = useState("");
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
        memorable_detail: memorableDetail || null,
        phone_number: phoneNumber || null,
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
            {opportunities.map((opp) => (
              <div key={opp.id} className="bg-surface-container-low p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-on-surface font-medium font-heading">{opp.candidate_name}</p>
                    <p className="text-on-surface-variant text-xs mt-0.5">
                      {opp.dating_apps?.app_name && `${opp.dating_apps.app_name} · `}
                      {opp.proposed_day ? new Date(opp.proposed_day).toLocaleDateString() : "Day TBD"}
                      {opp.venues?.venue_name && ` · ${opp.venues.venue_name}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[9px] uppercase tracking-widest border-outline-variant/30 text-outline">
                      {opp.status.replace(/_/g, " ")}
                    </Badge>
                    <Badge variant="outline" className={`text-[9px] uppercase tracking-widest ${opp.client_decision === "approved" ? "border-gold/30 text-gold" : opp.client_decision === "declined" ? "border-error-red/30 text-error-red" : "border-outline-variant/30 text-outline"}`}>
                      {opp.client_decision}
                    </Badge>
                  </div>
                </div>

                {/* Status advancement buttons */}
                {opp.status === "lead" && (
                  <Button onClick={() => handleStatusChange(opp.id, "date_closed")} variant="outline" size="sm" className="text-xs rounded-full border-outline-variant/20 text-on-surface-variant">
                    Advance to Date Closed
                  </Button>
                )}
                {opp.status === "date_closed" && (
                  <Button onClick={() => handleStatusChange(opp.id, "pending_client_approval")} variant="outline" size="sm" className="text-xs rounded-full border-gold/30 text-gold">
                    Send to Client for Approval
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
