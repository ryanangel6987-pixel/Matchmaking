"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface IntelligenceSuggestionsProps {
  kpiSummary: any;
  photos: any[];
  accountHealth: any[];
  actions: any[];
}

interface Suggestion {
  icon: string;
  message: string;
  severity: "critical" | "warning" | "info";
}

function severityColor(severity: Suggestion["severity"]): string {
  switch (severity) {
    case "critical":
      return "text-red-400";
    case "warning":
      return "text-yellow-400";
    case "info":
      return "text-gold";
  }
}

function severityBorder(severity: Suggestion["severity"]): string {
  switch (severity) {
    case "critical":
      return "border-l-red-400";
    case "warning":
      return "border-l-yellow-400";
    case "info":
      return "border-l-gold";
  }
}

export function IntelligenceSuggestions({
  kpiSummary,
  photos,
  accountHealth,
  actions,
}: IntelligenceSuggestionsProps) {
  const suggestions: Suggestion[] = [];

  // Photo check: no photos have status 'live'
  const hasLivePhotos = photos.some((p) => p.status === "live");
  if (!hasLivePhotos) {
    suggestions.push({
      icon: "photo_camera",
      message: "Upload and get photos approved to go live",
      severity: "critical",
    });
  }

  // Match rate < 3%
  const matchRate = kpiSummary?.match_rate ?? 0;
  if (matchRate < 0.03 && (kpiSummary?.total_swipes ?? 0) > 0) {
    suggestions.push({
      icon: "trending_down",
      message:
        "Low match rate — consider updating profile photos or bio",
      severity: "warning",
    });
  }

  // Conversation rate < 20%
  const convRate = kpiSummary?.conversation_rate ?? 0;
  if (convRate < 0.2 && (kpiSummary?.total_matches ?? 0) > 0) {
    suggestions.push({
      icon: "forum",
      message:
        "Matches aren't converting to conversations — review opening messages",
      severity: "warning",
    });
  }

  // Close rate < 10%
  const closeRate = kpiSummary?.close_rate ?? 0;
  if (closeRate < 0.1 && (kpiSummary?.total_conversations ?? 0) > 0) {
    suggestions.push({
      icon: "event_busy",
      message:
        "Conversations aren't leading to dates — try being more direct with date asks",
      severity: "warning",
    });
  }

  // Account health issues
  const problemAccounts = accountHealth.filter(
    (ah) => ah.status === "shadowbanned" || ah.status === "banned"
  );
  for (const ah of problemAccounts) {
    const appName = ah.dating_apps?.app_name ?? "an app";
    suggestions.push({
      icon: "error",
      message: `Account issue detected on ${appName} — contact your matchmaker`,
      severity: "critical",
    });
  }

  // Overdue actions
  const now = new Date();
  const overdueActions = actions.filter(
    (a) => a.due_date && new Date(a.due_date) < now
  );
  if (overdueActions.length > 0) {
    suggestions.push({
      icon: "schedule",
      message: "You have overdue action items",
      severity: "warning",
    });
  }

  // 0 dates approved but dates closed > 0
  const datesApproved = kpiSummary?.dates_approved ?? 0;
  const datesClosed = kpiSummary?.total_dates_closed ?? 0;
  if (datesApproved === 0 && datesClosed > 0) {
    suggestions.push({
      icon: "thumb_up",
      message:
        "You haven't approved any dates yet — check your opportunities",
      severity: "info",
    });
  }

  if (suggestions.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-on-surface-variant text-xs uppercase tracking-widest flex items-center gap-2">
        <span
          className="material-symbols-outlined text-gold text-base"
          style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}
        >
          lightbulb
        </span>
        Intelligence
      </h2>
      <div className="space-y-3">
        {suggestions.map((s, i) => (
          <div
            key={i}
            className={`bg-surface-container-low p-4 rounded-xl border-l-2 ${severityBorder(
              s.severity
            )} flex items-start gap-3`}
          >
            <span
              className={`material-symbols-outlined text-lg mt-0.5 ${severityColor(
                s.severity
              )}`}
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}
            >
              {s.icon}
            </span>
            <p className="text-on-surface text-sm">{s.message}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
