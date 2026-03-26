import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import {
  welcomeEmail,
  newDateOpportunityEmail,
  photosReadyEmail,
  matchmakerAssignedEmail,
  weeklyReportEmail,
} from "@/lib/email-templates";

export const dynamic = "force-dynamic";

type NotificationType =
  | "welcome"
  | "new_date_opportunity"
  | "photos_ready"
  | "matchmaker_assigned"
  | "weekly_report";

export async function POST(request: Request) {
  // Validate authorization — accept service role key or authenticated admin/matchmaker
  const authHeader = request.headers.get("authorization");
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  let isServiceRole = false;
  if (authHeader === `Bearer ${serviceRoleKey}` && serviceRoleKey) {
    isServiceRole = true;
  }

  // If not service role, check for authenticated session with matchmaker/admin role
  if (!isServiceRole) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignore
            }
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !["admin", "matchmaker"].includes(profile.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // Parse body
  const body = await request.json();
  const { type, clientId, data } = body as {
    type: NotificationType;
    clientId: string;
    data?: Record<string, unknown>;
  };

  if (!type || !clientId) {
    return NextResponse.json(
      { error: "Missing required fields: type, clientId" },
      { status: 400 }
    );
  }

  // Look up client email and name using service role client
  const supabaseAdmin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {
          // No-op for service role
        },
      },
    }
  );

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("full_name, email")
    .eq("id", clientId)
    .single();

  if (!profile?.email) {
    return NextResponse.json(
      { error: "Client not found or no email" },
      { status: 404 }
    );
  }

  const clientName = profile.full_name || "Valued Client";
  let template: { subject: string; html: string };

  switch (type) {
    case "welcome":
      template = welcomeEmail(clientName);
      break;
    case "new_date_opportunity":
      template = newDateOpportunityEmail(
        clientName,
        (data?.candidateName as string) || "your match"
      );
      break;
    case "photos_ready":
      template = photosReadyEmail(clientName);
      break;
    case "matchmaker_assigned":
      template = matchmakerAssignedEmail(
        clientName,
        (data?.matchmakerName as string) || "your matchmaker"
      );
      break;
    case "weekly_report":
      template = weeklyReportEmail(clientName, {
        swipes: (data?.swipes as number) || 0,
        matches: (data?.matches as number) || 0,
        dates: (data?.dates as number) || 0,
      });
      break;
    default:
      return NextResponse.json(
        { error: `Unknown notification type: ${type}` },
        { status: 400 }
      );
  }

  await sendEmail({
    to: profile.email,
    subject: template.subject,
    html: template.html,
  });

  return NextResponse.json({ success: true });
}
