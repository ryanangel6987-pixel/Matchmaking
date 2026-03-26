"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";

interface DatingApp {
  id: string;
  app_name: string;
  description: string | null;
  is_active: boolean;
}

interface DatingAppToggleProps {
  apps: DatingApp[];
}

export function DatingAppToggle({ apps: initialApps }: DatingAppToggleProps) {
  const [apps, setApps] = useState<DatingApp[]>(initialApps);
  const [pending, setPending] = useState<string | null>(null);
  const supabase = createClient();

  const handleToggle = async (appId: string, currentActive: boolean) => {
    setPending(appId);
    const newActive = !currentActive;

    const { error } = await supabase
      .from("dating_apps")
      .update({ is_active: newActive })
      .eq("id", appId);

    if (!error) {
      setApps((prev) =>
        prev.map((app) =>
          app.id === appId ? { ...app, is_active: newActive } : app
        )
      );
    }

    setPending(null);
  };

  return (
    <div className="space-y-3">
      {apps.map((app) => (
        <div
          key={app.id}
          className="flex items-center justify-between bg-surface-container-highest/50 rounded-xl px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <span
              className="material-symbols-outlined text-lg text-gold"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
            >
              apps
            </span>
            <div>
              <p className="text-on-surface text-sm font-medium">
                {app.app_name}
              </p>
              {app.description && (
                <p className="text-on-surface-variant text-xs">
                  {app.description}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => handleToggle(app.id, app.is_active)}
            disabled={pending === app.id}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
              app.is_active
                ? "bg-gold"
                : "bg-surface-container-highest"
            } ${pending === app.id ? "opacity-50" : ""}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                app.is_active ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      ))}
      {apps.length === 0 && (
        <p className="text-on-surface-variant text-sm text-center py-4">
          No dating apps configured.
        </p>
      )}
    </div>
  );
}
