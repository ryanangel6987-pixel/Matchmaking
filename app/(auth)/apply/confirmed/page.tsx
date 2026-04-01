"use client";

import Image from "next/image";

export default function BookingConfirmedPage() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-2xl mx-auto px-6 py-12 space-y-10">

        {/* Logo */}
        <div className="text-center">
          <Image src="/logo.png" alt="Private Dating Concierge" width={200} height={40} className="mx-auto" priority />
        </div>

        {/* ═══ 1. CONFIRMATION ═══ */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gold-gradient shadow-lg shadow-gold/20">
            <span className="material-symbols-outlined text-on-gold text-4xl" style={{ fontVariationSettings: "'FILL' 1, 'wght' 500" }}>
              event_available
            </span>
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-on-surface">
            You&apos;re Booked.
          </h1>
          <p className="text-on-surface-variant text-base max-w-sm mx-auto leading-relaxed">
            Your consultation call is confirmed. We&apos;ll see you soon.
          </p>
        </div>

        {/* ═══ 2. BEFORE YOUR CALL + COME PREPARED ═══ */}
        <div className="bg-surface-container-low rounded-2xl p-6 space-y-6">
          <p className="text-gold text-xs uppercase tracking-widest font-bold">Before Your Call</p>
          {[
            { num: "1", icon: "sms", text: "Check your texts to confirm your consultation time" },
            { num: "2", icon: "calendar_add_on", text: "Add the call to your calendar using the email link" },
          ].map((item) => (
            <div key={item.num} className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-full bg-gold/15 flex items-center justify-center shrink-0">
                <span className="text-gold font-heading font-bold text-sm">{item.num}</span>
              </div>
              <div className="flex items-center gap-3 flex-1">
                <span className="material-symbols-outlined text-gold text-xl" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>{item.icon}</span>
                <p className="text-on-surface text-sm">{item.text}</p>
              </div>
            </div>
          ))}

          <div className="border-t border-outline-variant/10 pt-5">
            <p className="text-gold text-xs uppercase tracking-widest font-bold mb-3">Come Prepared</p>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-3">
              The more your matchmaker knows going in, the faster you get results. Have these ready:
            </p>
            <ul className="space-y-2.5">
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
        </div>

        {/* ═══ 3. WHAT HAPPENS NEXT (WITH DECISION STEP) ═══ */}
        <div className="space-y-4">
          <h2 className="font-heading text-xl font-bold text-on-surface text-center">What Happens Next</h2>
          <div className="space-y-3">
            {[
              { icon: "call", title: "Your Consultation", text: "30-minute deep dive into your type, preferences, and goals.", time: "Your booked time" },
              { icon: "handshake", title: "If We\u2019re a Good Fit", text: "We agree on next steps together. No pressure, no hard sell \u2014 just a mutual decision.", time: "End of call" },
              { icon: "photo_library", title: "Photo & Content", text: "Send your best photos. We select, enhance, and optimize.", time: "Day 1\u20132" },
              { icon: "auto_fix_high", title: "Identity Rebuild", text: "Profiles, bios, prompts, and photo order reconstructed across every platform.", time: "Day 2\u20137" },
              { icon: "person", title: "Manager Assigned", text: "Your dedicated manager is briefed on your profile and type. Apps go live.", time: "Day 7" },
              { icon: "tune", title: "Calibration Phase", text: "Daily swiping and messaging using proven playbooks. Manager learns your taste.", time: "Day 7\u201314" },
              { icon: "notifications_active", title: "First Date Notification", text: "Her name. One detail. The day. Her number. A pre-written text.", time: "Week 2\u20133", highlight: true },
            ].map((step) => (
              <div key={step.title} className={`flex gap-4 p-4 rounded-2xl ${step.highlight ? "bg-gold/10 border border-gold/20" : "bg-surface-container-low"}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${step.highlight ? "bg-gold text-on-gold" : "bg-surface-container-high"}`}>
                  <span className={`material-symbols-outlined text-lg ${step.highlight ? "" : "text-gold"}`} style={{ fontVariationSettings: step.highlight ? "'FILL' 1, 'wght' 400" : "'FILL' 0, 'wght' 300" }}>{step.icon}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-heading text-sm font-semibold ${step.highlight ? "text-gold" : "text-on-surface"}`}>{step.title}</h3>
                    <span className="text-outline text-[10px] uppercase tracking-widest">{step.time}</span>
                  </div>
                  <p className="text-on-surface-variant text-xs mt-0.5 leading-relaxed">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-on-surface-variant/40 text-xs">
          We accept a limited number of new clients each month to ensure quality.
        </p>
      </div>
    </div>
  );
}
