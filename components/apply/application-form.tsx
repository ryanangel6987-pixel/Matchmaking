"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { CustomSelect } from "@/components/ui/custom-select";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface FormData {
  // Step 1 — Tell Us About You
  full_name: string;
  age: string;
  city: string;
  profession: string;
  relationship_goal: string;
  dating_frustration: string;

  // Step 2 — Your Standards
  target_age_min: string;
  target_age_max: string;
  most_important: string;
  deal_breakers: string;
  dating_apps: string;
  dates_per_month: string;

  // Step 3 — Create Your Account
  email: string;
  password: string;
  phone: string;
  terms_agreed: boolean;
}

const INITIAL_DATA: FormData = {
  full_name: "",
  age: "",
  city: "",
  profession: "",
  relationship_goal: "",
  dating_frustration: "",

  target_age_min: "",
  target_age_max: "",
  most_important: "",
  deal_breakers: "",
  dating_apps: "",
  dates_per_month: "",

  email: "",
  password: "",
  phone: "",
  terms_agreed: false,
};

/* ------------------------------------------------------------------ */
/*  Step Definitions                                                    */
/* ------------------------------------------------------------------ */

const STEPS = [
  { label: "Tell Us About You", icon: "person", subheader: "Let\u2019s see if we\u2019re a fit" },
  { label: "Your Standards", icon: "favorite", subheader: "Help us understand your type" },
  { label: "Create Your Account", icon: "lock", subheader: "Secure your spot" },
];

/* ------------------------------------------------------------------ */
/*  Select Options                                                     */
/* ------------------------------------------------------------------ */

const RELATIONSHIP_GOALS = [
  { value: "short-term", label: "Short-term" },
  { value: "open-to-long-term", label: "Open to long-term" },
  { value: "long-term", label: "Long-term" },
  { value: "marriage", label: "Marriage" },
  { value: "open-to-anything", label: "Open to anything" },
];

const DATING_FRUSTRATIONS = [
  { value: "not-enough-time", label: "Not enough time" },
  { value: "low-match-quality", label: "Low match quality" },
  { value: "bad-photos-profile", label: "Bad photos/profile" },
  { value: "conversations-die-out", label: "Conversations die out" },
  { value: "all-of-the-above", label: "All of the above" },
];

const MOST_IMPORTANT = [
  { value: "physical-attraction", label: "Physical attraction" },
  { value: "personality", label: "Personality" },
  { value: "career-ambition", label: "Career ambition" },
  { value: "shared-values", label: "Shared values" },
  { value: "all-equally", label: "All equally" },
];

const DATING_APPS = [
  { value: "hinge", label: "Hinge" },
  { value: "bumble", label: "Bumble" },
  { value: "tinder", label: "Tinder" },
  { value: "raya", label: "Raya" },
  { value: "the-league", label: "The League" },
  { value: "none", label: "None" },
];

const DATES_PER_MONTH = [
  { value: "2-4", label: "2\u20134 dates" },
  { value: "4-6", label: "4\u20136 dates" },
  { value: "6-8", label: "6\u20138 dates" },
  { value: "as-many-as-possible", label: "As many as possible" },
];

/* ------------------------------------------------------------------ */
/*  Reusable Field Components                                          */
/* ------------------------------------------------------------------ */

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  icon,
  minLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  icon?: string;
  minLength?: number;
}) {
  return (
    <div className="space-y-2">
      <label className="text-gold text-xs uppercase tracking-wider font-medium flex items-center gap-1.5">
        {icon && (
          <span
            className="material-symbols-outlined text-sm"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
          >
            {icon}
          </span>
        )}
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        minLength={minLength}
        className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-4 py-3.5 text-on-surface text-sm placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-gold/40 focus:border-gold transition"
      />
    </div>
  );
}

