"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface AlertDismissButtonProps {
  alertId: string;
}

export function AlertDismissButton({ alertId }: AlertDismissButtonProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleDismiss = async () => {
    await supabase
      .from("alerts")
      .update({ read: true })
      .eq("id", alertId);
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleDismiss}
      className="text-gold/50 hover:text-gold transition-colors p-1 shrink-0"
      title="Dismiss alert"
    >
      <span
        className="material-symbols-outlined text-[18px]"
        style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
      >
        close
      </span>
    </button>
  );
}
