"use client";

import jsPDF from "jspdf";

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

  valuesTable(audit: AuditData) {
    // Section title
    this.checkPage(12);
    this.doc.setFontSize(11);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(...CYAN);
    this.doc.text("Value-by-Value Audit", this.margin, this.y);
    this.y += 6;

    // Table header
    const colX = [this.margin, this.margin + 55, this.margin + 100, this.margin + 145];
    this.checkPage(8);
    this.doc.setFontSize(7);
    this.doc.setTextColor(...GRAY_400);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("VALUE", colX[0], this.y);
    this.doc.text("VISIBILITY", colX[1], this.y);
    this.doc.text("CORROBORATION", colX[2], this.y);
    this.doc.text("STATUS", colX[3], this.y);
    this.y += 2;
    this.doc.setDrawColor(...CYAN);
    this.doc.line(this.margin, this.y, this.pageWidth - this.margin, this.y);
    this.y += 5;

    // Rows
    this.doc.setFont("helvetica", "normal");
    audit.values.forEach((v) => {
      this.checkPage(10);

      // Name (may need truncation)
      this.doc.setFontSize(8);
      this.doc.setTextColor(...WHITE);
      const name = v.name.length > 30 ? v.name.slice(0, 28) + "..." : v.name;
      this.doc.text(name, colX[0], this.y);

      // Visibility
      this.doc.setTextColor(...GRAY_400);
      this.doc.setFontSize(7);
      const vis = v.currentVisibility.format.length > 20 ? v.currentVisibility.format.slice(0, 18) + "..." : v.currentVisibility.format;
      this.doc.text(vis, colX[1], this.y);

      // Corroboration
      const corr = v.currentCorroboration.level.length > 18 ? v.currentCorroboration.level.slice(0, 16) + "..." : v.currentCorroboration.level;
      this.doc.text(corr, colX[2], this.y);

      // Status
      if (v.gap) {
        this.doc.setTextColor(...ORANGE);
        this.doc.text("Action needed", colX[3], this.y);
      } else {
        this.doc.setTextColor(...GREEN);
        this.doc.text("OK", colX[3], this.y);
      }

      this.y += 3;
      this.doc.setDrawColor(43, 49, 73);
      this.doc.line(this.margin, this.y, this.pageWidth - this.margin, this.y);
      this.y += 5;
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
      const actionLines = this.wrapText(a.action, this.contentWidth - 20);
      const impactLines = this.wrapText(a.impact, this.contentWidth - 20);
      const cardH = 14 + actionLines.length * 4.5 + impactLines.length * 3.5 + 8;
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
      this.doc.setFontSize(7);
      this.doc.setTextColor(...GRAY_400);
      this.doc.text(`Effort: ${a.effort}`, this.margin + 18, ty);

      this.y = cardTop + cardH + 5;
    });
  }

  companionBrief(brief: string) {
    const lines = this.wrapText(brief, this.contentWidth - 16);
    const cardH = Math.min(16 + lines.length * 3.5, 120);
    const cardTop = this.drawCard(cardH);
    let ty = cardTop + 10;

    this.doc.setFontSize(11);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(...CYAN);
    this.doc.text("Your Stratospheric Signal Brief", this.margin + 8, ty);
    ty += 7;

    this.doc.setFontSize(7);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(...GRAY_300);
    const maxLines = Math.floor((cardH - 20) / 3.5);
    lines.slice(0, maxLines).forEach((line: string) => {
      this.doc.text(line, this.margin + 8, ty);
      ty += 3.5;
    });
    if (lines.length > maxLines) {
      this.doc.setTextColor(...GRAY_400);
      this.doc.text("(continued in full report on screen)", this.margin + 8, ty);
    }

    this.y = cardTop + cardH + 6;
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

  pdf.valuesTable(audit);
  pdf.topActions(audit);
  pdf.companionBrief(audit.companionPromptBrief);
  pdf.footer();

  const filename = `Values-Signal-Audit-${audit.organisationName.replace(/[^a-zA-Z0-9]/g, "-")}.pdf`;
  pdf.save(filename);
}
