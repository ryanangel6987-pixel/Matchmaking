function wrapTemplate(preheader: string, body: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');
  </style>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Inter',Arial,sans-serif;">
  <span style="display:none;font-size:1px;color:#0a0a0a;max-height:0;overflow:hidden;">${preheader}</span>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <!-- Logo / Brand -->
          <tr>
            <td style="padding:0 40px 30px;text-align:center;">
              <p style="font-family:'Noto Serif',Georgia,serif;font-size:20px;color:#e6c487;margin:0;letter-spacing:0.5px;">
                Private Dating Concierge
              </p>
              <div style="width:60px;height:1px;background:linear-gradient(90deg,transparent,#e6c487,transparent);margin:12px auto 0;"></div>
            </td>
          </tr>
          <!-- Content Card -->
          <tr>
            <td style="padding:0 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#131313;border-radius:16px;overflow:hidden;">
                <tr>
                  <td style="padding:40px;">
                    ${body}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:30px 40px 0;text-align:center;">
              <p style="font-family:'Inter',Arial,sans-serif;font-size:11px;color:#666;margin:0;">
                This is a confidential communication from Private Dating Concierge.
              </p>
              <p style="font-family:'Inter',Arial,sans-serif;font-size:11px;color:#444;margin:8px 0 0;">
                &copy; ${new Date().getFullYear()} Private Dating Concierge. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function welcomeEmail(clientName: string): { subject: string; html: string } {
  return {
    subject: "Welcome to Private Dating Concierge",
    html: wrapTemplate(
      `Welcome aboard, ${clientName}. Your journey begins now.`,
      `
        <h1 style="font-family:'Noto Serif',Georgia,serif;font-size:24px;color:#e6c487;margin:0 0 16px;font-weight:600;">
          Welcome, ${clientName}
        </h1>
        <p style="font-size:15px;color:#ccc;line-height:1.7;margin:0 0 20px;">
          We are delighted to have you. Your dedicated matchmaker will be reviewing your profile and preferences to begin curating exceptional introductions.
        </p>
        <p style="font-size:15px;color:#ccc;line-height:1.7;margin:0 0 24px;">
          In the meantime, please ensure your profile and preferences are up to date in your client portal. The more we know, the better your matches will be.
        </p>
        <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
          <tr>
            <td style="background:linear-gradient(135deg,#e6c487,#c9a96e);border-radius:50px;padding:14px 36px;">
              <a href="${process.env.NEXT_PUBLIC_SUPABASE_URL ? '' : '#'}" style="font-family:'Inter',Arial,sans-serif;font-size:14px;color:#1a1a1a;text-decoration:none;font-weight:600;letter-spacing:0.3px;">
                Open Your Portal
              </a>
            </td>
          </tr>
        </table>
      `
    ),
  };
}

export function newDateOpportunityEmail(clientName: string, candidateName: string): { subject: string; html: string } {
  return {
    subject: "New date opportunity awaiting your approval",
    html: wrapTemplate(
      `${clientName}, a new introduction is ready for you.`,
      `
        <h1 style="font-family:'Noto Serif',Georgia,serif;font-size:24px;color:#e6c487;margin:0 0 16px;font-weight:600;">
          New Introduction
        </h1>
        <p style="font-size:15px;color:#ccc;line-height:1.7;margin:0 0 20px;">
          ${clientName}, your matchmaker has curated a new date opportunity for you with <strong style="color:#e6c487;">${candidateName}</strong>.
        </p>
        <p style="font-size:15px;color:#ccc;line-height:1.7;margin:0 0 24px;">
          Please review the details in your portal and let us know your decision. Time-sensitive opportunities are best acted on promptly.
        </p>
        <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
          <tr>
            <td style="background:linear-gradient(135deg,#e6c487,#c9a96e);border-radius:50px;padding:14px 36px;">
              <a href="#" style="font-family:'Inter',Arial,sans-serif;font-size:14px;color:#1a1a1a;text-decoration:none;font-weight:600;letter-spacing:0.3px;">
                Review Opportunity
              </a>
            </td>
          </tr>
        </table>
      `
    ),
  };
}

export function photosReadyEmail(clientName: string): { subject: string; html: string } {
  return {
    subject: "Your curated photos are ready for review",
    html: wrapTemplate(
      `${clientName}, your profile photos have been curated.`,
      `
        <h1 style="font-family:'Noto Serif',Georgia,serif;font-size:24px;color:#e6c487;margin:0 0 16px;font-weight:600;">
          Photos Ready
        </h1>
        <p style="font-size:15px;color:#ccc;line-height:1.7;margin:0 0 20px;">
          ${clientName}, your matchmaker has curated a selection of photos for your dating profiles. These have been chosen to present you at your best.
        </p>
        <p style="font-size:15px;color:#ccc;line-height:1.7;margin:0 0 24px;">
          Please review and approve them in your portal at your earliest convenience.
        </p>
        <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
          <tr>
            <td style="background:linear-gradient(135deg,#e6c487,#c9a96e);border-radius:50px;padding:14px 36px;">
              <a href="#" style="font-family:'Inter',Arial,sans-serif;font-size:14px;color:#1a1a1a;text-decoration:none;font-weight:600;letter-spacing:0.3px;">
                Review Photos
              </a>
            </td>
          </tr>
        </table>
      `
    ),
  };
}

export function matchmakerAssignedEmail(clientName: string, matchmakerName: string): { subject: string; html: string } {
  return {
    subject: "Your dedicated matchmaker has been assigned",
    html: wrapTemplate(
      `${clientName}, meet your matchmaker.`,
      `
        <h1 style="font-family:'Noto Serif',Georgia,serif;font-size:24px;color:#e6c487;margin:0 0 16px;font-weight:600;">
          Meet Your Matchmaker
        </h1>
        <p style="font-size:15px;color:#ccc;line-height:1.7;margin:0 0 20px;">
          ${clientName}, we are pleased to introduce <strong style="color:#e6c487;">${matchmakerName}</strong> as your dedicated matchmaker.
        </p>
        <p style="font-size:15px;color:#ccc;line-height:1.7;margin:0 0 24px;">
          ${matchmakerName} will be your single point of contact throughout your journey. They will handle all introductions, venue selections, and post-date follow-ups to ensure a seamless experience.
        </p>
        <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
          <tr>
            <td style="background:linear-gradient(135deg,#e6c487,#c9a96e);border-radius:50px;padding:14px 36px;">
              <a href="#" style="font-family:'Inter',Arial,sans-serif;font-size:14px;color:#1a1a1a;text-decoration:none;font-weight:600;letter-spacing:0.3px;">
                View Your Portal
              </a>
            </td>
          </tr>
        </table>
      `
    ),
  };
}

export function weeklyReportEmail(
  clientName: string,
  stats: { swipes: number; matches: number; dates: number }
): { subject: string; html: string } {
  return {
    subject: "Your weekly dating report",
    html: wrapTemplate(
      `${clientName}, here is your weekly activity summary.`,
      `
        <h1 style="font-family:'Noto Serif',Georgia,serif;font-size:24px;color:#e6c487;margin:0 0 16px;font-weight:600;">
          Weekly Report
        </h1>
        <p style="font-size:15px;color:#ccc;line-height:1.7;margin:0 0 24px;">
          ${clientName}, here is a summary of your activity this week.
        </p>
        <!-- Stats row -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
          <tr>
            <td width="33%" style="text-align:center;padding:20px 8px;background:#1a1a1a;border-radius:12px 0 0 12px;">
              <p style="font-family:'Noto Serif',Georgia,serif;font-size:28px;color:#e6c487;margin:0;font-weight:700;">
                ${stats.swipes}
              </p>
              <p style="font-size:10px;color:#888;margin:6px 0 0;text-transform:uppercase;letter-spacing:1.5px;">
                Swipes
              </p>
            </td>
            <td width="33%" style="text-align:center;padding:20px 8px;background:#1a1a1a;">
              <p style="font-family:'Noto Serif',Georgia,serif;font-size:28px;color:#e6c487;margin:0;font-weight:700;">
                ${stats.matches}
              </p>
              <p style="font-size:10px;color:#888;margin:6px 0 0;text-transform:uppercase;letter-spacing:1.5px;">
                Matches
              </p>
            </td>
            <td width="33%" style="text-align:center;padding:20px 8px;background:#1a1a1a;border-radius:0 12px 12px 0;">
              <p style="font-family:'Noto Serif',Georgia,serif;font-size:28px;color:#e6c487;margin:0;font-weight:700;">
                ${stats.dates}
              </p>
              <p style="font-size:10px;color:#888;margin:6px 0 0;text-transform:uppercase;letter-spacing:1.5px;">
                Dates
              </p>
            </td>
          </tr>
        </table>
        <p style="font-size:15px;color:#ccc;line-height:1.7;margin:0 0 24px;">
          Your matchmaker is continuously refining your matches. Check your portal for the latest opportunities.
        </p>
        <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
          <tr>
            <td style="background:linear-gradient(135deg,#e6c487,#c9a96e);border-radius:50px;padding:14px 36px;">
              <a href="#" style="font-family:'Inter',Arial,sans-serif;font-size:14px;color:#1a1a1a;text-decoration:none;font-weight:600;letter-spacing:0.3px;">
                View Dashboard
              </a>
            </td>
          </tr>
        </table>
      `
    ),
  };
}
