import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// POST: Admin activates an application → creates auth account + profile + client + prefills onboarding
export async function POST(request: Request) {
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

  // Verify admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: adminProfile } = await supabase.from("profiles").select("id, role").eq("auth_user_id", user.id).single();
  if (!adminProfile || adminProfile.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { applicationId } = await request.json();
  if (!applicationId) return NextResponse.json({ error: "Missing applicationId" }, { status: 400 });

  // Use service role for account creation
  const supabaseAdmin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );

  // Fetch application
  const { data: app } = await supabaseAdmin.from("applications").select("*").eq("id", applicationId).single();
  if (!app) return NextResponse.json({ error: "Application not found" }, { status: 404 });
  if (app.status === "activated") return NextResponse.json({ error: "Already activated" }, { status: 400 });

  // Create auth user with invite (sends magic link email)
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(app.email, {
    data: { full_name: app.full_name, phone: app.phone },
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://privatedatingconcierge.com"}/callback`,
  });

  if (authError) return NextResponse.json({ error: authError.message }, { status: 400 });

  const authUserId = authData.user.id;

  // Create profile
  const { data: profile } = await supabaseAdmin.from("profiles").insert({
    auth_user_id: authUserId,
    role: "client",
    full_name: app.full_name,
  }).select("id").single();

  if (!profile) return NextResponse.json({ error: "Failed to create profile" }, { status: 500 });

  // Create client record
  const { data: client } = await supabaseAdmin.from("clients").insert({
    profile_id: profile.id,
    onboarding_status: "not_started",
  }).select("id").single();

  if (!client) return NextResponse.json({ error: "Failed to create client" }, { status: 500 });

  // Pre-fill onboarding data from application
  await supabaseAdmin.from("onboarding_data").upsert({
    client_id: client.id,
    full_name: app.full_name,
    age: app.age,
    city: app.city,
    profession: app.profession,
    height_inches: null, // app.height is text format, not inches
    own_ethnicity: app.own_ethnicity,
    own_body_type: app.own_body_type,
    target_age_min: app.her_age_min,
    target_age_max: app.her_age_max,
    target_physical_preferences: {
      ethnicities: app.her_ethnicities ?? [],
      body_types: app.her_body_types ?? [],
    },
    anything_else: app.ideal_partner,
  }, { onConflict: "client_id" });

  // Mark application as activated
  await supabaseAdmin.from("applications").update({
    status: "activated",
    activated_at: new Date().toISOString(),
    activated_by: adminProfile.id,
  }).eq("id", applicationId);

  return NextResponse.json({ success: true, profileId: profile.id, clientId: client.id });
}
