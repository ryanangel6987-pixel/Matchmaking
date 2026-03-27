"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CustomSelect } from "@/components/ui/custom-select";
import { toast } from "sonner";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface StatsUploadClientProps {
  clientId: string;
  clientName: string;
  matchmakerProfileId: string;
  datingApps: any[];
  history: any[];
}

export function StatsUploadClient({ clientId, clientName, matchmakerProfileId, datingApps, history }: StatsUploadClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const [appId, setAppId] = useState(datingApps[0]?.id ?? "");
  const [statDate, setStatDate] = useState(today);
  const [swipes, setSwipes] = useState("0");
  const [newMatches, setNewMatches] = useState("0");
  const [conversations, setConversations] = useState("0");
  const [datesClosed, setDatesClosed] = useState("0");
  const [notes, setNotes] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    const s = parseInt(swipes);
    const m = parseInt(newMatches);
    const c = parseInt(conversations);
    const d = parseInt(datesClosed);

    if (isNaN(s) || s < 0 || s > 10000) {
      errors.swipes = "Swipes must be between 0 and 10,000";
    }
    if (isNaN(m) || m < 0 || m > 10000) {
      errors.newMatches = "Matches must be between 0 and 10,000";
    } else if (!isNaN(s) && s >= 0 && m > s) {
      errors.newMatches = "Matches cannot exceed swipes";
    }
    if (isNaN(c) || c < 0 || c > 10000) {
      errors.conversations = "Conversations must be between 0 and 10,000";
    } else if (!isNaN(m) && m >= 0 && c > m) {
      errors.conversations = "Conversations cannot exceed matches";
    }
    if (isNaN(d) || d < 0 || d > 10000) {
      errors.datesClosed = "Dates closed must be between 0 and 10,000";
    } else if (!isNaN(c) && c >= 0 && d > c) {
      errors.datesClosed = "Dates closed cannot exceed conversations";
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

    const { error: upsertError } = await supabase
      .from("daily_app_stats")
      .upsert({
        client_id: clientId,
        app_id: appId,
        stat_date: statDate,
        swipes: parseInt(swipes),
        new_matches: parseInt(newMatches),
        conversations: parseInt(conversations),
        dates_closed: parseInt(datesClosed),
        notes: notes || null,
        entered_by: matchmakerProfileId,
      }, { onConflict: "client_id,app_id,stat_date" });

    if (upsertError) {
      setError(upsertError.message);
      toast.error("Failed to save stats", { description: upsertError.message });
    } else {
      setSuccess(true);
      toast.success("Stats uploaded");
      setSwipes("0");
      setNewMatches("0");
      setConversations("0");
      setDatesClosed("0");
      setNotes("");
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <Link href={`/clients/${clientId}`} className="text-gold text-xs uppercase tracking-widest hover:text-gold-light transition-colors">
          ← Back to {clientName}
        </Link>
        <h1 className="text-3xl font-heading font-bold text-gold tracking-tight mt-2">Upload Daily Stats</h1>
        <p className="text-on-surface-variant text-sm mt-1">For {clientName}</p>
      </div>

      {/* Upload Form */}
      <form onSubmit={handleSubmit} className="bg-surface-container-low p-8 rounded-2xl shadow-xl space-y-6">
        <div className="space-y-2">
          <Label className="text-gold text-xs uppercase tracking-wider">App</Label>
          <CustomSelect
            value={appId}
            onChange={(v) => setAppId(v)}
            options={datingApps.map((app) => ({ value: app.id, label: app.app_name }))}
            placeholder="Select app..."
            className="w-full bg-surface-container border border-outline-variant/20 text-on-surface rounded-xl px-4 py-3 text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-gold text-xs uppercase tracking-wider">Date</Label>
          <Input type="date" value={statDate} onChange={(e) => setStatDate(e.target.value)} className="bg-surface-container border-outline-variant/20 text-on-surface" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-gold text-xs uppercase tracking-wider">Swipes</Label>
            <Input type="number" min="0" value={swipes} onChange={(e) => setSwipes(e.target.value)} className="bg-surface-container border-outline-variant/20 text-on-surface" />
            {fieldErrors.swipes && <p className="text-error-red text-xs mt-1">{fieldErrors.swipes}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-gold text-xs uppercase tracking-wider">New Matches</Label>
            <Input type="number" min="0" value={newMatches} onChange={(e) => setNewMatches(e.target.value)} className="bg-surface-container border-outline-variant/20 text-on-surface" />
            {fieldErrors.newMatches && <p className="text-error-red text-xs mt-1">{fieldErrors.newMatches}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-gold text-xs uppercase tracking-wider">Conversations</Label>
            <Input type="number" min="0" value={conversations} onChange={(e) => setConversations(e.target.value)} className="bg-surface-container border-outline-variant/20 text-on-surface" />
            {fieldErrors.conversations && <p className="text-error-red text-xs mt-1">{fieldErrors.conversations}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-gold text-xs uppercase tracking-wider">Dates Closed</Label>
            <Input type="number" min="0" value={datesClosed} onChange={(e) => setDatesClosed(e.target.value)} className="bg-surface-container border-outline-variant/20 text-on-surface" />
            {fieldErrors.datesClosed && <p className="text-error-red text-xs mt-1">{fieldErrors.datesClosed}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-gold text-xs uppercase tracking-wider">Notes</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes" rows={2} className="bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-outline" />
        </div>

        {error && <p className="text-error-red text-sm">{error}</p>}
        {success && <p className="text-gold text-sm">Stats uploaded successfully.</p>}

        <Button type="submit" disabled={loading} className="w-full gold-gradient text-on-gold font-semibold rounded-full h-12">
          {loading ? "Saving..." : "Save Stats"}
        </Button>
      </form>

      {/* History */}
      {history.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-on-surface-variant text-xs uppercase tracking-widest">Upload History</h2>
          <div className="space-y-2">
            {history.map((stat) => (
              <div key={stat.id} className="bg-surface-container-low p-3 rounded-xl flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <span className="text-on-surface">{new Date(stat.stat_date).toLocaleDateString("en-US")}</span>
                  <span className="text-gold text-xs">{stat.dating_apps?.app_name}</span>
                </div>
                <div className="flex gap-3 text-xs text-on-surface-variant">
                  <span>{stat.swipes} swipes</span>
                  <span>{stat.new_matches} matches</span>
                  <span>{stat.conversations} convos</span>
                  <span>{stat.dates_closed} dates</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
