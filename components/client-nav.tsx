"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { PortalTab } from "@/components/client-portal";

const tabs = [
  {
    label: "Dashboard",
    mobileLabel: "Dashboard",
    tabKey: "dashboard" as PortalTab,
    icon: "bar_chart",
  },
  {
    label: "Taste Calibration",
    mobileLabel: "Taste",
    tabKey: "preferences" as PortalTab,
    icon: "tune",
  },
  {
    label: "Dates",
    mobileLabel: "Dates",
    tabKey: "dates" as PortalTab,
    icon: "star",
    isCenter: true,
  },
  {
    label: "Profiles & Uploads",
    mobileLabel: "Profiles",
    tabKey: "profile" as PortalTab,
    icon: "person",
  },
  {
    label: "Credentials Vault",
    mobileLabel: "Account",
    tabKey: "access" as PortalTab,
    icon: "key",
  },
];

interface ClientNavProps {
  userName: string;
  avatarUrl: string | null;
}

export function ClientNav({ userName, avatarUrl }: ClientNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [localAvatar, setLocalAvatar] = useState<string | null>(avatarUrl);
  const [activeTab, setActiveTab] = useState<PortalTab>("dashboard");

  // Whether we are on the single-page portal route
  const isPortalRoute = pathname === "/portal";

  // Listen for tab changes from the ClientPortal component
  useEffect(() => {
    if (!isPortalRoute) return;

    const onTabChange = (e: Event) => {
      setActiveTab((e as CustomEvent).detail as PortalTab);
    };
    window.addEventListener("portaltabchange", onTabChange);

    // Sync initial state
    const current = (window as any).__portalActiveTab;
    if (current) setActiveTab(current);

    return () => window.removeEventListener("portaltabchange", onTabChange);
  }, [isPortalRoute]);

  const handleTabClick = useCallback(
    (tabKey: PortalTab) => {
      if (isPortalRoute) {
        // Instant client-side tab switch — no server round-trip
        const switchFn = (window as any).__portalSwitchTab;
        if (switchFn) switchFn(tabKey);
      } else {
        // Fallback: navigate to portal with the right hash
        router.push(`/portal#${tabKey}`);
      }
    },
    [isPortalRoute, router]
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setUploading(false); return; }

    const ext = file.name.split(".").pop();
    const filePath = `avatars/${user.id}.${ext}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setUploading(false);
      return;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    // Update profile
    await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("auth_user_id", user.id);

    setLocalAvatar(publicUrl);
    setUploading(false);
    router.refresh();
  };

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-surface-container-lowest border-r border-outline-variant/15">
        {/* Logo */}
        <div className="px-6 py-8">
          <img src="/logo.png" alt="Private Dating Concierge" className="h-8 w-auto" />
        </div>

        {/* Profile */}
        <div className="px-6 pb-6 flex items-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="relative group shrink-0"
            title="Upload profile photo"
          >
            <Avatar className="h-10 w-10 border border-outline-variant/20 group-hover:border-gold/40 transition-colors">
              <AvatarImage src={localAvatar ?? undefined} />
              <AvatarFallback className="bg-surface-container-high text-on-surface text-sm">
                {uploading ? (
                  <span className="material-symbols-outlined text-gold text-sm animate-spin">progress_activity</span>
                ) : initials}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>photo_camera</span>
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />
          <div className="min-w-0">
            <p className="text-sm font-medium text-on-surface truncate">
              {userName}
            </p>
            <p className="text-xs text-on-surface-variant">Client</p>
          </div>
        </div>

        {/* Nav tabs */}
        <nav className="flex-1 px-3 space-y-1">
          {tabs.map((tab) => {
            const isActive = isPortalRoute
              ? activeTab === tab.tabKey
              : false;
            return (
              <button
                key={tab.tabKey}
                onClick={() => handleTabClick(tab.tabKey)}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all duration-200 w-full text-left ${
                  isActive
                    ? "bg-gold/10 text-gold"
                    : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                }`}
              >
                <span
                  className={`material-symbols-outlined text-xl ${
                    isActive ? "text-gold" : ""
                  }`}
                  style={{
                    fontVariationSettings: isActive
                      ? "'FILL' 1, 'wght' 400"
                      : "'FILL' 0, 'wght' 300",
                  }}
                >
                  {tab.icon}
                </span>
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout — pinned to bottom */}
        <div className="px-3 py-4 border-t border-outline-variant/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all duration-200 w-full"
          >
            <span
              className="material-symbols-outlined text-xl"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
            >
              logout
            </span>
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-[#0a0a0a] border-t border-outline-variant/15 safe-area-pb">
        <div className="flex items-end justify-around h-[72px] px-2 pb-2">
          {tabs.map((tab) => {
            const isActive = isPortalRoute
              ? activeTab === tab.tabKey
              : false;

            // Center button — raised gold circle
            if (tab.isCenter) {
              return (
                <button
                  key={tab.tabKey}
                  onClick={() => handleTabClick(tab.tabKey)}
                  className="flex flex-col items-center -mt-6"
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all ${
                    isActive
                      ? "gold-gradient shadow-gold/30"
                      : "bg-[#2a2210] border-2 border-gold/50"
                  }`}>
                    <span
                      className={`material-symbols-outlined text-[28px] ${isActive ? "text-on-gold" : "text-gold"}`}
                      style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}
                    >
                      {tab.icon}
                    </span>
                  </div>
                  <span className={`text-[11px] leading-tight font-bold mt-1 ${isActive ? "text-gold" : "text-on-surface-variant"}`}>
                    {tab.mobileLabel}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={tab.tabKey}
                onClick={() => handleTabClick(tab.tabKey)}
                className={`flex flex-col items-center justify-center gap-1 min-w-[48px] min-h-[48px] ${
                  isActive ? "text-gold" : "text-on-surface-variant"
                }`}
              >
                <span
                  className="material-symbols-outlined text-[35px]"
                  style={{
                    fontVariationSettings: isActive
                      ? "'FILL' 1, 'wght' 400"
                      : "'FILL' 0, 'wght' 300",
                  }}
                >
                  {tab.icon}
                </span>
                <span className="text-[11px] leading-tight font-medium">
                  {tab.mobileLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
