"use client";

import { useIsMobile } from "@/lib/hooks/use-mobile";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { DashboardMobile } from "@/components/dashboard/dashboard-mobile";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface DashboardResponsiveProps {
  dailyStats: any[];
  kpiSummary: any;
  allOpportunities: any[];
  actions: any[];
  datingApps: any[];
  photos: any[];
  accountHealth: any[];
}

export function DashboardResponsive(props: DashboardResponsiveProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <DashboardMobile {...props} />;
  }

  return <DashboardClient {...props} />;
}
