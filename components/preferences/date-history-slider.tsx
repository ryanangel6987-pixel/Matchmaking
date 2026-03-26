"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Image from "next/image";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface DateHistorySliderProps {
  approvedDates: any[];
  declinedDates: any[];
  preferences: any;
  isMobile?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getDealBreakerFlags(candidate: any, preferences: any): string[] {
  if (!preferences) return [];
  const flags: string[] = [];

  // Age check
  if (candidate.candidate_age) {
    if (preferences.target_age_min && candidate.candidate_age < preferences.target_age_min) {
      flags.push("Age outside range");
    } else if (preferences.target_age_max && candidate.candidate_age > preferences.target_age_max) {
      flags.push("Age outside range");
    }
  }

  // Kids check
  if (candidate.candidate_has_kids && preferences.kids_preference === "no_kids") {
    flags.push("Has kids");
  }

  // Deal-breakers array match
  if (preferences.deal_breakers && Array.isArray(preferences.deal_breakers)) {
    const candidateFields = [
      candidate.candidate_ethnicity,
      candidate.candidate_education,
      candidate.candidate_profession,
      candidate.candidate_location,
    ].filter(Boolean).map((f: string) => f.toLowerCase());

    for (const breaker of preferences.deal_breakers) {
      const lower = breaker.toLowerCase();
      if (candidateFields.some((f: string) => f.includes(lower) || lower.includes(f))) {
        flags.push(breaker);
      }
    }
  }

  return flags;
}

function formatHeight(inches: number | null | undefined): string | null {
  if (!inches) return null;
  const ft = Math.floor(inches / 12);
  const rem = inches % 12;
  return `${ft}'${rem}"`;
}

/* ─── Horizontal Scroll Section ────────────────────────────────── */

