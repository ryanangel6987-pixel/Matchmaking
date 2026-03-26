"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

interface MatchmakerProfileProps {
  profile: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    whatsapp_number: string | null;
    bio: string | null;
  };
  authUserId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  availability: any | null;
}

const DAY_ABBR: Record<string, string> = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

export function MatchmakerProfile({ profile, authUserId, availability }: MatchmakerProfileProps) {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [whatsapp, setWhatsapp] = useState(profile.whatsapp_number ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [localAvatar, setLocalAvatar] = useState(profile.avatar_url);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const ext = file.name.split(".").pop();
    const filePath = `avatars/${authUserId}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setMessage("Failed to upload avatar.");
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("auth_user_id", authUserId);

    setLocalAvatar(publicUrl);
    setUploading(false);
    router.refresh();
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim() || profile.full_name,
        whatsapp_number: whatsapp.trim() || null,
        bio: bio.trim() || null,
      })
      .eq("id", profile.id);

    if (error) {
      setMessage("Failed to save: " + error.message);
    } else {
      setMessage("Profile saved successfully.");
      router.refresh();
    }
    setSaving(false);
  };

  const workingDays = availability?.working_days ?? [];
  const startTime = availability?.start_time?.slice(0, 5) ?? "--:--";
  const endTime = availability?.end_time?.slice(0, 5) ?? "--:--";
  const timezone = availability?.timezone ?? "Not set";

  return (
    <div className="space-y-8">
      {/* Avatar Section */}
      <div className="bg-surface-container-low rounded-2xl shadow-xl p-8">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <Avatar className="h-24 w-24 border-2 border-outline-variant/20">
              <AvatarImage src={localAvatar ?? undefined} />
              <AvatarFallback className="bg-surface-container-high text-on-surface text-2xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <span className="material-symbols-outlined text-white text-2xl">
                {uploading ? "hourglass_empty" : "photo_camera"}
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>
          <div>
            <h2 className="font-heading text-xl font-bold text-on-surface">{fullName || "Your Name"}</h2>
            <p className="text-on-surface-variant text-sm">Matchmaker</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="text-gold text-xs mt-2 hover:text-gold-light transition-colors"
            >
              {uploading ? "Uploading..." : "Change photo"}
            </button>
          </div>
        </div>
      </div>

      {/* Editable Fields */}
      <div className="bg-surface-container-low rounded-2xl shadow-xl p-8 space-y-6">
        <div className="space-y-2">
          <Label className="text-gold text-xs uppercase tracking-wider">Full Name</Label>
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
            className="bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-outline"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-gold text-xs uppercase tracking-wider">WhatsApp Number</Label>
          <Input
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="e.g. +1 555-123-4567"
            className="bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-outline"
          />
          <p className="text-on-surface-variant text-xs">Used for client communication. Include country code.</p>
        </div>

        <div className="space-y-2">
          <Label className="text-gold text-xs uppercase tracking-wider">Bio / About</Label>
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="A short bio about yourself, your approach, specialties..."
            rows={4}
            className="bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-outline"
          />
        </div>

        {message && (
          <p className={`text-sm ${message.includes("Failed") ? "text-error-red" : "text-gold"}`}>
            {message}
          </p>
        )}

        <Button
          onClick={handleSave}
          disabled={saving}
          className="gold-gradient text-on-gold font-semibold rounded-full h-12 w-full"
        >
          {saving ? "Saving..." : "Save Profile"}
        </Button>
      </div>

      {/* Working Hours (read-only, links to availability page) */}
      <div className="bg-surface-container-low rounded-2xl shadow-xl p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className="material-symbols-outlined text-2xl text-gold"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
            >
              schedule
            </span>
            <h2 className="font-heading text-lg font-bold text-on-surface">Working Hours</h2>
          </div>
          <Link
            href="/availability"
            className="text-gold text-xs uppercase tracking-widest hover:text-gold-light transition-colors"
          >
            Edit
          </Link>
        </div>

        {workingDays.length > 0 ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {workingDays.map((day: string) => (
                <span key={day} className="bg-gold/10 text-gold text-xs px-3 py-1.5 rounded-full border border-gold/20">
                  {DAY_ABBR[day] ?? day}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-1">Hours</p>
                <p className="text-on-surface text-sm">{startTime} - {endTime}</p>
              </div>
              <div>
                <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-1">Timezone</p>
                <p className="text-on-surface text-sm">{timezone}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-on-surface-variant/60 text-sm">
            No availability set yet.{" "}
            <Link href="/availability" className="text-gold hover:text-gold-light transition-colors">
              Set your hours
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
