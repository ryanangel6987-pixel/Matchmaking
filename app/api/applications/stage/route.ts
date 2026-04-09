import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// PATCH: Update application pipeline stage (public — called from confirmed page)
export async function PATCH(request: Request) {
  const { email, stage } = await request.json();

  if (!email || !stage) {
    return NextResponse.json({ error: "Missing email or stage" }, { status: 400 });
  }

  const validStages = ["new_signup", "call_booked"];
  if (!validStages.includes(stage)) {
    return NextResponse.json({ error: "Invalid stage" }, { status: 400 });
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );

  const { error } = await supabase
    .from("applications")
    .update({ pipeline_stage: stage })
    .eq("email", email)
    .eq("status", "pending");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
