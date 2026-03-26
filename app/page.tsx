export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
        redirect("/overview");
      case "matchmaker":
        redirect("/clients");
      case "admin":
        redirect("/admin");
      default:
        redirect("/overview");
    }
  }

  redirect("/login");
}
