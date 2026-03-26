"use client";

const calendarUrl = process.env.NEXT_PUBLIC_GHL_CALENDAR_URL;

export function BookingEmbed() {
  if (!calendarUrl) {
    return (
      <div className="w-full rounded-2xl border border-outline-variant/20 bg-surface-container-low p-10 text-center space-y-4">
        <span
          className="material-symbols-outlined text-gold text-4xl"
          style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
        >
          calendar_month
        </span>
        <p className="text-on-surface-variant text-sm">
          Calendar booking is being configured. Your matchmaker will reach out
          directly to schedule your consultation.
        </p>
        <p className="text-on-surface-variant/50 text-xs">
          Set <code className="text-gold/60 bg-surface-container px-1.5 py-0.5 rounded text-xs">NEXT_PUBLIC_GHL_CALENDAR_URL</code> in your environment to enable embedded booking.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-outline-variant/20">
      <iframe
        src={calendarUrl}
        title="Book Your Consultation"
        className="w-full border-0"
        style={{ height: "700px", minHeight: "600px" }}
        allow="payment"
      />
    </div>
  );
}
