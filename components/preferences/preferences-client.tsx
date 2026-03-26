"use client";

import { useState } from "react";
import { SectionClientContext } from "./section-client-context";
import { SectionWhatHeWants } from "./section-what-he-wants";
import { SectionOperationalNotes } from "./section-operational-notes";
import { SectionVisualPreferences } from "./section-visual-preferences";
import { DateHistorySlider } from "./date-history-slider";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface PreferencesClientProps {
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

const TABS = [
  { label: "About You", icon: "person" },
  { label: "Preferences", icon: "favorite" },
  { label: "Logistics", icon: "calendar_month" },
];

export function PreferencesClient({
  clientId,
  onboarding,
  preferences,
  preferenceAssets,
  venues,
  availability,
  searchAreas,
  approvedDates,
  declinedDates,
}: PreferencesClientProps) {
  const [activeTab, setActiveTab] = useState(0);
  const activeVenues = venues.filter((v: any) => v.is_active && !v.is_avoided);
  const avoidedVenues = venues.filter((v: any) => v.is_avoided);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-heading font-bold text-gold tracking-tight">
          Your Preferences
        </h1>
        <div className="h-px w-24 bg-gradient-to-r from-gold to-transparent" />
      </div>

      {/* Tab bar */}
      <div className="flex rounded-xl bg-surface-container-low p-1 gap-1">
        {TABS.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(i)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === i
                ? "bg-gold/10 text-gold"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
            }`}
          >
            <span
              className="material-symbols-outlined text-lg"
              style={{ fontVariationSettings: activeTab === i ? "'FILL' 1, 'wght' 400" : "'FILL' 0, 'wght' 300" }}
            >
              {tab.icon}
            </span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 0 && (
        <SectionClientContext onboarding={onboarding} clientId={clientId} />
      )}

      {activeTab === 1 && (
        <div className="space-y-8">
          <SectionWhatHeWants preferences={preferences} clientId={clientId} />
          <SectionVisualPreferences assets={preferenceAssets} clientId={clientId} />

          {/* Date History — Tinder-style card slider */}
          <DateHistorySlider
            approvedDates={approvedDates}
            declinedDates={declinedDates}
            preferences={preferences}
          />
        </div>
      )}

      {activeTab === 2 && (
        <div className="space-y-8">
          <SectionOperationalNotes onboarding={onboarding} clientId={clientId} availability={availability} searchAreas={searchAreas} />
        </div>
      )}
    </div>
  );
}
