"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { OpportunityCreateForm } from "@/components/matchmaker/opportunity-create-form";
import { OppCard } from "@/components/matchmaker/opp-card";
import { EmptyState } from "@/components/matchmaker/empty-state";
import { toast } from "sonner";

interface OpportunitiesClientProps {
  clientId: string;
  clientName: string;
  matchmakerProfileId: string;
  datingApps: any[];
  venues: any[];
  opportunities: any[];
}

export function OpportunitiesClient({
  clientId,
  clientName,
  matchmakerProfileId,
  datingApps,
  venues,
  opportunities,
}: OpportunitiesClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [showForm, setShowForm] = useState(false);

  const handleStatusChange = async (oppId: string, newStatus: string) => {
    const { error } = await supabase
      .from("date_opportunities")
      .update({ status: newStatus })
      .eq("id", oppId);

    if (error) {
      toast.error("Failed to update status", { description: error.message });
    } else {
      toast.success(`Status updated to ${newStatus.replace(/_/g, " ")}`);
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href={`/clients/${clientId}`}
            className="text-gold text-xs uppercase tracking-widest hover:text-gold-light transition-colors"
          >
            ← Back to {clientName}
          </Link>
          <h1 className="text-3xl font-heading font-bold text-gold tracking-tight mt-2">
            Date Opportunities
          </h1>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="gold-gradient text-on-gold font-semibold rounded-full"
        >
          {showForm ? "Cancel" : "+ New Opportunity"}
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <OpportunityCreateForm
          clientId={clientId}
          matchmakerProfileId={matchmakerProfileId}
          datingApps={datingApps}
          venues={venues}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Opportunities List */}
      {opportunities.length === 0 ? (
        <EmptyState
          icon="favorite"
          title="No date opportunities yet"
          description="Create the first date opportunity for this client."
          actionLabel="Create Opportunity"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <div className="space-y-3">
          {opportunities.map((opp) => {
            const photo =
              opp.candidate_photo_url ||
              (opp.candidate_photos && opp.candidate_photos[0]);
            return (
              <OppCard
                key={opp.id}
                opp={opp}
                photoUrl={photo}
                datingApps={datingApps}
                venues={venues}
                onStatusChange={handleStatusChange}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
