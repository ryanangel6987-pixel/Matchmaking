"use client";

import { useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";

/* eslint-disable @typescript-eslint/no-explicit-any */

export type RealtimeTable = "date_opportunities" | "alerts" | "photos";

export type RealtimeEvent = {
  table: RealtimeTable;
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: Record<string, any>;
  old: Record<string, any>;
};

type RealtimeCallback = (event: RealtimeEvent) => void;

/**
 * Subscribes to Supabase Realtime postgres_changes for a given client.
 * Calls `onEvent` whenever a row changes on date_opportunities, alerts, or photos
 * that belongs to this clientId.
 *
 * The callback is stored in a ref so it can be updated without re-subscribing.
 */
export function useRealtime(clientId: string, onEvent: RealtimeCallback) {
  const callbackRef = useRef<RealtimeCallback>(onEvent);

  // Keep the ref current without re-subscribing
  useEffect(() => {
    callbackRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    if (!clientId) return;

    const supabase = createClient();

    const channel: RealtimeChannel = supabase
      .channel(`client-portal:${clientId}`)
      .on<Record<string, any>>(
        "postgres_changes" as any,
        {
          event: "*",
          schema: "public",
          table: "date_opportunities",
          filter: `client_id=eq.${clientId}`,
        },
        (payload: RealtimePostgresChangesPayload<Record<string, any>>) => {
          callbackRef.current({
            table: "date_opportunities",
            eventType: payload.eventType as RealtimeEvent["eventType"],
            new: (payload.new as Record<string, any>) ?? {},
            old: (payload.old as Record<string, any>) ?? {},
          });
        }
      )
      .on<Record<string, any>>(
        "postgres_changes" as any,
        {
          event: "*",
          schema: "public",
          table: "alerts",
          filter: `client_id=eq.${clientId}`,
        },
        (payload: RealtimePostgresChangesPayload<Record<string, any>>) => {
          callbackRef.current({
            table: "alerts",
            eventType: payload.eventType as RealtimeEvent["eventType"],
            new: (payload.new as Record<string, any>) ?? {},
            old: (payload.old as Record<string, any>) ?? {},
          });
        }
      )
      .on<Record<string, any>>(
        "postgres_changes" as any,
        {
          event: "*",
          schema: "public",
          table: "photos",
          filter: `client_id=eq.${clientId}`,
        },
        (payload: RealtimePostgresChangesPayload<Record<string, any>>) => {
          callbackRef.current({
            table: "photos",
            eventType: payload.eventType as RealtimeEvent["eventType"],
            new: (payload.new as Record<string, any>) ?? {},
            old: (payload.old as Record<string, any>) ?? {},
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clientId]);
}
