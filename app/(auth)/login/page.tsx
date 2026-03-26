"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<"confirmed" | "expired" | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("confirmed") === "true") setBanner("confirmed");
    if (params.get("error") === "expired") setBanner("expired");
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center">
        <Image src="/logo.png" alt="Private Dating Concierge" width={687} height={132} />
      </div>

      {banner === "confirmed" && (
        <div className="rounded-xl bg-gold/10 border border-gold/20 px-4 py-3 text-center">
          <p className="text-gold text-sm font-medium">Email confirmed — you can now sign in.</p>
        </div>
      )}

      {banner === "expired" && (
        <div className="rounded-xl bg-error-red/10 border border-error-red/20 px-4 py-3 text-center">
          <p className="text-error-red text-sm font-medium">Link expired — please sign up again.</p>
        </div>
      )}

      <div className="rounded-2xl bg-surface-container-low p-8 space-y-6">
        <div className="space-y-1">
          <h2 className="font-heading text-xl font-bold text-on-surface">
            Sign In
          </h2>
          <p className="text-sm text-on-surface-variant">
            Enter your credentials to continue
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
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
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="flex items-center justify-between text-sm">
          <Link
            href="/reset-password"
            className="text-gold hover:text-gold-light transition-colors"
          >
            Forgot password?
          </Link>
          <Link
            href="/signup"
            className="text-gold hover:text-gold-light transition-colors"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
