"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const tabs = [
  { label: "My Clients", href: "/clients", icon: "group" },
  { label: "Availability", href: "/availability", icon: "event_available" },
];

interface MatchmakerNavProps {
  userName: string;
  avatarUrl: string | null;
}

export function MatchmakerNav({ userName, avatarUrl }: MatchmakerNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const initials = userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <>
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-surface-container-lowest border-r border-outline-variant/15">
        <div className="px-6 py-8">
          <img src="/logo.png" alt="Private Dating Concierge" className="h-8 w-auto" />
          <p className="text-xs text-on-surface-variant mt-2">Matchmaker Portal</p>
        </div>
        <div className="px-6 pb-6 flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-outline-variant/20">
            <AvatarImage src={avatarUrl ?? undefined} />
            <AvatarFallback className="bg-surface-container-high text-on-surface text-sm">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-medium text-on-surface truncate">{userName}</p>
            <p className="text-xs text-on-surface-variant">Matchmaker</p>
          </div>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {tabs.map((tab) => {
            const isActive = pathname.startsWith(tab.href);
            return (
              <Link key={tab.href} href={tab.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all duration-200 ${isActive ? "bg-gold/10 text-gold" : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"}`}>
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: isActive ? "'FILL' 1, 'wght' 400" : "'FILL' 0, 'wght' 300" }}>{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="px-3 pb-6">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all duration-200 w-full">
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>logout</span>
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 glass-panel border-t border-outline-variant/15 h-[60px] safe-area-pb">
        <div className="flex items-center justify-around h-full px-2">
          {tabs.map((tab) => {
            const isActive = pathname.startsWith(tab.href);
            return (
              <Link key={tab.href} href={tab.href} className={`flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[44px] ${isActive ? "text-gold" : "text-on-surface-variant"}`}>
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: isActive ? "'FILL' 1, 'wght' 400" : "'FILL' 0, 'wght' 300" }}>{tab.icon}</span>
                <span className="text-[10px] leading-tight font-medium">{tab.label}</span>
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[44px] text-on-surface-variant"
          >
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>logout</span>
            <span className="text-[10px] leading-tight font-medium">Sign Out</span>
          </button>
        </div>
      </nav>
    </>
  );
}
