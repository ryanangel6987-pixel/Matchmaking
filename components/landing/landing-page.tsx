"use client";

import Link from "next/link";
import { useState } from "react";

const ICON_STYLE = { fontVariationSettings: "'FILL' 0, 'wght' 300" };
const ICON_FILLED = { fontVariationSettings: "'FILL' 1, 'wght' 400" };

export function LandingPage() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-surface text-on-surface">

      {/* ═══ NAV ═══════════════════════════════════════════════════════════ */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Private Dating Concierge" className="h-6 w-auto" />
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-on-surface-variant">
            <a href="#how-it-works" className="hover:text-gold transition-colors">How It Works</a>
            <a href="#services" className="hover:text-gold transition-colors">Services</a>
            <a href="#results" className="hover:text-gold transition-colors">Results</a>
            <a href="#pricing" className="hover:text-gold transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-gold transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-on-surface-variant text-sm hover:text-gold transition-colors hidden sm:block">
              Sign In
            </Link>
            <Link href="/apply" className="gold-gradient text-on-gold font-semibold rounded-full px-5 py-2 text-sm hover:opacity-90 transition-opacity">
              Apply Now
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══ HERO ══════════════════════════════════════════════════════════ */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[120px]" />

        <div className="max-w-4xl mx-auto px-6 text-center relative">
          <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-full px-4 py-1.5 mb-8">
            <span className="material-symbols-outlined text-gold text-sm" style={ICON_FILLED}>star</span>
            <span className="text-gold text-xs font-medium uppercase tracking-widest">By Invitation Only</span>
          </div>

          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold text-on-surface leading-tight tracking-tight">
            Your Dating Life,{" "}
            <span className="text-gold">Professionally Managed</span>
          </h1>

          <p className="text-on-surface-variant text-lg md:text-xl max-w-2xl mx-auto mt-6 leading-relaxed">
            A dedicated matchmaker builds and manages your dating profiles, sources high-quality matches, and coordinates every date — so you just show up.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <Link href="/apply" className="gold-gradient text-on-gold font-semibold rounded-full px-8 py-4 text-base hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-xl" style={ICON_STYLE}>arrow_forward</span>
              Start Your Application
            </Link>
            <a href="#how-it-works" className="border border-outline-variant/20 text-on-surface-variant font-medium rounded-full px-8 py-4 text-base hover:border-gold/40 hover:text-gold transition-all flex items-center justify-center gap-2">
              See How It Works
            </a>
          </div>

          <div className="flex items-center justify-center gap-8 mt-12 text-on-surface-variant text-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-gold text-lg" style={ICON_FILLED}>verified</span>
              Vetted Clients Only
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-gold text-lg" style={ICON_FILLED}>lock</span>
              100% Confidential
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-gold text-lg" style={ICON_FILLED}>handshake</span>
              White-Glove Service
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SOCIAL PROOF BAR ══════════════════════════════════════════════ */}
      <section className="border-y border-outline-variant/10 py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="font-heading text-3xl font-bold text-gold">500+</p>
              <p className="text-on-surface-variant text-sm mt-1">Dates Arranged</p>
            </div>
            <div>
              <p className="font-heading text-3xl font-bold text-gold">89%</p>
              <p className="text-on-surface-variant text-sm mt-1">Second Date Rate</p>
            </div>
            <div>
              <p className="font-heading text-3xl font-bold text-gold">7 Days</p>
              <p className="text-on-surface-variant text-sm mt-1">Avg. First Date</p>
            </div>
            <div>
              <p className="font-heading text-3xl font-bold text-gold">4.9★</p>
              <p className="text-on-surface-variant text-sm mt-1">Client Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PROBLEM / SOLUTION ════════════════════════════════════════════ */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-on-surface">
                Dating apps weren&apos;t designed for{" "}
                <span className="text-gold">high-performing men</span>
              </h2>
              <div className="space-y-4">
                {[
                  { icon: "schedule", text: "You don't have 2 hours a day to swipe" },
                  { icon: "photo_camera", text: "Your photos don't reflect who you actually are" },
                  { icon: "chat_bubble", text: "Opening messages feel like a part-time job" },
                  { icon: "trending_down", text: "Match quality doesn't match your standards" },
                ].map((item) => (
                  <div key={item.text} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-error-red text-xl mt-0.5" style={ICON_STYLE}>{item.icon}</span>
                    <p className="text-on-surface-variant text-base leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-on-surface">
                We handle{" "}
                <span className="text-gold">everything</span>
              </h2>
              <div className="space-y-4">
                {[
                  { icon: "auto_fix_high", text: "Professional photos curated or created for you" },
                  { icon: "person_search", text: "A dedicated matchmaker managing your profiles daily" },
                  { icon: "chat", text: "Conversations handled until the date is locked in" },
                  { icon: "calendar_today", text: "Venue booked, time set — you just show up" },
                ].map((item) => (
                  <div key={item.text} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-gold text-xl mt-0.5" style={ICON_FILLED}>{item.icon}</span>
                    <p className="text-on-surface text-base leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ══════════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-20 md:py-28 bg-surface-container-lowest">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-gold text-xs uppercase tracking-widest mb-3">The Process</p>
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-on-surface">
              How It Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "1", icon: "assignment", title: "Onboard", desc: "Complete your profile — preferences, lifestyle, deal-breakers. Tell us exactly what you're looking for." },
              { step: "2", icon: "auto_fix_high", title: "We Build", desc: "Your matchmaker creates optimized profiles with professional photos across your chosen dating apps." },
              { step: "3", icon: "favorite", title: "We Match", desc: "Daily swiping, conversations, and date coordination — all managed by your dedicated matchmaker." },
              { step: "4", icon: "restaurant", title: "You Date", desc: "Review matches, approve dates, and show up. Venue booked, opening text provided, reservation confirmed." },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="bg-surface-container-low p-8 rounded-2xl h-full space-y-4 relative overflow-hidden group hover:bg-surface-container-high transition-colors duration-300">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gold/30 group-hover:bg-gold transition-colors duration-500" />
                  <span className="text-gold font-heading font-bold text-4xl opacity-20 absolute top-4 right-6">{item.step}</span>
                  <span className="material-symbols-outlined text-gold text-3xl block" style={ICON_STYLE}>{item.icon}</span>
                  <h3 className="font-heading text-lg font-bold text-on-surface">{item.title}</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SERVICES / WHAT'S INCLUDED ═══════════════════════════════════ */}
      <section id="services" className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-gold text-xs uppercase tracking-widest mb-3">Full Service</p>
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-on-surface">
              What&apos;s Included
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: "photo_library", title: "Profile Creation", items: ["Professional photo curation & creation", "Bio writing optimized per app", "Profile setup on 1-3 apps", "Ongoing photo rotation & testing"] },
              { icon: "swipe_right", title: "Daily Management", items: ["Daily swiping by your matchmaker", "Conversation management until date locked", "Match quality filtering against your preferences", "Real-time KPI dashboard access"] },
              { icon: "event_available", title: "Date Coordination", items: ["Venue selection & reservation", "Day/time coordination", "Opening text suggestions", "Post-date feedback & preference refinement"] },
              { icon: "tune", title: "Preference Calibration", items: ["Detailed preference profiling", "Visual type references (Tinder-style)", "Deal-breaker flagging system", "Continuous targeting optimization"] },
              { icon: "shield", title: "Account Security", items: ["Credential vault (encrypted)", "Account health monitoring", "Ban detection & prevention", "Fresh profile creation if needed"] },
              { icon: "support_agent", title: "Dedicated Matchmaker", items: ["5-day work week coverage", "WhatsApp direct line", "Weekly strategy reviews", "Availability calendar sync"] },
            ].map((service) => (
              <div key={service.title} className="bg-surface-container-low p-6 rounded-2xl space-y-4 group hover:bg-surface-container-high transition-colors duration-300">
                <span className="material-symbols-outlined text-gold text-2xl" style={ICON_STYLE}>{service.icon}</span>
                <h3 className="font-heading text-base font-bold text-on-surface">{service.title}</h3>
                <ul className="space-y-2">
                  {service.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-on-surface-variant text-sm">
                      <span className="material-symbols-outlined text-gold text-sm mt-0.5" style={ICON_FILLED}>check_circle</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ RESULTS / TRANSPARENCY ═══════════════════════════════════════ */}
      <section id="results" className="py-20 md:py-28 bg-surface-container-lowest">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-gold text-xs uppercase tracking-widest mb-3">Full Transparency</p>
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-on-surface">
              Your Personal Dashboard
            </h2>
            <p className="text-on-surface-variant text-lg max-w-2xl mx-auto mt-4">
              Real-time visibility into every metric. See exactly what your matchmaker is doing, how your profiles perform, and approve every date before it happens.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-surface-container-low p-8 rounded-2xl space-y-6">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-gold text-2xl" style={ICON_STYLE}>bar_chart</span>
                <h3 className="font-heading text-lg font-bold text-on-surface">KPI Dashboard</h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Swipes", value: "2,847" },
                  { label: "Matches", value: "234" },
                  { label: "Conversations", value: "89" },
                  { label: "Dates Closed", value: "12" },
                  { label: "Dates Approved", value: "10" },
                  { label: "Match Rate", value: "8.2%" },
                ].map((kpi) => (
                  <div key={kpi.label} className="bg-surface-container rounded-xl p-3 text-center">
                    <p className="font-heading text-xl font-bold text-gold">{kpi.value}</p>
                    <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mt-1">{kpi.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface-container-low p-8 rounded-2xl space-y-6">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-gold text-2xl" style={ICON_STYLE}>star</span>
                <h3 className="font-heading text-lg font-bold text-on-surface">Date Approval</h3>
              </div>
              <div className="space-y-4">
                {[
                  { name: "Sarah M.", age: 28, prof: "Marketing Director", status: "approved" },
                  { name: "Jessica L.", age: 26, prof: "Interior Designer", status: "approved" },
                  { name: "Amanda K.", age: 27, prof: "Tech Founder", status: "pending" },
                ].map((date) => (
                  <div key={date.name} className="flex items-center justify-between bg-surface-container rounded-xl p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-gold text-lg" style={ICON_FILLED}>person</span>
                      </div>
                      <div>
                        <p className="text-on-surface text-sm font-medium">{date.name}, {date.age}</p>
                        <p className="text-on-surface-variant text-xs">{date.prof}</p>
                      </div>
                    </div>
                    <span className={`text-[9px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full ${
                      date.status === "approved" ? "bg-gold/15 text-gold border border-gold/30" : "bg-surface-container-high text-on-surface-variant border border-outline-variant/20"
                    }`}>
                      {date.status}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-on-surface-variant text-xs italic">Nothing goes live without your approval.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══════════════════════════════════════════════════════ */}
      <section id="pricing" className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-gold text-xs uppercase tracking-widest mb-3">Investment</p>
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-on-surface">
              Choose Your Plan
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Monthly */}
            <div className="bg-surface-container-low rounded-2xl p-8 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-gold/30" />
              <div>
                <p className="text-on-surface-variant text-xs uppercase tracking-widest">Monthly</p>
                <div className="flex items-end gap-1 mt-2">
                  <span className="font-heading text-4xl font-bold text-on-surface">$997</span>
                  <span className="text-on-surface-variant text-sm mb-1">/month</span>
                </div>
              </div>
              <ul className="space-y-3">
                {[
                  "1 dating app managed",
                  "Fresh profile built & optimized",
                  "Daily swiping & conversations",
                  "Date coordination & venue booking",
                  "KPI dashboard access",
                  "WhatsApp support",
                  "Weekly strategy call",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-on-surface-variant text-sm">
                    <span className="material-symbols-outlined text-gold text-sm mt-0.5" style={ICON_FILLED}>check_circle</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/apply" className="block w-full border border-gold/30 text-gold font-semibold rounded-full py-3 text-center hover:bg-gold/10 transition-colors">
                Get Started
              </Link>
            </div>

            {/* 3-Month */}
            <div className="bg-surface-container-low rounded-2xl p-8 space-y-6 relative overflow-hidden ring-2 ring-gold/30">
              <div className="absolute top-0 left-0 w-1 h-full bg-gold" />
              <div className="absolute top-4 right-4">
                <span className="bg-gold/15 text-gold text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full border border-gold/30">Most Popular</span>
              </div>
              <div>
                <p className="text-on-surface-variant text-xs uppercase tracking-widest">3-Month Commitment</p>
                <div className="flex items-end gap-1 mt-2">
                  <span className="font-heading text-4xl font-bold text-gold">$2,497</span>
                  <span className="text-on-surface-variant text-sm mb-1">/month</span>
                </div>
              </div>
              <ul className="space-y-3">
                {[
                  "2-3 dating apps managed",
                  "Professional photo shoot included",
                  "Fresh profiles built across all apps",
                  "Priority daily management",
                  "Full KPI dashboard + analytics",
                  "WhatsApp 24/7 priority support",
                  "Bi-weekly strategy sessions",
                  "Curated image creation",
                  "Date coaching & post-date review",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-on-surface text-sm">
                    <span className="material-symbols-outlined text-gold text-sm mt-0.5" style={ICON_FILLED}>check_circle</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/apply" className="block w-full gold-gradient text-on-gold font-semibold rounded-full py-3 text-center hover:opacity-90 transition-opacity">
                Apply Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ══════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-surface-container-lowest">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-gold text-xs uppercase tracking-widest mb-3">Client Stories</p>
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-on-surface">
              What Our Clients Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { quote: "I went from zero matches to 3 dates a week. The photos alone were a game-changer — I never would have picked those shots myself.", name: "Alex T.", role: "Finance, 32", city: "New York" },
              { quote: "I literally just show up. They handle the apps, the conversations, the reservations. It's like having a dating assistant who actually knows what they're doing.", name: "Marcus D.", role: "Tech CEO, 38", city: "San Francisco" },
              { quote: "The transparency is what sold me. I can see every swipe, every match, every conversation. And I approve every date before it happens.", name: "James R.", role: "Attorney, 29", city: "Chicago" },
            ].map((testimonial) => (
              <div key={testimonial.name} className="bg-surface-container-low p-6 rounded-2xl space-y-4">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className="material-symbols-outlined text-gold text-lg" style={ICON_FILLED}>star</span>
                  ))}
                </div>
                <p className="text-on-surface text-sm leading-relaxed italic">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="pt-2 border-t border-outline-variant/10">
                  <p className="text-on-surface text-sm font-medium">{testimonial.name}</p>
                  <p className="text-on-surface-variant text-xs">{testimonial.role} — {testimonial.city}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══════════════════════════════════════════════════════════ */}
      <section id="faq" className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-gold text-xs uppercase tracking-widest mb-3">Questions</p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-on-surface">
              Frequently Asked
            </h2>
          </div>

          <div className="space-y-3">
            {[
              { q: "How is this different from a traditional matchmaker?", a: "Traditional matchmakers introduce you to people from their network. We manage your entire dating app presence — profiles, photos, swiping, conversations, and date logistics. You get the scale of dating apps with the quality of a concierge." },
              { q: "Do you access my dating app accounts?", a: "Yes — you provide credentials through our encrypted vault. Your matchmaker logs in daily to manage swiping and conversations on your behalf. You can see everything happening in real-time through your dashboard." },
              { q: "How do I approve dates?", a: "Every potential date is presented to you in the portal with her photos, profile details, and your matchmaker's notes. You approve or decline with one tap. Nothing happens without your sign-off." },
              { q: "What if I'm not getting results?", a: "Your dashboard shows exactly what's happening — swipes, matches, conversations, and conversion rates. If something isn't working, your matchmaker adjusts strategy: new photos, different targeting, bio updates. Full transparency, no black boxes." },
              { q: "Is my information confidential?", a: "Absolutely. All credentials are encrypted. Your profile data is protected by enterprise-grade Row Level Security. Only your assigned matchmaker and admin can access your information." },
              { q: "What apps do you support?", a: "Hinge, Bumble, Tinder, Raya, The League, Luxy, and Seeking Arrangements. We can also set up new accounts if you don't have existing ones." },
              { q: "Can I pause or cancel?", a: "Monthly plans can be cancelled anytime with 30 days notice. 3-month plans are committed for the term but can be paused for up to 2 weeks if needed." },
            ].map((item, i) => (
              <div key={i} className="bg-surface-container-low rounded-2xl overflow-hidden">
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <p className="text-on-surface text-sm font-medium pr-4">{item.q}</p>
                  <span className={`material-symbols-outlined text-gold text-lg shrink-0 transition-transform duration-200 ${faqOpen === i ? "rotate-180" : ""}`}>
                    expand_more
                  </span>
                </button>
                <div className={`grid transition-all duration-300 ease-in-out ${faqOpen === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-on-surface-variant text-sm leading-relaxed">{item.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-surface-container-lowest relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent" />
        <div className="max-w-3xl mx-auto px-6 text-center relative">
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-on-surface">
            Ready to upgrade your{" "}
            <span className="text-gold">dating life</span>?
          </h2>
          <p className="text-on-surface-variant text-lg mt-4 max-w-xl mx-auto">
            Limited spots available. Apply now and your dedicated matchmaker can start within 48 hours.
          </p>
          <Link href="/apply" className="inline-flex items-center gap-2 gold-gradient text-on-gold font-semibold rounded-full px-10 py-4 text-lg mt-8 hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-xl" style={ICON_STYLE}>arrow_forward</span>
            Start Your Application
          </Link>
          <p className="text-on-surface-variant text-xs mt-4">No commitment required. 15-minute intro call to see if we&apos;re a fit.</p>
        </div>
      </section>

      {/* ═══ FOOTER ════════════════════════════════════════════════════════ */}
      <footer className="border-t border-outline-variant/10 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Private Dating Concierge" className="h-5 w-auto opacity-60" />
            </div>
            <div className="flex items-center gap-6 text-on-surface-variant text-xs">
              <Link href="/login" className="hover:text-gold transition-colors">Sign In</Link>
              <a href="#how-it-works" className="hover:text-gold transition-colors">How It Works</a>
              <a href="#pricing" className="hover:text-gold transition-colors">Pricing</a>
              <a href="#faq" className="hover:text-gold transition-colors">FAQ</a>
            </div>
            <p className="text-on-surface-variant/50 text-xs">
              &copy; {new Date().getFullYear()} Private Dating Concierge. Exclusive &amp; Confidential.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
