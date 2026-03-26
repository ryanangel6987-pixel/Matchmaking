"use client";

import { useIsMobile } from "@/lib/hooks/use-mobile";
import { PreferencesClient } from "./preferences-client";
import { PreferencesMobile } from "./preferences-mobile";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface PreferencesResponsiveProps {
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
}

export function PreferencesResponsive(props: PreferencesResponsiveProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <PreferencesMobile {...props} />;
  }

  return <PreferencesClient {...props} />;
}
