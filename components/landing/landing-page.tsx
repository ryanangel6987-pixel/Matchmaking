"use client";

import Link from "next/link";
import { useState } from "react";

const I = { fontVariationSettings: "'FILL' 0, 'wght' 300" } as const;
const IF = { fontVariationSettings: "'FILL' 1, 'wght' 400" } as const;

export function LandingPage() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-surface text-on-surface">

      {/* ═══ 1. NAV ═══ */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <img src="/logo.png" alt="Private Dating Concierge" className="h-6 w-auto" />
          <div className="hidden md:flex items-center gap-8 text-sm text-on-surface-variant">
            <a href="#problem" className="hover:text-gold transition-colors">The Problem</a>
            <a href="#solution" className="hover:text-gold transition-colors">How It Works</a>
            <a href="#results" className="hover:text-gold transition-colors">Results</a>
            <a href="#pricing" className="hover:text-gold transition-colors">Investment</a>
            <a href="#faq" className="hover:text-gold transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-on-surface-variant text-sm hover:text-gold transition-colors hidden sm:block">Sign In</Link>
            <Link href="/apply" className="gold-gradient text-on-gold font-semibold rounded-full px-5 py-2 text-sm hover:opacity-90 transition-opacity">Apply Now</Link>
          </div>
        </div>
      </nav>

      {/* ═══ 2. HERO — THE OUTCOME ═══ */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[120px]" />
        <div className="max-w-4xl mx-auto px-6 text-center relative">
          <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-full px-4 py-1.5 mb-8">
            <span className="material-symbols-outlined text-gold text-sm" style={IF}>verified</span>
            <span className="text-gold text-xs font-medium uppercase tracking-widest">Exclusive Management</span>
          </div>
          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
            <span className="text-gold">Private Dating Concierge</span>
          </h1>
          <p className="font-heading text-xl md:text-2xl lg:text-3xl font-semibold text-on-surface mt-4 max-w-3xl mx-auto leading-snug">
            Get 4&ndash;8 Quality Dates a Month On Demand &mdash; Without Apps, Matchmakers, or Swiping.
          </p>
          <p className="text-on-surface-variant text-base md:text-lg mt-6 max-w-2xl mx-auto leading-relaxed">
            Your dating life, managed. A dedicated concierge rebuilds how you show up online, runs your apps daily, and delivers vetted dates to your phone.
          </p>
          <p className="text-gold font-heading text-lg md:text-xl italic mt-4">Copy. Send. Show up.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Link href="/apply" className="gold-gradient text-on-gold font-semibold rounded-full px-8 py-3.5 text-base hover:opacity-90 transition-opacity shadow-lg">
              Start Your Application
            </Link>
            <a href="#problem" className="text-on-surface-variant text-sm hover:text-gold transition-colors flex items-center gap-1.5">
              See How It Works <span className="material-symbols-outlined text-base" style={I}>arrow_downward</span>
            </a>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 text-xs text-on-surface-variant">
            <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-gold text-sm" style={IF}>shield</span> Vetted Clients Only</span>
            <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-gold text-sm" style={IF}>lock</span> 100% Confidential</span>
            <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-gold text-sm" style={IF}>diamond</span> Month-to-Month</span>
          </div>
        </div>
      </section>

      {/* ═══ 3. SOCIAL PROOF ═══ */}
      <section className="border-y border-outline-variant/10 py-8">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "500+", label: "Dates Arranged" },
            { value: "89%", label: "Second Date Rate" },
            { value: "2-3 Wks", label: "To First Date" },
            { value: "4.9★", label: "Client Satisfaction" },
          ].map((s) => (
            <div key={s.label}>
              <p className="font-heading text-2xl md:text-3xl font-bold text-gold">{s.value}</p>
              <p className="text-on-surface-variant text-xs uppercase tracking-widest mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ 4. THE PROBLEM — EVERYTHING YOU'VE TRIED HAS FAILED ═══ */}
      <section id="problem" className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-gold text-xs uppercase tracking-widest mb-4">The Real Problem</p>
          <h2 className="font-heading text-3xl md:text-5xl font-bold leading-tight">
            Dating apps failed you.<br className="hidden md:block" />
            Matchmakers failed you.<br className="hidden md:block" />
            <span className="text-gold">Here&apos;s why nothing has worked.</span>
          </h2>
          <p className="text-on-surface-variant text-base md:text-lg mt-6 max-w-2xl leading-relaxed">
            You&apos;ve tried the apps. Maybe you hired a photographer. Maybe you paid a matchmaker. And you&apos;re still here. The reason nothing worked isn&apos;t effort &mdash; it&apos;s that every service you&apos;ve used operates on top of the same broken foundation.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            {[
              { icon: "smartphone", title: "Dating Apps Failed You", text: "10+ hours a week swiping, messaging, boosting. The algorithm doesn\u2019t know who you are. Your profile doesn\u2019t represent you. The matches don\u2019t match your standards. You\u2019re doing the work of a full-time job for zero results." },
              { icon: "camera_alt", title: "Photographers Failed You", text: "You paid $500\u2013$1,500 for better photos. The lighting is better. But the dates are still the same quality. Women don\u2019t date men for good lighting \u2014 they date men with good personal brands. Your bios, prompts, Instagram, and overall digital identity are still broken." },
              { icon: "handshake", title: "Matchmakers Failed You", text: "You paid $5,000\u2013$25,000 for blind dates with strangers. Your preferences got ignored. Declined matches counted against your contract. Zero transparency into what was happening with your money." },
              { icon: "school", title: "Dating Coaches Failed You", text: "You learned frameworks, conversation tactics, and \u201Cmindset.\u201D But you still have to do all the work yourself. Knowledge doesn\u2019t solve the time problem or the positioning problem." },
            ].map((card) => (
              <div key={card.title} className="bg-surface-container-low p-6 rounded-2xl space-y-3">
                <span className="material-symbols-outlined text-2xl text-gold" style={I}>{card.icon}</span>
                <h3 className="font-heading text-lg font-semibold text-on-surface">{card.title}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">{card.text}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ═══ THE BLIND SPOT — AHA MOMENT ═══ */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-heading text-2xl md:text-4xl lg:text-5xl font-bold leading-tight text-on-surface">
            Attraction comes first.<br className="hidden md:block" />
            <span className="text-gold">Everything else comes second.</span>
          </h2>
          <p className="text-on-surface-variant text-base md:text-lg mt-8 max-w-2xl mx-auto leading-relaxed">
            A beautiful woman walks into a room and you don&apos;t need a questionnaire to know you&apos;re interested. Women vet you the same way &mdash; visually, instantly, based on how you show up.
          </p>
          <p className="text-on-surface-variant text-base md:text-lg mt-4 max-w-2xl mx-auto leading-relaxed">
            If your digital identity doesn&apos;t match who you actually are in real life, no amount of swiping, coaching, or matchmaking will fix it.
          </p>
          <p className="text-on-surface text-base md:text-lg mt-4 max-w-2xl mx-auto leading-relaxed font-medium">
            Every other service skips this step. We don&apos;t. Fix how you show up first &mdash; then we scale the effort, vet every match, and track every metric. All you do is show up. Quality dates weekly with total KPI transparency and full approval.
          </p>
        </div>
      </section>

      {/* ═══ 5. THE INDUSTRY FAILURES — CUSTOMER CARE ═══ */}
      <section className="py-20 md:py-28 bg-surface-container-lowest">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-gold text-xs uppercase tracking-widest mb-4">You Deserve Better</p>
          <h2 className="font-heading text-3xl md:text-5xl font-bold leading-tight">
            What &ldquo;premium&rdquo; services<br className="hidden md:block" />
            <span className="text-gold">are actually doing to you.</span>
          </h2>
          <p className="text-on-surface-variant text-base mt-6 max-w-2xl leading-relaxed">
            Beyond failing to fix the root cause, here&apos;s what the industry is specifically doing wrong &mdash; at your expense.
          </p>
          <div className="space-y-4 mt-12">
            {[
              { icon: "visibility_off", issue: "Blind Dates Only", stat: "No photos. No names. No vetting.", text: "You\u2019re paying $5,000+ to meet a complete stranger. Some services cold-call people from databases to fill the seat \u2014 people who never even signed up.", links: [{ label: "Real client experiences", url: "https://www.sitejabber.com/reviews/tawkify.com" }] },
              { icon: "person_off", issue: "Your Preferences Get Ignored", stat: "$60M+ in class action settlements", text: "You describe exactly what you want. They send whoever\u2019s available. Matches driven by quotas, not compatibility. Physical attraction treated as optional.", links: [{ label: "Class action details", url: "https://topclassactions.com/lawsuit-settlements/lawsuit-news/its-just-lunch-matchmaking-site-settles-class-action-for-60m-in-dates/" }] },
              { icon: "block", issue: "You Pay Even When You Say No", stat: "Declined matches still count", text: "She wasn\u2019t your type? Doesn\u2019t matter. That \u201Cintroduction\u201D still counts. Non-refundable contracts, $2\u20133K per date whether you wanted it or not.", links: [{ label: "Contract terms", url: "https://blog.photofeeler.com/three-day-rule/" }] },
              { icon: "query_stats", issue: "Zero Process Transparency", stat: "No dashboard. No metrics. No proof.", text: "No way to see what\u2019s happening. No KPIs, no weekly updates. Your physical preferences \u2014 attraction, body type, ethnicity \u2014 get filed away and ignored.", links: [{ label: "Client complaints", url: "https://lumasearch.com/blog/its-just-lunch-reviews-2025/" }] },
              { icon: "auto_fix_off", issue: "Zero Digital Identity Rebuilding", stat: "They never fix how you show up.", text: "No service rebuilds your profiles, photos, bios, or Instagram. They swipe for you, introduce you, or coach you \u2014 all on top of the same broken positioning. You don\u2019t match how you are in real life, and nobody fixes that. So you still attract lower quality people than you deserve.", links: [] },
            ].map((comp) => (
              <div key={comp.issue} className="bg-surface-container-low p-5 rounded-2xl flex items-start gap-4">
                <span className="material-symbols-outlined text-xl text-gold shrink-0 mt-1" style={I}>{comp.icon}</span>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                    <h3 className="font-heading text-base font-semibold text-on-surface">{comp.issue}</h3>
                    <span className="text-gold text-xs font-heading">{comp.stat}</span>
                  </div>
                  <p className="text-on-surface-variant text-sm leading-relaxed mt-1">{comp.text}</p>
                  {comp.links.length > 0 && <div className="flex gap-3 mt-2">
                    {comp.links.map((l) => <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="text-gold/50 text-[10px] uppercase tracking-widest hover:text-gold transition-colors flex items-center gap-1"><span className="material-symbols-outlined text-xs">open_in_new</span>{l.label}</a>)}
                  </div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ AMPLIFY — EMOTIONAL COST OF INACTION ═══ */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-heading text-2xl md:text-4xl font-bold leading-tight text-on-surface">
            What does another year of this look like?
          </h2>
          <div className="mt-8 space-y-4 text-on-surface-variant text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            <p>Your friends are getting engaged. You&apos;re still swiping.</p>
            <p>Every month you wait, the pool gets smaller. The algorithm works against you harder. The gap between who you are and how you show up online gets wider.</p>
            <p>Another year. Same apps. Same results. Same empty apartment on a Sunday night wondering why nothing changes.</p>
          </div>
          <div className="border-l-2 border-gold pl-6 mt-10 max-w-lg mx-auto text-left">
            <p className="font-heading text-lg text-gold italic">&ldquo;The risk isn&apos;t trying something new. The risk is doing the same thing for another year.&rdquo;</p>
          </div>
        </div>
      </section>

      {/* ═══ 6. THE NEW CATEGORY ═══ */}
      <section id="solution" className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-gold text-xs uppercase tracking-widest mb-4">A New Category</p>
          <h2 className="font-heading text-3xl md:text-5xl font-bold leading-tight">
            Not apps. Not matchmakers. Not coaching.<br className="hidden md:block" />
            <span className="text-gold">Private Dating Concierge.</span>
          </h2>
          <p className="text-on-surface-variant text-base md:text-lg mt-6 max-w-2xl leading-relaxed">
            We built a brand new service specifically for high-performing men. Here&apos;s what it is and how it works.
          </p>

          <div className="space-y-4 mt-12">
            {[
              { num: "01", icon: "auto_fix_high", title: "We Rebuild Your Digital Identity", text: "How you show up online finally matches real life. Profiles, photos, bios, Instagram \u2014 reconstructed so the women you deserve actually engage." },
              { num: "02", icon: "support_agent", title: "We Manage Your Dating Life Daily", text: "Your own dedicated manager runs all your apps every day. Swiping, messaging, closing dates \u2014 handled. One person who knows your type, your schedule, your standards." },
              { num: "03", icon: "tune", title: "Every Date Vetted to Your Exact Preferences", text: "Attraction, body type, ethnicity, age, lifestyle \u2014 non-negotiable. Your manager can\u2019t violate your preferences. You get full approval on every date." },
              { num: "04", icon: "bar_chart", title: "Total Transparency and Reporting", text: "Your dashboard shows everything \u2014 daily swipes, weekly matches, monthly stats. You see what\u2019s working, what\u2019s not, and exactly what your manager is doing. 24/7." },
            ].map((item) => (
              <div key={item.num} className="bg-surface-container-low p-5 rounded-2xl flex items-start gap-4">
                <span className="font-heading text-2xl font-bold text-gold/30 shrink-0 w-8">{item.num}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-gold" style={I}>{item.icon}</span>
                    <h3 className="font-heading text-base font-semibold text-on-surface">{item.title}</h3>
                  </div>
                  <p className="text-on-surface-variant text-sm leading-relaxed mt-1.5">{item.text}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-gold font-heading text-lg mt-10 font-semibold">Your only job: approve dates and show up.</p>
        </div>
      </section>

      {/* ═══ BEFORE / AFTER — TIGHT ═══ */}
      <section className="py-16 md:py-20 bg-surface-container-lowest">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface-container-low p-5 rounded-2xl border-l-2 border-red-400/30">
              <p className="text-red-400/60 text-[10px] uppercase tracking-widest font-bold mb-3">Without us</p>
              <p className="text-on-surface-variant text-sm leading-relaxed">2 hours swiping. Matches below your level. Conversations that die. Quality dates: zero.</p>
            </div>
            <div className="bg-surface-container-low p-5 rounded-2xl border-l-2 border-gold">
              <p className="text-gold text-[10px] uppercase tracking-widest font-bold mb-3">With us</p>
              <p className="text-on-surface-variant text-sm leading-relaxed">Phone buzzes. Jessica, 28. Marketing Director. Thursday 7:30. Copy. Send. Done.</p>
              <p className="text-gold font-medium text-sm mt-2">15 seconds. Quality date booked.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 8. HOW IT WORKS — 3-STEP SYSTEM ═══ */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-gold text-xs uppercase tracking-widest mb-4">The Process</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {[
              { num: "01", title: "Digital Identity\nRebuild", icon: "fingerprint", text: "We reconstruct your entire digital presence \u2014 profiles, photos, bios, and Instagram \u2014 ensuring every touchpoint reflects who you actually are." },
              { num: "02", title: "Preference\nFiltering", icon: "filter_list", text: "4-layer qualification matched to your standards:", bullets: ["Physical attractiveness (reference matched)", "Hard preferences (age, lifestyle, dealbreakers)", "Conversation quality (red flags, effort)", "Date readiness (interest confirmed)"] },
              { num: "03", title: "Date\nDelivery", icon: "send", text: "Your dedicated manager runs your accounts daily using proven playbooks. You receive one concise notification per date." },
            ].map((step) => (
              <div key={step.num} className="bg-surface-container-low p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="material-symbols-outlined text-2xl text-gold" style={I}>{step.icon}</span>
                  <span className="font-heading text-3xl font-bold text-outline/30">{step.num}</span>
                </div>
                <h3 className="font-heading text-xl font-semibold text-on-surface whitespace-pre-line">{step.title}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">{step.text}</p>
                {step.bullets && <ul className="space-y-1.5 mt-2">{step.bullets.map((b) => <li key={b} className="text-on-surface-variant text-xs flex items-start gap-2"><span className="material-symbols-outlined text-gold text-xs mt-0.5" style={IF}>check</span>{b}</li>)}</ul>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 9. YOUR TIMELINE ═══ */}
      <section className="py-20 md:py-28 bg-surface-container-lowest">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-gold text-xs uppercase tracking-widest mb-4">Speed</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold">From signup to first date in 2&ndash;3 weeks.</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-12">
            {[
              { time: "Day 0", icon: "call", title: "Onboarding Call", text: "60-min deep dive: your type, dealbreakers, schedule." },
              { time: "Day 1\u20132", icon: "photo_library", title: "Photo & Content", text: "We select, enhance, and optimize your best photos." },
              { time: "Day 2\u20137", icon: "auto_fix_high", title: "Identity Rebuild", text: "Profiles, bios, prompts reconstructed." },
              { time: "Day 7", icon: "person", title: "Manager Assigned", text: "Dedicated manager briefed on your profile." },
              { time: "Day 7\u201314", icon: "tune", title: "Calibration", text: "Daily swiping + messaging. Manager learns your taste." },
              { time: "Week 2\u20133", icon: "notifications_active", title: "First Date", text: "Name, detail, day, number, pre-written text.", highlight: true },
            ].map((step) => (
              <div key={step.time} className={`p-4 rounded-2xl text-center space-y-2 ${step.highlight ? "bg-gold/10 border border-gold/20" : "bg-surface-container-low"}`}>
                <p className="text-gold text-xs uppercase tracking-widest">{step.time}</p>
                <span className={`material-symbols-outlined text-2xl ${step.highlight ? "text-gold" : "text-on-surface-variant"}`} style={I}>{step.icon}</span>
                <h3 className={`font-heading text-sm font-semibold ${step.highlight ? "text-gold" : "text-on-surface"}`}>{step.title}</h3>
                <p className="text-on-surface-variant text-xs leading-relaxed">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 10. WHAT YOU'RE ALREADY PAYING ═══ */}
      <section id="pricing" className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-center">What you&apos;re already paying.</h2>
          <p className="text-on-surface-variant text-sm text-center mt-3 max-w-lg mx-auto">The status quo isn&apos;t free. Here&apos;s what doing nothing actually costs you every year.</p>

          <div className="space-y-4 mt-12">
            {[
              { label: "Dating Apps", cost: "$5,000\u2013$10,000 / year", text: "Hinge Premium, Bumble Boost, Tinder Gold, Super Likes, paid boosts. $40\u2013$80/month across 3\u20134 apps adds up fast \u2014 for a system that monetizes your frustration, not your results." },
              { label: "Your Time", cost: "$25,000+ / year", text: "5\u201310 hours per week swiping, messaging, planning. At $100\u2013$300/hour, that\u2019s $2,000\u2013$12,000/month of executive time spent on something that isn\u2019t working." },
              { label: "Nightlife & Social", cost: "$5,000+ / quarter", text: "$200\u2013$400 per weekend on drinks, venues, and logistics. No filtering, no vetting, no system. Purely hope-based with zero guarantee of quality." },
              { label: "Matchmakers & Coaches", cost: "$10,000\u2013$25,000 / quarter", text: "One blind date per month. Your preferences ignored. Declined matches still count against your contract. Non-refundable. Zero transparency into what they\u2019re actually doing." },
            ].map((c) => (
              <div key={c.label} className="bg-surface-container-low p-5 rounded-2xl flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-6">
                <div className="sm:w-56 shrink-0">
                  <p className="text-on-surface font-heading font-semibold text-sm">{c.label}</p>
                  <p className="text-gold font-heading text-lg font-bold">{c.cost}</p>
                </div>
                <p className="text-on-surface-variant text-sm leading-relaxed flex-1">{c.text}</p>
              </div>
            ))}
          </div>

          <div className="bg-gold/10 border border-gold/20 rounded-2xl p-6 mt-8 text-center">
            <p className="text-on-surface-variant text-sm">Combined annual cost of the current approach</p>
            <p className="text-gold font-heading text-4xl md:text-5xl font-bold mt-2">$25K&ndash;$50K+</p>
            <p className="text-on-surface-variant text-sm mt-2">And you&apos;re still not getting quality dates.</p>
          </div>

          <div className="bg-surface-container-low rounded-2xl p-6 mt-6 text-center space-y-4">
            <p className="text-on-surface-variant text-sm leading-relaxed max-w-2xl mx-auto">
              And that&apos;s not even the real cost. A wedding photographer is <span className="text-on-surface font-medium">$15,000 for one day</span>. A divorce is <span className="text-on-surface font-medium">$500,000+ conservatively</span>. Not to mention the cost to your mental peace and emotional wellbeing if you get this wrong. Your partner is the most important decision of your life.
            </p>
            <p className="font-heading text-lg md:text-xl text-gold italic">
              Isn&apos;t it worth investing a little to meet the right quality women in the first place?
            </p>
          </div>

          <div className="text-center mt-8">
            <Link href="/apply" className="gold-gradient text-on-gold font-semibold rounded-full px-8 py-3.5 text-base hover:opacity-90 transition-opacity shadow-lg inline-block">
              Start Your Application
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ 12. RISK REVERSAL ═══ */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-gold text-xs uppercase tracking-widest mb-4">Built for Confidence</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold">Your protection.</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {[
              { icon: "event_available", title: "Month-to-Month", text: "No long-term contracts. Walk anytime. We earn your business every 30 days." },
              { icon: "rocket_launch", title: "First Intro in 2\u20133 Weeks", text: "Rapid onboarding. Immediate execution. You\u2019re not waiting months." },
              { icon: "visibility", title: "24/7 KPI Dashboard", text: "Daily KPI dashboard. Every number visible. No black box." },
              { icon: "inventory_2", title: "You Keep Everything", text: "Cancel and keep all rebuilt assets \u2014 profiles, photos, bios. Yours forever." },
              { icon: "chat", title: "24/7 WhatsApp Access", text: "Direct line to your dedicated manager. Not a call center." },
            ].map((r) => (
              <div key={r.title} className="bg-surface-container-low p-6 rounded-2xl space-y-3 border-l-2 border-gold/20">
                <span className="material-symbols-outlined text-2xl text-gold" style={I}>{r.icon}</span>
                <h3 className="font-heading text-base font-semibold text-on-surface">{r.title}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">{r.text}</p>
              </div>
            ))}
            <div className="bg-gold/10 border-2 border-gold/30 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
              <p className="font-heading text-5xl font-bold text-gold">4&ndash;8</p>
              <p className="text-gold text-xs uppercase tracking-widest mt-2 font-bold">Dates Per Month</p>
              <p className="text-on-surface-variant text-xs mt-1">most common</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 13. CLIENT RESULTS ═══ */}
      <section id="results" className="py-20 md:py-28 bg-surface-container-lowest">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-center">Client Results</h2>
          <p className="text-on-surface-variant text-sm text-center mt-2">Real clients. Specific numbers. Verifiable transformations.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-12">
            {[
              { name: "TJ", role: "Tech Sales Manager", before: "Bad matches, low quality dates", after: "4\u20135 quality dates weekly", time: "From profile launch" },
              { name: "AJ", role: "Computer Scientist", before: "Zero matches, zero likes, zero dates", after: "Unlimited quality dates", time: "30 days" },
              { name: "Mike B.", role: "Blockchain Co-founder", before: "3\u20135 likes per week", after: "120+ likes on Hinge, unlimited dates", time: "From profile launch" },
              { name: "Bhavesh", role: "Engineer", before: "Post-divorce, starting from zero", after: "2\u20135 dates weekly", time: "30 days" },
              { name: "Ryan", role: "Software Engineer", before: "A few bad likes a week", after: "10\u201320 quality matches weekly per app", time: "From profile launch" },
              { name: "Tri", role: "Finance Data Analyst", before: "3 likes in 6 months", after: "10 likes per day per app", time: "From profile launch" },
              { name: "Mike", role: "Data Scientist", before: "$1,500 wasted on photographers", after: "Unlimited weekly dates", time: "From profile launch" },
              { name: "Marshall", role: "Software Engineer", before: "Low quality matches, quit apps", after: "Multiple weekly dates", time: "From profile launch" },
              { name: "David", role: "PR Manager", before: "Bad matches across all apps", after: "Multiple quality dates weekly", time: "30 days" },
            ].map((t, i) => (
              <div key={i} className="bg-surface-container-low p-5 rounded-2xl space-y-3">
                <div className="flex gap-1">{Array.from({ length: 5 }).map((_, j) => <span key={j} className="material-symbols-outlined text-gold text-sm" style={IF}>star</span>)}</div>
                <div className="space-y-1.5">
                  <p className="text-red-400/60 text-xs"><span className="uppercase tracking-widest">Before:</span> {t.before}</p>
                  <p className="text-gold text-xs font-medium"><span className="uppercase tracking-widest">After:</span> {t.after}</p>
                  <p className="text-on-surface-variant text-[10px] uppercase tracking-widest">{t.time}</p>
                </div>
                <div>
                  <p className="text-on-surface font-heading font-semibold text-sm">{t.name}</p>
                  <p className="text-on-surface-variant text-xs">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 14. FAQ ═══ */}
      <section id="faq" className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-center">Frequently Asked Questions</h2>
          <div className="mt-12 space-y-3">
            {[
              { q: "How is this different from a traditional matchmaker?", a: "Traditional matchmakers charge $15,000\u2013$50,000 and never touch your digital identity. We rebuild your entire digital presence first, then run your dating apps daily with full transparency. You see every metric, approve every date, and pay month-to-month." },
              { q: "What dating apps do you manage?", a: "Hinge, Bumble, Tinder, Raya, The League, and others. We manage all simultaneously." },
              { q: "How do you protect my privacy?", a: "Dedicated Apple ID per client. AES-256 encrypted credentials. Every team member signs an NDA. Clean termination: we delete everything if you leave." },
              { q: "How quickly will I see dates?", a: "Most clients get their first date notification within 2\u20133 weeks. Your manager begins daily operations by Day 7." },
              { q: "What if matches aren\u2019t my type?", a: "Your preferences are calibrated through a 4-layer filter. During the first two weeks, your manager learns your exact taste. Quality improves weekly." },
              { q: "Can I cancel anytime?", a: "Yes. Month-to-month, no contract. If you cancel, you keep all rebuilt assets \u2014 profiles, photos, bios. Clean termination on all accounts." },
              { q: "What cities do you serve?", a: "Major US cities including New York, LA, San Francisco, Chicago, and Miami. Expanding quarterly." },
              { q: "How much does it cost vs alternatives?", a: "DIY apps cost $5\u201310K/year plus 10+ hrs/week. Matchmakers charge $10\u201325K/quarter. We deliver 4\u20138 dates/month with full transparency for $2K/month." },
              { q: "Is this just for men?", a: "Currently designed for high-performing men. Exploring options for women and non-binary clients." },
            ].map((item, i) => (
              <div key={i} className="bg-surface-container-low rounded-2xl overflow-hidden">
                <button onClick={() => setFaqOpen(faqOpen === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left">
                  <span className="text-on-surface font-medium text-sm pr-4">{item.q}</span>
                  <span className={`material-symbols-outlined text-gold text-lg shrink-0 transition-transform duration-200 ${faqOpen === i ? "rotate-180" : ""}`}>expand_more</span>
                </button>
                <div className={`grid transition-all duration-300 ${faqOpen === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="overflow-hidden"><p className="px-5 pb-5 text-on-surface-variant text-sm leading-relaxed">{item.a}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 15. NEXT STEPS ═══ */}
      <section className="py-20 md:py-28 bg-surface-container-lowest">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold">Next Steps</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {[
              { time: "Today", icon: "bolt", title: "Apply", text: "Complete a quick application. We\u2019ll reach out to schedule your consultation." },
              { time: "Week 1\u20132", icon: "public", title: "Identity Rebuild", text: "Your digital presence is reconstructed across all platforms." },
              { time: "Week 2\u20133", icon: "notifications_active", title: "First Date", text: "The first vetted date notification lands on your phone.", highlight: true },
            ].map((step) => (
              <div key={step.time} className="text-center space-y-3">
                <div className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center ${step.highlight ? "bg-gold text-on-gold" : "bg-surface-container-low border border-outline-variant/20"}`}>
                  <span className="material-symbols-outlined text-xl" style={step.highlight ? IF : I}>{step.icon}</span>
                </div>
                <p className="text-gold text-xs uppercase tracking-widest">{step.time}</p>
                <h3 className={`font-heading text-lg font-semibold ${step.highlight ? "text-gold" : "text-on-surface"}`}>{step.title}</h3>
                <p className="text-on-surface-variant text-sm">{step.text}</p>
              </div>
            ))}
          </div>
          <div className="bg-surface-container-low rounded-2xl p-6 mt-12 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <p className="font-heading text-lg font-semibold text-on-surface">Lock in the 3-Month Performance Rate</p>
              <p className="text-on-surface-variant text-sm mt-1">Secure your package price today.</p>
            </div>
            <Link href="/apply" className="gold-gradient text-on-gold font-semibold rounded-full px-8 py-3.5 text-base hover:opacity-90 transition-opacity shadow-lg shrink-0">
              Start Your Application
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-outline-variant/10 py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <img src="/logo.png" alt="Private Dating Concierge" className="h-5 w-auto" />
          <div className="flex items-center gap-6 text-xs text-on-surface-variant">
            <a href="#problem" className="hover:text-gold transition-colors">The Problem</a>
            <a href="#solution" className="hover:text-gold transition-colors">How It Works</a>
            <a href="#results" className="hover:text-gold transition-colors">Results</a>
            <a href="#pricing" className="hover:text-gold transition-colors">Investment</a>
            <a href="#faq" className="hover:text-gold transition-colors">FAQ</a>
          </div>
          <p className="text-xs text-outline">&copy; {new Date().getFullYear()} Private Dating Concierge. All rights reserved.</p>
        </div>
      </footer>

      {/* ═══ STICKY MOBILE CTA ═══ */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 glass-panel border-t border-outline-variant/10 safe-area-pb px-4 py-3">
        <Link href="/apply" className="block gold-gradient text-on-gold font-semibold rounded-full py-3 text-sm text-center hover:opacity-90 transition-opacity">
          Start Your Application
        </Link>
      </div>
    </div>
  );
}
