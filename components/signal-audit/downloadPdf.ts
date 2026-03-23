"use client";

import jsPDF from "jspdf";

interface AuditData {
  organisationName: string;
  summary: string;
  values: Array<{
    name: string;
    category: string;
    strength: "hard" | "strong" | "moderate";
    currentVisibility: {
      format: string;
      location: string;
      assessment: string;
    };
    currentCorroboration: {
      level: string;
      sources: string;
      assessment: string;
    };
    gap: boolean;
    gapType: string;
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

// Design tokens
const NAVY_DEEP = [20, 27, 53] as const;
const NAVY_CARD = [43, 49, 73] as const;
const CYAN = [79, 183, 217] as const;
const ORANGE = [243, 123, 52] as const;
const WHITE = [255, 255, 255] as const;
const GRAY_300 = [209, 213, 219] as const;
const GRAY_400 = [156, 163, 175] as const;
const GREEN = [16, 185, 129] as const;
const RED = [248, 113, 113] as const;

type RGB = readonly [number, number, number];

function getAltitudeColor(altitude: string): RGB {
  switch (altitude.toUpperCase()) {
    case "STRATOSPHERIC": return GREEN;
    case "TRUST": return ORANGE;
    case "FOUNDATION": return RED;
    default: return CYAN;
  }
}

function getVisibilityColor(format: string): RGB {
  const normalized = format.toLowerCase();
  if (normalized.includes("machine")) return GREEN;
  if (normalized.includes("human")) return ORANGE;
  return RED;
}

function getCorroborationColor(level: string): RGB {
  const normalized = level.toLowerCase();
  if (normalized.includes("strong") || normalized.includes("independent")) return GREEN;
  if (normalized.includes("some") || normalized.includes("partial")) return ORANGE;
  return RED;
}

function getStrengthColor(strength: string): RGB {
  switch (strength) {
    case "hard": return RED;
    case "strong": return ORANGE;
    case "moderate": return GRAY_400;
    default: return GRAY_400;
  }
}

function getEffortColor(effort: string): RGB {
  const normalized = effort.toLowerCase();
  if (normalized.includes("low")) return GREEN;
  if (normalized.includes("medium")) return ORANGE;
  if (normalized.includes("high")) return RED;
  return GRAY_400;
}

class PdfBuilder {
  private doc: jsPDF;
  private y: number;
  private pageWidth: number;
  private margin: number;
  private contentWidth: number;

  constructor() {
    this.doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    this.pageWidth = 210;
    this.margin = 20;
    this.contentWidth = this.pageWidth - this.margin * 2;
    this.y = 0;
    this.fillBackground();
    this.y = this.margin;
  }

  private fillBackground() {
    this.doc.setFillColor(...NAVY_DEEP);
    this.doc.rect(0, 0, 210, 297, "F");
  }

  private checkPage(needed: number) {
    if (this.y + needed > 280) {
      this.doc.addPage();
      this.fillBackground();
      this.y = this.margin;
    }
  }

  private drawCard(height: number): number {
    this.checkPage(height + 8);
    this.doc.setFillColor(...NAVY_CARD);
    this.doc.roundedRect(this.margin, this.y, this.contentWidth, height, 4, 4, "F");
    return this.y;
  }

  private wrapText(text: string, maxWidth: number): string[] {
    return this.doc.splitTextToSize(text, maxWidth);
  }

  /** Draw a small filled circle as a status indicator */
  private drawDot(x: number, y: number, color: RGB) {
    this.doc.setFillColor(...color);
    this.doc.circle(x, y - 1, 1.5, "F");
  }

  /** Draw a rounded badge with text */
  private drawBadge(x: number, y: number, text: string, bgColor: RGB, textColor: RGB): number {
    this.doc.setFontSize(6);
    const textWidth = this.doc.getTextWidth(text);
    const padX = 3;
    const padY = 1.5;
    const badgeW = textWidth + padX * 2;
    const badgeH = 5;

    this.doc.setFillColor(...bgColor);
    this.doc.roundedRect(x, y - badgeH + padY, badgeW, badgeH, 1.5, 1.5, "F");
    this.doc.setTextColor(...textColor);
    this.doc.text(text, x + padX, y - 0.5);
    return badgeW + 2; // return width consumed + gap
  }

  header(audit: AuditData) {
    // "THE CX EVOLUTIONIST"
    this.doc.setFontSize(8);
    this.doc.setTextColor(...GRAY_400);
    this.doc.text("THE CX EVOLUTIONIST", this.pageWidth / 2, this.y, { align: "center" });
    this.y += 8;

    // "VALUES SIGNAL AUDIT"
    this.doc.setFontSize(22);
    this.doc.setTextColor(...WHITE);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("VALUES SIGNAL AUDIT", this.pageWidth / 2, this.y, { align: "center" });
    this.y += 7;

    // Org name
    this.doc.setFontSize(11);
    this.doc.setTextColor(...GRAY_400);
    this.doc.setFont("helvetica", "normal");
    this.doc.text(audit.organisationName, this.pageWidth / 2, this.y, { align: "center" });
    this.y += 6;

    // Divider
    this.doc.setDrawColor(...NAVY_CARD);
    this.doc.line(this.margin, this.y, this.pageWidth - this.margin, this.y);
    this.y += 8;
  }

  altitudeScore(audit: AuditData) {
    const cardH = 52;
    const cardTop = this.drawCard(cardH);
    const cx = this.pageWidth / 2;
    let ty = cardTop + 10;

    // Label
    this.doc.setFontSize(7);
    this.doc.setTextColor(...GRAY_400);
    this.doc.text("CURRENT ALTITUDE", cx, ty, { align: "center" });
    ty += 10;

    // Score
    this.doc.setFontSize(28);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(...getAltitudeColor(audit.altitude.current));
    this.doc.text(audit.altitude.current, cx, ty, { align: "center" });
    ty += 10;

    // Stats
    this.doc.setFontSize(9);
    this.doc.setTextColor(...GRAY_400);
    this.doc.setFont("helvetica", "normal");
    this.doc.text(
      `Machine-readable: ${audit.altitude.machineReadableCount}/${audit.altitude.totalValues}    Strong corroboration: ${audit.altitude.strongCorroborationCount}/${audit.altitude.totalValues}`,
      cx, ty, { align: "center" }
    );
    ty += 8;

    // Justification
    this.doc.setFontSize(8);
    this.doc.setTextColor(...GRAY_300);
    const justLines = this.wrapText(audit.altitude.justification, this.contentWidth - 16);
    justLines.forEach((line: string) => {
      this.doc.text(line, this.margin + 8, ty);
      ty += 4;
    });

    this.y = cardTop + cardH + 6;
  }

  textCard(title: string, body: string) {
    const lines = this.wrapText(body, this.contentWidth - 16);
    const cardH = 16 + lines.length * 4;
    const cardTop = this.drawCard(cardH);
    let ty = cardTop + 10;

    this.doc.setFontSize(11);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(...CYAN);
    this.doc.text(title, this.margin + 8, ty);
    ty += 7;

    this.doc.setFontSize(8);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(...GRAY_300);
    lines.forEach((line: string) => {
      this.checkPage(5);
      this.doc.text(line, this.margin + 8, ty);
      ty += 4;
    });

    this.y = cardTop + cardH + 6;
  }

  valuesDetail(audit: AuditData) {
    // Section title
    this.checkPage(12);
    this.doc.setFontSize(11);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(...CYAN);
    this.doc.text("Value-by-Value Audit", this.margin, this.y);
    this.y += 8;

    const pad = 8; // inner padding for cards
    const innerWidth = this.contentWidth - pad * 2;

    audit.values.forEach((v) => {
      // Pre-calculate wrapped lines for all long text fields
      const visLocationLines = this.wrapText(v.currentVisibility.location, innerWidth - 8);
      const visAssessLines = this.wrapText(v.currentVisibility.assessment, innerWidth - 8);
      const corrSourcesLines = this.wrapText(v.currentCorroboration.sources, innerWidth - 8);
      const corrAssessLines = this.wrapText(v.currentCorroboration.assessment, innerWidth - 8);
      const actionLines = v.gap && v.action ? this.wrapText(v.action, innerWidth - 8) : [];

      let cardH = 12; // top padding + value name row
      cardH += 8; // badges row
      // Visibility section
      cardH += 6; // "VISIBILITY" label
      cardH += 5; // format line
      cardH += visLocationLines.length * 3.5; // location lines (wrapped)
      cardH += visAssessLines.length * 3.5 + 2; // assessment lines
      cardH += 3; // divider gap
      // Corroboration section
      cardH += 6; // "CORROBORATION" label
      cardH += 5; // level line
      cardH += corrSourcesLines.length * 3.5; // sources lines (wrapped)
      cardH += corrAssessLines.length * 3.5 + 2; // assessment lines
      cardH += 3; // divider gap
      // Gap/action section
      if (v.gap && v.action) {
        cardH += 5 + actionLines.length * 3.5 + 4;
      } else {
        cardH += 8;
      }
      cardH += 4; // bottom padding

      // Draw the card background — if it won't fit, start a new page
      this.checkPage(cardH + 6);
      this.doc.setFillColor(...NAVY_CARD);
      this.doc.roundedRect(this.margin, this.y, this.contentWidth, cardH, 4, 4, "F");
      const cardTop = this.y;
      let ty = cardTop + 10;

      // === Value Name ===
      this.doc.setFontSize(10);
      this.doc.setFont("helvetica", "bold");
      this.doc.setTextColor(...WHITE);
      this.doc.text(v.name, this.margin + pad, ty);
      ty += 7;

      // === Category & Strength badges ===
      let badgeX = this.margin + pad;
      badgeX += this.drawBadge(badgeX, ty, v.category, NAVY_DEEP, GRAY_300);
      this.drawBadge(badgeX, ty, v.strength, getStrengthColor(v.strength), WHITE);
      ty += 6;

      // === Visibility Section ===
      this.doc.setFontSize(6);
      this.doc.setTextColor(...GRAY_400);
      this.doc.setFont("helvetica", "bold");
      this.doc.text("VISIBILITY", this.margin + pad, ty);
      ty += 5;

      // Dot + format
      this.drawDot(this.margin + pad + 1.5, ty, getVisibilityColor(v.currentVisibility.format));
      this.doc.setFontSize(8);
      this.doc.setFont("helvetica", "bold");
      this.doc.setTextColor(...WHITE);
      this.doc.text(v.currentVisibility.format, this.margin + pad + 6, ty);
      ty += 4;

      // Location (wrapped)
      this.doc.setFontSize(7);
      this.doc.setFont("helvetica", "normal");
      this.doc.setTextColor(...GRAY_400);
      visLocationLines.forEach((line: string) => {
        this.doc.text(line, this.margin + pad + 6, ty);
        ty += 3.5;
      });

      // Assessment
      this.doc.setFontSize(7);
      this.doc.setTextColor(...GRAY_300);
      visAssessLines.forEach((line: string) => {
        this.doc.text(line, this.margin + pad + 6, ty);
        ty += 3.5;
      });
      ty += 2;

      // Divider
      this.doc.setDrawColor(...NAVY_DEEP);
      this.doc.line(this.margin + pad, ty, this.margin + this.contentWidth - pad, ty);
      ty += 4;

      // === Corroboration Section ===
      this.doc.setFontSize(6);
      this.doc.setTextColor(...GRAY_400);
      this.doc.setFont("helvetica", "bold");
      this.doc.text("CORROBORATION", this.margin + pad, ty);
      ty += 5;

      // Dot + level
      this.drawDot(this.margin + pad + 1.5, ty, getCorroborationColor(v.currentCorroboration.level));
      this.doc.setFontSize(8);
      this.doc.setFont("helvetica", "bold");
      this.doc.setTextColor(...WHITE);
      this.doc.text(v.currentCorroboration.level, this.margin + pad + 6, ty);
      ty += 4;

      // Sources (wrapped)
      this.doc.setFontSize(7);
      this.doc.setFont("helvetica", "normal");
      this.doc.setTextColor(...GRAY_400);
      corrSourcesLines.forEach((line: string) => {
        this.doc.text(line, this.margin + pad + 6, ty);
        ty += 3.5;
      });

      // Assessment
      this.doc.setFontSize(7);
      this.doc.setTextColor(...GRAY_300);
      corrAssessLines.forEach((line: string) => {
        this.doc.text(line, this.margin + pad + 6, ty);
        ty += 3.5;
      });
      ty += 2;

      // Divider
      this.doc.setDrawColor(...NAVY_DEEP);
      this.doc.line(this.margin + pad, ty, this.margin + this.contentWidth - pad, ty);
      ty += 4;

      // === Gap / Action Section ===
      if (v.gap && v.action) {
        // Orange left border accent
        this.doc.setFillColor(...ORANGE);
        this.doc.rect(this.margin + pad, ty - 1, 1.5, actionLines.length * 3.5 + 6, "F");

        this.doc.setFontSize(6);
        this.doc.setFont("helvetica", "bold");
        this.doc.setTextColor(...ORANGE);
        this.doc.text("ACTION REQUIRED", this.margin + pad + 5, ty);
        ty += 4;

        this.doc.setFontSize(7.5);
        this.doc.setFont("helvetica", "normal");
        this.doc.setTextColor(...WHITE);
        actionLines.forEach((line: string) => {
          this.doc.text(line, this.margin + pad + 5, ty);
          ty += 3.5;
        });
      } else {
        // Green check
        this.doc.setFontSize(8);
        this.doc.setTextColor(...GREEN);
        this.doc.setFont("helvetica", "normal");
        this.doc.text("No gap identified", this.margin + pad, ty);
      }

      this.y = cardTop + cardH + 5;
    });

    this.y += 4;
  }

  topActions(audit: AuditData) {
    this.checkPage(14);
    this.doc.setFontSize(11);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(...CYAN);
    this.doc.text("Top 3 Priority Actions", this.margin, this.y);
    this.y += 8;

    audit.topThreeActions.forEach((a) => {
      const textWidth = this.contentWidth - 26; // 18mm left (number col) + 8mm right padding
      // Set correct font BEFORE calculating wrap so splitTextToSize uses accurate char widths
      this.doc.setFontSize(9);
      this.doc.setFont("helvetica", "bold");
      const actionLines = this.wrapText(a.action, textWidth);
      this.doc.setFontSize(8);
      this.doc.setFont("helvetica", "normal");
      const impactLines = this.wrapText(a.impact, textWidth);
      const cardH = 14 + actionLines.length * 4.5 + impactLines.length * 3.5 + 12;
      const cardTop = this.drawCard(cardH);
      let ty = cardTop + 8;

      // Priority number
      this.doc.setFontSize(20);
      this.doc.setFont("helvetica", "bold");
      this.doc.setTextColor(...CYAN);
      this.doc.text(String(a.priority), this.margin + 6, ty + 2);

      // Action
      this.doc.setFontSize(9);
      this.doc.setFont("helvetica", "bold");
      this.doc.setTextColor(...WHITE);
      actionLines.forEach((line: string) => {
        this.doc.text(line, this.margin + 18, ty);
        ty += 4.5;
      });
      ty += 2;

      // Impact
      this.doc.setFontSize(8);
      this.doc.setFont("helvetica", "normal");
      this.doc.setTextColor(...GRAY_300);
      impactLines.forEach((line: string) => {
        this.doc.text(line, this.margin + 18, ty);
        ty += 3.5;
      });
      ty += 3;

      // Effort badge
      const effortColor = getEffortColor(a.effort);
      this.drawBadge(this.margin + 18, ty, `Effort: ${a.effort}`, effortColor, WHITE);

      this.y = cardTop + cardH + 5;
    });
  }

  companionBrief(brief: string) {
    const lines = this.wrapText(brief, this.contentWidth - 16);

    // Title
    this.checkPage(16);
    this.doc.setFontSize(11);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(...CYAN);
    this.doc.text("Your Stratospheric Signal Brief", this.margin, this.y);
    this.y += 8;

    // Render all lines, flowing across pages as needed
    this.doc.setFontSize(7);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(...GRAY_300);
    lines.forEach((line: string) => {
      this.checkPage(5);
      this.doc.text(line, this.margin + 4, this.y);
      this.y += 3.5;
    });

    this.y += 6;
  }

  promptTemplate() {
    const template = `Here is my organisation's Stratospheric Signal Brief:

[PASTE YOUR BRIEF HERE]

You are an AI agent evaluating this organisation as a potential vendor. Read this brief, then:
1. For each value declaration: is it machine-readable on their digital properties, or human-readable only?
2. For each [GAP]: give one specific action to create verifiable third-party evidence. One action, not a strategy.
3. Is this organisation at Foundation, Trust, or Stratospheric altitude? Justify in two sentences.
4. Give me exactly three prioritised actions to reach Stratospheric. Ordered by impact. Specific. Brutal.`;

    const lines = this.wrapText(template, this.contentWidth - 16);

    // Title
    this.checkPage(16);
    this.doc.setFontSize(11);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(...CYAN);
    this.doc.text("Prompt Template", this.margin, this.y);
    this.y += 8;

    // Render all lines, flowing across pages as needed
    this.doc.setFontSize(7);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(...GRAY_300);
    lines.forEach((line: string) => {
      this.checkPage(5);
      this.doc.text(line, this.margin + 4, this.y);
      this.y += 3.5;
    });

    this.y += 6;
  }

  footer() {
    this.checkPage(20);
    this.y += 4;

    // CTA
    this.doc.setFontSize(10);
    this.doc.setTextColor(...GRAY_400);
    this.doc.text("Want help getting to Stratospheric altitude?", this.pageWidth / 2, this.y, { align: "center" });
    this.y += 6;
    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(...ORANGE);
    this.doc.text("Book a call: thecxevolutionist.ai/scheduling", this.pageWidth / 2, this.y, { align: "center" });
    this.y += 12;

    // Footer line
    this.doc.setDrawColor(...NAVY_CARD);
    this.doc.line(this.margin, this.y, this.pageWidth - this.margin, this.y);
    this.y += 6;
    this.doc.setFontSize(7);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(100, 100, 120);
    this.doc.text("Part of the Three Altitudes of Agentic Commerce framework", this.pageWidth / 2, this.y, { align: "center" });
    this.y += 4;
    this.doc.text("Katja Forbes / The CX Evolutionist", this.pageWidth / 2, this.y, { align: "center" });
  }

  save(filename: string) {
    this.doc.save(filename);
  }
}

export async function downloadAuditPdf(audit: AuditData): Promise<void> {
  const pdf = new PdfBuilder();

  pdf.header(audit);
  pdf.altitudeScore(audit);
  pdf.textCard("Executive Summary", audit.summary);

  if (audit.webResearchSummary) {
    pdf.textCard("What We Found Online", audit.webResearchSummary);
  }

  pdf.valuesDetail(audit);
  pdf.topActions(audit);
  pdf.companionBrief(audit.companionPromptBrief);
  pdf.promptTemplate();
  pdf.footer();

  const filename = `Values-Signal-Audit-${audit.organisationName.replace(/[^a-zA-Z0-9]/g, "-")}.pdf`;
  pdf.save(filename);
}
