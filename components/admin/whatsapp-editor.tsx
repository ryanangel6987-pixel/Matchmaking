"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface WhatsAppEditorProps {
  profileId: string;
  currentNumber: string | null;
}

export function WhatsAppEditor({ profileId, currentNumber }: WhatsAppEditorProps) {
  const router = useRouter();
  const supabase = createClient();
  const [number, setNumber] = useState(currentNumber ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    const { error } = await supabase
      .from("profiles")
      .update({ whatsapp_number: number || null })
      .eq("id", profileId);

    setSaving(false);
    if (!error) {
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className="bg-surface-container-low p-4 rounded-xl flex items-center gap-3">
      <span
        className="material-symbols-outlined text-xl text-gold"
        style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
      >
        chat
      </span>
      <div className="flex-1">
        <label className="text-gold text-[10px] uppercase tracking-widest block mb-1">
          WhatsApp Number
        </label>
        <input
          type="tel"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          placeholder="+1234567890"
          className="w-full bg-surface-container border border-outline-variant/20 rounded-lg px-3 py-1.5 text-on-surface text-sm placeholder:text-outline focus:border-gold focus:ring-1 focus:ring-gold outline-none"
        />
        <p className="text-outline text-[10px] mt-1">Include country code (e.g. +1 for US). Clients will see a direct WhatsApp link.</p>
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="gold-gradient text-on-gold font-semibold rounded-full px-4 py-2 text-xs hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {saving ? "Saving..." : saved ? "Saved!" : "Save"}
      </button>
    </div>
  );
}
