"use client";

import { useState, useEffect, useCallback } from "react";
import { useRealtime, type RealtimeEvent } from "@/lib/hooks/use-realtime";
import { showInfo } from "@/lib/toast";
import { DashboardResponsive } from "@/components/dashboard/dashboard-responsive";
import { OverviewResponsive } from "@/components/overview/overview-responsive";
import { PreferencesResponsive } from "@/components/preferences/preferences-responsive";
import { ProfileResponsive } from "@/components/profile/profile-responsive";
import { AccessResponsive } from "@/components/access/access-responsive";

/* eslint-disable @typescript-eslint/no-explicit-any */

export type PortalTab =
  | "dashboard"
  | "preferences"
  | "dates"
  | "profile"
  | "access";

interface ClientPortalProps {
  clientId: string;
  clientName: string;
  consultation: {
    status: string | null;
    bookedAt: string | null;
    meetingUrl: string | null;
  } | null;
  dashboardData: {
    dailyStats: any[];
    kpiSummary: any;
    allOpportunities: any[];
    actions: any[];
    datingApps: any[];
    photos: any[];
    accountHealth: any[];
  };
  overviewData: {
    clientId: string;
    clientName: string;
    pendingOpportunities: any[];
    recentApproved: any[];
    declinedDates: any[];
    kpiSummary: any;
    alerts: any[];
    actions: any[];
    candidates: any[];
  };
  preferencesData: {
    clientId: string;
    onboarding: any;
    preferences: any;
    preferenceAssets: any[];
    approvedType: any;
    candidates: any[];
    datingApps: any[];
    venues: any[];
    availability: any[];
    searchAreas: any[];
    approvedDates: any[];
    declinedDates: any[];
  };
  profileData: {
    clientId: string;
    photos: any[];
  };
  accessData: {
    clientId: string;
    credentials: any[];
    datingApps: any[];
    communication: any;
    matchmakerName: string | null;
    matchmakerWhatsApp: string | null;
    matchmakerAvailability: any;
    accountHealth: any[];
    supportNotes: any[];
  };
}

const HASH_TO_TAB: Record<string, PortalTab> = {
  "#dashboard": "dashboard",
  "#preferences": "preferences",
  "#dates": "dates",
  "#profile": "profile",
  "#access": "access",
};

const TAB_TO_HASH: Record<PortalTab, string> = {
  dashboard: "#dashboard",
  preferences: "#preferences",
  dates: "#dates",
  profile: "#profile",
  access: "#access",
};

function getTabFromHash(): PortalTab {
  if (typeof window === "undefined") return "dashboard";
  return HASH_TO_TAB[window.location.hash] ?? "dashboard";
}

