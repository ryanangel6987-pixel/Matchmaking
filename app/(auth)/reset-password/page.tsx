"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <img src="/logo.png" alt="Private Dating Concierge" className="h-12 w-auto" />
        </div>
        <div className="rounded-2xl bg-surface-container-low p-8 space-y-4 text-center">
          <h2 className="font-heading text-xl font-bold text-gold">
            Check Your Email
          </h2>
          <p className="text-on-surface-variant">
            If an account exists for <strong className="text-on-surface">{email}</strong>,
            you&apos;ll receive a password reset link.
          </p>
          <Link
            href="/login"
            className="inline-block text-gold hover:text-gold-light transition-colors text-sm"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="font-heading text-3xl font-bold text-on-surface">
          Private Dating Concierge
        </h1>
      </div>

      <div className="rounded-2xl bg-surface-container-low p-8 space-y-6">
        <div className="space-y-1">
          <h2 className="font-heading text-xl font-bold text-on-surface">
            Reset Password
          </h2>
          <p className="text-sm text-on-surface-variant">
            Enter your email to receive a reset link
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gold text-xs uppercase tracking-wider">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-outline focus:border-gold focus:ring-gold"
            />
          </div>

          {error && (
            <p className="text-error-red text-sm">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full gold-gradient text-on-gold font-semibold rounded-full h-12"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>

        <p className="text-center text-sm text-on-surface-variant">
          <Link href="/login" className="text-gold hover:text-gold-light transition-colors">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
