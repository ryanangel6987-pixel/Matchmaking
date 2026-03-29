"use client";

import Link from "next/link";
import Image from "next/image";

export default function BookingConfirmedPage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6">
      <div className="w-full max-w-lg text-center space-y-8">
        {/* Logo */}
        <Image src="/logo.png" alt="Private Dating Concierge" width={200} height={40} className="mx-auto" priority />

        {/* Success */}
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gold-gradient shadow-lg shadow-gold/20">
            <span
              className="material-symbols-outlined text-on-gold text-4xl"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 500" }}
            >
              event_available
            </span>
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-on-surface">
            You&apos;re Booked
          </h1>
          <p className="text-on-surface-variant text-base max-w-sm mx-auto leading-relaxed">
            Your consultation is confirmed. Here&apos;s what happens next.
          </p>
        </div>

        {/* Next Steps Timeline */}
        <div className="bg-surface-container-low rounded-2xl p-6 text-left space-y-5">
          {[
            {
              icon: "mark_email_read",
              title: "Check Your Email",
              text: "You'll receive a calendar invite with your consultation details and a link to join.",
              time: "Now",
            },
            {
              icon: "call",
              title: "Your Consultation Call",
              text: "A 30-minute deep dive into your type, preferences, schedule, and goals. Come ready to talk specifics.",
              time: "Your booked time",
            },
            {
              icon: "auto_fix_high",
              title: "Identity Rebuild Begins",
              text: "Within 48 hours of your call, we start reconstructing your digital presence across every platform.",
              time: "Within 48 hours",
            },
            {
              icon: "notifications_active",
              title: "First Date Notification",
              text: "Her name, one detail, the day, her number, and a pre-written text. Copy. Send. Show up.",
              time: "Week 2\u20133",
              highlight: true,
            },
          ].map((step) => (
            <div key={step.title} className="flex gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                step.highlight ? "bg-gold text-on-gold" : "bg-surface-container-high"
              }`}>
                <span
                  className={`material-symbols-outlined text-lg ${step.highlight ? "" : "text-gold"}`}
                  style={{ fontVariationSettings: step.highlight ? "'FILL' 1, 'wght' 400" : "'FILL' 0, 'wght' 300" }}
                >
                  {step.icon}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className={`font-heading text-sm font-semibold ${step.highlight ? "text-gold" : "text-on-surface"}`}>
                    {step.title}
                  </h3>
                  <span className="text-outline text-[10px] uppercase tracking-widest">{step.time}</span>
                </div>
                <p className="text-on-surface-variant text-xs mt-0.5 leading-relaxed">{step.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Prepare for Call */}
        <div className="bg-surface-container-low rounded-2xl p-5 text-left">
          <p className="text-gold text-xs uppercase tracking-widest mb-3">Prepare for Your Call</p>
          <ul className="space-y-2">
            {[
              "Have 3\u20135 recent photos of yourself ready to share",
              "Think about your top 3 deal-breakers",
              "Know your preferred neighborhoods for dates",
              "Have your dating app logins available (if you have accounts)",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-on-surface-variant text-xs">
                <span className="material-symbols-outlined text-gold text-xs mt-0.5" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}>check</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <Link
            href="/login"
            className="block gold-gradient text-on-gold font-semibold rounded-full py-3.5 text-sm hover:opacity-90 transition-opacity shadow-lg"
          >
            Go to Your Portal
          </Link>
          <p className="text-on-surface-variant/40 text-xs">
            You can explore your portal while you wait. Your matchmaker will be assigned after the call.
          </p>
        </div>
      </div>
    </div>
  );
}
