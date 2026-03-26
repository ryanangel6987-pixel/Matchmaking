"use client";

import type { AppStats } from "./dashboard-client";

interface PerAppBreakdownProps {
  appStats: AppStats[];
}

function rateColor(rate: number): string {
  if (rate >= 0.1) return "text-emerald-400";
  if (rate >= 0.05) return "text-yellow-400";
  return "text-red-400";
}

function rateDot(rate: number): string {
  if (rate >= 0.1) return "bg-emerald-400";
  if (rate >= 0.05) return "bg-yellow-400";
  return "bg-red-400";
}

function formatPct(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export function PerAppBreakdown({ appStats }: PerAppBreakdownProps) {
  if (appStats.length === 0) return null;

  // Determine best performer by dates_closed
  const sorted = [...appStats].sort((a, b) => b.dates_closed - a.dates_closed);
  const bestApp = sorted[0]?.appName ?? null;

  return (
    <section className="space-y-4">
      <h2 className="text-on-surface-variant text-xs uppercase tracking-widest">
        Per-App Breakdown
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {appStats.map((app) => {
          const isBest = app.appName === bestApp && appStats.length > 1;
          const maxBar = Math.max(app.swipes, 1);

          const funnelBars = [
            { label: "Swipes", value: app.swipes },
            { label: "Matches", value: app.matches },
            { label: "Convos", value: app.conversations },
            { label: "Dates", value: app.dates_closed },
          ];

          const matchesPerSwipe =
            app.matches > 0 ? Math.round(app.swipes / app.matches) : 0;
          const datesPerConvo =
            app.dates_closed > 0
              ? Math.round(app.conversations / app.dates_closed)
              : 0;

          return (
            <div
              key={app.appName}
              className="bg-surface-container-low p-6 rounded-2xl shadow-xl relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-gold opacity-30 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading text-lg font-bold text-on-surface">
                  {app.appName}
                </h3>
                {isBest && (
                  <span className="bg-gold/15 text-gold text-[9px] uppercase tracking-widest font-bold px-2 py-1 rounded-full">
                    #1
                  </span>
                )}
              </div>

              {/* Mini Funnel */}
              <div className="space-y-1.5 mb-5">
                {funnelBars.map((bar) => {
                  const w =
                    maxBar > 0
                      ? Math.max(4, (bar.value / maxBar) * 100)
                      : 4;
                  return (
                    <div
                      key={bar.label}
                      className="flex items-center gap-2"
                    >
                      <span className="text-on-surface-variant text-[10px] w-12 text-right flex-shrink-0">
                        {bar.label}
                      </span>
                      <div className="flex-1 h-4 rounded-sm overflow-hidden bg-outline-variant/10">
                        <div
                          className="h-full bg-gradient-to-r from-gold/70 to-gold/40 rounded-sm transition-all duration-500"
                          style={{ width: `${w}%` }}
                        />
                      </div>
                      <span className="text-on-surface text-[10px] font-heading font-semibold w-10 text-right flex-shrink-0">
                        {fmtNum(bar.value)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Rates */}
              <div className="border-t border-outline-variant/15 pt-4 space-y-2.5 mb-4">
                <RateLine label="Match Rate" rate={app.match_rate} />
                <RateLine
                  label="Conversation Rate"
                  rate={app.conversation_rate}
                />
                <RateLine label="Close Rate" rate={app.close_rate} />
              </div>

              {/* Efficiency Metrics */}
              <div className="border-t border-outline-variant/15 pt-3 space-y-1">
                {app.matches > 0 && (
                  <p className="text-on-surface-variant text-[10px]">
                    <span className="text-gold font-heading font-semibold">
                      1 match
                    </span>{" "}
                    per {matchesPerSwipe} swipes
                  </p>
                )}
                {app.dates_closed > 0 && (
                  <p className="text-on-surface-variant text-[10px]">
                    <span className="text-gold font-heading font-semibold">
                      1 date
                    </span>{" "}
                    per {datesPerConvo} conversations
                  </p>
                )}
                {app.matches === 0 && app.dates_closed === 0 && (
                  <p className="text-on-surface-variant text-[10px] italic">
                    Not enough data for efficiency metrics
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function RateLine({ label, rate }: { label: string; rate: number }) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <span
          className={`inline-block w-2 h-2 rounded-full ${rateDot(rate)}`}
        />
        <span className="text-on-surface-variant text-xs">{label}</span>
      </div>
      <span
        className={`font-heading text-sm font-semibold ${rateColor(rate)}`}
      >
        {formatPct(rate)}
      </span>
    </div>
  );
}
