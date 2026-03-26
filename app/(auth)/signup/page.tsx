"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          invite_code: inviteCode,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signupError) {
      setError(signupError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <img src="/logo.png" alt="Private Dating Concierge" className="h-12 w-auto" />
          <p className="text-on-surface-variant text-sm">
            Private Client Portal
          </p>
        </div>
        <div className="rounded-2xl bg-surface-container-low p-8 space-y-4 text-center">
          <h2 className="font-heading text-xl font-bold text-gold">
            Check Your Email
          </h2>
          <p className="text-on-surface-variant">
            We&apos;ve sent a verification link to <strong className="text-on-surface">{email}</strong>.
            Click it to activate your account.
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
        <p className="text-on-surface-variant text-sm">
          Private Client Portal
        </p>
      </div>

      <div className="rounded-2xl bg-surface-container-low p-8 space-y-6">
        <div className="space-y-1">
          <h2 className="font-heading text-xl font-bold text-on-surface">
            Create Account
          </h2>
          <p className="text-sm text-on-surface-variant">
            Enter your details to get started
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-gold text-xs uppercase tracking-wider">
              Full Name
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-outline focus:border-gold focus:ring-gold"
            />
          </div>

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

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gold text-xs uppercase tracking-wider">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="8+ characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-outline focus:border-gold focus:ring-gold"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="inviteCode" className="text-gold text-xs uppercase tracking-wider">
              Invite Code
            </Label>
            <Input
              id="inviteCode"
              type="text"
              placeholder="Optional"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
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
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <p className="text-center text-sm text-on-surface-variant">
          Already have an account?{" "}
          <Link href="/login" className="text-gold hover:text-gold-light transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
