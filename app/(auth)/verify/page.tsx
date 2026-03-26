import Link from "next/link";

export default function VerifyPage() {
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
          Email Verified
        </h2>
        <p className="text-on-surface-variant">
          Your email has been verified. You can now sign in to your account.
        </p>
        <Link
          href="/login"
          className="inline-block gold-gradient text-on-gold font-semibold rounded-full px-8 py-3 text-sm"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}
