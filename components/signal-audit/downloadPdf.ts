"use client";

interface AuditData {
  organisationName: string;
  summary: string;
  values: Array<{
    name: string;
    category: string;
    currentVisibility: { format: string };
    currentCorroboration: { level: string };
    gap: boolean;
    action: string | null;
  }>;
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

function getAltitudeColor(altitude: string): string {
  switch (altitude.toUpperCase()) {
    case "STRATOSPHERIC":
      return "#10b981";
    case "TRUST":
      return "#F37B34";
    case "FOUNDATION":
      return "#f87171";
    default:
      return "#4FB7D9";
  }
}

function buildPdfHtml(audit: AuditData): string {
  const altitudeColor = getAltitudeColor(audit.altitude.current);

  const valuesRows = audit.values
    .map(
      (v) => `
      <tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid #2B3149; color: #ffffff; font-size: 12px;">${v.name}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #2B3149; color: #9ca3af; text-align: center; font-size: 11px;">${v.currentVisibility.format}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #2B3149; color: #9ca3af; text-align: center; font-size: 11px;">${v.currentCorroboration.level}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #2B3149; text-align: center; font-size: 11px;">
          ${v.gap ? '<span style="color: #F37B34;">Action needed</span>' : '<span style="color: #10b981;">&#10003;</span>'}
        </td>
      </tr>`
    )
    .join("");

  const actionsRows = audit.topThreeActions
    .map(
      (a) => `
      <tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid #2B3149; color: #4FB7D9; font-weight: bold; width: 30px; font-size: 14px;">${a.priority}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #2B3149; color: #ffffff; font-size: 12px;">
          <strong>${a.action}</strong>
          <div style="color: #9ca3af; font-size: 11px; margin-top: 4px;">${a.impact}</div>
        </td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #2B3149; color: #9ca3af; font-size: 11px;">${a.effort}</td>
      </tr>`
    )
    .join("");

  const gapValues = audit.values.filter((v) => v.gap && v.action);
  const gapSection =
    gapValues.length > 0
      ? `
    <div style="background-color: #2B3149; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
      <h3 style="color: #F37B34; font-size: 14px; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 1px;">Gaps Identified</h3>
      ${gapValues
        .map(
          (v) => `
        <div style="border-left: 3px solid #F37B34; padding: 8px 12px; margin-bottom: 8px; background: rgba(243,123,52,0.05); border-radius: 0 8px 8px 0;">
          <p style="color: #ffffff; font-size: 12px; font-weight: bold; margin: 0 0 4px;">${v.name}</p>
          <p style="color: #d1d5db; font-size: 11px; margin: 0;">${v.action}</p>
        </div>`
        )
        .join("")}
    </div>`
      : "";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background-color: #141B35; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #ffffff; }
  </style>
</head>
<body>
  <div style="max-width: 700px; margin: 0 auto; padding: 30px 24px;">

    <!-- Header -->
    <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #2B3149;">
      <p style="color: #ffffff60; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; margin: 0 0 12px;">The CX Evolutionist</p>
      <h1 style="color: #ffffff; font-size: 24px; font-weight: bold; text-transform: uppercase; margin: 0 0 6px;">Values Signal Audit</h1>
      <p style="color: #9ca3af; font-size: 13px; margin: 0;">${audit.organisationName}</p>
    </div>

    <!-- Altitude Score -->
    <div style="background-color: #2B3149; border-radius: 12px; padding: 24px; margin-bottom: 20px; text-align: center;">
      <p style="color: #9ca3af; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 10px;">Current Altitude</p>
      <h2 style="color: ${altitudeColor}; font-size: 32px; font-weight: bold; margin: 0 0 12px;">${audit.altitude.current}</h2>
      <p style="color: #9ca3af; font-size: 12px; margin: 0 0 12px;">
        Machine-readable: ${audit.altitude.machineReadableCount}/${audit.altitude.totalValues} &nbsp;&bull;&nbsp;
        Strong corroboration: ${audit.altitude.strongCorroborationCount}/${audit.altitude.totalValues}
      </p>
      <p style="color: #d1d5db; font-size: 12px; line-height: 1.5; margin: 0;">${audit.altitude.justification}</p>
    </div>

    <!-- Summary -->
    <div style="background-color: #2B3149; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
      <h3 style="color: #4FB7D9; font-size: 14px; margin: 0 0 10px;">Executive Summary</h3>
      <p style="color: #d1d5db; font-size: 12px; line-height: 1.6; margin: 0;">${audit.summary}</p>
    </div>

    ${
      audit.webResearchSummary
        ? `
    <!-- Web Research -->
    <div style="background-color: #2B3149; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
      <h3 style="color: #4FB7D9; font-size: 14px; margin: 0 0 10px;">What We Found Online</h3>
      <p style="color: #d1d5db; font-size: 12px; line-height: 1.6; margin: 0;">${audit.webResearchSummary}</p>
    </div>`
        : ""
    }

    <!-- Values Table -->
    <div style="background-color: #2B3149; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
      <h3 style="color: #4FB7D9; font-size: 14px; margin: 0 0 14px;">Value-by-Value Audit</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="padding: 8px 12px; text-align: left; color: #9ca3af; border-bottom: 2px solid #4FB7D9; font-size: 10px; text-transform: uppercase;">Value</th>
            <th style="padding: 8px 12px; text-align: center; color: #9ca3af; border-bottom: 2px solid #4FB7D9; font-size: 10px; text-transform: uppercase;">Visibility</th>
            <th style="padding: 8px 12px; text-align: center; color: #9ca3af; border-bottom: 2px solid #4FB7D9; font-size: 10px; text-transform: uppercase;">Corroboration</th>
            <th style="padding: 8px 12px; text-align: center; color: #9ca3af; border-bottom: 2px solid #4FB7D9; font-size: 10px; text-transform: uppercase;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${valuesRows}
        </tbody>
      </table>
    </div>

    ${gapSection}

    <!-- Top 3 Actions -->
    <div style="background-color: #2B3149; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
      <h3 style="color: #4FB7D9; font-size: 14px; margin: 0 0 14px;">Top 3 Priority Actions</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="padding: 8px 12px; text-align: left; color: #9ca3af; border-bottom: 2px solid #4FB7D9; font-size: 10px; text-transform: uppercase;">#</th>
            <th style="padding: 8px 12px; text-align: left; color: #9ca3af; border-bottom: 2px solid #4FB7D9; font-size: 10px; text-transform: uppercase;">Action</th>
            <th style="padding: 8px 12px; text-align: left; color: #9ca3af; border-bottom: 2px solid #4FB7D9; font-size: 10px; text-transform: uppercase;">Effort</th>
          </tr>
        </thead>
        <tbody>
          ${actionsRows}
        </tbody>
      </table>
    </div>

    <!-- Companion Brief -->
    <div style="background-color: #2B3149; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
      <h3 style="color: #4FB7D9; font-size: 14px; margin: 0 0 10px;">Your Stratospheric Signal Brief</h3>
      <div style="background-color: #141B35; border-radius: 8px; padding: 16px; border: 1px solid #3A4160;">
        <p style="color: #d1d5db; font-size: 11px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${audit.companionPromptBrief}</p>
      </div>
    </div>

    <!-- CTA -->
    <div style="text-align: center; margin: 30px 0 20px;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0 0 6px;">Want help getting to Stratospheric altitude?</p>
      <p style="color: #F37B34; font-size: 14px; font-weight: bold;">Book a call: thecxevolutionist.ai/scheduling</p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding-top: 20px; border-top: 1px solid #2B3149;">
      <p style="color: #ffffff40; font-size: 9px; margin: 0;">Part of the Three Altitudes of Agentic Commerce framework</p>
      <p style="color: #ffffff30; font-size: 9px; margin: 4px 0 0;">Katja Forbes / The CX Evolutionist</p>
    </div>

  </div>
</body>
</html>`;
}

export async function downloadAuditPdf(audit: AuditData): Promise<void> {
  const html2pdf = (await import("html2pdf.js")).default;

  const container = document.createElement("div");
  container.innerHTML = buildPdfHtml(audit);
  // Must be on-screen for html2canvas to render — hide visually with z-index
  container.style.position = "fixed";
  container.style.top = "0";
  container.style.left = "0";
  container.style.width = "700px";
  container.style.zIndex = "-9999";
  container.style.opacity = "1";
  document.body.appendChild(container);

  const filename = `Values-Signal-Audit-${audit.organisationName.replace(/[^a-zA-Z0-9]/g, "-")}.pdf`;

  try {
    await html2pdf()
      .set({
        margin: 0,
        filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          backgroundColor: "#141B35",
          useCORS: true,
          windowWidth: 700,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
      })
      .from(container)
      .save();
  } finally {
    document.body.removeChild(container);
  }
}