function CardSlider({
  children,
  count,
  isMobile,
}: {
  children: React.ReactNode;
  count: number;
  isMobile: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const cardWidth = isMobile ? 0 : 280; // mobile uses full-width snap
  const gap = 16;

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const itemWidth = isMobile
      ? el.offsetWidth
      : cardWidth + gap;
    const idx = Math.round(scrollLeft / itemWidth);
    setActiveIndex(Math.min(idx, count - 1));
  }, [isMobile, cardWidth, count]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const scrollTo = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const itemWidth = isMobile ? el.offsetWidth : cardWidth + gap;
    const target = direction === "left"
      ? el.scrollLeft - itemWidth
      : el.scrollLeft + itemWidth;
    el.scrollTo({ left: target, behavior: "smooth" });
  };

  return (
    <div className="relative">
      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide"
        style={{
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {children}
      </div>

      {/* Desktop arrows */}
      {!isMobile && count > 1 && (
        <>
          <button
            onClick={() => scrollTo("left")}
            disabled={activeIndex === 0}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-8 h-8 rounded-full bg-surface-container-high/90 flex items-center justify-center text-on-surface hover:bg-gold/20 transition-colors disabled:opacity-30 disabled:cursor-default"
          >
            <span className="material-symbols-outlined text-base">chevron_left</span>
          </button>
          <button
            onClick={() => scrollTo("right")}
            disabled={activeIndex >= count - 1}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-8 h-8 rounded-full bg-surface-container-high/90 flex items-center justify-center text-on-surface hover:bg-gold/20 transition-colors disabled:opacity-30 disabled:cursor-default"
          >
            <span className="material-symbols-outlined text-base">chevron_right</span>
          </button>
        </>
      )}

      {/* Dot indicators */}
      {count > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {Array.from({ length: count }).map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-200 ${
                i === activeIndex
                  ? "w-5 h-1.5 bg-gold"
                  : "w-1.5 h-1.5 bg-on-surface-variant/30"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Single Date Card ─────────────────────────────────────────── */

function DateCard({
  date,
  variant,
  flags,
  isMobile,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  date: any;
  variant: "approved" | "declined";
  flags: string[];
  isMobile: boolean;
}) {
  const isDeclined = variant === "declined";
  const cardHeight = isMobile ? "h-[400px]" : "h-[350px]";
  const cardWidth = isMobile ? "w-full shrink-0" : "w-[280px] shrink-0";

  return (
    <div
      className={`${cardWidth} snap-start`}
      style={{ scrollSnapAlign: "start" }}
    >
      {/* Card */}
      <div
        className={`relative ${cardHeight} rounded-2xl overflow-hidden bg-surface-container-low ${
          isDeclined ? "opacity-70 grayscale-[40%]" : ""
        }`}
      >
        {/* Photo or placeholder */}
        {date.candidate_photo_url ? (
          <Image
            src={date.candidate_photo_url}
            alt={date.candidate_name || "Candidate"}
            fill
            className="object-cover"
            sizes={isMobile ? "100vw" : "280px"}
          />
        ) : (
          <div className={`absolute inset-0 ${
            isDeclined
              ? "bg-gradient-to-br from-surface-container-high to-surface-container"
              : "bg-gradient-to-br from-gold/20 to-surface-container-high"
          } flex items-center justify-center`}>
            <span
              className={`material-symbols-outlined text-6xl ${
                isDeclined ? "text-on-surface-variant/30" : "text-gold/30"
              }`}
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}
            >
              person
            </span>
          </div>
        )}

        {/* Badge */}
        <div className="absolute top-3 right-3 z-10">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium backdrop-blur-sm ${
              isDeclined
                ? "bg-error-red/20 text-error-red border border-error-red/30"
                : "bg-gold/20 text-gold border border-gold/30"
            }`}
          >
            <span
              className="material-symbols-outlined text-xs"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}
            >
              {isDeclined ? "cancel" : "check_circle"}
            </span>
            {isDeclined ? "Declined" : "Approved"}
          </span>
        </div>

        {/* Deal-breaker flags */}
        {flags.length > 0 && (
          <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1 max-w-[60%]">
            {flags.map((flag, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-error-red/80 text-white backdrop-blur-sm"
              >
                <span
                  className="material-symbols-outlined text-[10px]"
                  style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}
                >
                  warning
                </span>
                {flag}
              </span>
            ))}
          </div>
        )}

        {/* Bottom gradient overlay with info */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-20 pb-4 px-4">
          <h4 className="text-white text-[20px] font-bold leading-tight">
            {date.candidate_name || "Unknown"}
          </h4>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
            {date.candidate_age && (
              <span className="text-white/80 text-[13px]">{date.candidate_age}</span>
            )}
            {date.candidate_profession && (
              <span className="text-white/60 text-[13px]">{date.candidate_profession}</span>
            )}
            {date.candidate_location && (
              <span className="text-white/60 text-[13px]">{date.candidate_location}</span>
            )}
          </div>
          {/* Additional details row */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
            {date.candidate_height_inches && (
              <span className="text-white/50 text-[12px]">{formatHeight(date.candidate_height_inches)}</span>
            )}
            {date.candidate_ethnicity && (
              <span className="text-white/50 text-[12px]">{date.candidate_ethnicity}</span>
            )}
            {date.candidate_education && (
              <span className="text-white/50 text-[12px]">{date.candidate_education}</span>
            )}
          </div>
        </div>
      </div>

      {/* Below-card info */}
      <div className="mt-2 px-1 space-y-1">
        {date.client_decision_at && (
          <p className="text-on-surface-variant text-[11px]">
            {new Date(date.client_decision_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        )}
        {isDeclined && date.decline_reason && (
          <p className="text-error-red/80 text-[12px] italic leading-snug">
            {date.decline_reason}
          </p>
        )}
        {!isDeclined && date.notes && (
          <p className="text-on-surface-variant text-[12px] italic leading-snug">
            {date.notes}
          </p>
        )}
        {!isDeclined && date.memorable_detail && (
          <p className="text-gold/70 text-[12px] leading-snug">
            &ldquo;{date.memorable_detail}&rdquo;
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── Main Export ───────────────────────────────────────────────── */

export function DateHistorySlider({
  approvedDates,
  declinedDates,
  preferences,
  isMobile = false,
}: DateHistorySliderProps) {
  if (approvedDates.length === 0 && declinedDates.length === 0) return null;

  return (
    <div className={`space-y-8 ${isMobile ? "" : "bg-surface-container-low p-8 rounded-2xl shadow-xl"}`}>
      {/* Section heading */}
      <h3 className={`text-on-surface-variant uppercase tracking-widest ${isMobile ? "text-[11px]" : "text-xs"}`}>
        Date History
      </h3>

      {/* Approved section */}
      {approvedDates.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-outlined text-gold text-sm"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}
            >
              check_circle
            </span>
            <p className="text-gold text-xs uppercase tracking-widest font-medium">
              Approved Matches
            </p>
            <span className="text-gold/50 text-xs">({approvedDates.length})</span>
          </div>

          <CardSlider count={approvedDates.length} isMobile={isMobile}>
            {approvedDates.map((d: any) => (
              <DateCard
                key={d.id}
                date={d}
                variant="approved"
                flags={getDealBreakerFlags(d, preferences)}
                isMobile={isMobile}
              />
            ))}
          </CardSlider>
        </div>
      )}

      {/* Declined section */}
      {declinedDates.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-outlined text-error-red text-sm"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}
            >
              cancel
            </span>
            <p className="text-error-red/80 text-xs uppercase tracking-widest font-medium">
              Declined
            </p>
            <span className="text-error-red/40 text-xs">({declinedDates.length})</span>
          </div>

          <CardSlider count={declinedDates.length} isMobile={isMobile}>
            {declinedDates.map((d: any) => (
              <DateCard
                key={d.id}
                date={d}
                variant="declined"
                flags={getDealBreakerFlags(d, preferences)}
                isMobile={isMobile}
              />
            ))}
          </CardSlider>
        </div>
      )}

      {/* Footer note */}
      <p className={`text-on-surface-variant italic ${isMobile ? "text-[12px]" : "text-xs"}`}>
        Your date history helps your matchmaker refine targeting and improve match quality.
      </p>
    </div>
  );
}
