"use client";

import Link from "next/link";
import { useState } from "react";

const I = { fontVariationSettings: "'FILL' 0, 'wght' 300" } as const;
const IF = { fontVariationSettings: "'FILL' 1, 'wght' 400" } as const;

export function LandingPageMobile() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const CTA = () => (
    <div className="px-6 py-6">
      <Link href="/apply" className="block gold-gradient text-on-gold font-semibold rounded-full py-4 text-base text-center hover:opacity-90 transition-opacity shadow-lg">
        Start Your Application
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface text-on-surface">

      {/* ═══ NAV ═══ */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-surface/90 backdrop-blur-xl">
        <div className="flex items-center justify-between px-5 h-14">
          <img src="/logo.png" alt="PDC" className="h-5 w-auto" />
          <Link href="/apply" className="gold-gradient text-on-gold font-semibold rounded-full px-4 py-1.5 text-xs">Apply Now</Link>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="pt-24 pb-12 px-6">
        <div className="inline-flex items-center gap-1.5 bg-gold/10 border border-gold/20 rounded-full px-3 py-1 mb-6">
          <span className="material-symbols-outlined text-gold text-xs" style={IF}>verified</span>
          <span className="text-gold text-[10px] font-medium uppercase tracking-widest">Private Dating Concierge</span>
        </div>
        <h1 className="font-heading text-3xl font-bold leading-tight tracking-tight">
          Get 4&ndash;8 Quality Dates a Month On Demand &mdash; <span className="text-gold">Without Apps, Matchmakers, or Swiping.</span>
        </h1>
        <p className="text-on-surface-variant text-sm mt-4 leading-relaxed">
          Your dating life, managed. A dedicated concierge rebuilds how you show up online, runs your apps daily, and delivers vetted dates to your phone.
        </p>
        <p className="text-gold font-heading text-base italic mt-3">Copy. Send. Show up.</p>
      </section>

      <CTA />

      {/* ═══ SOCIAL PROOF ═══ */}
      <section className="px-6 py-6">
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: "500+", label: "Dates" },
            { value: "89%", label: "2nd Date Rate" },
            { value: "2-3 Wks", label: "To 1st Date" },
            { value: "4.9★", label: "Rating" },
          ].map((s) => (
            <div key={s.label} className="bg-surface-container-low rounded-xl p-3 text-center">
              <p className="font-heading text-lg font-bold text-gold">{s.value}</p>
              <p className="text-on-surface-variant text-[9px] uppercase tracking-widest mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ THE PROBLEM ═══ */}
      <section className="px-6 py-10">
        <p className="text-gold text-[10px] uppercase tracking-widest mb-3">The Real Problem</p>
        <h2 className="font-heading text-2xl font-bold leading-tight">
          Dating apps failed you. Matchmakers failed you. <span className="text-gold">Here&apos;s why.</span>
        </h2>
        <p className="text-on-surface-variant text-sm mt-4 leading-relaxed">
          Every service you&apos;ve used operates on top of the same broken foundation.
        </p>
        <div className="space-y-3 mt-6">
          {[
            { icon: "smartphone", title: "Dating Apps", text: "10+ hrs/week swiping. Matches below your level. Zero quality dates." },
            { icon: "camera_alt", title: "Photographers", text: "Better lighting. Same dates. Women don\u2019t date men for good photos \u2014 they date men with good personal brands." },
            { icon: "handshake", title: "Matchmakers", text: "$5\u201325K for blind dates. Preferences ignored. Non-refundable." },
            { icon: "school", title: "Coaches", text: "Learned frameworks. Still doing all the work yourself." },
          ].map((c) => (
            <div key={c.title} className="bg-surface-container-low p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="material-symbols-outlined text-gold text-lg" style={I}>{c.icon}</span>
                <h3 className="font-heading text-sm font-semibold">{c.title}</h3>
              </div>
              <p className="text-on-surface-variant text-xs leading-relaxed">{c.text}</p>
            </div>
          ))}
        </div>
      </section>

      <CTA />

      {/* ═══ ATTRACTION FIRST ═══ */}
      <section className="px-6 py-10 text-center">
        <h2 className="font-heading text-2xl font-bold leading-tight">
          Attraction comes first. <span className="text-gold">Everything else comes second.</span>
        </h2>
        <p className="text-on-surface-variant text-sm mt-4 leading-relaxed">
          A beautiful woman walks into a room and you don&apos;t need a questionnaire to know you&apos;re interested. Women vet you the same way &mdash; visually, instantly.
        </p>
        <p className="text-on-surface text-sm mt-3 leading-relaxed font-medium">
          If your digital identity doesn&apos;t match who you actually are, nothing else works. We fix that first.
        </p>
      </section>

      {/* ═══ INDUSTRY FAILURES ═══ */}
      <section className="px-6 py-10 bg-surface-container-lowest">
        <p className="text-gold text-[10px] uppercase tracking-widest mb-3">You Deserve Better</p>
        <h2 className="font-heading text-xl font-bold leading-tight">
          What &ldquo;premium&rdquo; services <span className="text-gold">actually do to you.</span>
        </h2>
        <div className="space-y-3 mt-6">
          {[
            { title: "Blind Dates Only", text: "No photos. No names. Cold-called strangers filling seats." },
            { title: "Preferences Ignored", text: "$60M+ in settlements. Quotas over compatibility." },
            { title: "Pay When You Say No", text: "Declined matches still count. Non-refundable." },
            { title: "Zero Transparency", text: "No dashboard. No metrics. Your preferences filed away." },
            { title: "No Identity Rebuild", text: "Nobody fixes how you show up. You still attract below your level." },
          ].map((c) => (
            <div key={c.title} className="bg-surface-container-low p-4 rounded-xl">
              <h3 className="font-heading text-sm font-semibold text-on-surface">{c.title}</h3>
              <p className="text-on-surface-variant text-xs leading-relaxed mt-1">{c.text}</p>
            </div>
          ))}
        </div>
      </section>

      <CTA />

      {/* ═══ AMPLIFY ═══ */}
      <section className="px-6 py-10 text-center">
        <h2 className="font-heading text-2xl font-bold">What does another year of this look like?</h2>
        <p className="text-on-surface-variant text-sm mt-4">Your friends are getting engaged. You&apos;re still swiping.</p>
        <p className="text-on-surface-variant text-sm mt-2">Another year. Same apps. Same results.</p>
        <div className="border-l-2 border-gold pl-4 mt-6 text-left">
          <p className="text-gold font-heading text-sm italic">&ldquo;The risk isn&apos;t trying something new. The risk is doing the same thing for another year.&rdquo;</p>
        </div>
      </section>

      <CTA />

      {/* ═══ THE NEW CATEGORY ═══ */}
      <section className="px-6 py-10">
        <p className="text-gold text-[10px] uppercase tracking-widest mb-3">A New Category</p>
        <h2 className="font-heading text-2xl font-bold leading-tight">
          Not apps. Not matchmakers. <span className="text-gold">Private Dating Concierge.</span>
        </h2>
        <div className="space-y-3 mt-6">
          {[
            { num: "01", title: "We Rebuild Your Digital Identity", text: "How you show up online finally matches real life." },
            { num: "02", title: "We Manage Your Dating Life Daily", text: "Your dedicated manager runs all your apps. Every day." },
            { num: "03", title: "Every Date Vetted to Your Preferences", text: "Attraction, body type, ethnicity, age \u2014 non-negotiable." },
            { num: "04", title: "Total Transparency", text: "Dashboard 24/7. Daily swipes, weekly matches, monthly stats." },
          ].map((s) => (
            <div key={s.num} className="bg-surface-container-low p-4 rounded-xl flex gap-3">
              <span className="font-heading text-lg font-bold text-gold/30 shrink-0">{s.num}</span>
              <div>
                <h3 className="font-heading text-sm font-semibold">{s.title}</h3>
                <p className="text-on-surface-variant text-xs leading-relaxed mt-1">{s.text}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-gold font-heading text-sm mt-6 font-semibold">Your only job: approve dates and show up.</p>
      </section>

      <CTA />

      {/* ═══ BEFORE / AFTER ═══ */}
      <section className="px-6 py-8 bg-surface-container-lowest">
        <div className="space-y-3">
          <div className="bg-surface-container-low p-4 rounded-xl border-l-2 border-red-400/30">
            <p className="text-red-400/60 text-[9px] uppercase tracking-widest font-bold mb-2">Without us</p>
            <p className="text-on-surface-variant text-xs leading-relaxed">2 hours swiping. Matches below your level. Quality dates: zero.</p>
          </div>
          <div className="bg-surface-container-low p-4 rounded-xl border-l-2 border-gold">
            <p className="text-gold text-[9px] uppercase tracking-widest font-bold mb-2">With us</p>
            <p className="text-on-surface-variant text-xs leading-relaxed">Phone buzzes. Jessica, 28. Thursday 7:30. Copy. Send. Done.</p>
            <p className="text-gold font-medium text-xs mt-1">15 seconds. Quality date booked.</p>
          </div>
        </div>
      </section>

      {/* ═══ TIMELINE ═══ */}
      <section className="px-6 py-10">
        <h2 className="font-heading text-xl font-bold">Signup to first date: <span className="text-gold">2&ndash;3 weeks.</span></h2>
        <div className="grid grid-cols-3 gap-2 mt-6">
          {[
            { time: "Day 0", title: "Call" },
            { time: "Day 2\u20137", title: "Rebuild" },
            { time: "Week 2\u20133", title: "First Date", highlight: true },
          ].map((s) => (
            <div key={s.time} className={`p-3 rounded-xl text-center ${s.highlight ? "bg-gold/10 border border-gold/20" : "bg-surface-container-low"}`}>
              <p className="text-gold text-[9px] uppercase tracking-widest">{s.time}</p>
              <p className={`font-heading text-xs font-semibold mt-1 ${s.highlight ? "text-gold" : "text-on-surface"}`}>{s.title}</p>
            </div>
          ))}
        </div>
      </section>

      <CTA />

      {/* ═══ COSTS ═══ */}
      <section className="px-6 py-10 bg-surface-container-lowest">
        <h2 className="font-heading text-xl font-bold">What you&apos;re already paying.</h2>
        <div className="grid grid-cols-2 gap-2 mt-6">
          {[
            { label: "Apps", cost: "$5\u201310K/yr" },
            { label: "Time", cost: "$25K+/yr" },
            { label: "Nightlife", cost: "$5K/qtr" },
            { label: "Matchmakers", cost: "$10\u201325K/qtr" },
          ].map((c) => (
            <div key={c.label} className="bg-surface-container-low p-3 rounded-xl text-center">
              <p className="font-heading text-base font-bold text-gold">{c.cost}</p>
              <p className="text-on-surface-variant text-[9px] uppercase tracking-widest mt-0.5">{c.label}</p>
            </div>
          ))}
        </div>
        <div className="bg-gold/10 border border-gold/20 rounded-xl p-4 mt-4 text-center">
          <p className="text-on-surface-variant text-xs">Annual cost of the status quo</p>
          <p className="text-gold font-heading text-2xl font-bold mt-1">$25K&ndash;$50K+</p>
          <p className="text-on-surface-variant text-xs mt-1">And still no quality dates.</p>
        </div>
        <p className="text-on-surface-variant text-xs text-center mt-4 leading-relaxed">
          A wedding photographer: $15,000. A divorce: $500,000+. Not to mention your mental peace. <span className="text-gold italic">Isn&apos;t it worth investing to meet the right women in the first place?</span>
        </p>
      </section>

      <CTA />

      {/* ═══ RISK REVERSAL ═══ */}
      <section className="px-6 py-10">
        <h2 className="font-heading text-xl font-bold">Your protection.</h2>
        <div className="space-y-3 mt-6">
          {[
            { icon: "event_available", title: "Month-to-Month", text: "Cancel anytime. No contract." },
            { icon: "rocket_launch", title: "First Date: 2\u20133 Weeks", text: "Not months. Weeks." },
            { icon: "visibility", title: "24/7 KPI Dashboard", text: "Every number visible." },
            { icon: "inventory_2", title: "Keep Everything", text: "Cancel and keep all rebuilt assets." },
            { icon: "chat", title: "24/7 WhatsApp", text: "Direct line to your manager." },
          ].map((r) => (
            <div key={r.title} className="bg-surface-container-low p-4 rounded-xl flex items-start gap-3">
              <span className="material-symbols-outlined text-gold text-lg shrink-0 mt-0.5" style={I}>{r.icon}</span>
              <div>
                <h3 className="font-heading text-sm font-semibold">{r.title}</h3>
                <p className="text-on-surface-variant text-xs">{r.text}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-gold/10 border border-gold/20 rounded-xl p-4 mt-4 text-center">
          <p className="font-heading text-3xl font-bold text-gold">4&ndash;8</p>
          <p className="text-gold text-[9px] uppercase tracking-widest mt-1 font-bold">Dates Per Month</p>
        </div>
      </section>

      <CTA />

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="px-6 py-10 bg-surface-container-lowest">
        <h2 className="font-heading text-xl font-bold text-center">Client Results</h2>
        <div className="space-y-3 mt-6">
          {[
            { name: "TJ", role: "Sales Manager", before: "Bad matches", after: "4\u20135 quality dates/week" },
            { name: "Bhavesh", role: "Engineer", before: "Post-divorce", after: "2\u20135 dates/week in 30 days" },
            { name: "Mike B.", role: "Blockchain", before: "3\u20135 likes/week", after: "120+ likes, unlimited dates" },
            { name: "Ryan", role: "Engineer", before: "Few bad likes", after: "10\u201320 matches/week/app" },
            { name: "Tri", role: "Finance", before: "3 likes in 6 months", after: "10 likes/day/app" },
            { name: "AJ", role: "Computer Sci", before: "Zero matches", after: "Unlimited dates in 30 days" },
          ].map((t, i) => (
            <div key={i} className="bg-surface-container-low p-4 rounded-xl">
              <div className="flex gap-1 mb-2">{Array.from({ length: 5 }).map((_, j) => <span key={j} className="material-symbols-outlined text-gold text-xs" style={IF}>star</span>)}</div>
              <p className="text-red-400/60 text-[10px]"><span className="uppercase tracking-widest">Before:</span> {t.before}</p>
              <p className="text-gold text-[10px] font-medium mt-0.5"><span className="uppercase tracking-widest">After:</span> {t.after}</p>
              <p className="text-on-surface font-heading text-xs font-semibold mt-2">{t.name} <span className="text-on-surface-variant font-normal">&middot; {t.role}</span></p>
            </div>
          ))}
        </div>
      </section>

      <CTA />

      {/* ═══ FAQ ═══ */}
      <section className="px-6 py-10">
        <h2 className="font-heading text-xl font-bold text-center">FAQ</h2>
        <div className="mt-6 space-y-2">
          {[
            { q: "How is this different from a matchmaker?", a: "We rebuild your digital identity first, then run your apps daily with full transparency. Month-to-month." },
            { q: "What apps do you manage?", a: "Hinge, Bumble, Tinder, Raya, The League, and others." },
            { q: "How fast will I see dates?", a: "First date notification within 2\u20133 weeks." },
            { q: "What if matches aren\u2019t my type?", a: "4-layer preference filter. Your manager learns your taste. Quality improves weekly." },
            { q: "Can I cancel anytime?", a: "Yes. Month-to-month. Keep all rebuilt assets." },
            { q: "What cities?", a: "NYC, LA, SF, Chicago, Miami. Expanding quarterly." },
            { q: "Is this just for men?", a: "Yes. Built exclusively for high-performing men." },
          ].map((item, i) => (
            <div key={i} className="bg-surface-container-low rounded-xl overflow-hidden">
              <button onClick={() => setFaqOpen(faqOpen === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left">
                <span className="text-on-surface font-medium text-xs pr-3">{item.q}</span>
                <span className={`material-symbols-outlined text-gold text-base shrink-0 transition-transform ${faqOpen === i ? "rotate-180" : ""}`}>expand_more</span>
              </button>
              <div className={`grid transition-all duration-300 ${faqOpen === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                <div className="overflow-hidden"><p className="px-4 pb-4 text-on-surface-variant text-xs leading-relaxed">{item.a}</p></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="px-6 py-10 bg-surface-container-lowest text-center">
        <h2 className="font-heading text-xl font-bold">Next Steps</h2>
        <div className="flex justify-center gap-4 mt-6">
          {[
            { time: "Today", title: "Apply" },
            { time: "Wk 1\u20132", title: "Rebuild" },
            { time: "Wk 2\u20133", title: "1st Date", highlight: true },
          ].map((s) => (
            <div key={s.time} className="text-center">
              <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${s.highlight ? "bg-gold" : "bg-surface-container-low"}`}>
                <span className={`material-symbols-outlined text-base ${s.highlight ? "text-on-gold" : "text-gold"}`} style={s.highlight ? IF : I}>{s.highlight ? "notifications_active" : s.time === "Today" ? "bolt" : "public"}</span>
              </div>
              <p className="text-gold text-[9px] uppercase tracking-widest mt-2">{s.time}</p>
              <p className={`font-heading text-xs font-semibold ${s.highlight ? "text-gold" : "text-on-surface"}`}>{s.title}</p>
            </div>
          ))}
        </div>
      </section>

      <CTA />

      {/* ═══ FOOTER ═══ */}
      <footer className="px-6 py-8 text-center">
        <img src="/logo.png" alt="PDC" className="h-4 w-auto mx-auto opacity-30" />
        <p className="text-outline text-[10px] mt-3">&copy; {new Date().getFullYear()} Private Dating Concierge</p>
      </footer>

      {/* Spacer for sticky CTA */}
      <div className="h-16" />

      {/* ═══ STICKY BOTTOM CTA ═══ */}
      <div className="fixed bottom-0 inset-x-0 z-40 glass-panel border-t border-outline-variant/10 safe-area-pb px-4 py-3">
        <Link href="/apply" className="block gold-gradient text-on-gold font-semibold rounded-full py-3 text-sm text-center">
          Start Your Application
        </Link>
      </div>
    </div>
  );
}
