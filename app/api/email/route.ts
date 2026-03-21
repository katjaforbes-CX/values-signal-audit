import { NextRequest, NextResponse } from "next/server";

// Katja always gets a copy
const NOTIFY_EMAIL = "katjaforbes@gmail.com";

interface AuditValue {
  name: string;
  category: string;
  gap: boolean;
  gapType: string;
  currentVisibility: { format: string };
  currentCorroboration: { level: string };
  action: string | null;
}

interface AuditData {
  organisationName: string;
  summary: string;
  values: AuditValue[];
  altitude: {
    current: string;
    machineReadableCount: number;
    strongCorroborationCount: number;
    totalValues: number;
    justification: string;
  };
  topThreeActions: Array<{
    priority: number;
    action: string;
    impact: string;
    effort: string;
  }>;
  webResearchSummary?: string;
  companionPromptBrief: string;
}

function buildEmailHtml(audit: AuditData, websiteUrl: string): string {
  const altitudeColor =
    audit.altitude.current === "STRATOSPHERIC"
      ? "#10b981"
      : audit.altitude.current === "TRUST"
      ? "#F37B34"
      : "#f87171";

  const valuesHtml = audit.values
    .map(
      (v) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #2B3149; color: #ffffff;">${v.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #2B3149; color: #9ca3af; text-align: center;">${v.currentVisibility.format}</td>
        <td style="padding: 12px; border-bottom: 1px solid #2B3149; color: #9ca3af; text-align: center;">${v.currentCorroboration.level}</td>
        <td style="padding: 12px; border-bottom: 1px solid #2B3149; text-align: center;">
          ${v.gap ? '<span style="color: #F37B34;">Action needed</span>' : '<span style="color: #10b981;">&#10003;</span>'}
        </td>
      </tr>`
    )
    .join("");

  const actionsHtml = audit.topThreeActions
    .map(
      (a) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #2B3149; color: #4FB7D9; font-weight: bold; width: 30px;">${a.priority}</td>
        <td style="padding: 12px; border-bottom: 1px solid #2B3149; color: #ffffff;">${a.action}</td>
        <td style="padding: 12px; border-bottom: 1px solid #2B3149; color: #9ca3af;">${a.effort}</td>
      </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin: 0; padding: 0; background-color: #141B35; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
  <div style="max-width: 640px; margin: 0 auto; padding: 40px 24px;">

    <!-- Header -->
    <div style="text-align: center; margin-bottom: 40px;">
      <p style="color: #ffffff60; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin: 0 0 20px;">The CX Evolutionist</p>
      <h1 style="color: #ffffff; font-size: 28px; font-weight: bold; text-transform: uppercase; margin: 0 0 8px;">Stratospheric Signal Audit</h1>
      <p style="color: #9ca3af; font-size: 14px; margin: 0;">${audit.organisationName}${websiteUrl ? ` &bull; ${websiteUrl}` : ""}</p>
    </div>

    <!-- Altitude Score -->
    <div style="background-color: #2B3149; border-radius: 12px; padding: 32px; margin-bottom: 24px; text-align: center;">
      <p style="color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 12px;">Current Altitude</p>
      <h2 style="color: ${altitudeColor}; font-size: 36px; font-weight: bold; margin: 0 0 16px;">${audit.altitude.current}</h2>
      <p style="color: #9ca3af; font-size: 14px; margin: 0;">
        Machine-readable: ${audit.altitude.machineReadableCount}/${audit.altitude.totalValues} &nbsp;&bull;&nbsp;
        Strong corroboration: ${audit.altitude.strongCorroborationCount}/${audit.altitude.totalValues}
      </p>
    </div>

    <!-- Summary -->
    <div style="background-color: #2B3149; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
      <h3 style="color: #4FB7D9; font-size: 16px; margin: 0 0 12px;">Executive Summary</h3>
      <p style="color: #d1d5db; font-size: 14px; line-height: 1.6; margin: 0;">${audit.summary}</p>
    </div>

    ${audit.webResearchSummary ? `
    <!-- Web Research -->
    <div style="background-color: #2B3149; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
      <h3 style="color: #4FB7D9; font-size: 16px; margin: 0 0 12px;">What We Found Online</h3>
      <p style="color: #d1d5db; font-size: 14px; line-height: 1.6; margin: 0;">${audit.webResearchSummary}</p>
    </div>
    ` : ""}

    <!-- Values Table -->
    <div style="background-color: #2B3149; border-radius: 12px; padding: 24px; margin-bottom: 24px; overflow-x: auto;">
      <h3 style="color: #4FB7D9; font-size: 16px; margin: 0 0 16px;">Value-by-Value Audit</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <thead>
          <tr>
            <th style="padding: 12px; text-align: left; color: #9ca3af; border-bottom: 2px solid #4FB7D9;">Value</th>
            <th style="padding: 12px; text-align: center; color: #9ca3af; border-bottom: 2px solid #4FB7D9;">Visibility</th>
            <th style="padding: 12px; text-align: center; color: #9ca3af; border-bottom: 2px solid #4FB7D9;">Corroboration</th>
            <th style="padding: 12px; text-align: center; color: #9ca3af; border-bottom: 2px solid #4FB7D9;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${valuesHtml}
        </tbody>
      </table>
    </div>

    <!-- Top 3 Actions -->
    <div style="background-color: #2B3149; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
      <h3 style="color: #4FB7D9; font-size: 16px; margin: 0 0 16px;">Top 3 Priority Actions</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <thead>
          <tr>
            <th style="padding: 12px; text-align: left; color: #9ca3af; border-bottom: 2px solid #4FB7D9;">#</th>
            <th style="padding: 12px; text-align: left; color: #9ca3af; border-bottom: 2px solid #4FB7D9;">Action</th>
            <th style="padding: 12px; text-align: left; color: #9ca3af; border-bottom: 2px solid #4FB7D9;">Effort</th>
          </tr>
        </thead>
        <tbody>
          ${actionsHtml}
        </tbody>
      </table>
    </div>

    <!-- CTA -->
    <div style="text-align: center; margin: 40px 0;">
      <p style="color: #9ca3af; font-size: 14px; margin: 0 0 16px;">Want help getting to Stratospheric altitude?</p>
      <a href="https://www.thecxevolutionist.ai" style="display: inline-block; background-color: #F37B34; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 999px; font-size: 14px; font-weight: bold; text-transform: uppercase;">Book a Strategy Session</a>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding-top: 32px; border-top: 1px solid #2B3149;">
      <p style="color: #ffffff40; font-size: 11px; margin: 0;">Part of the Three Altitudes of Agentic Commerce framework</p>
      <p style="color: #ffffff30; font-size: 11px; margin: 4px 0 0;">Katja Forbes / The CX Evolutionist</p>
    </div>

  </div>
</body>
</html>`;
}

function buildNotifyHtml(
  audit: AuditData,
  websiteUrl: string,
  userEmail: string,
  userName: string,
  userCompany: string
): string {
  const gapCount = audit.values.filter((v) => v.gap).length;

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin: 0; padding: 0; background-color: #141B35; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
  <div style="max-width: 640px; margin: 0 auto; padding: 40px 24px;">
    <h2 style="color: #4FB7D9; font-size: 20px; margin: 0 0 20px;">New Signal Audit Lead</h2>

    <div style="background-color: #2B3149; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
      <table style="width: 100%; font-size: 14px; color: #d1d5db;">
        <tr><td style="padding: 6px 12px; color: #9ca3af;">Name</td><td style="padding: 6px 12px; color: #ffffff;">${userName || "Not provided"}</td></tr>
        <tr><td style="padding: 6px 12px; color: #9ca3af;">Email</td><td style="padding: 6px 12px;"><a href="mailto:${userEmail}" style="color: #4FB7D9;">${userEmail}</a></td></tr>
        <tr><td style="padding: 6px 12px; color: #9ca3af;">Company</td><td style="padding: 6px 12px; color: #ffffff;">${userCompany || "Not provided"}</td></tr>
        <tr><td style="padding: 6px 12px; color: #9ca3af;">URL Audited</td><td style="padding: 6px 12px;"><a href="${websiteUrl}" style="color: #4FB7D9;">${websiteUrl || "Pasted content"}</a></td></tr>
      </table>
    </div>

    <div style="background-color: #2B3149; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
      <h3 style="color: #ffffff; font-size: 16px; margin: 0 0 8px;">${audit.organisationName}</h3>
      <p style="color: #9ca3af; font-size: 13px; margin: 0 0 12px;">
        Altitude: <strong style="color: #ffffff;">${audit.altitude.current}</strong> &bull;
        Values: ${audit.altitude.totalValues} &bull;
        Gaps: ${gapCount}
      </p>
      <p style="color: #d1d5db; font-size: 14px; line-height: 1.6; margin: 0;">${audit.summary}</p>
    </div>

    <p style="color: #ffffff40; font-size: 11px; text-align: center;">Stratospheric Signal Audit — automated notification</p>
  </div>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  try {
    const { audit, email, firstName, lastName, company, websiteUrl } =
      await req.json();

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      console.error("RESEND_API_KEY not configured");
      return NextResponse.json(
        { status: "error", detail: "Email service not configured" },
        { status: 200 }
      );
    }

    if (!email || !audit) {
      return NextResponse.json(
        { error: "Email and audit data required." },
        { status: 400 }
      );
    }

    const userName = [firstName, lastName].filter(Boolean).join(" ");
    const fromAddress = process.env.RESEND_FROM_EMAIL || "audit@thecxevolutionist.ai";

    // Send report to user
    const userEmailPromise = fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: `The CX Evolutionist <${fromAddress}>`,
        to: [email],
        subject: `Your Stratospheric Signal Audit — ${audit.organisationName}`,
        html: buildEmailHtml(audit, websiteUrl || ""),
      }),
    });

    // Send notification to Katja
    const notifyEmailPromise = fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: `Signal Audit <${fromAddress}>`,
        to: [NOTIFY_EMAIL],
        reply_to: email,
        subject: `New Audit: ${audit.organisationName} (${audit.altitude.current}) — ${userName || email}`,
        html: buildNotifyHtml(audit, websiteUrl || "", email, userName, company || ""),
      }),
    });

    const [userRes, notifyRes] = await Promise.all([
      userEmailPromise,
      notifyEmailPromise,
    ]);

    if (!userRes.ok) {
      const errText = await userRes.text();
      console.error("Resend user email error:", userRes.status, errText);
    }
    if (!notifyRes.ok) {
      const errText = await notifyRes.text();
      console.error("Resend notify email error:", notifyRes.status, errText);
    }

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("Email route error:", err);
    return NextResponse.json({ status: "error" }, { status: 200 });
  }
}
