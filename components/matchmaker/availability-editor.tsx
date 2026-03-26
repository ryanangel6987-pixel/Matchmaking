"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CustomSelect } from "@/components/ui/custom-select";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const TIMEZONES = [
  { value: "America/New_York", label: "Eastern (ET)" },
  { value: "America/Chicago", label: "Central (CT)" },
  { value: "America/Denver", label: "Mountain (MT)" },
  { value: "America/Los_Angeles", label: "Pacific (PT)" },
  { value: "America/Phoenix", label: "Arizona (MST)" },
  { value: "Pacific/Honolulu", label: "Hawaii (HST)" },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface AvailabilityEditorProps {
  profileId: string;
  availability: any | null;
}

function formatTime12(time24: string): string {
  if (!time24) return "";
  const [h, m] = time24.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${hour12}:${m} ${ampm}`;
}

export function AvailabilityEditor({ profileId, availability }: AvailabilityEditorProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [workingDays, setWorkingDays] = useState<string[]>(availability?.working_days ?? []);
  const [startTime, setStartTime] = useState(availability?.start_time ?? "09:00");
  const [endTime, setEndTime] = useState(availability?.end_time ?? "17:00");
  const [timezone, setTimezone] = useState(availability?.timezone ?? "America/New_York");
  const [notes, setNotes] = useState(availability?.notes ?? "");

  const toggleDay = (day: string) => {
    setWorkingDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const payload = {
      profile_id: profileId,
      working_days: workingDays,
      start_time: startTime,
      end_time: endTime,
      timezone,
      notes: notes || null,
    };

    const { error: upsertError } = availability?.id
      ? await supabase.from("matchmaker_availability").update(payload).eq("id", availability.id)
      : await supabase.from("matchmaker_availability").insert(payload);

    if (upsertError) {
      setError(upsertError.message);
    } else {
      setSuccess(true);
      router.refresh();
    }
    setLoading(false);
  };

  const tzLabel = TIMEZONES.find((t) => t.value === timezone)?.label ?? timezone;
  const sortedDays = DAYS.filter((d) => workingDays.includes(d));

  return (
    <div className="space-y-8">
      {/* Current Schedule Summary */}
      {availability && (
        <div className="bg-surface-container-low p-6 rounded-2xl shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-2xl text-gold" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}>schedule</span>
            <h2 className="font-heading text-lg font-bold text-on-surface">Current Schedule</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-gold text-xs uppercase tracking-wider mb-1">Working Days</p>
              <p className="text-on-surface text-sm">
                {sortedDays.length > 0 ? sortedDays.join(", ") : "None set"}
              </p>
            </div>
            <div>
              <p className="text-gold text-xs uppercase tracking-wider mb-1">Hours</p>
              <p className="text-on-surface text-sm">
                {formatTime12(availability.start_time)} &ndash; {formatTime12(availability.end_time)}
              </p>
            </div>
            <div>
              <p className="text-gold text-xs uppercase tracking-wider mb-1">Timezone</p>
              <p className="text-on-surface text-sm">{tzLabel}</p>
            </div>
          </div>
          {availability.notes && (
            <div className="mt-4 pt-4 border-t border-outline-variant/15">
              <p className="text-gold text-xs uppercase tracking-wider mb-1">Notes</p>
              <p className="text-on-surface-variant text-sm">{availability.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Editor Form */}
      <form onSubmit={handleSave} className="bg-surface-container-low p-8 rounded-2xl shadow-xl space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="material-symbols-outlined text-2xl text-gold" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>event_available</span>
          <h2 className="font-heading text-xl font-bold text-on-surface">
            {availability ? "Edit Availability" : "Set Your Availability"}
          </h2>
        </div>

        {/* Working Days */}
        <div className="space-y-3">
          <Label className="text-gold text-xs uppercase tracking-wider">Working Days</Label>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((day) => {
              const isSelected = workingDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    isSelected
                      ? "bg-gold text-on-gold shadow-md"
                      : "bg-surface-container text-on-surface-variant border border-outline-variant/20 hover:bg-surface-container-high hover:text-on-surface"
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Range */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-gold text-xs uppercase tracking-wider">Start Time</Label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full h-12 px-4 bg-surface-container border border-outline-variant/20 rounded-xl text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 transition-all"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gold text-xs uppercase tracking-wider">End Time</Label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full h-12 px-4 bg-surface-container border border-outline-variant/20 rounded-xl text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 transition-all"
            />
          </div>
        </div>

        {/* Timezone */}
        <div className="space-y-2">
          <Label className="text-gold text-xs uppercase tracking-wider">Timezone</Label>
          <CustomSelect
            value={timezone}
            onChange={(v) => setTimezone(v)}
            options={TIMEZONES.map((tz) => ({ value: tz.value, label: `${tz.label} (${tz.value})` }))}
            className="w-full h-12 px-4 bg-surface-container border border-outline-variant/20 rounded-xl text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 transition-all"
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label className="text-gold text-xs uppercase tracking-wider">Notes</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., Off every other Friday, Available on weekends for urgent matters"
            rows={3}
            className="bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-outline"
          />
        </div>

        {error && <p className="text-error-red text-sm">{error}</p>}
        {success && <p className="text-gold text-sm">Availability saved successfully.</p>}

        <Button type="submit" disabled={loading} className="w-full gold-gradient text-on-gold font-semibold rounded-full h-12">
          {loading ? "Saving..." : "Save Availability"}
        </Button>
      </form>
    </div>
  );
}
