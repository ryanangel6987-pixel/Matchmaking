"use client";

import { useIsMobile } from "@/lib/hooks/use-mobile";
import { AccessClient } from "./access-client";
import { AccessMobile } from "./access-mobile";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface AccessResponsiveProps {
  clientId: string;
  credentials: any[];
  datingApps: any[];
  communication: any;
  matchmakerName: string | null;
  matchmakerWhatsApp: string | null;
  matchmakerAvailability: any;
  accountHealth: any[];
  supportNotes: any[];
}

export function AccessResponsive(props: AccessResponsiveProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <AccessMobile {...props} />;
  }

  return <AccessClient {...props} />;
}
