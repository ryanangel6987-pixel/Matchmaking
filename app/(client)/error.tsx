"use client";

import { Button } from "@/components/ui/button";

export default function ClientError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
      <span
        className="material-symbols-outlined text-6xl text-outline/40"
        style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}
      >
        error
      </span>
      <div className="text-center space-y-2">
        <h2 className="font-heading text-xl font-bold text-on-surface">
          Something went wrong
        </h2>
        <p className="text-on-surface-variant text-sm max-w-md">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
      </div>
      <Button
        onClick={reset}
        className="gold-gradient text-on-gold font-semibold rounded-full"
      >
        Try Again
      </Button>
    </div>
  );
}
