"use client";

import { useIsMobile } from "@/lib/hooks/use-mobile";
import { ProfileClient } from "./profile-client";
import { ProfileMobile } from "./profile-mobile";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ProfileResponsive({ clientId, photos }: { clientId: string; photos: any[] }) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <ProfileMobile clientId={clientId} photos={photos} />;
  }

  return <ProfileClient clientId={clientId} photos={photos} />;
}