export function ClientPortal(props: ClientPortalProps) {
  const [activeTab, setActiveTab] = useState<PortalTab>("dashboard");

  // Sync from hash on mount + hash changes
  useEffect(() => {
    const tabFromHash = getTabFromHash();
    if (tabFromHash !== "dashboard") {
      setActiveTab(tabFromHash);
    }
    const onHashChange = () => {
      setActiveTab(getTabFromHash());
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // Expose tab setter for nav to call
  const switchTab = useCallback((tab: PortalTab) => {
    setActiveTab(tab);
    window.history.replaceState(null, "", TAB_TO_HASH[tab]);
  }, []);

  // Attach switchTab to window so ClientNav can call it
  useEffect(() => {
    (window as any).__portalSwitchTab = switchTab;
    (window as any).__portalActiveTab = activeTab;
    // Dispatch a custom event so nav re-renders on tab change
    window.dispatchEvent(new CustomEvent("portaltabchange", { detail: activeTab }));
    return () => {
      delete (window as any).__portalSwitchTab;
      delete (window as any).__portalActiveTab;
    };
  }, [switchTab, activeTab]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Realtime subscriptions — toast notifications for live updates
  const onRealtimeEvent = useCallback((event: RealtimeEvent) => {
    switch (event.table) {
      case "date_opportunities":
        showInfo("New date opportunity from your matchmaker");
        break;
      case "alerts":
        showInfo("New notification");
        break;
      case "photos":
        showInfo("Photo status updated");
        break;
      default:
        showInfo(`Update: ${event.table}`);
    }
  }, []);
  useRealtime(props.clientId, onRealtimeEvent);

  // Don't render tabs until client-side mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="material-symbols-outlined text-gold text-3xl animate-spin" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>progress_activity</span>
      </div>
    );
  }

  // Show consultation banner if no matchmaker assigned
  const noMatchmaker = !props.accessData.matchmakerName;
  const consultation = props.consultation;
  const isBooked = consultation?.status === "booked" && consultation?.bookedAt;
  const callDate = isBooked ? new Date(consultation.bookedAt!) : null;

  const formatCallDate = (d: Date) => d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const formatCallTime = (d: Date) => d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const buildCalendarUrl = (d: Date, url: string | null) => {
    const end = new Date(d.getTime() + 30 * 60000);
    const fmt = (dt: Date) => dt.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent("Private Dating Concierge — Consultation")}&dates=${fmt(d)}/${fmt(end)}&details=${encodeURIComponent(url ? `Join: ${url}` : "Your matchmaker will call you.")}`;
  };

  return (
    <>
      {noMatchmaker && (
        <div className="bg-gold/5 border border-gold/20 rounded-2xl p-6 mb-6">
          {isBooked && callDate ? (
            /* Booked — show date/time/join/calendar */
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gold/15 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-gold text-2xl" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}>event_available</span>
                </div>
                <div>
                  <p className="text-on-surface font-heading font-semibold text-sm">Your Consultation Is Booked</p>
                  <p className="text-gold text-base font-heading font-bold mt-0.5">
                    {formatCallDate(callDate)} at {formatCallTime(callDate)}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {consultation.meetingUrl && (
                  <a
                    href={consultation.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gold-gradient text-on-gold font-semibold rounded-full px-5 py-2 text-sm hover:opacity-90 transition-opacity inline-flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>videocam</span>
                    Join Call
                  </a>
                )}
                <a
                  href={buildCalendarUrl(callDate, consultation.meetingUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-gold/30 text-gold font-medium rounded-full px-5 py-2 text-sm hover:bg-gold/10 transition-colors inline-flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>calendar_add_on</span>
                  Add to Calendar
                </a>
              </div>
              <p className="text-on-surface-variant text-xs">Prepare by uploading your photos and filling in your preferences below.</p>
            </div>
          ) : (
            /* Not booked — show booking CTA */
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-gold text-2xl" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>calendar_month</span>
                <div>
                  <p className="text-on-surface text-sm font-medium font-heading">Book Your Consultation</p>
                  <p className="text-on-surface-variant text-xs">Your application is in — book a free 30-min call to get matched with your dedicated concierge.</p>
                </div>
              </div>
              <a href="/apply/book" className="gold-gradient text-on-gold font-semibold rounded-full px-6 py-2.5 text-sm hover:opacity-90 transition-opacity shrink-0">
                Book Now
              </a>
            </div>
          )}
        </div>
      )}
      <div className={activeTab === "dashboard" ? "" : "hidden"}>
        <DashboardResponsive {...props.dashboardData} />
      </div>
      <div className={activeTab === "preferences" ? "" : "hidden"}>
        <PreferencesResponsive {...props.preferencesData} />
      </div>
      <div className={activeTab === "dates" ? "" : "hidden"}>
        <OverviewResponsive {...props.overviewData} />
      </div>
      <div className={activeTab === "profile" ? "" : "hidden"}>
        <ProfileResponsive {...props.profileData} />
      </div>
      <div className={activeTab === "access" ? "" : "hidden"}>
        <AccessResponsive {...props.accessData} />
      </div>
    </>
  );
}
