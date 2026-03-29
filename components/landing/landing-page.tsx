"use client";

import Link from "next/link";
import { useState } from "react";

const I = { fontVariationSettings: "'FILL' 0, 'wght' 300" } as const;
const IF = { fontVariationSettings: "'FILL' 1, 'wght' 400" } as const;

export function LandingPage() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-surface text-on-surface">

      {/* ═══ NAV ═══ */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <img src="/logo.png" alt="Private Dating Concierge" className="h-6 w-auto" />
          <div className="hidden md:flex items-center gap-8 text-sm text-on-surface-variant">
            <a href="#problem" className="hover:text-gold transition-colors">The Problem</a>
            <a href="#system" className="hover:text-gold transition-colors">The System</a>
            <a href="#services" className="hover:text-gold transition-colors">Services</a>
            <a href="#pricing" className="hover:text-gold transition-colors">Investment</a>
            <a href="#faq" className="hover:text-gold transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-on-surface-variant text-sm hover:text-gold transition-colors hidden sm:block">Sign In</Link>
            <Link href="/apply" className="gold-gradient text-on-gold font-semibold rounded-full px-5 py-2 text-sm hover:opacity-90 transition-opacity">Apply Now</Link>
          </div>
        </div>
      </nav>

      {/* ═══ HERO (Deck Slide 01) ═══ */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[120px]" />
        <div className="max-w-4xl mx-auto px-6 text-center relative">
          <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-full px-4 py-1.5 mb-8">
            <span className="material-symbols-outlined text-gold text-sm" style={IF}>verified</span>
            <span className="text-gold text-xs font-medium uppercase tracking-widest">Exclusive Management</span>
          </div>
          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
            Your Dating Life,{" "}<span className="text-gold">Discreetly Managed</span>
          </h1>
          <p className="text-on-surface-variant text-lg md:text-xl mt-6 max-w-2xl mx-auto leading-relaxed">
            We engineer your digital identity and deliver curated dates — you only show up.
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
            <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-gold text-sm" style={IF}>diamond</span> White-Glove Service</span>
          </div>
        </div>
      </section>

      {/* ═══ SOCIAL PROOF ═══ */}
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

      {/* ═══ THE REAL PROBLEM (Deck Slide 02) ═══ */}
      <section id="problem" className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-gold text-xs uppercase tracking-widest mb-4">The Real Problem</p>
          <h2 className="font-heading text-3xl md:text-5xl font-bold leading-tight">
            You&apos;re not getting rejected.{" "}<br className="hidden md:block" />
            <span className="text-gold">You&apos;re being misrepresented.</span>
          </h2>
          <p className="text-on-surface-variant text-base md:text-lg mt-6 max-w-2xl leading-relaxed">
            There is a fundamental gap between who you are in real life and how you show up online. That gap is where your dating life breaks.
          </p>
          <div className="bg-surface-container-low border-l-2 border-gold p-5 rounded-r-xl mt-8 max-w-lg">
            <p className="font-heading text-lg text-on-surface">We close the gap first.</p>
            <p className="text-on-surface-variant text-sm mt-1">Before any matching begins.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {[
              { icon: "person_off", title: "Silent Attrition", text: "She matches, checks your Instagram, and sees a version of you that doesn\u2019t align with reality. She disappears without a word." },
              { icon: "schedule", title: "The Executive Time Tax", text: "10+ hours wasted every week on swiping, messaging, and planning \u2014 all built on top of positioning that is actively working against you." },
              { icon: "filter_alt_off", title: "Wrong Pool Entirely", text: "Your current digital identity is filtering you into the wrong category. The high-caliber women you actually want never even see you." },
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

      {/* ═══ COMPETITIVE ANALYSIS (Deck Slide 03) ═══ */}
      <section className="py-20 md:py-28 bg-surface-container-lowest">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-gold text-xs uppercase tracking-widest mb-4">You Deserve Better</p>
          <h2 className="font-heading text-3xl md:text-5xl font-bold leading-tight">
            What you&apos;re actually getting<br className="hidden md:block" />
            <span className="text-gold">from &ldquo;premium&rdquo; dating services.</span>
          </h2>
          <p className="text-on-surface-variant text-base mt-6 max-w-2xl leading-relaxed">
            You&apos;re paying thousands for a premium experience. But behind the sales pitch, most services cut corners on the things that matter most &mdash; your time, your privacy, and who actually shows up on the other side of the table.
          </p>

          <div className="space-y-4 mt-12">
            {[
              {
                icon: "visibility_off",
                issue: "Blind Dates Only",
                stat: "No photos. No names. No vetting.",
                text: "You\u2019re paying $5,000+ to walk into a restaurant and meet a complete stranger. No photo beforehand. No name. No background. Some services cold-call people from databases to fill the seat across from you \u2014 people who never even signed up.",
                detail: "Clients have reported their \u201Cmatch\u201D had never heard of the service until someone called asking them to go on a date. That\u2019s not matchmaking. That\u2019s filling a quota.",
                links: [
                  { label: "Real client experiences", url: "https://www.sitejabber.com/reviews/tawkify.com" },
                  { label: "How blind matching actually works", url: "https://eddie-hernandez.com/tawkify-reviews-cost-what-is-tawkify/" },
                ],
              },
              {
                icon: "person_off",
                issue: "Your Preferences Get Ignored",
                stat: "$60M+ in class action settlements",
                text: "You spend an hour on the phone describing exactly what you want. Then they send you on dates with people who match none of it. Why? Because matches are driven by who\u2019s available, not who\u2019s right for you.",
                detail: "One major matchmaking service settled for $60M after clients proved their stated preferences were systematically ignored to hit monthly quotas. 115+ BBB complaints in 3 years.",
                links: [
                  { label: "Class action settlement details", url: "https://topclassactions.com/lawsuit-settlements/lawsuit-news/its-just-lunch-matchmaking-site-settles-class-action-for-60m-in-dates/" },
                  { label: "BBB complaint history", url: "https://www.bbb.org/us/ca/san-francisco/profile/dating-services/tawkify-1116-874156/complaints" },
                ],
              },
              {
                icon: "block",
                issue: "You Pay Even When You Say No",
                stat: "Declined matches still count against your contract",
                text: "She wasn\u2019t your type? Doesn\u2019t matter. That \u201Cintroduction\u201D still counts as one of your 3\u20136 guaranteed matches. You\u2019re locked into a non-refundable contract paying $2,000\u2013$3,000 per date \u2014 whether you wanted it or not.",
                detail: "One client was offered just $2,000 back on an $8,500 contract. The fine print says all presented matches count \u2014 even ones you decline \u2014 and no refunds are issued.",
                links: [
                  { label: "Contract terms breakdown", url: "https://blog.photofeeler.com/three-day-rule/" },
                  { label: "BBB refund complaints", url: "https://www.bbb.org/us/tx/colleyville/profile/online-dating-services/three-day-rule-matchmaking-0825-1000201568/complaints" },
                ],
              },
              {
                icon: "visibility_off",
                issue: "Zero Process Transparency",
                stat: "No dashboard. No metrics. No proof.",
                text: "You hand over $5,000\u2013$20,000 and have no way to see what\u2019s happening. No dashboard. No swipe data. No match rates. No proof anyone is working on your behalf. Your physical preferences \u2014 attraction, body type, ethnicity \u2014 get filed away and ignored because they don\u2019t have the pool to match them.",
                detail: "Attraction matters. But most services treat physical preferences as optional because they can\u2019t deliver on them. No KPIs, no weekly updates, no conversion data. When clients ask what\u2019s happening, they get vague reassurances or silence. It\u2019s a black box you\u2019re paying thousands to sit inside.",
                links: [
                  { label: "Client transparency complaints", url: "https://lumasearch.com/blog/its-just-lunch-reviews-2025/" },
                  { label: "Industry review patterns", url: "https://www.trustpilot.com/review/matchmakingservices.com" },
                ],
              },
            ].map((comp) => (
              <div key={comp.issue} className="bg-surface-container-low p-6 rounded-2xl space-y-4">
                <div className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-2xl text-gold shrink-0 mt-1" style={I}>{comp.icon}</span>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <h3 className="font-heading text-lg font-semibold text-on-surface">{comp.issue}</h3>
                      <span className="text-gold text-sm font-heading font-medium">{comp.stat}</span>
                    </div>
                    <p className="text-on-surface-variant text-sm leading-relaxed mt-2">{comp.text}</p>
                    <p className="text-on-surface-variant/70 text-xs leading-relaxed mt-2">{comp.detail}</p>
                    <div className="flex flex-wrap gap-3 mt-3">
                      {comp.links.map((link) => (
                        <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" className="text-gold/60 text-[10px] uppercase tracking-widest hover:text-gold transition-colors flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">open_in_new</span>
                          {link.label}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-surface-container-low border-l-2 border-gold p-6 rounded-r-xl mt-8 max-w-2xl">
            <p className="font-heading text-lg text-on-surface">You deserve to know who you&apos;re meeting, approve every date, and see exactly what&apos;s happening.</p>
            <p className="text-on-surface-variant text-sm mt-2">That&apos;s why we built something that solves every one of these problems.</p>
          </div>
        </div>
      </section>

      {/* ═══ HOW WE'RE DIFFERENT — JOBS TO BE DONE ═══ */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-gold text-xs uppercase tracking-widest mb-4">How We&apos;re Different</p>
          <h2 className="font-heading text-3xl md:text-5xl font-bold leading-tight">
            Built around what<br className="hidden md:block" />
            <span className="text-gold">actually matters to you.</span>
          </h2>
          <p className="text-on-surface-variant text-base mt-6 max-w-2xl leading-relaxed">
            Every part of our service was designed to solve a specific problem that existing services ignore. Here&apos;s what that looks like in practice.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            {[
              {
                problem: "Blind dates with strangers",
                icon: "how_to_reg",
                title: "You See Every Match Before You Meet",
                text: "Her name, photo, age, profession, and one memorable detail \u2014 delivered to your phone before you approve anything. You never walk in blind. You decide who you sit across from.",
              },
              {
                problem: "Preferences get ignored",
                icon: "tune",
                title: "Your Type Is the Starting Point, Not an Afterthought",
                text: "Physical attraction, ethnicity, body type, age range, lifestyle \u2014 your preferences aren\u2019t filed away. They\u2019re the first filter. Our 4-layer vetting system starts with what you\u2019re actually attracted to.",
              },
              {
                problem: "Declined matches still count",
                icon: "event_available",
                title: "You Only Pay for What You Approve",
                text: "Month-to-month. No contracts. No lock-ins. If a date doesn\u2019t meet your standard, decline it \u2014 no penalty, no wasted slot. Cancel any month, no questions asked.",
              },
              {
                problem: "Zero transparency",
                icon: "bar_chart",
                title: "A Dashboard You Can Actually See",
                text: "Weekly KPI reports: swipes, matches, conversations, dates closed, approval rate. You see every metric, every week. If something isn\u2019t working, the data tells us \u2014 not your frustration.",
              },
              {
                problem: "Rotating staff, no continuity",
                icon: "person",
                title: "One Dedicated Manager. Your Accounts Only.",
                text: "Not a rotating team. Not 20 accounts per person. One trained human who knows your type, your dealbreakers, and your schedule. Available 24/7 on WhatsApp.",
              },
              {
                problem: "Identity never gets fixed",
                icon: "auto_fix_high",
                title: "We Fix the Root Cause First",
                text: "Before a single swipe happens, we reconstruct your entire digital identity \u2014 profiles, photos, bios, Instagram. The gap between who you are and how you show up online is closed before matching begins.",
              },
            ].map((item) => (
              <div key={item.title} className="bg-surface-container-low p-6 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-on-surface-variant text-[10px] uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                  Their problem: {item.problem}
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-2xl text-gold shrink-0 mt-0.5" style={I}>{item.icon}</span>
                  <div>
                    <h3 className="font-heading text-base font-semibold text-on-surface">{item.title}</h3>
                    <p className="text-on-surface-variant text-sm leading-relaxed mt-1.5">{item.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CORE METHODOLOGY (Deck Slide 04) ═══ */}
      <section className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-gold text-xs uppercase tracking-widest mb-4">Core Methodology</p>
            <h2 className="font-heading text-3xl md:text-5xl font-bold leading-tight">
              Identity First,<br />Then the System.
            </h2>
            <p className="text-on-surface-variant text-base mt-6 leading-relaxed">
              Before a single match is made, your digital identity must be reconstructed correctly across every platform.
            </p>
            <p className="text-on-surface-variant text-base mt-4 leading-relaxed">
              We rebuild how you show up — not just on dating apps, but your entire digital presence — ensuring the public version of you aligns with your actual status.
            </p>
            <div className="border-l-2 border-gold pl-5 mt-8">
              <p className="font-heading text-xl italic text-gold">&ldquo;We don&apos;t just find dates.<br />We engineer the reception.&rdquo;</p>
            </div>
            <p className="text-on-surface-variant text-sm mt-6">Only after this foundation is set do we activate the system to convert interest into dates.</p>
          </div>
          <div className="bg-surface-container-low rounded-2xl p-8 flex items-center justify-center min-h-[300px]">
            <div className="text-center space-y-4">
              <span className="material-symbols-outlined text-6xl text-gold/30" style={I}>fingerprint</span>
              <p className="text-on-surface-variant text-xs uppercase tracking-widest">Your Digital Identity</p>
              <p className="text-gold font-heading text-sm">Reconstructed</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 3-STEP SYSTEM (Deck Slide 05) ═══ */}
      <section id="system" className="py-20 md:py-28 bg-surface-container-lowest">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-gold text-xs uppercase tracking-widest mb-4">How It Works</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold">The 3-Step Engagement System</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {[
              { num: "01", title: "Digital Identity\nRebuild", icon: "fingerprint", text: "We reconstruct your entire digital presence \u2014 profiles, photos, bios, and Instagram \u2014 ensuring every touchpoint reflects who you actually are at a high level." },
              { num: "02", title: "Preference\nFiltering", icon: "filter_list", text: "Rigorous 4-layer qualification matched to your specific standards:", bullets: ["Physical attractiveness (reference matched)", "Hard preferences (age, lifestyle, dealbreakers)", "Conversation quality (red flags, effort)", "Date readiness (interest confirmed)"] },
              { num: "03", title: "Date\nDelivery", icon: "send", text: "Your dedicated manager runs your accounts daily using our proven playbooks. You receive one concise notification per date." },
            ].map((step) => (
              <div key={step.num} className="bg-surface-container-low p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="material-symbols-outlined text-2xl text-gold" style={I}>{step.icon}</span>
                  <span className="font-heading text-3xl font-bold text-outline/30">{step.num}</span>
                </div>
                <h3 className="font-heading text-xl font-semibold text-on-surface whitespace-pre-line">{step.title}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">{step.text}</p>
                {step.bullets && (
                  <ul className="space-y-1.5 mt-2">
                    {step.bullets.map((b) => (
                      <li key={b} className="text-on-surface-variant text-xs flex items-start gap-2">
                        <span className="material-symbols-outlined text-gold text-xs mt-0.5" style={IF}>check</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-gold font-heading text-xl mt-10 font-semibold">Copy. Send. Show up.</p>
        </div>
      </section>

      {/* ═══ 5-ELEMENT DATE NOTIFICATION (Deck Slide 06) ═══ */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-gold text-xs uppercase tracking-widest mb-4">What You Receive</p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold leading-tight">
              The 5-Element<br /><span className="text-gold">Date Notification</span>
            </h2>
            <p className="text-on-surface-variant text-base mt-6 leading-relaxed">
              We condense hours of logistics into a single executive briefing. You receive one notification per date containing exactly what you need — and nothing you don&apos;t.
            </p>
            <div className="mt-8">
              <p className="font-heading text-4xl font-bold text-on-surface">~15 Seconds</p>
              <p className="text-on-surface-variant text-sm mt-1">Of Your Time</p>
            </div>
            <div className="flex gap-6 mt-6 text-sm">
              <span><span className="text-gold font-heading font-bold">01.</span> Copy</span>
              <span><span className="text-gold font-heading font-bold">02.</span> Send</span>
              <span><span className="text-gold font-heading font-bold">03.</span> Show Up</span>
            </div>
          </div>
          {/* Mock notification card */}
          <div className="bg-surface-container-low rounded-2xl p-6 space-y-0 border border-outline-variant/10">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/10">
              <p className="text-on-surface-variant text-xs uppercase tracking-widest">Approved Match Brief</p>
              <span className="material-symbols-outlined text-gold text-xl" style={I}>notifications</span>
            </div>
            {[
              { num: "01", label: "Her Name", value: "Jessica, 28" },
              { num: "02", label: "One Detail", value: "Marketing Director at Deloitte" },
              { num: "03", label: "The Day", value: "Thursday evening, 7:30 PM" },
              { num: "04", label: "Her Number", value: "(512) 555-0147" },
            ].map((item) => (
              <div key={item.num} className="py-4 border-b border-outline-variant/10">
                <p className="text-on-surface-variant text-xs">{item.label}</p>
                <p className="font-heading text-base font-semibold text-on-surface mt-0.5">{item.value}</p>
              </div>
            ))}
            <div className="pt-4">
              <p className="text-on-surface-variant text-xs">Pre-Written Text</p>
              <div className="bg-surface-container p-3 rounded-xl mt-2">
                <p className="text-on-surface text-sm italic">&ldquo;Hey Jessica! Drinks Thursday at Julep &mdash; 7:30 work?&rdquo;</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ ONBOARDING TIMELINE (Deck Slide 07) ═══ */}
      <section className="py-20 md:py-28 bg-surface-container-lowest">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-gold text-xs uppercase tracking-widest mb-4">Implementation Strategy</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold">Your Onboarding Timeline</h2>
          <p className="text-on-surface-variant text-base mt-4">From sign up to first date notification in 2&ndash;3 weeks.</p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-12">
            {[
              { time: "Day 0", icon: "call", title: "Onboarding Call", text: "60-min deep dive: your type, dealbreakers, schedule." },
              { time: "Day 1\u20132", icon: "photo_library", title: "Photo & Content", text: "Send your best photos. We select, enhance, and optimize." },
              { time: "Day 2\u20137", icon: "auto_fix_high", title: "Identity Rebuild", text: "Profiles, bios, prompts, and photo order reconstructed." },
              { time: "Day 7", icon: "person", title: "Manager Assigned", text: "Dedicated manager briefed on your profile and type." },
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

      {/* ═══ WHAT'S INCLUDED (Deck Slide 08) ═══ */}
      <section id="services" className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-gold text-xs uppercase tracking-widest mb-4">Comprehensive Management</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold">What&apos;s Included in Your Concierge</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            {[
              { icon: "badge", title: "Digital Identity Reconstruction", text: "Profiles, photos, bios, and Instagram \u2014 rebuilt from scratch to reflect your status." },
              { icon: "support_agent", title: "Dedicated Concierge Manager", text: "One trained human (not AI). Your accounts only. 24/7 WhatsApp access." },
              { icon: "filter_list", title: "4-Layer Preference Filtering", text: "Physical attractiveness, hard preferences, conversation quality, and date readiness." },
              { icon: "calendar_month", title: "Daily Account Operations", text: "Strategic swiping, conversation management, and date scheduling using 5+ year playbooks." },
              { icon: "notifications", title: "Executive Date Notifications", text: "Delivered to your phone: Her name, one detail, the day, her number, and a pre-written text." },
              { icon: "bar_chart", title: "Weekly KPI Dashboard", text: "Full transparency on swipes, matches, conversations, approved match quality, and dates." },
              { icon: "auto_fix_high", title: "Ongoing A/B Optimization", text: "Continuous photo swaps, prompt rotation, and profile testing based on real match data." },
            ].map((s) => (
              <div key={s.title} className="flex gap-4 p-5 bg-surface-container-low rounded-2xl">
                <span className="material-symbols-outlined text-2xl text-gold shrink-0 mt-1" style={I}>{s.icon}</span>
                <div>
                  <h3 className="font-heading text-base font-semibold text-on-surface">{s.title}</h3>
                  <p className="text-on-surface-variant text-sm mt-1 leading-relaxed">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-surface-container-low rounded-2xl p-5 mt-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-gold text-xl" style={I}>schedule</span>
              <span className="text-gold text-sm">Your Total Time Commitment</span>
            </div>
            <span className="font-heading text-2xl font-bold text-on-surface">~15 Seconds Per Date</span>
          </div>
        </div>
      </section>

      {/* ═══ PDC VS ALTERNATIVES (Deck Slide 10) ═══ */}
      <section className="py-20 md:py-28 bg-surface-container-lowest">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-gold text-xs uppercase tracking-widest mb-4">Comparative Analysis</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold">PDC vs. The Alternatives</h2>

          <div className="overflow-x-auto mt-12">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-gold/20">
                  <th className="text-left py-3 text-on-surface-variant text-xs uppercase tracking-widest" />
                  <th className="text-center py-3 text-on-surface-variant text-xs uppercase tracking-widest">DIY Apps</th>
                  <th className="text-center py-3 text-on-surface-variant text-xs uppercase tracking-widest">Matchmakers</th>
                  <th className="text-center py-3 text-gold text-xs uppercase tracking-widest font-bold">PDC Concierge</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Fixes your identity?", "No", "Rarely", "Yes \u2014 First Priority"],
                  ["Dates / Month", "0\u20132", "~1", "4\u20138"],
                  ["Your Time / Week", "10+ Hours", "0\u20131 Hour", "~15 Seconds / Date"],
                  ["Dedicated Person?", "N/A", "Rotating Staff", "Yes \u2014 1 Manager"],
                  ["Transparency", "N/A", "Zero KPIs", "Weekly Dashboard"],
                  ["Vetting System", "None", "Minimal", "4-Layer Filter"],
                  ["Communication", "None", "Office Hours", "24/7 WhatsApp"],
                  ["Monthly Cost", "High Opportunity Cost", "$2K\u2013$8K", "$1.5K\u2013$2K"],
                ].map(([label, diy, mm, pdc], i) => (
                  <tr key={i} className="border-b border-outline-variant/10">
                    <td className="py-3 text-on-surface text-sm font-medium">{label}</td>
                    <td className="py-3 text-center text-on-surface-variant text-sm">{diy}</td>
                    <td className="py-3 text-center text-on-surface-variant text-sm">{mm}</td>
                    <td className="py-3 text-center text-gold text-sm font-semibold">{pdc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═══ HIDDEN COSTS (Deck Slide 11) ═══ */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-gold text-xs uppercase tracking-widest mb-4">Financial & Time Investment</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold">The Hidden Costs You&apos;re Already Paying</h2>
          <p className="text-on-surface-variant text-base mt-4 max-w-2xl">Whether you act or not, maintaining the status quo is costing you capital, time, and reputation.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            {[
              { icon: "smartphone", title: "The DIY App Grind", cost: "$5,000\u2013$10,000 / year", text: "Premium subscriptions, paid boosts, and Super Likes. A broken funnel that monetizes your frustration, not your success." },
              { icon: "hourglass_top", title: "Time Opportunity Cost", cost: "$25,000+ / year", text: "5+ hours/week at $100+/hour is 250+ hours a year. That\u2019s $2,000+ a month of wasted executive time." },
              { icon: "card_membership", title: "Traditional Matchmakers", cost: "$10K\u2013$25K / 3 months", text: "One blind date a month. Zero quality filters. Zero digital identity rebuild. Zero transparency." },
              { icon: "local_bar", title: "Unfiltered Nightlife", cost: "$5,000 / 3 months", text: "$250+ a week average. No filtering, just drinking and logistics. Purely hope-based strategy." },
            ].map((c) => (
              <div key={c.title} className="bg-surface-container-low p-6 rounded-2xl">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-xl text-on-surface-variant" style={I}>{c.icon}</span>
                    <h3 className="font-heading text-base font-semibold text-on-surface">{c.title}</h3>
                  </div>
                  <span className="text-gold font-heading text-sm font-bold">{c.cost}</span>
                </div>
                <p className="text-on-surface-variant text-sm mt-3 leading-relaxed">{c.text}</p>
              </div>
            ))}
          </div>
          <div className="bg-surface-container-low border-l-2 border-gold rounded-r-2xl p-6 mt-8 flex items-center justify-between">
            <div>
              <p className="text-gold text-xs uppercase tracking-widest">Total Annual Exposure</p>
              <p className="text-on-surface-variant text-sm mt-1">Combined financial and time cost of the current state.</p>
            </div>
            <span className="font-heading text-3xl md:text-4xl font-bold text-on-surface">$25K&ndash;$50K+</span>
          </div>
        </div>
      </section>

      {/* ═══ INVESTMENT STRUCTURE (Deck Slide 13) ═══ */}
      <section id="pricing" className="py-20 md:py-28 bg-surface-container-lowest">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-gold text-xs uppercase tracking-widest mb-4 text-center">Investment Options</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-center">Your Investment Structure</h2>

          {/* Foundation Setup */}
          <div className="bg-surface-container-low rounded-2xl p-6 mt-12">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="md:w-48 shrink-0">
                <p className="text-gold text-xs uppercase tracking-widest">Foundation Setup</p>
                <p className="font-heading text-4xl font-bold text-on-surface mt-1">$5,000</p>
                <p className="text-on-surface-variant text-sm">One-Time Investment</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                {["Digital identity rebuild", "Profile architecture", "Photo optimization", "Manager onboarding", "Playbook calibration", "4-layer preference filter", "Manager training", "Proven playbooks", "Weekly KPIs"].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-gold text-sm" style={IF}>check</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Monthly plans */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-surface-container-low rounded-2xl p-6 text-center space-y-4">
              <p className="text-on-surface-variant text-sm">Month-to-Month</p>
              <p className="font-heading text-4xl font-bold text-on-surface">$2,000</p>
              <p className="text-on-surface-variant text-sm">Per Month</p>
              <div className="border-t border-outline-variant/10 pt-4 space-y-2 text-sm text-on-surface-variant">
                <p>Cancel anytime</p><p>Zero commitment</p><p>Full flexibility</p><p>All core features included</p><p>24/7 Manager access</p>
              </div>
              <Link href="/apply" className="block gold-gradient text-on-gold font-semibold rounded-full py-3 text-sm hover:opacity-90 transition-opacity mt-4">Get Started</Link>
            </div>
            <div className="bg-surface-container-low rounded-2xl p-6 text-center space-y-4 ring-2 ring-gold/30 relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-on-gold text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-full">Most Popular</span>
              <p className="text-gold text-sm">3-Month Package</p>
              <p className="font-heading text-4xl font-bold text-on-surface">$5,000</p>
              <p className="text-on-surface-variant text-sm">Per 3 Months</p>
              <div className="border-t border-outline-variant/10 pt-4 space-y-2 text-sm text-on-surface-variant">
                <p className="text-gold font-semibold">Save $1,000 vs. monthly</p><p>Instagram rebrand included</p><p>Date classes + class library</p><p>Most clients choose this</p>
              </div>
              <Link href="/apply" className="block gold-gradient text-on-gold font-semibold rounded-full py-3 text-sm hover:opacity-90 transition-opacity mt-4">Apply Now</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ RISK REVERSAL (Deck Slide 14) ═══ */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-gold text-xs uppercase tracking-widest mb-4">Risk Reversal</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold">Built for Confidence</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {[
              { icon: "event_available", title: "Month-to-Month", text: "No long-term contracts. Walk anytime, no questions asked. We earn your business every 30 days." },
              { icon: "rocket_launch", title: "First Intro in 2\u20133 Weeks", text: "You\u2019re not waiting months to see if this works. Rapid onboarding and immediate execution." },
              { icon: "visibility", title: "Full Transparency", text: "Weekly KPI dashboard with every number visible. Swipes, matches, and conversion rates \u2014 no black box." },
              { icon: "inventory_2", title: "You Keep Everything", text: "If you cancel, you keep all rebuilt assets \u2014 profiles, photos, bios. Your identity upgrade is yours forever." },
              { icon: "chat", title: "24/7 WhatsApp Access", text: "Message your dedicated manager anytime. Not a call center \u2014 a direct line to your concierge." },
            ].map((r) => (
              <div key={r.title} className="bg-surface-container-low p-6 rounded-2xl space-y-3 border-l-2 border-gold/20">
                <span className="material-symbols-outlined text-2xl text-gold" style={I}>{r.icon}</span>
                <h3 className="font-heading text-base font-semibold text-on-surface">{r.title}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">{r.text}</p>
              </div>
            ))}
            {/* Dates badge */}
            <div className="bg-gold/10 border-2 border-gold/30 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
              <p className="font-heading text-5xl font-bold text-gold">4&ndash;8</p>
              <p className="text-gold text-xs uppercase tracking-widest mt-2 font-bold">Dates Per Month</p>
              <p className="text-on-surface-variant text-xs mt-1">most common</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="py-20 md:py-28 bg-surface-container-lowest">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-center">What Our Clients Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {[
              { name: "Alex T.", role: "Finance, 32", city: "New York", quote: "I went from zero matches to 3 dates a week. The photos alone were a game-changer \u2014 I never would have picked those shots myself." },
              { name: "Marcus D.", role: "Tech CEO, 38", city: "San Francisco", quote: "I literally just show up. They handle the apps, the conversations, the reservations. It\u2019s like having a dating assistant who actually knows what they\u2019re doing." },
              { name: "James R.", role: "Attorney, 29", city: "Chicago", quote: "The transparency is what sold me. I can see every swipe, every match, every conversation. And I approve every date before it happens." },
            ].map((t) => (
              <div key={t.name} className="bg-surface-container-low p-6 rounded-2xl space-y-4">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-gold text-sm" style={IF}>star</span>
                  ))}
                </div>
                <p className="text-on-surface text-sm leading-relaxed italic">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p className="text-on-surface font-heading font-semibold text-sm">{t.name}</p>
                  <p className="text-on-surface-variant text-xs">{t.role} &middot; {t.city}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section id="faq" className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-center">Frequently Asked Questions</h2>
          <div className="mt-12 space-y-3">
            {[
              { q: "How is this different from a traditional matchmaker?", a: "Traditional matchmakers charge $15,000\u2013$50,000 and never touch your digital identity. We rebuild your entire digital presence first, then run your dating apps daily with full transparency. You see every metric, approve every date, and pay month-to-month." },
              { q: "What dating apps do you manage?", a: "Hinge, Bumble, Tinder, Raya, The League, and others based on your preferences. We manage all of them simultaneously from a single dashboard." },
              { q: "How do you protect my privacy?", a: "Dedicated Apple ID per client (your personal accounts are never touched). All credentials stored with AES-256 encryption. Every team member signs an NDA. Clean termination: we delete everything if you leave." },
              { q: "How quickly will I start seeing dates?", a: "Most clients receive their first date notification within 2\u20133 weeks. Day 0 is your onboarding call, and your dedicated manager begins daily operations by Day 7." },
              { q: "What if the matches aren\u2019t what I\u2019m looking for?", a: "Your preferences are calibrated through a 4-layer filtering system. During the first two weeks, your manager learns your exact taste. Quality improves week over week based on your approvals and feedback." },
              { q: "Can I cancel anytime?", a: "Yes. Month-to-month with no long-term contract. If you cancel, you keep all rebuilt assets \u2014 profiles, photos, bios. Your identity upgrade is yours forever." },
              { q: "What cities do you serve?", a: "We currently operate in major US cities including New York, Los Angeles, San Francisco, Chicago, and Miami. Expanding to additional markets quarterly." },
              { q: "What if I want to cancel?", a: "Clean termination. We delete all stored credentials, deactivate any accounts created, and remove all data. No questions asked. You keep your rebuilt profiles and photos." },
              { q: "How much does it cost compared to alternatives?", a: "DIY apps cost $5\u201310K/year in subscriptions plus 10+ hours/week of your time. Traditional matchmakers charge $10\u201325K per quarter. Our service delivers 4\u20138 dates/month with full transparency for $2K/month." },
              { q: "Is this just for men?", a: "Currently, our concierge service is designed for high-performing men. We\u2019re exploring options for women and non-binary clients." },
            ].map((item, i) => (
              <div key={i} className="bg-surface-container-low rounded-2xl overflow-hidden">
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="text-on-surface font-medium text-sm pr-4">{item.q}</span>
                  <span className={`material-symbols-outlined text-gold text-lg shrink-0 transition-transform duration-200 ${faqOpen === i ? "rotate-180" : ""}`}>expand_more</span>
                </button>
                <div className={`grid transition-all duration-300 ${faqOpen === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-on-surface-variant text-sm leading-relaxed">{item.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA — NEXT STEPS (Deck Slide 15) ═══ */}
      <section className="py-20 md:py-28 bg-surface-container-lowest">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-gold text-xs uppercase tracking-widest mb-4">Implementation Roadmap</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold">Next Steps</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {[
              { time: "Today", icon: "bolt", title: "Identity Rebuild", text: "We begin reconstructing your digital presence within 48 hours of onboarding." },
              { time: "Week 1\u20132", icon: "public", title: "Presence Goes Live", text: "Your new, high-status digital identity launches across all selected platforms." },
              { time: "Week 2\u20133", icon: "notifications_active", title: "First Notification", text: "The first vetted date notification lands on your phone. Copy, send, show up.", highlight: true },
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
              <p className="text-on-surface-variant text-sm mt-1">Secure your package price today. Standard setup increases to $7,000 post-call.</p>
            </div>
            <Link href="/apply" className="gold-gradient text-on-gold font-semibold rounded-full px-8 py-3.5 text-base hover:opacity-90 transition-opacity shadow-lg shrink-0">
              Enroll Now
            </Link>
          </div>

          <p className="text-on-surface-variant text-xs mt-8">We accept a limited number of new clients each month to ensure quality.</p>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-outline-variant/10 py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <img src="/logo.png" alt="Private Dating Concierge" className="h-5 w-auto" />
          <div className="flex items-center gap-6 text-xs text-on-surface-variant">
            <a href="#problem" className="hover:text-gold transition-colors">The Problem</a>
            <a href="#system" className="hover:text-gold transition-colors">The System</a>
            <a href="#services" className="hover:text-gold transition-colors">Services</a>
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
