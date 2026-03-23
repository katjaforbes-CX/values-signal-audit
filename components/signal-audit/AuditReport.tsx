"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { downloadAuditPdf } from "./downloadPdf";

interface AuditReportProps {
  audit: {
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
  };
}

const COMPANION_PROMPT_TEMPLATE = `Here is my organisation's Stratospheric Signal Brief:

[PASTE YOUR BRIEF HERE]

You are an AI agent evaluating this organisation as a potential vendor. Read this brief, then:
1. For each value declaration: is it machine-readable on their digital properties, or human-readable only?
2. For each [GAP]: give one specific action to create verifiable third-party evidence. One action, not a strategy.
3. Is this organisation at Foundation, Trust, or Stratospheric altitude? Justify in two sentences.
4. Give me exactly three prioritised actions to reach Stratospheric. Ordered by impact. Specific. Brutal.`;

const getAltitudeColor = (altitude: string): string => {
  switch (altitude.toUpperCase()) {
    case "STRATOSPHERIC":
      return "text-emerald-400";
    case "TRUST":
      return "text-orange";
    case "FOUNDATION":
      return "text-red-400";
    default:
      return "text-cyan";
  }
};

const getVisibilityIndicator = (format: string): React.ReactNode => {
  const normalized = format.toLowerCase();
  if (normalized.includes("machine")) {
    return <div className="w-3 h-3 bg-emerald-400 rounded-full" />;
  } else if (normalized.includes("human")) {
    return <div className="w-3 h-3 bg-orange rounded-full" />;
  }
  return <div className="w-3 h-3 bg-red-400 rounded-full" />;
};

const getCorroborationIndicator = (level: string): React.ReactNode => {
  const normalized = level.toLowerCase();
  if (normalized.includes("strong") || normalized.includes("independent")) {
    return <div className="w-3 h-3 bg-emerald-400 rounded-full" />;
  } else if (normalized.includes("some") || normalized.includes("partial")) {
    return <div className="w-3 h-3 bg-orange rounded-full" />;
  }
  return <div className="w-3 h-3 bg-red-400 rounded-full" />;
};

const getStrengthColor = (strength: string): string => {
  switch (strength) {
    case "hard":
      return "bg-red-400 text-white";
    case "strong":
      return "bg-orange text-white";
    case "moderate":
      return "bg-gray-400 text-white";
    default:
      return "bg-gray-400 text-white";
  }
};

const getEffortColor = (effort: string): string => {
  const normalized = effort.toLowerCase();
  if (normalized.includes("low")) {
    return "bg-emerald-400 text-white";
  } else if (normalized.includes("medium")) {
    return "bg-orange text-white";
  } else if (normalized.includes("high")) {
    return "bg-red-400 text-white";
  }
  return "bg-gray-400 text-white";
};

const CopyButton: React.FC<{ text: string; label: string }> = ({
  text,
  label,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="bg-cyan text-white px-4 py-2 rounded font-body text-sm font-medium hover:opacity-90 transition"
    >
      {copied ? "Copied!" : `Copy ${label}`}
    </button>
  );
};

