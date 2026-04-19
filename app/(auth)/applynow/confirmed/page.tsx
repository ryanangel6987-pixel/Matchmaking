"use client";

import { useEffect } from "react";
import Image from "next/image";

export default function ApplyNowConfirmedPage() {
  // Fire pipeline stage update to "call_booked" (they already booked before applying)
  useEffect(() => {
    try {
      const stored = localStorage.getItem("pdc_application");
      if (stored) {
        const { email } = JSON.parse(stored);
        if (email) {
          fetch("/api/applications/stage", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, stage: "call_booked" }),
          }).catch(() => {});
        }
      }
    } catch {}
  }, []);

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-2xl mx-auto px-6 py-12 space-y-10">

        {/* Logo */}
        <div className="text-center">
          <Image src="/logo.png" alt="Private Dating Concierge" width={200} height={40} className="mx-auto" priority />
        </div>

        {/* ═══ 1. THANK YOU ═══ */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gold-gradient shadow-lg shadow-gold/20">
            <span className="material-symbols-outlined text-on-gold text-4xl" style={{ fontVariationSettings: "'FILL' 1, 'wght' 500" }}>
              check_circle
            </span>
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-on-surface">
            Thanks for Submitting.
          </h1>
          <p className="text-on-surface-variant text-base max-w-sm mx-auto leading-relaxed">
            Your application is in. We&apos;ll review everything before your call.
          </p>
        </div>

        {/* ═══ 2. PREP FOR YOUR CALL ═══ */}
        <div className="bg-surface-container-low rounded-2xl p-6 space-y-6">
          <p className="text-gold text-xs uppercase tracking-widest font-bold">Prepare for Your Call</p>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            The more your concierge knows going in, the faster you get results. Have these ready before your consultation:
          </p>
          <ul className="space-y-3">
            {[
              "3\u20135 recent photos of yourself (phone photos are fine)",
              "Reference photos of your type \u2014 exes, celebrities, anyone who represents what you\u2019re attracted to",
              "Your top 3 deal-breakers",
              "Your preferred neighborhoods and venues for dates",
              "Any questions you want to ask",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-on-surface text-sm">
                <span className="material-symbols-outlined text-gold text-sm mt-0.5" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}>check_circle</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <p className="text-center text-on-surface-variant/40 text-xs">
          We accept a limited number of new clients each month to ensure quality.
        </p>
      </div>
    </div>
  );
}