function CheckboxField({
  label,
  checked,
  onChange,
  description,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  description?: string;
}) {
  return (
    <div
      className="flex items-start gap-3 cursor-pointer group"
      onClick={() => onChange(!checked)}
    >
      <div
        className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition flex-shrink-0 ${
          checked
            ? "bg-gold border-gold"
            : "bg-surface-container border-outline-variant/30 group-hover:border-gold/50"
        }`}
      >
        {checked && (
          <span
            className="material-symbols-outlined text-on-gold text-sm"
            style={{ fontVariationSettings: "'FILL' 1, 'wght' 500" }}
          >
            check
          </span>
        )}
      </div>
      <div>
        <span className="text-on-surface text-sm font-medium">{label}</span>
        {description && (
          <p className="text-on-surface-variant text-xs mt-1">{description}</p>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function ApplicationForm() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(INITIAL_DATA);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  /* ---- Submit ---- */
  const handleSubmit = async () => {
    if (!form.terms_agreed) {
      setError("You must agree to the terms to continue.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!form.email) {
      setError("Email is required.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.full_name,
          phone: form.phone,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setSubmitting(false);
      return;
    }

    // Save application data to localStorage for later use
    const applicationData = {
      full_name: form.full_name,
      age: form.age,
      city: form.city,
      profession: form.profession,
      relationship_goal: form.relationship_goal,
      dating_frustration: form.dating_frustration,
      target_age_min: form.target_age_min,
      target_age_max: form.target_age_max,
      most_important: form.most_important,
      deal_breakers: form.deal_breakers,
      dating_apps: form.dating_apps,
      dates_per_month: form.dates_per_month,
      phone: form.phone,
      submitted_at: new Date().toISOString(),
    };

    try {
      localStorage.setItem("pdc_application", JSON.stringify(applicationData));
    } catch {
      // localStorage may be unavailable
    }

    router.push("/apply/book");
  };

  /* ---- Step Renderers ---- */
  const renderStep0 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TextField
          label="Full Name"
          value={form.full_name}
          onChange={(v) => updateField("full_name", v)}
          placeholder="James Richardson"
          icon="badge"
        />
        <TextField
          label="Age"
          value={form.age}
          onChange={(v) => updateField("age", v)}
          placeholder="32"
          type="number"
          icon="cake"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TextField
          label="City"
          value={form.city}
          onChange={(v) => updateField("city", v)}
          placeholder="New York"
          icon="location_city"
        />
        <TextField
          label="Profession / Industry"
          value={form.profession}
          onChange={(v) => updateField("profession", v)}
          placeholder="Finance, Tech, Law..."
          icon="work"
        />
      </div>
      <div className="space-y-2">
        <label className="text-gold text-xs uppercase tracking-wider font-medium flex items-center gap-1.5">
          <span
            className="material-symbols-outlined text-sm"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
          >
            favorite
          </span>
          Relationship Goal
        </label>
        <CustomSelect
          value={form.relationship_goal}
          onChange={(v) => updateField("relationship_goal", v)}
          options={RELATIONSHIP_GOALS}
          placeholder="What are you looking for?"
        />
      </div>
      <div className="space-y-2">
        <label className="text-gold text-xs uppercase tracking-wider font-medium flex items-center gap-1.5">
          <span
            className="material-symbols-outlined text-sm"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
          >
            sentiment_dissatisfied
          </span>
          Biggest Dating Frustration
        </label>
        <CustomSelect
          value={form.dating_frustration}
          onChange={(v) => updateField("dating_frustration", v)}
          options={DATING_FRUSTRATIONS}
          placeholder="What's holding you back?"
        />
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TextField
          label="Target Age (Minimum)"
          value={form.target_age_min}
          onChange={(v) => updateField("target_age_min", v)}
          placeholder="25"
          type="number"
          icon="arrow_downward"
        />
        <TextField
          label="Target Age (Maximum)"
          value={form.target_age_max}
          onChange={(v) => updateField("target_age_max", v)}
          placeholder="35"
          type="number"
          icon="arrow_upward"
        />
      </div>
      <div className="space-y-2">
        <label className="text-gold text-xs uppercase tracking-wider font-medium flex items-center gap-1.5">
          <span
            className="material-symbols-outlined text-sm"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
          >
            star
          </span>
          What&apos;s Most Important to You?
        </label>
        <CustomSelect
          value={form.most_important}
          onChange={(v) => updateField("most_important", v)}
          options={MOST_IMPORTANT}
          placeholder="Choose what matters most"
        />
      </div>
      <TextField
        label="Top 3 Deal-Breakers"
        value={form.deal_breakers}
        onChange={(v) => updateField("deal_breakers", v)}
        placeholder="e.g. Smoking, no ambition, poor communication"
        icon="block"
      />
      <div className="space-y-2">
        <label className="text-gold text-xs uppercase tracking-wider font-medium flex items-center gap-1.5">
          <span
            className="material-symbols-outlined text-sm"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
          >
            apps
          </span>
          Dating Apps Currently On
        </label>
        <CustomSelect
          value={form.dating_apps}
          onChange={(v) => updateField("dating_apps", v)}
          options={DATING_APPS}
          placeholder="Select your current apps"
        />
      </div>
      <div className="space-y-2">
        <label className="text-gold text-xs uppercase tracking-wider font-medium flex items-center gap-1.5">
          <span
            className="material-symbols-outlined text-sm"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
          >
            event
          </span>
          How Many Dates Per Month?
        </label>
        <CustomSelect
          value={form.dates_per_month}
          onChange={(v) => updateField("dates_per_month", v)}
          options={DATES_PER_MONTH}
          placeholder="Your ideal pace"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <TextField
        label="Email"
        value={form.email}
        onChange={(v) => updateField("email", v)}
        placeholder="you@example.com"
        type="email"
        icon="mail"
      />
      <TextField
        label="Password"
        value={form.password}
        onChange={(v) => updateField("password", v)}
        placeholder="Minimum 8 characters"
        type="password"
        icon="lock"
        minLength={8}
      />
      <TextField
        label="Phone Number (WhatsApp)"
        value={form.phone}
        onChange={(v) => updateField("phone", v)}
        placeholder="+1 (555) 000-0000"
        type="tel"
        icon="phone_iphone"
      />

      <div className="pt-2">
        <CheckboxField
          label="I agree to the terms and understand this is a premium service"
          checked={form.terms_agreed}
          onChange={(v) => updateField("terms_agreed", v)}
          description="By submitting, you acknowledge that Private Dating Concierge is an exclusive, white-glove matchmaking service with limited availability."
        />
      </div>
    </div>
  );

  const stepRenderers = [renderStep0, renderStep1, renderStep2];

  /* ---- Render ---- */
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Full-width header area */}
      <div className="w-full pt-10 pb-6 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          {/* Logo */}
          <div className="flex justify-center">
            <Image src="/logo.png" alt="Private Dating Concierge" width={340} height={65} priority />
          </div>

          {/* Subheader — changes per step */}
          <p className="font-heading text-lg text-on-surface-variant/80 italic">
            {STEPS[step].subheader}
          </p>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 flex items-start justify-center px-4 pb-12">
        <div className="w-full max-w-2xl space-y-8">
          {/* Step Indicators */}
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-0">
              {STEPS.map((s, i) => (
                <div key={s.label} className="flex items-center">
                  <button
                    type="button"
                    onClick={() => i <= step && setStep(i)}
                    className={`flex flex-col items-center gap-2 transition ${
                      i <= step ? "cursor-pointer" : "cursor-default"
                    }`}
                  >
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 ${
                        i < step
                          ? "gold-gradient text-on-gold shadow-lg shadow-gold/20"
                          : i === step
                          ? "bg-gold/15 text-gold border-2 border-gold shadow-lg shadow-gold/10"
                          : "bg-surface-container border border-outline-variant/30 text-on-surface-variant"
                      }`}
                    >
                      {i < step ? (
                        <span
                          className="material-symbols-outlined text-lg"
                          style={{ fontVariationSettings: "'FILL' 1, 'wght' 500" }}
                        >
                          check
                        </span>
                      ) : (
                        <span
                          className="material-symbols-outlined text-lg"
                          style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
                        >
                          {s.icon}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium whitespace-nowrap ${
                        i <= step ? "text-gold" : "text-on-surface-variant/50"
                      }`}
                    >
                      {s.label}
                    </span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div className="w-16 sm:w-24 mx-2 -mt-6">
                      <div
                        className={`h-px transition-all duration-500 ${
                          i < step ? "bg-gold/50" : "bg-outline-variant/20"
                        }`}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-surface-container-high rounded-full overflow-hidden">
              <div
                className="h-full gold-gradient rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-surface-container-low rounded-2xl p-6 sm:p-10 space-y-8 border border-outline-variant/10">
            {/* Step header inside card */}
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span
                  className="material-symbols-outlined text-gold text-xl"
                  style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
                >
                  {STEPS[step].icon}
                </span>
                <h2 className="font-heading text-2xl font-semibold text-on-surface">
                  {STEPS[step].label}
                </h2>
              </div>
              <p className="text-on-surface-variant text-sm pl-8">
                Step {step + 1} of {STEPS.length}
              </p>
            </div>

            {/* Step Content */}
            {stepRenderers[step]()}

            {/* Error Display */}
            {error && (
              <div className="bg-error-container/20 border border-error-red/30 rounded-xl p-4 flex items-center gap-3">
                <span
                  className="material-symbols-outlined text-error-red"
                  style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
                >
                  error
                </span>
                <p className="text-error-red text-sm">{error}</p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t border-outline-variant/10">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setStep((s) => Math.max(0, s - 1));
                }}
                disabled={step === 0}
                className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition ${
                  step === 0
                    ? "text-on-surface-variant/30 cursor-not-allowed"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                }`}
              >
                <span
                  className="material-symbols-outlined text-lg"
                  style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
                >
                  arrow_back
                </span>
                Back
              </button>

              {step < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setStep((s) => Math.min(STEPS.length - 1, s + 1));
                  }}
                  className="flex items-center gap-2 gold-gradient text-on-gold font-semibold rounded-full px-8 py-3.5 text-sm hover:opacity-90 transition shadow-lg shadow-gold/20"
                >
                  Continue
                  <span
                    className="material-symbols-outlined text-lg"
                    style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
                  >
                    arrow_forward
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || !form.terms_agreed}
                  className="flex items-center gap-2 gold-gradient text-on-gold font-semibold rounded-full px-10 py-4 text-base hover:opacity-90 transition shadow-lg shadow-gold/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  {submitting ? (
                    <>
                      <span
                        className="material-symbols-outlined text-lg animate-spin"
                        style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
                      >
                        progress_activity
                      </span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Application
                      <span
                        className="material-symbols-outlined text-lg"
                        style={{ fontVariationSettings: "'FILL' 1, 'wght' 500" }}
                      >
                        send
                      </span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Footer text */}
          <p className="text-center text-on-surface-variant/40 text-xs">
            Applications are reviewed within 24 hours. Limited spots available each month.
          </p>
        </div>
      </div>
    </div>
  );
}
