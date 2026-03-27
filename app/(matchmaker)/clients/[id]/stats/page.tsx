export const dynamic = "force-dynamic";
export const metadata = { title: "Stats Upload | Matchmaker Portal" };

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StatsUploadClient } from "@/components/matchmaker/stats-upload-client";
import { ClientSubNav } from "@/components/matchmaker/client-sub-nav";

export default async function StatsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: clientId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles").select("id").eq("auth_user_id", user.id).single();
  if (!profile) redirect("/login");

  const { data: client } = await supabase
    .from("clients")
    .select("id, profiles!clients_profile_id_fkey(full_name)")
    .eq("id", clientId)
    .eq("assigned_matchmaker_id", profile.id)
    .single();

  if (!client) redirect("/clients");

  const [{ data: datingApps }, { data: history }, { data: weeklyStats }] = await Promise.all([
    supabase.from("dating_apps").select("*").eq("is_active", true),
    supabase.from("daily_app_stats").select("*, dating_apps(app_name)").eq("client_id", clientId).order("stat_date", { ascending: false }).limit(30),
    supabase.from("daily_app_stats").select("stat_date, swipes, new_matches, conversations, dates_closed").eq("client_id", clientId).order("stat_date", { ascending: false }).limit(60),
  ]);

  // Compute weekly summaries from raw stats (last 4 weeks)
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun
  const mondayOfThisWeek = new Date(now);
  mondayOfThisWeek.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  mondayOfThisWeek.setHours(0, 0, 0, 0);

  type WeekRow = { label: string; startDate: Date; swipes: number; matches: number; conversations: number; dates_closed: number };
  const weeks: WeekRow[] = [];
  for (let i = 0; i < 4; i++) {
    const start = new Date(mondayOfThisWeek);
    start.setDate(start.getDate() - 7 * i);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    weeks.push({
      label: `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
      startDate: start,
      swipes: 0,
      matches: 0,
      conversations: 0,
      dates_closed: 0,
    });
  }

  // Daily breakdown for current week (Mon-Sun)
  const dailyBreakdown: { day: string; swipes: number; matches: number; conversations: number; dates_closed: number }[] = [];
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  for (let i = 0; i < 7; i++) {
    const d = new Date(mondayOfThisWeek);
    d.setDate(d.getDate() + i);
    dailyBreakdown.push({ day: dayNames[i], swipes: 0, matches: 0, conversations: 0, dates_closed: 0 });
  }

  // Populate from stats
  for (const stat of weeklyStats ?? []) {
    const statDate = new Date(stat.stat_date + "T00:00:00");

    // Weekly buckets
    for (const week of weeks) {
      const weekEnd = new Date(week.startDate);
      weekEnd.setDate(weekEnd.getDate() + 7);
      if (statDate >= week.startDate && statDate < weekEnd) {
        week.swipes += stat.swipes ?? 0;
        week.matches += stat.new_matches ?? 0;
        week.conversations += stat.conversations ?? 0;
        week.dates_closed += stat.dates_closed ?? 0;
      }
    }

    // Daily breakdown for current week
    if (statDate >= mondayOfThisWeek) {
      const diffDays = Math.floor((statDate.getTime() - mondayOfThisWeek.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays < 7) {
        dailyBreakdown[diffDays].swipes += stat.swipes ?? 0;
        dailyBreakdown[diffDays].matches += stat.new_matches ?? 0;
        dailyBreakdown[diffDays].conversations += stat.conversations ?? 0;
        dailyBreakdown[diffDays].dates_closed += stat.dates_closed ?? 0;
      }
    }
  }

  const weeklyTotals = {
    swipes: weeks.reduce((s, w) => s + w.swipes, 0),
    matches: weeks.reduce((s, w) => s + w.matches, 0),
    conversations: weeks.reduce((s, w) => s + w.conversations, 0),
    dates_closed: weeks.reduce((s, w) => s + w.dates_closed, 0),
  };

  return (
    <div className="space-y-8">
      <ClientSubNav clientId={clientId} />
      <StatsUploadClient
        clientId={clientId}
        clientName={(client.profiles as any)?.full_name ?? "Client"}
        matchmakerProfileId={profile.id}
        datingApps={datingApps ?? []}
        history={history ?? []}
      />

      {/* Weekly Summary Table */}
      <section className="space-y-4">
        <h2 className="text-on-surface-variant text-xs uppercase tracking-widest">Weekly Summary (Last 4 Weeks)</h2>
        <div className="bg-surface-container-low rounded-2xl shadow-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant/20">
                <th className="text-left text-on-surface-variant text-[10px] uppercase tracking-widest px-4 py-3">Week</th>
                <th className="text-right text-on-surface-variant text-[10px] uppercase tracking-widest px-4 py-3">Swipes</th>
                <th className="text-right text-on-surface-variant text-[10px] uppercase tracking-widest px-4 py-3">Matches</th>
                <th className="text-right text-on-surface-variant text-[10px] uppercase tracking-widest px-4 py-3">Convos</th>
                <th className="text-right text-on-surface-variant text-[10px] uppercase tracking-widest px-4 py-3">Dates</th>
              </tr>
            </thead>
            <tbody>
              {weeks.map((w, i) => (
                <tr key={i} className={`border-b border-outline-variant/10 ${i === 0 ? "bg-gold/5" : ""}`}>
                  <td className="px-4 py-3 text-on-surface">{w.label}{i === 0 ? " (current)" : ""}</td>
                  <td className="px-4 py-3 text-right text-on-surface">{w.swipes.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-on-surface">{w.matches.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-on-surface">{w.conversations.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-gold font-medium">{w.dates_closed.toLocaleString()}</td>
                </tr>
              ))}
              <tr className="bg-surface-container-high">
                <td className="px-4 py-3 text-on-surface font-medium">Total</td>
                <td className="px-4 py-3 text-right text-on-surface font-medium">{weeklyTotals.swipes.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-on-surface font-medium">{weeklyTotals.matches.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-on-surface font-medium">{weeklyTotals.conversations.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-gold font-bold">{weeklyTotals.dates_closed.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Daily Breakdown for Current Week */}
      <section className="space-y-4">
        <h2 className="text-on-surface-variant text-xs uppercase tracking-widest">Daily Breakdown (This Week)</h2>
        <div className="bg-surface-container-low rounded-2xl shadow-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant/20">
                <th className="text-left text-on-surface-variant text-[10px] uppercase tracking-widest px-4 py-3">Day</th>
                <th className="text-right text-on-surface-variant text-[10px] uppercase tracking-widest px-4 py-3">Swipes</th>
                <th className="text-right text-on-surface-variant text-[10px] uppercase tracking-widest px-4 py-3">Matches</th>
                <th className="text-right text-on-surface-variant text-[10px] uppercase tracking-widest px-4 py-3">Convos</th>
                <th className="text-right text-on-surface-variant text-[10px] uppercase tracking-widest px-4 py-3">Dates</th>
              </tr>
            </thead>
            <tbody>
              {dailyBreakdown.map((d, i) => {
                const dayDate = new Date(mondayOfThisWeek);
                dayDate.setDate(dayDate.getDate() + i);
                const isToday = dayDate.toDateString() === now.toDateString();
                return (
                  <tr key={d.day} className={`border-b border-outline-variant/10 ${isToday ? "bg-gold/5" : ""}`}>
                    <td className="px-4 py-3 text-on-surface">
                      {d.day}
                      {isToday && <span className="ml-2 text-gold text-[10px] uppercase tracking-widest">Today</span>}
                    </td>
                    <td className="px-4 py-3 text-right text-on-surface">{d.swipes}</td>
                    <td className="px-4 py-3 text-right text-on-surface">{d.matches}</td>
                    <td className="px-4 py-3 text-right text-on-surface">{d.conversations}</td>
                    <td className="px-4 py-3 text-right text-gold font-medium">{d.dates_closed}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
