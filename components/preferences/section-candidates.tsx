"use client";

import Image from "next/image";
import { CollapsibleSection } from "./section-header";
import { Badge } from "@/components/ui/badge";

const statusConfig: Record<string, { label: string; className: string }> = {
  candidate: {
    label: "Candidate",
    className: "bg-surface-bright/40 border-outline-variant/30 text-neutral",
  },
  date_closed: {
    label: "Date Closed",
    className: "bg-gold/20 border-gold/30 text-gold",
  },
  pending_client_approval: {
    label: "Pending Approval",
    className: "bg-surface-bright/40 border-outline-variant/30 text-neutral",
  },
  approved: {
    label: "Approved",
    className: "bg-gold/20 border-gold/30 text-gold",
  },
  declined: {
    label: "Declined",
    className: "bg-error-container/20 border-error-red/30 text-error-red",
  },
  archived: {
    label: "Archived",
    className: "bg-surface-bright/40 border-outline-variant/30 text-outline",
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CandidateCard({ candidate }: { candidate: any }) {
  const status = statusConfig[candidate.status] ?? statusConfig.candidate;

  return (
    <div className="relative group">
      <div className="p-px rounded-2xl bg-gradient-to-br from-gold to-gold-dark overflow-hidden">
        <div className="bg-surface-container-lowest h-full w-full rounded-[0.95rem] overflow-hidden">
          {candidate.photo_url ? (
            <Image
              src={candidate.photo_url}
              alt={candidate.name || "Candidate"}
              width={400}
              height={500}
              className="w-full h-[400px] object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
            />
          ) : (
            <div className="w-full h-[400px] bg-surface-container-high flex items-center justify-center">
              <span
                className="material-symbols-outlined text-6xl text-outline/30"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}
              >
                person
              </span>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />

          {/* Bottom info */}
          <div className="absolute bottom-0 left-0 p-6 w-full">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-gold-light font-heading text-2xl font-bold">
                  {candidate.name || "Unknown"}
                </p>
                <p className="text-on-surface-variant text-xs uppercase tracking-widest mt-1">
                  {[
                    candidate.archetype_descriptor,
                    candidate.age ? `${candidate.age}` : null,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                {candidate.dating_apps?.app_name && (
                  <p className="text-outline text-[10px] uppercase tracking-widest mt-1">
                    via {candidate.dating_apps.app_name}
                  </p>
                )}
              </div>

              <Badge
                variant="outline"
                className={`text-[10px] font-bold uppercase tracking-widest backdrop-blur-md px-3 py-1 rounded-full ${status.className}`}
              >
                {status.label}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SectionCandidates({
  candidates,
}: {
  candidates: any[];
  datingApps: any[];
}) {
  const activeCandidates = candidates.filter(
    (c) => c.status !== "archived" && c.status !== "declined"
  );

  return (
    <section className="space-y-8">
      <div className="flex justify-between items-end">
        <CollapsibleSection
          title="Section F — Live Candidates"
          subtitle="Approved women & candidate pipeline"
        >
          {candidates.length === 0 ? (
            <p className="text-on-surface-variant/60 text-sm">
              No candidates in the pipeline yet.
            </p>
          ) : (
            <>
              <div className="flex justify-end mb-4">
                <span className="text-on-surface-variant text-[10px] uppercase tracking-[0.2em]">
                  Active Candidates:{" "}
                  {String(activeCandidates.length).padStart(2, "0")}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {candidates.map((candidate) => (
                  <CandidateCard key={candidate.id} candidate={candidate} />
                ))}
              </div>
            </>
          )}
        </CollapsibleSection>
      </div>
    </section>
  );
}
