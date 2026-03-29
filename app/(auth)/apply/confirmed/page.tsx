"use client";

import Link from "next/link";
import Image from "next/image";

const TESTIMONIALS = [
  { name: "TJ", role: "Tech Sales Manager", result: "Went from bad matches to 4/5 quality dates weekly from launching his profile" },
  { name: "AJ", role: "Computer Scientist", result: "Went from zero prior success, matches, or likes to unlimited quality dates in 30 days" },
  { name: "Raj", role: "Consultant", result: "Went from bad matches on dating apps to unlimited dates every week" },
  { name: "Mike", role: "Data Scientist", result: "Went from $1,500 wasted on dating photographers to unlimited weekly dates" },
  { name: "Ryan", role: "Software Engineer", result: "Went from a few bad likes a week to 10\u201320 quality matches weekly per app" },
  { name: "Mike B.", role: "Blockchain Co-founder", result: "Went from 3\u20135 likes a week to 120+ likes on Hinge and unlimited dates every week" },
  { name: "Tri", role: "Finance Data Analyst", result: "Went from 3 likes in 6 months to 10 likes a day per app and hot weekly dates" },
  { name: "Marshall", role: "Software Engineer", result: "Went from super low quality matches and quitting dating apps to multiple weekly dates" },
  { name: "David", role: "PR Manager", result: "Went from bad matches to multiple quality dates weekly in 30 days" },
  { name: "Bhavesh", role: "Engineer", result: "Went from a divorce to 2\u20135 dates weekly in 30 days from launching his profile" },
];

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

        {/* ═══ 2. ACTION ITEMS ═══ */}
        <div className="bg-surface-container-low rounded-2xl p-6 space-y-4">
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
        </div>

        {/* ═══ 3. WHAT HAPPENS NEXT ═══ */}
        <div className="space-y-4">
          <h2 className="font-heading text-xl font-bold text-on-surface text-center">What Happens Next</h2>
          <div className="space-y-3">
            {[
              { icon: "call", title: "Your Consultation", text: "30-minute deep dive into your type, preferences, and goals.", time: "Your booked time" },
              { icon: "auto_fix_high", title: "Identity Rebuild", text: "We reconstruct your digital presence across every platform.", time: "Within 48 hours" },
              { icon: "person", title: "Manager Assigned", text: "Your dedicated manager is briefed and begins daily operations.", time: "Day 7" },
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

        {/* ═══ 4. PREPARE FOR YOUR CALL + PORTAL CTA ═══ */}
        <div className="bg-surface-container-low rounded-2xl p-6 space-y-5">
          <p className="text-gold text-xs uppercase tracking-widest font-bold">Prepare for Your Call</p>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            Your portal is ready. Upload your photos, add reference pictures of your type, and fill in your preferences before the call — the more your matchmaker knows going in, the faster you get results.
          </p>
          <ul className="space-y-2.5">
            {[
              "Upload your best photos and photos of exes / your type",
              "Fill in your preferences, deal-breakers, and lifestyle details",
              "Add your preferred date neighborhoods and venues",
              "Have your dating app logins ready (if you have accounts)",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-on-surface text-sm">
                <span className="material-symbols-outlined text-gold text-sm mt-0.5" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}>check_circle</span>
                {item}
              </li>
            ))}
          </ul>
          <Link
            href="/login"
            className="block gold-gradient text-on-gold font-semibold rounded-full py-3.5 text-sm text-center hover:opacity-90 transition-opacity shadow-lg"
          >
            Open Your Portal
          </Link>
        </div>

        {/* ═══ 5. CLIENT TESTIMONIALS ═══ */}
        <div className="space-y-4">
          <h2 className="font-heading text-xl font-bold text-center text-on-surface">Clients Like You</h2>
          <p className="text-on-surface-variant text-xs text-center uppercase tracking-widest">Real results from real clients</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-surface-container-low rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gold/15 flex items-center justify-center">
                    <span className="text-gold font-heading font-bold text-xs">{t.name[0]}</span>
                  </div>
                  <div>
                    <p className="text-on-surface font-heading font-semibold text-sm">{t.name}</p>
                    <p className="text-on-surface-variant text-[10px] uppercase tracking-widest">{t.role}</p>
                  </div>
                </div>
                <p className="text-on-surface-variant text-xs leading-relaxed">{t.result}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-on-surface-variant/40 text-xs">
          Your matchmaker will be assigned after the consultation call.
        </p>
      </div>
    </div>
  );
}
