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
  const noMatchmaker = !props.overviewData.kpiSummary && !props.accessData.matchmakerName;

  return (
    <>
      {noMatchmaker && (
        <div className="bg-gold/5 border border-gold/20 rounded-2xl p-6 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
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
