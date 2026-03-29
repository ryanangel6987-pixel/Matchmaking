import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// POST: Submit new application (public, no auth required)
export async function POST(request: Request) {
  const body = await request.json();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );

  const { error } = await supabase.from("applications").insert({
    full_name: body.full_name,
    email: body.email,
    phone: body.phone,
    city: body.city,
    profession: body.profession,
    age: body.age,
    height: body.height,
    own_ethnicity: body.own_ethnicity,
    own_body_type: body.own_body_type,
    life_window: body.life_window,
    duration: body.duration,
    tried_before: body.tried_before,
    current_results: body.current_results,
    priority_level: body.priority_level,
    ideal_partner: body.ideal_partner,
    her_age_min: body.her_age_min,
    her_age_max: body.her_age_max,
    her_ethnicities: body.her_ethnicities ?? [],
    her_body_types: body.her_body_types ?? [],
    lead_score: body.lead_score,
    lead_tier: body.lead_tier,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Fire webhook to GoHighLevel (non-blocking)
  const ghlWebhookUrl = process.env.GHL_WEBHOOK_URL;
  if (ghlWebhookUrl) {
    fetch(ghlWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "application_submitted",
        email: body.email,
        phone: body.phone,
        first_name: body.full_name?.split(" ")[0] ?? "",
        last_name: body.full_name?.split(" ").slice(1).join(" ") ?? "",
        full_name: body.full_name,
        city: body.city,
        profession: body.profession,
        age: body.age,
        height: body.height,
        ethnicity: body.own_ethnicity,
        body_type: body.own_body_type,
        life_window: body.life_window,
        duration_unsatisfied: body.duration,
        tried_before: body.tried_before,
        current_results: body.current_results,
        priority_level: body.priority_level,
        ideal_partner: body.ideal_partner,
        her_age_range: body.her_age_min && body.her_age_max ? `${body.her_age_min}-${body.her_age_max}` : "",
        her_ethnicities: (body.her_ethnicities ?? []).join(", "),
        her_body_types: (body.her_body_types ?? []).join(", "),
        lead_score: body.lead_score,
        lead_tier: body.lead_tier,
        source: "privatedatingconcierge.com",
      }),
    }).catch(() => {}); // Fire and forget
  }

  return NextResponse.json({ success: true });
}

// PATCH: Update application status (admin only, uses RLS)
export async function PATCH(request: Request) {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (c) => { try { c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {} },
      },
    }
  );

  const body = await request.json();
  const { id, status } = body;

  if (!id || !status) {
    return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
  }

  const { error } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
