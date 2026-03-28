export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Private Dating Concierge — Your Dating Life, Discreetly Managed",
  description: "We engineer your digital identity and deliver curated dates. Dedicated concierge manager, 4-layer preference filtering, and weekly KPI dashboard. 4-8 dates per month. Apply now.",
  openGraph: {
    title: "Private Dating Concierge",
    description: "Your dating life, discreetly managed end-to-end. We engineer your digital identity and deliver curated dates — you only show up.",
    type: "website",
  },
};
import { createClient } from "@/lib/supabase/server";
import { LandingPage } from "@/components/landing/landing-page";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("auth_user_id", user.id)
      .single();

    switch (profile?.role) {
      case "client":
        redirect("/portal");
      case "matchmaker":
        redirect("/clients");
      case "admin":
        redirect("/admin");
      default:
        redirect("/portal");
    }
  }

  return <LandingPage />;
}
