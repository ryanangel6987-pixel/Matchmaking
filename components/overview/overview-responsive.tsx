"use client";

import { useIsMobile } from "@/lib/hooks/use-mobile";
import { OverviewClient } from "./overview-client";
import { OverviewMobile } from "./overview-mobile";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface OverviewClientProps {
  clientId: string;
  clientName: string;
  pendingOpportunities: any[];
  recentApproved: any[];
  declinedDates: any[];
  kpiSummary: any;
  alerts: any[];
  actions: any[];
  candidates: any[];
}

export function OverviewResponsive(props: OverviewClientProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <OverviewMobile {...props} />;
  }

  return <OverviewClient {...props} />;
}
