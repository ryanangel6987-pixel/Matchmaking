"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

/* ------------------------------------------------------------------ */
/*  Lead Scoring                                                       */
/* ------------------------------------------------------------------ */

const QUALIFYING_CAREERS = [
  "tech", "software", "engineer", "developer", "founder", "ceo", "cto", "coo",
  "entrepreneur", "startup", "medicine", "doctor", "surgeon", "physician",
  "dentist", "finance", "banking", "investment", "trader", "analyst",
  "sales", "consulting", "consultant", "real estate", "marketing",
  "attorney", "lawyer", "legal", "executive", "director", "vp", "president",
  "manager", "partner", "architect", "data scientist", "product",
];

function isQualifyingCareer(p: string): boolean {
  const l = p.toLowerCase();
  return QUALIFYING_CAREERS.some((k) => l.includes(k));
}

function scoreLead(d: { lifeWindow: string; duration: string; triedBefore: string; priority: number; profession: string; income: string; shape: string }) {
  if (d.income === "no" || d.shape === "no") return { tier: "likely_unqualified" as const, score: 0 };
  if (d.priority <= 3) return { tier: "likely_unqualified" as const, score: d.priority };

  let high = 0;
  if (["6_12", "1_2_years", "3_plus_years", "3_6"].includes(d.duration)) high++;
  if (["apps", "photos", "matchmaker", "multiple"].includes(d.triedBefore)) high++;
  if (d.priority >= 8) high++;
  if (isQualifyingCareer(d.profession)) high++;
  if (["divorce", "new_city", "milestone", "career", "frustrated", "all"].includes(d.lifeWindow)) high++;

  return high >= 3
    ? { tier: "high" as const, score: high * 10 + d.priority }
    : { tier: "medium" as const, score: high * 10 + d.priority };
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const ETHNICITY_OPTIONS = [
  "White / Caucasian", "Black / African American", "East Asian", "South Asian",
  "Southeast Asian", "Hispanic / Latino", "Middle Eastern", "Pacific Islander",
  "Mixed / Multiracial", "Other",
];
const BODY_TYPE_OPTIONS = ["Slim", "Athletic / Fit", "Average", "Curvy", "Muscular", "Plus Size", "Petite"];

const TOTAL_STEPS = 14;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ApplicationForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // State
  const [intent, setIntent] = useState("");
  const [lifeWindow, setLifeWindow] = useState("");
  const [city, setCity] = useState("");
  const [profession, setProfession] = useState("");
  const [income, setIncome] = useState("");
  const [shape, setShape] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [ownEthnicity, setOwnEthnicity] = useState("");
  const [ownBodyType, setOwnBodyType] = useState("");
  const [biggestChallenge, setBiggestChallenge] = useState("");
  const [challengeNotes, setChallengeNotes] = useState("");
  const [duration, setDuration] = useState("");
  const [triedBefore, setTriedBefore] = useState("");
  const [currentResults, setCurrentResults] = useState("");
  const [priority, setPriority] = useState(0);
  const [herAgeMin, setHerAgeMin] = useState("");
  const [herAgeMax, setHerAgeMax] = useState("");
  const [herEthnicities, setHerEthnicities] = useState<string[]>([]);
  const [herBodyTypes, setHerBodyTypes] = useState<string[]>([]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Keyboard
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Enter" && canAdvance() && !submitting) next(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });

  // Session persistence
  useEffect(() => {
    try {
      const s = sessionStorage.getItem("pdc_apply");
      if (s) { const d = JSON.parse(s); Object.entries(d).forEach(([k, v]) => {
        const setters: Record<string, any> = { intent: setIntent, lifeWindow: setLifeWindow, city: setCity, profession: setProfession, income: setIncome, shape: setShape, age: setAge, height: setHeight, weight: setWeight, ownEthnicity: setOwnEthnicity, ownBodyType: setOwnBodyType, biggestChallenge: setBiggestChallenge, challengeNotes: setChallengeNotes, duration: setDuration, triedBefore: setTriedBefore, currentResults: setCurrentResults, priority: setPriority, herAgeMin: setHerAgeMin, herAgeMax: setHerAgeMax, herEthnicities: setHerEthnicities, herBodyTypes: setHerBodyTypes, fullName: setFullName, phone: setPhone, step: setStep };
        if (setters[k] && v) setters[k](v);
      }); }
    } catch {}
  }, []);

  useEffect(() => {
    sessionStorage.setItem("pdc_apply", JSON.stringify({ intent, lifeWindow, city, profession, income, shape, age, height, weight, ownEthnicity, ownBodyType, biggestChallenge, challengeNotes, duration, triedBefore, currentResults, priority, herAgeMin, herAgeMax, herEthnicities, herBodyTypes, fullName, phone, step }));
  }, [intent, lifeWindow, city, profession, income, shape, age, height, weight, ownEthnicity, ownBodyType, biggestChallenge, challengeNotes, duration, triedBefore, currentResults, priority, herAgeMin, herAgeMax, herEthnicities, herBodyTypes, fullName, phone, step]);

  const canAdvance = (): boolean => {
    switch (step) {
      case 0: return !!intent;
      case 1: return !!lifeWindow;
      case 2: return city.trim().length >= 2;
      case 3: return profession.trim().length >= 2;
      case 4: return !!income;
      case 5: return !!shape;
      case 6: return !!age && !!ownEthnicity && !!ownBodyType;
      case 7: return !!biggestChallenge;
      case 8: return !!duration;
      case 9: return !!triedBefore;
      case 10: return !!currentResults;
      case 11: return priority >= 1;
      case 12: return !!herAgeMin && !!herAgeMax && herEthnicities.length > 0;
      case 13: return fullName.trim().length >= 2 && email.includes("@") && phone.trim().length >= 7;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    const { tier, score } = scoreLead({ lifeWindow, duration, triedBefore, priority, profession, income, shape });

    const payload = {
      full_name: fullName.trim(), email, phone: phone.trim(), city: city.trim(), profession: profession.trim(),
      age: age ? parseInt(age) : null, height: height.trim(), weight: weight.trim(),
      own_ethnicity: ownEthnicity, own_body_type: ownBodyType,
      intent, life_window: lifeWindow, income_qualified: income, shape_qualified: shape,
      biggest_challenge: biggestChallenge, challenge_notes: challengeNotes.trim(),
      duration, tried_before: triedBefore, current_results: currentResults,
      priority_level: priority, ideal_partner: "",
      her_age_min: herAgeMin ? parseInt(herAgeMin) : null, her_age_max: herAgeMax ? parseInt(herAgeMax) : null,
      her_ethnicities: herEthnicities, her_body_types: herBodyTypes,
      lead_score: score, lead_tier: tier, submitted_at: new Date().toISOString(),
    };

    try {
      const res = await fetch("/api/applications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) { const d = await res.json(); if (!d.error?.includes("duplicate")) { setError(d.error || "Failed to submit."); setSubmitting(false); return; } }
    } catch {}

    localStorage.setItem("pdc_application", JSON.stringify(payload));
    sessionStorage.removeItem("pdc_apply");
    router.push("/apply/book");
  };

  const next = () => {
    // Disqualification gates
    if (step === 4 && income === "no") { router.push("/?dq=income"); return; }
    if (step === 5 && shape === "no") { router.push("/?dq=shape"); return; }
    if (step === TOTAL_STEPS - 1) handleSubmit();
    else setStep(step + 1);
  };

  const back = () => { if (step > 0) setStep(step - 1); };

  // UI helpers
  const Pill = ({ value, selected, onSelect, children }: { value: string; selected: string; onSelect: (v: string) => void; children: React.ReactNode }) => (
    <button type="button" onClick={() => onSelect(value)}
      className={`w-full text-left px-5 py-4 rounded-2xl transition-all duration-200 ${selected === value ? "bg-gold/15 border-2 border-gold text-on-surface shadow-lg shadow-gold/10" : "bg-surface-container-low border-2 border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high hover:border-outline-variant/50 hover:text-on-surface"}`}
    >{children}</button>
  );

  const MultiPill = ({ options, selected, onChange, noPreference }: { options: string[]; selected: string[]; onChange: (v: string[]) => void; noPreference?: boolean }) => (
    <div className="flex flex-wrap gap-2">
      {[...options, ...(noPreference ? ["No Preference"] : [])].map((opt) => (
        <button key={opt} type="button"
          onClick={() => {
            if (opt === "No Preference") { onChange(["No Preference"]); return; }
            const f = selected.filter((e) => e !== "No Preference");
            onChange(f.includes(opt) ? f.filter((e) => e !== opt) : [...f, opt]);
          }}
          className={`px-3 py-2 rounded-full text-xs font-medium transition-all ${selected.includes(opt) ? "bg-gold text-on-gold shadow-md" : "bg-surface-container-low border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high"}`}
        >{opt}</button>
      ))}
    </div>
  );

  const progress = ((step + 1) / TOTAL_STEPS) * 100;
  const ic = "w-full bg-surface-container-low border-2 border-outline-variant/20 rounded-2xl px-5 py-4 text-on-surface placeholder:text-outline focus:border-gold/40 outline-none transition-colors";

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <div className="fixed top-0 inset-x-0 z-50 h-1 bg-surface-container-high">
        <div className="h-full bg-gold transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
      </div>
      <div className="fixed top-4 left-4 z-50">
        {step > 0 ? <button onClick={back} className="flex items-center gap-1 text-on-surface-variant text-sm hover:text-gold transition-colors"><span className="material-symbols-outlined text-lg">arrow_back</span>Back</button>
          : <a href="/" className="flex items-center gap-1 text-on-surface-variant text-sm hover:text-gold transition-colors"><span className="material-symbols-outlined text-lg">arrow_back</span>Home</a>}
      </div>
      <div className="fixed top-4 right-4 z-50"><span className="text-on-surface-variant text-xs">{step + 1} / {TOTAL_STEPS}</span></div>

      <div className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-md space-y-8">

          {/* 0: Intent */}
          {step === 0 && <Q label="Getting Started" title="What interested you in this service?">
            <div className="space-y-3">
              <Pill value="split" selected={intent} onSelect={setIntent}><p className="font-medium">Recent split — want to get back in the game</p></Pill>
              <Pill value="age" selected={intent} onSelect={setIntent}><p className="font-medium">Hit the age where I feel behind</p></Pill>
              <Pill value="career_success" selected={intent} onSelect={setIntent}><p className="font-medium">Got career success and want something meaningful</p></Pill>
              <Pill value="alone" selected={intent} onSelect={setIntent}><p className="font-medium">Been alone for a while with no luck</p></Pill>
              <Pill value="quality" selected={intent} onSelect={setIntent}><p className="font-medium">Don&apos;t want to settle — want quality weekly options</p></Pill>
              <Pill value="all" selected={intent} onSelect={setIntent}><p className="font-medium">All / most of the above</p></Pill>
            </div>
          </Q>}

          {/* 1: Life Window */}
          {step === 1 && <Q label="Your Situation" title="What best describes your situation right now?">
            <div className="space-y-3">
              <Pill value="divorce" selected={lifeWindow} onSelect={setLifeWindow}><p className="font-medium">Just came out of a relationship or divorce</p></Pill>
              <Pill value="new_city" selected={lifeWindow} onSelect={setLifeWindow}><p className="font-medium">Moved to a new city in the last 12 months</p></Pill>
              <Pill value="milestone" selected={lifeWindow} onSelect={setLifeWindow}><p className="font-medium">Hitting a milestone (turning 35, 40, 45, 50)</p></Pill>
              <Pill value="career" selected={lifeWindow} onSelect={setLifeWindow}><p className="font-medium">Just had a career change or big promotion</p></Pill>
              <Pill value="frustrated" selected={lifeWindow} onSelect={setLifeWindow}><p className="font-medium">Frustrated wasting money and time on low quality dates below my level</p></Pill>
              <Pill value="none" selected={lifeWindow} onSelect={setLifeWindow}><p className="font-medium">None of these — just want better results</p></Pill>
              <Pill value="all" selected={lifeWindow} onSelect={setLifeWindow}><p className="font-medium">All / most of the above</p></Pill>
            </div>
          </Q>}

          {/* 2: City */}
          {step === 2 && <Q label="Location" title="What city are you based in?">
            <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. New York" autoFocus className={`${ic} text-lg`} />
          </Q>}

          {/* 3: Career */}
          {step === 3 && <Q label="Career" title="What do you do professionally?">
            <input type="text" value={profession} onChange={(e) => setProfession(e.target.value)} placeholder="e.g. Tech Executive" autoFocus className={`${ic} text-lg`} />
          </Q>}

          {/* 4: Income Gate */}
          {step === 4 && <Q label="Qualification" title="Are you a professional or entrepreneur making at least $100K/year?">
            <div className="space-y-3">
              <Pill value="yes" selected={income} onSelect={setIncome}><p className="font-medium">Yes</p></Pill>
              <Pill value="no" selected={income} onSelect={setIncome}><p className="font-medium">No</p></Pill>
            </div>
          </Q>}

          {/* 5: Shape Gate */}
          {step === 5 && <Q label="Qualification" title="Are you in at least average physical shape?">
            <div className="space-y-3">
              <Pill value="yes" selected={shape} onSelect={setShape}><p className="font-medium">Yes, I&apos;m in good shape</p></Pill>
              <Pill value="working" selected={shape} onSelect={setShape}><p className="font-medium">I&apos;m working on it but getting there</p></Pill>
              <Pill value="no" selected={shape} onSelect={setShape}><p className="font-medium">No, this isn&apos;t a focus right now</p></Pill>
            </div>
          </Q>}

          {/* 6: About You */}
          {step === 6 && <Q label="About You" title="Tell us a bit about yourself">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1"><label className="text-on-surface-variant text-xs">Age</label><input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="32" className={`${ic} text-base`} /></div>
                <div className="space-y-1"><label className="text-on-surface-variant text-xs">Height</label><input type="text" value={height} onChange={(e) => setHeight(e.target.value)} placeholder={`5'10"`} className={`${ic} text-base`} /></div>
                <div className="space-y-1"><label className="text-on-surface-variant text-xs">Weight</label><input type="text" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="180 lbs" className={`${ic} text-base`} /></div>
              </div>
              <div className="space-y-2">
                <label className="text-on-surface-variant text-xs">Your Ethnicity</label>
                <div className="flex flex-wrap gap-2">
                  {ETHNICITY_OPTIONS.map((o) => <button key={o} type="button" onClick={() => setOwnEthnicity(o)} className={`px-3 py-2 rounded-full text-xs font-medium transition-all ${ownEthnicity === o ? "bg-gold text-on-gold shadow-md" : "bg-surface-container-low border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high"}`}>{o}</button>)}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-on-surface-variant text-xs">Your Body Type</label>
                <div className="flex flex-wrap gap-2">
                  {BODY_TYPE_OPTIONS.map((o) => <button key={o} type="button" onClick={() => setOwnBodyType(o)} className={`px-3 py-2 rounded-full text-xs font-medium transition-all ${ownBodyType === o ? "bg-gold text-on-gold shadow-md" : "bg-surface-container-low border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high"}`}>{o}</button>)}
                </div>
              </div>
            </div>
          </Q>}

          {/* 7: Problem */}
          {step === 7 && <Q label="The Problem" title="What's the biggest challenge you're facing with dating right now?">
            <div className="space-y-3">
              <Pill value="no_time" selected={biggestChallenge} onSelect={setBiggestChallenge}><p className="font-medium">I don&apos;t have time to manage dating apps</p></Pill>
              <Pill value="low_quality" selected={biggestChallenge} onSelect={setBiggestChallenge}><p className="font-medium">The quality of matches doesn&apos;t match my standards</p></Pill>
              <Pill value="bad_profile" selected={biggestChallenge} onSelect={setBiggestChallenge}><p className="font-medium">My profile doesn&apos;t represent who I actually am</p></Pill>
              <Pill value="no_dates" selected={biggestChallenge} onSelect={setBiggestChallenge}><p className="font-medium">I&apos;m not converting matches into actual dates</p></Pill>
              <Pill value="starting_over" selected={biggestChallenge} onSelect={setBiggestChallenge}><p className="font-medium">I&apos;m starting over and don&apos;t know where to begin</p></Pill>
              <Pill value="all_above" selected={biggestChallenge} onSelect={setBiggestChallenge}><p className="font-medium">All of the above</p></Pill>
            </div>
            <textarea value={challengeNotes} onChange={(e) => setChallengeNotes(e.target.value)} placeholder="Tell us more — why do you feel you haven't had success? What's been missing? (optional)" rows={3}
              className="w-full bg-surface-container-low border-2 border-outline-variant/20 rounded-2xl px-5 py-4 text-on-surface text-sm placeholder:text-outline focus:border-gold/40 outline-none transition-colors resize-none mt-4" />
          </Q>}

          {/* 8: Duration */}
          {step === 8 && <Q label="Duration" title="How long has this been an issue?">
            <div className="space-y-3">
              <Pill value="less_than_3" selected={duration} onSelect={setDuration}><p className="font-medium">Less than 3 months</p></Pill>
              <Pill value="3_6" selected={duration} onSelect={setDuration}><p className="font-medium">3–6 months</p></Pill>
              <Pill value="6_12" selected={duration} onSelect={setDuration}><p className="font-medium">6–12 months</p></Pill>
              <Pill value="1_2_years" selected={duration} onSelect={setDuration}><p className="font-medium">1–2 years</p></Pill>
              <Pill value="3_plus_years" selected={duration} onSelect={setDuration}><p className="font-medium">3+ years</p></Pill>
            </div>
          </Q>}

          {/* 9: Tried Before */}
          {step === 9 && <Q label="Prior Attempts" title="What have you tried so far to improve your dating life?">
            <div className="space-y-3">
              <Pill value="nothing" selected={triedBefore} onSelect={setTriedBefore}><p className="font-medium">Nothing yet — this is my first step</p></Pill>
              <Pill value="apps" selected={triedBefore} onSelect={setTriedBefore}><p className="font-medium">Dating apps (Hinge, Bumble, Tinder, etc.)</p></Pill>
              <Pill value="photos" selected={triedBefore} onSelect={setTriedBefore}><p className="font-medium">Professional photos / profile optimization</p></Pill>
              <Pill value="matchmaker" selected={triedBefore} onSelect={setTriedBefore}><p className="font-medium">A matchmaking service or dating coach</p></Pill>
              <Pill value="multiple" selected={triedBefore} onSelect={setTriedBefore}><p className="font-medium">Multiple things — nothing has worked</p></Pill>
            </div>
          </Q>}

          {/* 10: Current Results */}
          {step === 10 && <Q label="Current State" title="How many quality dates are you getting per month right now?">
            <div className="space-y-3">
              <Pill value="none" selected={currentResults} onSelect={setCurrentResults}><p className="font-medium">None — I&apos;m not dating at all</p></Pill>
              <Pill value="0_1" selected={currentResults} onSelect={setCurrentResults}><p className="font-medium">0–1 dates, but they&apos;re not great</p></Pill>
              <Pill value="2_3" selected={currentResults} onSelect={setCurrentResults}><p className="font-medium">2–3 dates, but not the quality I want</p></Pill>
              <Pill value="4_plus" selected={currentResults} onSelect={setCurrentResults}><p className="font-medium">4+ dates, but I want better matches</p></Pill>
            </div>
          </Q>}

          {/* 11: Priority */}
          {step === 11 && <Q label="Priority" title="On a scale of 1–10, how much of a priority is handling this right now?">
            <div className="grid grid-cols-5 gap-2">
              {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                <button key={n} type="button" onClick={() => setPriority(n)}
                  className={`py-4 rounded-xl font-heading text-lg font-bold transition-all duration-200 ${priority === n ? "bg-gold text-on-gold shadow-lg shadow-gold/20" : "bg-surface-container-low border-2 border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"}`}
                >{n}</button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-on-surface-variant"><span>Not a priority</span><span>Top priority</span></div>
          </Q>}

          {/* 12: Her Prefs */}
          {step === 12 && <Q label="Your Type" title="Tell us about your ideal partner">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><label className="text-on-surface-variant text-xs">Her Age (Min)</label><input type="number" value={herAgeMin} onChange={(e) => setHerAgeMin(e.target.value)} placeholder="25" className={`${ic} text-base`} /></div>
                <div className="space-y-1"><label className="text-on-surface-variant text-xs">Her Age (Max)</label><input type="number" value={herAgeMax} onChange={(e) => setHerAgeMax(e.target.value)} placeholder="35" className={`${ic} text-base`} /></div>
              </div>
              <div className="space-y-2">
                <label className="text-on-surface-variant text-xs">Ethnicity Preferences (select all that apply)</label>
                <MultiPill options={ETHNICITY_OPTIONS} selected={herEthnicities} onChange={setHerEthnicities} noPreference />
              </div>
              <div className="space-y-2">
                <label className="text-on-surface-variant text-xs">Body Type Preferences (select all that apply)</label>
                <MultiPill options={BODY_TYPE_OPTIONS} selected={herBodyTypes} onChange={setHerBodyTypes} noPreference />
              </div>
            </div>
          </Q>}

          {/* 13: Contact */}
          {step === 13 && <Q label="Final Step" title="Where should we reach you?" sub="We'll text you to confirm your consultation time.">
            <div className="space-y-4">
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" autoFocus className={`${ic} text-base`} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className={`${ic} text-base`} />
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number" className={`${ic} text-base`} />
            </div>
          </Q>}

          {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3"><p className="text-red-400 text-sm">{error}</p></div>}

          <button onClick={next} disabled={!canAdvance() || submitting}
            className={`w-full py-4 rounded-full font-semibold text-base transition-all duration-300 ${canAdvance() && !submitting ? "gold-gradient text-on-gold hover:opacity-90 shadow-lg" : "bg-surface-container-high text-outline cursor-not-allowed"}`}
          >{submitting ? "Submitting..." : step === TOTAL_STEPS - 1 ? "Submit Application" : "Continue"}</button>

          {canAdvance() && !submitting && step < TOTAL_STEPS - 1 && (
            <p className="text-center text-outline text-xs hidden md:block">or press <kbd className="bg-surface-container-high px-1.5 py-0.5 rounded text-on-surface-variant">Enter</kbd></p>
          )}
        </div>
      </div>
      <div className="text-center pb-6"><img src="/logo.png" alt="Private Dating Concierge" className="h-4 w-auto mx-auto opacity-30" /></div>
    </div>
  );
}

function Q({ label, title, sub, children }: { label: string; title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-gold text-xs uppercase tracking-widest mb-2">{label}</p>
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-on-surface">{title}</h2>
        {sub && <p className="text-on-surface-variant text-sm mt-2">{sub}</p>}
      </div>
      {children}
    </div>
  );
}
