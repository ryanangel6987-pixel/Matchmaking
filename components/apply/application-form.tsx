"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/* ------------------------------------------------------------------ */
/*  Lead Scoring — Qualification Matrix                                */
/* ------------------------------------------------------------------ */

const QUALIFYING_CAREERS = [
  "tech", "software", "engineer", "developer", "founder", "ceo", "cto", "coo",
  "entrepreneur", "startup", "medicine", "doctor", "surgeon", "physician",
  "dentist", "finance", "banking", "investment", "trader", "analyst",
  "sales", "consulting", "consultant", "real estate", "marketing",
  "attorney", "lawyer", "legal", "executive", "director", "vp", "president",
  "manager", "partner", "architect", "data scientist", "product",
];

function isQualifyingCareer(profession: string): boolean {
  const lower = profession.toLowerCase();
  return QUALIFYING_CAREERS.some((k) => lower.includes(k));
}

function scoreLead(data: {
  lifeWindow: string;
  duration: string;
  triedBefore: string;
  priority: number;
  profession: string;
}): { tier: "high" | "medium" | "likely_unqualified"; score: number } {
  // Hard disqualifiers
  if (data.priority <= 3) return { tier: "likely_unqualified", score: data.priority };
  if (!isQualifyingCareer(data.profession) && data.profession.length > 0) {
    // Non-qualifying career + low priority = unqualified
    if (data.priority <= 5) return { tier: "likely_unqualified", score: data.priority };
  }

  let highSignals = 0;

  // Issue duration: 3+ months = high
  if (["6_12", "1_2_years", "3_plus_years"].includes(data.duration)) highSignals++;
  if (data.duration === "3_6") highSignals++; // 3-6 months also counts

  // Tried solutions: tried something = high
  if (["apps", "photos", "matchmaker", "multiple"].includes(data.triedBefore)) highSignals++;

  // Priority: 8-10 = high
  if (data.priority >= 8) highSignals++;

  // Career: qualifying field = high
  if (isQualifyingCareer(data.profession)) highSignals++;

  // Life window: active transition = high
  if (["divorce", "new_city", "milestone", "career"].includes(data.lifeWindow)) highSignals++;

  if (highSignals >= 3) return { tier: "high", score: highSignals * 10 + data.priority };
  return { tier: "medium", score: highSignals * 10 + data.priority };
}

/* ------------------------------------------------------------------ */
/*  Form Component                                                     */
/* ------------------------------------------------------------------ */

const ETHNICITY_OPTIONS = [
  "White / Caucasian", "Black / African American", "East Asian", "South Asian",
  "Southeast Asian", "Hispanic / Latino", "Middle Eastern", "Pacific Islander",
  "Mixed / Multiracial", "Other",
];
const BODY_TYPE_OPTIONS = ["Slim", "Athletic / Fit", "Average", "Curvy", "Muscular", "Plus Size", "Petite"];

const TOTAL_STEPS = 11; // No account creation — just qualification + contact

