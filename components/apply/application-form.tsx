"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/* ------------------------------------------------------------------ */
/*  Lead Scoring (from Ad Qualification Guide)                         */
/* ------------------------------------------------------------------ */

const LIFE_WINDOW_SCORES: Record<string, number> = {
  divorce: 30,
  new_city: 25,
  milestone: 20,
  career: 20,
  none: 5,
};

const TIME_SCORES: Record<string, number> = {
  less_than_2: 5,
  "2_5": 10,
  "5_10": 20,
  "10_plus": 30,
  given_up: 25,
};

const COMMITMENT_SCORES: Record<string, number> = {
  immediately: 30,
  within_month: 15,
  exploring: 5,
  curious: 0,
};

function getLeadTier(score: number): string {
  if (score >= 70) return "green";
  if (score >= 40) return "yellow";
  if (score >= 15) return "red";
  return "dead";
}

/* ------------------------------------------------------------------ */
/*  Form Steps                                                         */
/* ------------------------------------------------------------------ */

const TOTAL_STEPS = 7;

export function ApplicationForm() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [lifeWindow, setLifeWindow] = useState("");
  const [timeInvestment, setTimeInvestment] = useState("");
  const [commitment, setCommitment] = useState("");
  const [city, setCity] = useState("");
  const [profession, setProfession] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [termsAgreed, setTermsAgreed] = useState(false);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && canAdvance() && !submitting) {
        next();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  // Persist to sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem("pdc_apply");
    if (saved) {
      try {
        const d = JSON.parse(saved);
        if (d.lifeWindow) setLifeWindow(d.lifeWindow);
        if (d.timeInvestment) setTimeInvestment(d.timeInvestment);
        if (d.commitment) setCommitment(d.commitment);
        if (d.city) setCity(d.city);
        if (d.profession) setProfession(d.profession);
        if (d.fullName) setFullName(d.fullName);
        if (d.phone) setPhone(d.phone);
        if (d.step) setStep(d.step);
      } catch {}
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem("pdc_apply", JSON.stringify({
      lifeWindow, timeInvestment, commitment, city, profession, fullName, phone, step,
    }));
  }, [lifeWindow, timeInvestment, commitment, city, profession, fullName, phone, step]);

  const canAdvance = (): boolean => {
    switch (step) {
      case 0: return !!lifeWindow;
      case 1: return !!timeInvestment;
      case 2: return !!commitment;
      case 3: return city.trim().length >= 2;
      case 4: return profession.trim().length >= 2;
      case 5: return fullName.trim().length >= 2 && email.includes("@") && password.length >= 8;
      case 6: return phone.trim().length >= 7 && termsAgreed;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");

    const score = (LIFE_WINDOW_SCORES[lifeWindow] ?? 0) +
      (TIME_SCORES[timeInvestment] ?? 0) +
      (COMMITMENT_SCORES[commitment] ?? 0);
    const tier = getLeadTier(score);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          phone: phone.trim(),
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setSubmitting(false);
      return;
    }

    // Save qualification data + light context to localStorage for booking page
    const payload = {
      full_name: fullName.trim(),
      email,
      phone: phone.trim(),
      city: city.trim(),
      profession: profession.trim(),
      life_window: lifeWindow,
      time_investment: timeInvestment,
      commitment_level: commitment,
      lead_score: score,
      lead_tier: tier,
      submitted_at: new Date().toISOString(),
    };

    localStorage.setItem("pdc_application", JSON.stringify(payload));
    sessionStorage.removeItem("pdc_apply");

    router.push("/apply/book");
  };

  const next = () => {
    if (step === TOTAL_STEPS - 1) {
      handleSubmit();
    } else {
      setStep(step + 1);
    }
  };

  const back = () => {
    if (step > 0) setStep(step - 1);
  };

  // Pill button for single-select options
  const Pill = ({ value, selected, onSelect, children }: {
    value: string; selected: string; onSelect: (v: string) => void; children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={`w-full text-left px-5 py-4 rounded-2xl transition-all duration-200 ${
        selected === value
          ? "bg-gold/15 border-2 border-gold/40 text-on-surface"
          : "bg-surface-container-low border-2 border-transparent text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
      }`}
    >
      {children}
    </button>
  );

  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Progress bar */}
      <div className="fixed top-0 inset-x-0 z-50 h-1 bg-surface-container-high">
        <div
          className="h-full bg-gold transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Back button */}
      <div className="fixed top-4 left-4 z-50">
        {step > 0 ? (
          <button onClick={back} className="flex items-center gap-1 text-on-surface-variant text-sm hover:text-gold transition-colors">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back
          </button>
        ) : (
          <a href="/" className="flex items-center gap-1 text-on-surface-variant text-sm hover:text-gold transition-colors">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Home
          </a>
        )}
      </div>

      {/* Step counter */}
      <div className="fixed top-4 right-4 z-50">
        <span className="text-on-surface-variant text-xs">{step + 1} / {TOTAL_STEPS}</span>
      </div>

      {/* Content area — centered, mobile-first */}
      <div className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-md space-y-8">

          {/* ═══ STEP 0: Life Window ═══ */}
          {step === 0 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <p className="text-gold text-xs uppercase tracking-widest mb-2">Your Situation</p>
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-on-surface">
                  What best describes your situation right now?
                </h2>
              </div>
              <div className="space-y-3">
                <Pill value="divorce" selected={lifeWindow} onSelect={setLifeWindow}>
                  <p className="font-medium">Just came out of a relationship or divorce</p>
                </Pill>
                <Pill value="new_city" selected={lifeWindow} onSelect={setLifeWindow}>
                  <p className="font-medium">Moved to a new city in the last 12 months</p>
                </Pill>
                <Pill value="milestone" selected={lifeWindow} onSelect={setLifeWindow}>
                  <p className="font-medium">Hitting a milestone (turning 35, 40, 45, 50)</p>
                </Pill>
                <Pill value="career" selected={lifeWindow} onSelect={setLifeWindow}>
                  <p className="font-medium">Just had a career change or big promotion</p>
                </Pill>
                <Pill value="none" selected={lifeWindow} onSelect={setLifeWindow}>
                  <p className="font-medium">None of these — just want better results</p>
                </Pill>
              </div>
            </div>
          )}

          {/* ═══ STEP 1: Time Investment ═══ */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <p className="text-gold text-xs uppercase tracking-widest mb-2">Time Investment</p>
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-on-surface">
                  How many hours per week do you spend on dating apps?
                </h2>
              </div>
              <div className="space-y-3">
                <Pill value="less_than_2" selected={timeInvestment} onSelect={setTimeInvestment}>
                  <p className="font-medium">Less than 2 hours</p>
                </Pill>
                <Pill value="2_5" selected={timeInvestment} onSelect={setTimeInvestment}>
                  <p className="font-medium">2–5 hours</p>
                </Pill>
                <Pill value="5_10" selected={timeInvestment} onSelect={setTimeInvestment}>
                  <p className="font-medium">5–10 hours</p>
                </Pill>
                <Pill value="10_plus" selected={timeInvestment} onSelect={setTimeInvestment}>
                  <p className="font-medium">10+ hours</p>
                </Pill>
                <Pill value="given_up" selected={timeInvestment} onSelect={setTimeInvestment}>
                  <p className="font-medium">I&apos;ve given up entirely</p>
                </Pill>
              </div>
            </div>
          )}

          {/* ═══ STEP 2: Commitment Level ═══ */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <p className="text-gold text-xs uppercase tracking-widest mb-2">Commitment</p>
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-on-surface">
                  If the right solution existed, how quickly would you move?
                </h2>
              </div>
              <div className="space-y-3">
                <Pill value="immediately" selected={commitment} onSelect={setCommitment}>
                  <p className="font-medium">I&apos;d start immediately</p>
                </Pill>
                <Pill value="within_month" selected={commitment} onSelect={setCommitment}>
                  <p className="font-medium">Within the next month</p>
                </Pill>
                <Pill value="exploring" selected={commitment} onSelect={setCommitment}>
                  <p className="font-medium">I&apos;m exploring my options</p>
                </Pill>
                <Pill value="curious" selected={commitment} onSelect={setCommitment}>
                  <p className="font-medium">Just curious</p>
                </Pill>
              </div>
            </div>
          )}

          {/* ═══ STEP 3: City ═══ */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <p className="text-gold text-xs uppercase tracking-widest mb-2">Location</p>
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-on-surface">
                  What city are you based in?
                </h2>
              </div>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. New York"
                autoFocus
                className="w-full bg-surface-container-low border-2 border-outline-variant/20 rounded-2xl px-5 py-4 text-on-surface text-lg placeholder:text-outline focus:border-gold/40 outline-none transition-colors"
              />
            </div>
          )}

          {/* ═══ STEP 4: Profession ═══ */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <p className="text-gold text-xs uppercase tracking-widest mb-2">Career</p>
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-on-surface">
                  What do you do professionally?
                </h2>
              </div>
              <input
                type="text"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                placeholder="e.g. Tech Executive"
                autoFocus
                className="w-full bg-surface-container-low border-2 border-outline-variant/20 rounded-2xl px-5 py-4 text-on-surface text-lg placeholder:text-outline focus:border-gold/40 outline-none transition-colors"
              />
            </div>
          )}

          {/* ═══ STEP 5: Account (Name + Email + Password) ═══ */}
          {step === 5 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <p className="text-gold text-xs uppercase tracking-widest mb-2">Create Account</p>
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-on-surface">
                  Secure your spot
                </h2>
                <p className="text-on-surface-variant text-sm mt-2">We&apos;ll use this to set up your private portal.</p>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full Name"
                  autoFocus
                  className="w-full bg-surface-container-low border-2 border-outline-variant/20 rounded-2xl px-5 py-4 text-on-surface text-base placeholder:text-outline focus:border-gold/40 outline-none transition-colors"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full bg-surface-container-low border-2 border-outline-variant/20 rounded-2xl px-5 py-4 text-on-surface text-base placeholder:text-outline focus:border-gold/40 outline-none transition-colors"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password (8+ characters)"
                  className="w-full bg-surface-container-low border-2 border-outline-variant/20 rounded-2xl px-5 py-4 text-on-surface text-base placeholder:text-outline focus:border-gold/40 outline-none transition-colors"
                />
              </div>
            </div>
          )}

          {/* ═══ STEP 6: Phone + Terms ═══ */}
          {step === 6 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <p className="text-gold text-xs uppercase tracking-widest mb-2">Final Step</p>
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-on-surface">
                  How should we reach you?
                </h2>
                <p className="text-on-surface-variant text-sm mt-2">Your dedicated manager will contact you via WhatsApp.</p>
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone / WhatsApp"
                autoFocus
                className="w-full bg-surface-container-low border-2 border-outline-variant/20 rounded-2xl px-5 py-4 text-on-surface text-lg placeholder:text-outline focus:border-gold/40 outline-none transition-colors"
              />
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAgreed}
                  onChange={(e) => setTermsAgreed(e.target.checked)}
                  className="accent-[#e6c487] mt-1"
                />
                <span className="text-on-surface-variant text-xs leading-relaxed">
                  I agree to the Terms of Service and Privacy Policy. I understand that a dedicated manager will reach out to schedule my consultation.
                </span>
              </label>
            </div>
          )}

          {/* ═══ Error ═══ */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* ═══ Continue Button ═══ */}
          <button
            onClick={next}
            disabled={!canAdvance() || submitting}
            className={`w-full py-4 rounded-full font-semibold text-base transition-all duration-300 ${
              canAdvance() && !submitting
                ? "gold-gradient text-on-gold hover:opacity-90 shadow-lg"
                : "bg-surface-container-high text-outline cursor-not-allowed"
            }`}
          >
            {submitting
              ? "Creating your account..."
              : step === TOTAL_STEPS - 1
              ? "Submit Application"
              : "Continue"}
          </button>

          {/* Enter hint for desktop */}
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
