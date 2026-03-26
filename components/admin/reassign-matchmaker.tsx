"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { CustomSelect } from "@/components/ui/custom-select";

interface Matchmaker {
  id: string;
  full_name: string;
}

interface ReassignMatchmakerProps {
  clientId: string;
  currentMatchmakerId: string | null;
  matchmakers: Matchmaker[];
}

export default function ReassignMatchmaker({
  clientId,
  currentMatchmakerId,
  matchmakers,
}: ReassignMatchmakerProps) {
  const [selected, setSelected] = useState(currentMatchmakerId ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleChange(newValue: string) {
    setSelected(newValue);
    if (newValue === currentMatchmakerId) return;

    setStatus("saving");
    setErrorMsg("");

    const supabase = createClient();
    const { error } = await supabase
      .from("clients")
      .update({ assigned_matchmaker_id: newValue || null })
      .eq("id", clientId);

    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
    } else {
      setStatus("success");
      startTransition(() => {
        router.refresh();
      });
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  return (
    <div className="space-y-3">
      <CustomSelect
        value={selected}
        onChange={(v) => handleChange(v)}
        options={[{ value: "", label: "Unassigned" }, ...matchmakers.map((mm) => ({ value: mm.id, label: mm.full_name }))]}
        placeholder="Unassigned"
        className="w-full bg-surface-container-low text-on-surface text-sm rounded-xl px-4 py-3 border border-outline-variant/30 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/50 transition-colors"
      />

      {status === "saving" && (
        <p className="text-on-surface-variant text-xs flex items-center gap-2">
          <span className="material-symbols-outlined text-sm animate-spin" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>progress_activity</span>
          Reassigning...
        </p>
      )}
      {status === "success" && (
        <p className="text-gold text-xs flex items-center gap-2">
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>check_circle</span>
          Matchmaker reassigned successfully
        </p>
      )}
      {status === "error" && (
        <p className="text-error-red text-xs flex items-center gap-2">
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>error</span>
          {errorMsg || "Failed to reassign matchmaker"}
        </p>
      )}
    </div>
  );
}