export function ApplicationForm() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Form state — 10 screens
  const [lifeWindow, setLifeWindow] = useState("");
  const [city, setCity] = useState("");
  const [profession, setProfession] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [ownEthnicity, setOwnEthnicity] = useState("");
  const [ownBodyType, setOwnBodyType] = useState("");
  const [duration, setDuration] = useState("");
  const [triedBefore, setTriedBefore] = useState("");
  const [currentResults, setCurrentResults] = useState("");
  const [priority, setPriority] = useState(0);
  const [idealPartner, setIdealPartner] = useState("");
  const [herAgeMin, setHerAgeMin] = useState("");
  const [herAgeMax, setHerAgeMax] = useState("");
  const [herEthnicities, setHerEthnicities] = useState<string[]>([]);
  const [herBodyTypes, setHerBodyTypes] = useState<string[]>([]);
  const [timeline, setTimeline] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [termsAgreed, setTermsAgreed] = useState(false);

  // Keyboard enter to advance
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && canAdvance() && !submitting) next();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  // Session persistence
  useEffect(() => {
    const saved = sessionStorage.getItem("pdc_apply");
    if (saved) {
      try {
        const d = JSON.parse(saved);
        if (d.lifeWindow) setLifeWindow(d.lifeWindow);
        if (d.city) setCity(d.city);
        if (d.profession) setProfession(d.profession);
        if (d.duration) setDuration(d.duration);
        if (d.triedBefore) setTriedBefore(d.triedBefore);
        if (d.currentResults) setCurrentResults(d.currentResults);
        if (d.priority) setPriority(d.priority);
        if (d.idealPartner) setIdealPartner(d.idealPartner);
        if (d.timeline) setTimeline(d.timeline);
        if (d.fullName) setFullName(d.fullName);
        if (d.phone) setPhone(d.phone);
        if (d.step) setStep(d.step);
      } catch {}
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem("pdc_apply", JSON.stringify({
      lifeWindow, city, profession, age, height, ownEthnicity, ownBodyType,
      duration, triedBefore, currentResults, priority, idealPartner,
      herAgeMin, herAgeMax, herEthnicities, herBodyTypes, timeline, fullName, phone, step,
    }));
  }, [lifeWindow, city, profession, age, height, ownEthnicity, ownBodyType, duration, triedBefore, currentResults, priority, idealPartner, herAgeMin, herAgeMax, herEthnicities, herBodyTypes, timeline, fullName, phone, step]);

  const canAdvance = (): boolean => {
    switch (step) {
      case 0: return !!lifeWindow;
      case 1: return city.trim().length >= 2;
      case 2: return profession.trim().length >= 2;
      case 3: return !!age && !!ownEthnicity && !!ownBodyType; // About You
      case 4: return !!duration;
      case 5: return !!triedBefore;
      case 6: return !!currentResults;
      case 7: return priority >= 1;
      case 8: return idealPartner.trim().length >= 10;
      case 9: return !!herAgeMin && !!herAgeMax && herEthnicities.length > 0; // Her Prefs
      case 10: return !!timeline;
      case 10: return fullName.trim().length >= 2 && email.includes("@") && phone.trim().length >= 7;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");

    const { tier, score } = scoreLead({ lifeWindow, duration, triedBefore, priority, profession });

    // No account creation — just save qualification data and book the call
    localStorage.setItem("pdc_application", JSON.stringify({
      full_name: fullName.trim(),
      email,
      phone: phone.trim(),
      city: city.trim(),
      profession: profession.trim(),
      age: age ? parseInt(age) : null,
      height: height.trim(),
      own_ethnicity: ownEthnicity,
      own_body_type: ownBodyType,
      life_window: lifeWindow,
      duration,
      tried_before: triedBefore,
      current_results: currentResults,
      priority_level: priority,
      ideal_partner: idealPartner.trim(),
      her_age_min: herAgeMin ? parseInt(herAgeMin) : null,
      her_age_max: herAgeMax ? parseInt(herAgeMax) : null,
      her_ethnicities: herEthnicities,
      her_body_types: herBodyTypes,
      timeline,
      lead_score: score,
      lead_tier: tier,
      submitted_at: new Date().toISOString(),
    }));

    sessionStorage.removeItem("pdc_apply");
    router.push("/apply/book");
  };

  const next = () => {
    if (step === TOTAL_STEPS - 1) handleSubmit();
    else setStep(step + 1);
  };

  const back = () => { if (step > 0) setStep(step - 1); };

  const Pill = ({ value, selected, onSelect, children }: {
    value: string; selected: string; onSelect: (v: string) => void; children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={`w-full text-left px-5 py-4 rounded-2xl transition-all duration-200 ${
        selected === value
          ? "bg-gold/15 border-2 border-gold text-on-surface shadow-lg shadow-gold/10"
          : "bg-surface-container-low border-2 border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high hover:border-outline-variant/50 hover:text-on-surface"
      }`}
    >
      {children}
    </button>
  );

  const progress = ((step + 1) / TOTAL_STEPS) * 100;
  const inputClass = "w-full bg-surface-container-low border-2 border-outline-variant/20 rounded-2xl px-5 py-4 text-on-surface text-lg placeholder:text-outline focus:border-gold/40 outline-none transition-colors";

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Progress bar */}
      <div className="fixed top-0 inset-x-0 z-50 h-1 bg-surface-container-high">
        <div className="h-full bg-gold transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
      </div>

      {/* Nav */}
      <div className="fixed top-4 left-4 z-50">
        {step > 0 ? (
          <button onClick={back} className="flex items-center gap-1 text-on-surface-variant text-sm hover:text-gold transition-colors">
            <span className="material-symbols-outlined text-lg">arrow_back</span> Back
          </button>
        ) : (
          <a href="/" className="flex items-center gap-1 text-on-surface-variant text-sm hover:text-gold transition-colors">
            <span className="material-symbols-outlined text-lg">arrow_back</span> Home
          </a>
        )}
      </div>
      <div className="fixed top-4 right-4 z-50">
        <span className="text-on-surface-variant text-xs">{step + 1} / {TOTAL_STEPS}</span>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-md space-y-8">

          {/* ═══ SCREEN 0: Life Window ═══ */}
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <p className="text-gold text-xs uppercase tracking-widest mb-2">Your Situation</p>
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-on-surface">What best describes your situation right now?</h2>
              </div>
              <div className="space-y-3">
                <Pill value="divorce" selected={lifeWindow} onSelect={setLifeWindow}><p className="font-medium">Just came out of a relationship or divorce</p></Pill>
                <Pill value="new_city" selected={lifeWindow} onSelect={setLifeWindow}><p className="font-medium">Moved to a new city in the last 12 months</p></Pill>
                <Pill value="milestone" selected={lifeWindow} onSelect={setLifeWindow}><p className="font-medium">Hitting a milestone (turning 35, 40, 45, 50)</p></Pill>
                <Pill value="career" selected={lifeWindow} onSelect={setLifeWindow}><p className="font-medium">Just had a career change or big promotion</p></Pill>
                <Pill value="none" selected={lifeWindow} onSelect={setLifeWindow}><p className="font-medium">None of these — just want better results</p></Pill>
              </div>
            </div>
          )}

          {/* ═══ SCREEN 1: City ═══ */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <p className="text-gold text-xs uppercase tracking-widest mb-2">Location</p>
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-on-surface">What city are you based in?</h2>
              </div>
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. New York" autoFocus className={inputClass} />
            </div>
          )}

          {/* ═══ SCREEN 2: Career ═══ */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <p className="text-gold text-xs uppercase tracking-widest mb-2">Career</p>
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-on-surface">What do you do professionally?</h2>
              </div>
              <input type="text" value={profession} onChange={(e) => setProfession(e.target.value)} placeholder="e.g. Tech Executive" autoFocus className={inputClass} />
            </div>
          )}

          {/* ═══ SCREEN 3: About You ═══ */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <p className="text-gold text-xs uppercase tracking-widest mb-2">About You</p>
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-on-surface">Tell us a bit about yourself</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-on-surface-variant text-xs">Age</label>
                  <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="32" className={inputClass.replace("text-lg", "text-base")} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-on-surface-variant text-xs">Height</label>
                  <input type="text" value={height} onChange={(e) => setHeight(e.target.value)} placeholder={`5'10" or 178cm`} className={inputClass.replace("text-lg", "text-base")} />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-on-surface-variant text-xs">Your Ethnicity</label>
                <div className="flex flex-wrap gap-2">
                  {ETHNICITY_OPTIONS.map((opt) => (
                    <button key={opt} type="button" onClick={() => setOwnEthnicity(opt)}
                      className={`px-3 py-2 rounded-full text-xs font-medium transition-all ${ownEthnicity === opt ? "bg-gold text-on-gold shadow-md" : "bg-surface-container-low border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high"}`}
                    >{opt}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-on-surface-variant text-xs">Your Body Type</label>
                <div className="flex flex-wrap gap-2">
                  {BODY_TYPE_OPTIONS.map((opt) => (
                    <button key={opt} type="button" onClick={() => setOwnBodyType(opt)}
                      className={`px-3 py-2 rounded-full text-xs font-medium transition-all ${ownBodyType === opt ? "bg-gold text-on-gold shadow-md" : "bg-surface-container-low border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high"}`}
                    >{opt}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══ SCREEN 4: Duration ═══ */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <p className="text-gold text-xs uppercase tracking-widest mb-2">Duration</p>
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-on-surface">How long have you been unsatisfied with your dating life?</h2>
              </div>
              <div className="space-y-3">
                <Pill value="less_than_3" selected={duration} onSelect={setDuration}><p className="font-medium">Less than 3 months</p></Pill>
                <Pill value="3_6" selected={duration} onSelect={setDuration}><p className="font-medium">3–6 months</p></Pill>
                <Pill value="6_12" selected={duration} onSelect={setDuration}><p className="font-medium">6–12 months</p></Pill>
                <Pill value="1_2_years" selected={duration} onSelect={setDuration}><p className="font-medium">1–2 years</p></Pill>
                <Pill value="3_plus_years" selected={duration} onSelect={setDuration}><p className="font-medium">3+ years</p></Pill>
              </div>
            </div>
          )}

          {/* ═══ SCREEN 5: Tried Before ═══ */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <p className="text-gold text-xs uppercase tracking-widest mb-2">Prior Attempts</p>
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-on-surface">What have you tried so far to improve your dating life?</h2>
              </div>
              <div className="space-y-3">
                <Pill value="nothing" selected={triedBefore} onSelect={setTriedBefore}><p className="font-medium">Nothing yet — this is my first step</p></Pill>
                <Pill value="apps" selected={triedBefore} onSelect={setTriedBefore}><p className="font-medium">Dating apps (Hinge, Bumble, Tinder, etc.)</p></Pill>
                <Pill value="photos" selected={triedBefore} onSelect={setTriedBefore}><p className="font-medium">Professional photos / profile optimization</p></Pill>
                <Pill value="matchmaker" selected={triedBefore} onSelect={setTriedBefore}><p className="font-medium">A matchmaking service or dating coach</p></Pill>
                <Pill value="multiple" selected={triedBefore} onSelect={setTriedBefore}><p className="font-medium">Multiple things — nothing has worked</p></Pill>
              </div>
            </div>
          )}

          {/* ═══ SCREEN 6: Current Results ═══ */}
          {step === 6 && (
            <div className="space-y-6">
              <div>
                <p className="text-gold text-xs uppercase tracking-widest mb-2">Current State</p>
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-on-surface">How many quality dates are you getting per month right now?</h2>
              </div>
              <div className="space-y-3">
                <Pill value="none" selected={currentResults} onSelect={setCurrentResults}><p className="font-medium">None — I&apos;m not dating at all</p></Pill>
                <Pill value="0_1" selected={currentResults} onSelect={setCurrentResults}><p className="font-medium">0–1 dates, but they&apos;re not great</p></Pill>
                <Pill value="2_3" selected={currentResults} onSelect={setCurrentResults}><p className="font-medium">2–3 dates, but not the quality I want</p></Pill>
                <Pill value="4_plus" selected={currentResults} onSelect={setCurrentResults}><p className="font-medium">4+ dates, but I want better matches</p></Pill>
              </div>
            </div>
          )}

          {/* ═══ SCREEN 7: Priority Level ═══ */}
          {step === 7 && (
            <div className="space-y-6">
              <div>
                <p className="text-gold text-xs uppercase tracking-widest mb-2">Priority</p>
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-on-surface">On a scale of 1–10, how much of a priority is fixing your dating life right now?</h2>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPriority(n)}
                    className={`py-4 rounded-xl font-heading text-lg font-bold transition-all duration-200 ${
                      priority === n
                        ? "bg-gold text-on-gold shadow-lg shadow-gold/20"
                        : "bg-surface-container-low border-2 border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-on-surface-variant">
                <span>Not a priority</span>
                <span>Top priority</span>
              </div>
            </div>
          )}

          {/* ═══ SCREEN 8: Ideal Partner ═══ */}
          {step === 8 && (
            <div className="space-y-6">
              <div>
                <p className="text-gold text-xs uppercase tracking-widest mb-2">Your Type</p>
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-on-surface">Describe what you&apos;re looking for — age range, type, what matters most.</h2>
              </div>
              <textarea
                value={idealPartner}
                onChange={(e) => setIdealPartner(e.target.value)}
                placeholder="e.g. Late 20s to mid 30s, professional, takes care of herself. Preferably into fitness and travel. Open to different backgrounds."
                rows={4}
                autoFocus
                className="w-full bg-surface-container-low border-2 border-outline-variant/20 rounded-2xl px-5 py-4 text-on-surface text-base placeholder:text-outline focus:border-gold/40 outline-none transition-colors resize-none"
              />
              <p className="text-on-surface-variant text-xs">The more specific you are, the better we can calibrate before your call.</p>
            </div>
          )}

          {/* ═══ SCREEN 9: Her Preferences ═══ */}
          {step === 9 && (
            <div className="space-y-6">
              <div>
                <p className="text-gold text-xs uppercase tracking-widest mb-2">Her Details</p>
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-on-surface">What are you looking for specifically?</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-on-surface-variant text-xs">Her Age (Min)</label>
                  <input type="number" value={herAgeMin} onChange={(e) => setHerAgeMin(e.target.value)} placeholder="25" className={inputClass.replace("text-lg", "text-base")} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-on-surface-variant text-xs">Her Age (Max)</label>
                  <input type="number" value={herAgeMax} onChange={(e) => setHerAgeMax(e.target.value)} placeholder="35" className={inputClass.replace("text-lg", "text-base")} />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-on-surface-variant text-xs">Ethnicity Preferences (select all that apply)</label>
                <div className="flex flex-wrap gap-2">
                  {[...ETHNICITY_OPTIONS, "No Preference"].map((opt) => (
                    <button key={opt} type="button"
                      onClick={() => {
                        if (opt === "No Preference") { setHerEthnicities(["No Preference"]); return; }
                        setHerEthnicities((prev) => {
                          const filtered = prev.filter((e) => e !== "No Preference");
                          return filtered.includes(opt) ? filtered.filter((e) => e !== opt) : [...filtered, opt];
                        });
                      }}
                      className={`px-3 py-2 rounded-full text-xs font-medium transition-all ${herEthnicities.includes(opt) ? "bg-gold text-on-gold shadow-md" : "bg-surface-container-low border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high"}`}
                    >{opt}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-on-surface-variant text-xs">Body Type Preferences (select all that apply)</label>
                <div className="flex flex-wrap gap-2">
                  {[...BODY_TYPE_OPTIONS, "No Preference"].map((opt) => (
                    <button key={opt} type="button"
                      onClick={() => {
                        if (opt === "No Preference") { setHerBodyTypes(["No Preference"]); return; }
                        setHerBodyTypes((prev) => {
                          const filtered = prev.filter((e) => e !== "No Preference");
                          return filtered.includes(opt) ? filtered.filter((e) => e !== opt) : [...filtered, opt];
                        });
                      }}
                      className={`px-3 py-2 rounded-full text-xs font-medium transition-all ${herBodyTypes.includes(opt) ? "bg-gold text-on-gold shadow-md" : "bg-surface-container-low border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high"}`}
                    >{opt}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══ SCREEN 10: Contact Info (Final) ═══ */}
          {step === 10 && (
            <div className="space-y-6">
              <div>
                <p className="text-gold text-xs uppercase tracking-widest mb-2">Final Step</p>
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-on-surface">Where should we reach you?</h2>
                <p className="text-on-surface-variant text-sm mt-2">We&apos;ll text you to confirm your consultation time.</p>
              </div>
              <div className="space-y-4">
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" autoFocus className={inputClass.replace("text-lg", "text-base")} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className={inputClass.replace("text-lg", "text-base")} />
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone / WhatsApp" className={inputClass.replace("text-lg", "text-base")} />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Continue */}
          <button
            onClick={next}
            disabled={!canAdvance() || submitting}
            className={`w-full py-4 rounded-full font-semibold text-base transition-all duration-300 ${
              canAdvance() && !submitting
                ? "gold-gradient text-on-gold hover:opacity-90 shadow-lg"
                : "bg-surface-container-high text-outline cursor-not-allowed"
            }`}
          >
            {submitting ? "Creating your account..." : step === TOTAL_STEPS - 1 ? "Submit Application" : "Continue"}
          </button>

          {canAdvance() && !submitting && step < TOTAL_STEPS - 1 && (
            <p className="text-center text-outline text-xs hidden md:block">
              or press <kbd className="bg-surface-container-high px-1.5 py-0.5 rounded text-on-surface-variant">Enter</kbd>
            </p>
          )}
        </div>
      </div>

      {/* Brand footer */}
      <div className="text-center pb-6">
        <img src="/logo.png" alt="Private Dating Concierge" className="h-4 w-auto mx-auto opacity-30" />
      </div>
    </div>
  );
}
