"use client";

import Image from "next/image";
import Link from "next/link";
import { BookingEmbed } from "@/components/apply/booking-embed";

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <div className="w-full pt-10 pb-2 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <Image src="/logo.png" alt="Private Dating Concierge" width={280} height={54} priority />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-4 pb-12">
        <div className="w-full max-w-2xl space-y-8">
          {/* Success banner */}
          <div className="text-center space-y-4 py-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gold-gradient shadow-lg shadow-gold/20 mb-2">
              <span
                className="material-symbols-outlined text-on-gold text-3xl"
                style={{ fontVariationSettings: "'FILL' 1, 'wght' 500" }}
              >
                check_circle
              </span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-gold tracking-tight">
              Application Received
            </h1>
            <p className="text-on-surface-variant text-base max-w-md mx-auto leading-relaxed">
              You&apos;ve been pre-approved. Book your free 30-minute consultation
              to get started.
            </p>
          </div>

          {/* Calendar embed */}
          <BookingEmbed />

          {/* Scarcity / urgency text */}
          <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10 text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-gold">
              <span
                className="material-symbols-outlined text-lg"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
              >
                schedule
              </span>
              <span className="text-sm font-medium uppercase tracking-wider">
                Limited Availability
              </span>
            </div>
            <p className="text-on-surface-variant text-sm leading-relaxed max-w-md mx-auto">
              Your matchmaker has limited availability this week. Applications
              are reviewed in order received. Booking sooner secures your
              priority placement.
            </p>
          </div>

          {/* Skip link */}
          <div className="text-center pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-on-surface-variant/60 text-sm hover:text-gold transition-colors group"
            >
              Book later
              <span
                className="material-symbols-outlined text-base group-hover:translate-x-0.5 transition-transform"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
              >
                arrow_forward
              </span>
              Go to portal
            </Link>
          </div>

          {/* Footer */}
          <p className="text-center text-on-surface-variant/40 text-xs pb-4">
            We accept a limited number of new clients each month to ensure quality.
          </p>
        </div>
      </div>
    </div>
  );
}