const AltitudeIndicator: React.FC<{ current: string }> = ({ current }) => {
  const stages = ["FOUNDATION", "TRUST", "STRATOSPHERIC"];
  const currentIndex = stages.findIndex((s) => s === current.toUpperCase());

  return (
    <div className="flex items-center gap-4 my-6">
      {stages.map((stage, index) => (
        <div key={stage} className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${
              index <= currentIndex
                ? index === currentIndex
                  ? "bg-cyan text-navy-deep"
                  : "bg-emerald-400 text-navy-deep"
                : "bg-navy-light text-gray-400"
            }`}
          >
            {index + 1}
          </div>
          <span
            className={`text-xs font-body ml-2 ${
              index <= currentIndex ? "text-white" : "text-gray-400"
            }`}
          >
            {stage}
          </span>
          {index < stages.length - 1 && (
            <div
              className={`w-8 h-0.5 ml-4 ${
                index < currentIndex ? "bg-emerald-400" : "bg-navy-light"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

const DownloadButton: React.FC<{ audit: AuditReportProps["audit"] }> = ({ audit }) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadAuditPdf(audit);
    } catch (err) {
      console.error("PDF download failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="inline-flex items-center gap-2 bg-cyan/10 border border-cyan/30 text-cyan hover:bg-cyan/20 px-5 py-2.5 rounded-full font-body text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {downloading ? (
        "Generating PDF..."
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Download Report
        </>
      )}
    </button>
  );
};

export const AuditReport: React.FC<AuditReportProps> = ({ audit }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.div
      className="min-h-screen bg-navy-deep text-white p-6 md:p-12 font-body"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header Section */}
      <motion.section variants={itemVariants} className="mb-12">
        <h1 className="text-5xl md:text-6xl font-heading text-white mb-6">
          {audit.organisationName}
        </h1>
        <p className="text-lg text-gray-300 leading-relaxed max-w-3xl mb-6">
          {audit.summary}
        </p>
        <DownloadButton audit={audit} />
      </motion.section>

      {/* Web Research Summary */}
      {audit.webResearchSummary && (
        <motion.section variants={itemVariants} className="mb-12 bg-cyan/5 border border-cyan/20 rounded-lg p-8">
          <h2 className="text-2xl font-heading mb-4 text-cyan">What We Found Online</h2>
          <p className="text-gray-300 leading-relaxed">
            {audit.webResearchSummary}
          </p>
        </motion.section>
      )}

      {/* Altitude Score Section */}
      <motion.section
        variants={itemVariants}
        className="mb-12 bg-navy-light rounded-lg p-8"
      >
        <h2 className="text-2xl font-heading mb-6">Altitude Score</h2>

        <div className="mb-8">
          <div className={`text-5xl font-heading mb-2 ${getAltitudeColor(audit.altitude.current)}`}>
            {audit.altitude.current}
          </div>
          <AltitudeIndicator current={audit.altitude.current} />
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <p className="text-gray-400 text-sm mb-2">Machine-Readable</p>
            <p className="text-2xl font-bold text-cyan">
              {audit.altitude.machineReadableCount}/{audit.altitude.totalValues}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-2">Strong Corroboration</p>
            <p className="text-2xl font-bold text-emerald-400">
              {audit.altitude.strongCorroborationCount}/{audit.altitude.totalValues}
            </p>
          </div>
        </div>

        <p className="text-gray-300 leading-relaxed">
          {audit.altitude.justification}
        </p>
      </motion.section>

      {/* Value-by-Value Audit Section */}
      <motion.section variants={itemVariants} className="mb-12">
        <h2 className="text-2xl font-heading mb-6">Value-by-Value Audit</h2>

        <motion.div
          className="space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {audit.values.map((value, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-navy-light rounded-lg p-6 border border-navy hover:border-cyan transition"
            >
              {/* Value Header */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <h3 className="text-xl font-bold text-white">{value.name}</h3>
                <div className="flex gap-2 flex-wrap">
                  <span className="bg-navy text-gray-300 text-xs px-3 py-1 rounded-full font-body">
                    {value.category}
                  </span>
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-body font-medium ${getStrengthColor(value.strength)}`}
                  >
                    {value.strength}
                  </span>
                </div>
              </div>

              {/* Visibility Row */}
              <div className="mb-4 pb-4 border-b border-navy">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                  Visibility
                </p>
                <div className="flex items-start gap-3">
                  {getVisibilityIndicator(value.currentVisibility.format)}
                  <div>
                    <p className="text-sm font-medium text-white">
                      {value.currentVisibility.format}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {value.currentVisibility.location}
                    </p>
                    <p className="text-sm text-gray-300 mt-2">
                      {value.currentVisibility.assessment}
                    </p>
                  </div>
                </div>
              </div>

              {/* Corroboration Row */}
              <div className="mb-4 pb-4 border-b border-navy">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                  Corroboration
                </p>
                <div className="flex items-start gap-3">
                  {getCorroborationIndicator(value.currentCorroboration.level)}
                  <div>
                    <p className="text-sm font-medium text-white">
                      {value.currentCorroboration.level}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {value.currentCorroboration.sources}
                    </p>
                    <p className="text-sm text-gray-300 mt-2">
                      {value.currentCorroboration.assessment}
                    </p>
                  </div>
                </div>
              </div>

              {/* Gap Status */}
              {value.gap && value.action ? (
                <div className="border-l-4 border-orange bg-orange bg-opacity-10 p-4 rounded">
                  <p className="text-xs text-orange uppercase tracking-wide font-bold mb-2">
                    Action Required
                  </p>
                  <p className="text-sm text-white">{value.action}</p>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-emerald-400">
                  <span className="text-lg">✓</span>
                  <p className="text-sm">No gap identified</p>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Top 3 Priority Actions Section */}
      <motion.section variants={itemVariants} className="mb-12">
        <h2 className="text-2xl font-heading mb-6">Top 3 Priority Actions</h2>

        <motion.div
          className="space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {audit.topThreeActions.map((action) => (
            <motion.div
              key={action.priority}
              variants={itemVariants}
              className="bg-navy-light rounded-lg p-6 flex flex-col md:flex-row md:items-start gap-6"
            >
              <div className="text-6xl font-heading text-cyan flex-shrink-0">
                {action.priority}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-3">
                  {action.action}
                </h3>
                <div className="mb-4">
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {action.impact}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Effort:</span>
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium ${getEffortColor(action.effort)}`}
                  >
                    {action.effort}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Step 2: Companion Prompt Section */}
      <motion.section variants={itemVariants} className="mb-12">
        <div className="flex items-start gap-4 sm:gap-6 mb-6">
          <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-cyan flex items-center justify-center">
            <span className="font-heading text-lg sm:text-xl text-navy-deep">2</span>
          </div>
          <div className="flex-1 pt-1">
            <h2 className="text-xl sm:text-2xl font-heading text-white uppercase mb-1">Get Customised Actions</h2>
            <p className="font-body text-sm text-white/50">Paste your brief and prompt into your favourite AI for personalised next steps</p>
          </div>
        </div>

        {/* Brief Section */}
        <div className="mb-8">
          <p className="text-sm text-gray-400 uppercase tracking-wide mb-3">
            Your Stratospheric Signal Brief
          </p>
          <div className="bg-navy-deep rounded-lg p-6 mb-4 font-mono text-sm text-gray-300 overflow-x-auto max-h-64 overflow-y-auto border border-navy-light">
            {audit.companionPromptBrief}
          </div>
          <CopyButton text={audit.companionPromptBrief} label="Brief" />
        </div>

        {/* Template Section */}
        <div className="mt-8">
          <p className="text-sm text-gray-400 uppercase tracking-wide mb-3">
            Prompt Template
          </p>
          <div className="bg-navy-deep rounded-lg p-6 mb-4 font-mono text-sm text-gray-300 overflow-x-auto max-h-64 overflow-y-auto border border-navy-light whitespace-pre-wrap break-words">
            {COMPANION_PROMPT_TEMPLATE}
          </div>
          <CopyButton text={COMPANION_PROMPT_TEMPLATE} label="Prompt" />
        </div>
      </motion.section>

      {/* Step 3: Book a Call */}
      <motion.section variants={itemVariants} className="mb-12">
        <div className="flex items-start gap-4 sm:gap-6 mb-6">
          <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-cyan flex items-center justify-center">
            <span className="font-heading text-lg sm:text-xl text-navy-deep">3</span>
          </div>
          <div className="flex-1 pt-1">
            <h2 className="text-xl sm:text-2xl font-heading text-white uppercase mb-1">Talk to Katja</h2>
            <p className="font-body text-sm text-white/50">Want help getting to Stratospheric altitude? Book a call to discuss how Katja can help</p>
          </div>
        </div>

        <div className="text-center py-8">
          <a
            href="https://www.thecxevolutionist.ai/scheduling"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-orange hover:bg-orange-hover text-white font-heading text-base sm:text-lg uppercase px-10 py-4 rounded-full transition-all duration-200"
          >
            Book a Call with Katja
          </a>
        </div>
      </motion.section>
    </motion.div>
  );
};
