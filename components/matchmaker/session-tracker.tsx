"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

interface SessionTrackerProps {
  profileId: string;
}

export function SessionTracker({ profileId }: SessionTrackerProps) {
  const sessionIdRef = useRef<string | null>(null);
  const loginAtRef = useRef<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const startSession = async () => {
      const now = new Date().toISOString();
      loginAtRef.current = now;

      const { data, error } = await supabase
        .from("matchmaker_sessions")
        .insert({ profile_id: profileId, login_at: now })
        .select("id")
        .single();

      if (!error && data) {
        sessionIdRef.current = data.id;
      }
    };

    startSession();

    const endSession = () => {
      if (!sessionIdRef.current || !loginAtRef.current) return;

      const now = new Date();
      const loginAt = new Date(loginAtRef.current);
      const durationMinutes = Math.round((now.getTime() - loginAt.getTime()) / 60000);

      // Use sendBeacon as primary method on beforeunload
      const payload = JSON.stringify({
        logout_at: now.toISOString(),
        duration_minutes: durationMinutes,
      });

      // Build the Supabase REST URL for the update
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseKey) {
        const url = `${supabaseUrl}/rest/v1/matchmaker_sessions?id=eq.${sessionIdRef.current}`;
        const blob = new Blob([payload], { type: "application/json" });

        // Try sendBeacon first (most reliable for unload)
        const beaconSent = navigator.sendBeacon(
          url + `&apikey=${supabaseKey}`,
          blob
        );

        // Fallback: synchronous-ish fetch with keepalive
        if (!beaconSent) {
          fetch(url, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
              Prefer: "return=minimal",
            },
            body: payload,
            keepalive: true,
          }).catch(() => {});
        }
      }
    };

    const handleBeforeUnload = () => {
      endSession();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      // Also end session on component unmount (e.g., navigation away from matchmaker routes)
      endSession();
    };
  }, [profileId]);

  // Renders nothing — hidden tracker
  return null;
}
