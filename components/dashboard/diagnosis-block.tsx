"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface DiagnosisBlockProps {
  kpiSummary: any;
  photos: any[];
  accountHealth: any[];
}

type HealthLevel = "green" | "yellow" | "red";

interface DiagnosisItem {
  label: string;
  icon: string;
  level: HealthLevel;
  explanation: string;
}

function dotColor(level: HealthLevel): string {
  switch (level) {
    case "green":
      return "bg-emerald-400";
    case "yellow":
      return "bg-yellow-400";
    case "red":
      return "bg-red-400";
  }
}

function levelTextColor(level: HealthLevel): string {
  switch (level) {
    case "green":
      return "text-emerald-400";
    case "yellow":
      return "text-yellow-400";
    case "red":
      return "text-red-400";
  }
}

function levelLabel(level: HealthLevel): string {
  switch (level) {
    case "green":
      return "Good";
    case "yellow":
      return "Needs Attention";
    case "red":
      return "Critical";
  }
}

export function DiagnosisBlock({
  kpiSummary,
  photos,
  accountHealth,
}: DiagnosisBlockProps) {
  const items: DiagnosisItem[] = [];

  // 1. Profile Health — based on photo status
  const livePhotos = photos.filter((p) => p.status === "live").length;
  const approvedPhotos = photos.filter((p) => p.status === "approved").length;
  const totalPhotos = photos.length;

  let profileLevel: HealthLevel;
  let profileExplanation: string;
  if (totalPhotos === 0) {
    profileLevel = "red";
    profileExplanation = "No photos uploaded yet";
  } else if (livePhotos === totalPhotos) {
    profileLevel = "green";
    profileExplanation = `All ${livePhotos} photos are live`;
  } else if (livePhotos > 0 || approvedPhotos > 0) {
    profileLevel = "yellow";
    profileExplanation = `${livePhotos} live, ${approvedPhotos} approved, ${totalPhotos - livePhotos - approvedPhotos} pending`;
  } else {
    profileLevel = "red";
    profileExplanation = "No photos are live or approved";
  }
  items.push({
    label: "Profile Health",
    icon: "person",
    level: profileLevel,
    explanation: profileExplanation,
  });

  // 2. Match Performance — based on match_rate
  const matchRate = kpiSummary?.match_rate ?? 0;
  const hasSwipes = (kpiSummary?.total_swipes ?? 0) > 0;
  let matchLevel: HealthLevel;
  let matchExplanation: string;
  if (!hasSwipes) {
    matchLevel = "yellow";
    matchExplanation = "No swipe data yet";
  } else if (matchRate >= 0.1) {
    matchLevel = "green";
    matchExplanation = `${(matchRate * 100).toFixed(1)}% match rate — strong performance`;
  } else if (matchRate >= 0.05) {
    matchLevel = "yellow";
    matchExplanation = `${(matchRate * 100).toFixed(1)}% match rate — room for improvement`;
  } else {
    matchLevel = "red";
    matchExplanation = `${(matchRate * 100).toFixed(1)}% match rate — needs attention`;
  }
  items.push({
    label: "Match Performance",
    icon: "favorite",
    level: matchLevel,
    explanation: matchExplanation,
  });

  // 3. Conversation Quality — based on conversation_rate
  const convRate = kpiSummary?.conversation_rate ?? 0;
  const hasMatches = (kpiSummary?.total_matches ?? 0) > 0;
  let convLevel: HealthLevel;
  let convExplanation: string;
  if (!hasMatches) {
    convLevel = "yellow";
    convExplanation = "No match data yet";
  } else if (convRate >= 0.1) {
    convLevel = "green";
    convExplanation = `${(convRate * 100).toFixed(1)}% of matches become conversations`;
  } else if (convRate >= 0.05) {
    convLevel = "yellow";
    convExplanation = `${(convRate * 100).toFixed(1)}% conversation rate — consider new openers`;
  } else {
    convLevel = "red";
    convExplanation = `${(convRate * 100).toFixed(1)}% conversation rate — review messaging strategy`;
  }
  items.push({
    label: "Conversation Quality",
    icon: "chat",
    level: convLevel,
    explanation: convExplanation,
  });

  // 4. Closing Power — based on close_rate
  const closeRate = kpiSummary?.close_rate ?? 0;
  const hasConversations = (kpiSummary?.total_conversations ?? 0) > 0;
  let closeLevel: HealthLevel;
  let closeExplanation: string;
  if (!hasConversations) {
    closeLevel = "yellow";
    closeExplanation = "No conversation data yet";
  } else if (closeRate >= 0.1) {
    closeLevel = "green";
    closeExplanation = `${(closeRate * 100).toFixed(1)}% close rate — converting well`;
  } else if (closeRate >= 0.05) {
    closeLevel = "yellow";
    closeExplanation = `${(closeRate * 100).toFixed(1)}% close rate — try more direct asks`;
  } else {
    closeLevel = "red";
    closeExplanation = `${(closeRate * 100).toFixed(1)}% close rate — needs strategy adjustment`;
  }
  items.push({
    label: "Closing Power",
    icon: "handshake",
    level: closeLevel,
    explanation: closeExplanation,
  });

  // 5. Account Status — based on account_health
  const problemAccounts = accountHealth.filter(
    (ah) =>
      ah.status === "shadowbanned" ||
      ah.status === "banned" ||
      ah.status === "needs_verification"
  );
  let accountLevel: HealthLevel;
  let accountExplanation: string;
  if (accountHealth.length === 0) {
    accountLevel = "yellow";
    accountExplanation = "No account health data tracked yet";
  } else if (problemAccounts.length === 0) {
    accountLevel = "green";
    accountExplanation = "All accounts active and healthy";
  } else {
    accountLevel = "red";
    const names = problemAccounts
      .map((ah) => ah.dating_apps?.app_name ?? "Unknown")
      .join(", ");
    accountExplanation = `Issues detected on: ${names}`;
  }
  items.push({
    label: "Account Status",
    icon: "shield",
    level: accountLevel,
    explanation: accountExplanation,
  });

  return (
    <section className="space-y-4">
      <h2 className="text-on-surface-variant text-xs uppercase tracking-widest flex items-center gap-2">
        <span
          className="material-symbols-outlined text-gold text-base"
          style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}
        >
          monitor_heart
        </span>
        Diagnosis
      </h2>
      <div className="bg-surface-container-low p-6 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-gold opacity-50" />
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-4"
            >
              {/* Colored dot */}
              <span
                className={`inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 ${dotColor(
                  item.level
                )}`}
              />
              {/* Icon */}
              <span
                className="material-symbols-outlined text-on-surface-variant text-lg flex-shrink-0"
                style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}
              >
                {item.icon}
              </span>
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-on-surface text-sm font-medium font-heading">
                    {item.label}
                  </span>
                  <span
                    className={`text-[10px] uppercase tracking-widest font-semibold ${levelTextColor(
                      item.level
                    )}`}
                  >
                    {levelLabel(item.level)}
                  </span>
                </div>
                <p className="text-on-surface-variant text-xs mt-0.5">
                  {item.explanation}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
