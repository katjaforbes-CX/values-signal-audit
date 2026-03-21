"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ValueEntry, LOCATIONS, CORROBORATIONS, MACHINE_READABLE_LOCATIONS, STRONG_CORROBORATIONS, ConditionalRule } from "./types";

interface AuditOutputProps {
  values: ValueEntry[];
  locations: Record<number, string>;
  corroboration: Record<number, string>;
  absolutes: string[];
  conditionals: ConditionalRule[];
  onRunAudit: () => void;
  showResults: boolean;
}

const MACHINE_READABLE = ["schema", "llms", "api", "product-page"];
const STRONG_CORR = ["cert-strong", "analyst", "wikipedia", "earned-media"];

export default function AuditOutput({
  values,
  locations,
  corroboration,
  absolutes,
  conditionals,
  onRunAudit,
  showResults,
}: AuditOutputProps) {
  const [copiedBrief, setCopiedBrief] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Calculate altitude score
  const mrCount = values.filter((_, i) => MACHINE_READABLE.includes(locations[i])).length;
  const scCount = values.filter((_, i) => STRONG_CORR.includes(corroboration[i])).length;
  const total = values.length;

  const altitude =
    total === 0
      ? null
      : mrCount >= Math.ceil(total * 0.5) && scCount >= Math.ceil(total * 0.5)
        ? "STRATOSPHERIC"
        : mrCount > 0 || scCount > 0
          ? "TRUST"
          : "FOUNDATION";

  // Identify gaps
  const gaps = values
    .map((value, i) => {
      const isLocationGap = !MACHINE_READABLE.includes(locations[i]);
      const isCorroborationGap = corroboration[i] === "none" || corroboration[i] === "own-site";

      if (isLocationGap || isCorroborationGap) {
        return {
          valueName: value.name,
          gapType: isLocationGap && isCorroborationGap ? "both" : isLocationGap ? "location" : "corroboration",
          location: locations[i],
          corroborationLevel: corroboration[i],
        };
      }
      return null;
    })
    .filter((gap) => gap !== null);

  // Generate Signal Brief
  const generateSignalBrief = () => {
    const briefLines = [
      "SIGNAL BRIEF",
      "============",
      "",
      "ORGANISATION VALUE DECLARATIONS",
      "--------",
      values.map((v, i) => `${i + 1}. "${v.name}"`).join("\n"),
      "",
      "LOCATION ANALYSIS",
      "--------",
      `Machine-readable locations: ${mrCount}/${total}`,
      `Locations: ${values.map((_, i) => locations[i]).join(", ")}`,
      "",
      "CORROBORATION ANALYSIS",
      "--------",
      `Strong corroborations: ${scCount}/${total}`,
      `Corroboration sources: ${values.map((_, i) => corroboration[i]).join(", ")}`,
      "",
      "ALTITUDE DETERMINATION",
      "--------",
      `Altitude: ${altitude || "N/A"}`,
      altitude === "STRATOSPHERIC"
        ? "Machine-readable AND strongly corroborated evidence for core claims."
        : altitude === "TRUST"
          ? "Some verifiable evidence present; gaps in coverage or corroboration."
          : "Claims lack machine-readable or independent corroboration.",
      "",
      gaps.length > 0
        ? `GAPS IDENTIFIED (${gaps.length})\n--------\n${gaps
            .map((g) => {
              if (g.gapType === "both") {
                return `• "${g.valueName}": Not machine-readable (${g.location}) and weak corroboration (${g.corroborationLevel})`;
              } else if (g.gapType === "location") {
                return `• "${g.valueName}": Location gap - only human-readable at ${g.location}`;
              } else {
                return `• "${g.valueName}": Corroboration gap - source is ${g.corroborationLevel}`;
              }
            })
            .join("\n")}`
        : "No gaps identified. All values have machine-readable locations and strong corroboration.",
    ];

    return briefLines.join("\n");
  };

  const brief = generateSignalBrief();

  const companionPrompt = `Here is my organisation's Stratospheric Signal Brief:

[PASTE YOUR BRIEF HERE]

You are an AI agent evaluating this organisation as a potential vendor. Read this brief, then:
1. For each value declaration: is it machine-readable on their digital properties, or human-readable only?
2. For each [GAP]: give one specific action to create verifiable third-party evidence. One action, not a strategy.
3. Is this organisation at Foundation, Trust, or Stratospheric altitude? Justify in two sentences.
4. Give me exactly three prioritised actions to reach Stratospheric. Ordered by impact. Specific. Brutal.`;

  const handleCopyBrief = () => {
    navigator.clipboard.writeText(brief);
    setCopiedBrief(true);
    setTimeout(() => setCopiedBrief(false), 2000);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(companionPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const getAltitudeColor = () => {
    switch (altitude) {
      case "STRATOSPHERIC":
        return "text-emerald-400";
      case "TRUST":
        return "text-orange";
      case "FOUNDATION":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
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
    <div className="space-y-8">
      {/* Run Audit Button */}
      <div className="flex justify-center">
        <button
          onClick={onRunAudit}
          disabled={values.length === 0}
          className="px-8 py-4 bg-orange rounded-full uppercase font-heading text-white text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
        >
          Run my audit
        </button>
      </div>

      {/* Results Section */}
      {showResults && (
        <motion.div
          className="space-y-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Altitude Score */}
          <motion.section variants={itemVariants} className="space-y-6">
            <div className="space-y-4">
              <h2 className={`text-5xl font-heading font-bold ${getAltitudeColor()}`}>
                {altitude || "UNKNOWN"}
              </h2>
              <p className="text-gray-300 font-body">Altitude Score</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-navy-light rounded-lg p-6 border-l-4 border-emerald-400">
                <div className="text-3xl font-bold text-emerald-400">{mrCount}</div>
                <div className="text-sm text-gray-400 font-body">Machine-readable locations</div>
                <div className="text-xs text-gray-500 mt-2">Required: {Math.ceil(total * 0.5)} of {total}</div>
              </div>

              <div className="bg-navy-light rounded-lg p-6 border-l-4 border-orange">
                <div className="text-3xl font-bold text-orange">{scCount}</div>
                <div className="text-sm text-gray-400 font-body">Strong corroborations</div>
                <div className="text-xs text-gray-500 mt-2">Required: {Math.ceil(total * 0.5)} of {total}</div>
              </div>
            </div>
          </motion.section>

          {/* Gap Report */}
          {gaps.length > 0 && (
            <motion.section variants={itemVariants} className="space-y-4">
              <h3 className="text-2xl font-heading font-bold text-white">Gap Report ({gaps.length})</h3>

              <div className="space-y-3">
                {gaps.map((gap, idx) => (
                  <div
                    key={idx}
                    className="bg-navy-light rounded-lg p-4 border-l-4 border-red-400 space-y-2"
                  >
                    <h4 className="font-body font-bold text-white">"{gap.valueName}"</h4>

                    {gap.gapType === "location" && (
                      <div className="text-sm text-gray-300">
                        <p className="font-semibold text-red-300">Location Gap</p>
                        <p>
                          Only human-readable at <span className="font-mono">{gap.location}</span>
                        </p>
                        <p className="text-gray-400 mt-2">
                          Action: Add machine-readable validation (schema, API, or published metadata)
                        </p>
                      </div>
                    )}

                    {gap.gapType === "corroboration" && (
                      <div className="text-sm text-gray-300">
                        <p className="font-semibold text-red-300">Corroboration Gap</p>
                        <p>
                          Current source: <span className="font-mono">{gap.corroborationLevel}</span>
                        </p>
                        <p className="text-gray-400 mt-2">
                          Action: Obtain third-party verification (analyst report, certification, or earned media)
                        </p>
                      </div>
                    )}

                    {gap.gapType === "both" && (
                      <div className="text-sm text-gray-300">
                        <p className="font-semibold text-red-300">Location & Corroboration Gaps</p>
                        <p>
                          Location: <span className="font-mono">{gap.location}</span> (not machine-readable)
                        </p>
                        <p>
                          Corroboration: <span className="font-mono">{gap.corroborationLevel}</span> (weak)
                        </p>
                        <p className="text-gray-400 mt-2">
                          Action: Publish machine-readable proof and obtain independent verification
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Signal Brief & Companion Prompt */}
          <motion.section variants={itemVariants} className="space-y-6">
            {/* Signal Brief */}
            <div className="space-y-3">
              <h3 className="text-2xl font-heading font-bold text-white">Signal Brief</h3>

              <div className="bg-navy rounded-lg p-6 border border-navy-light">
                <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap break-words overflow-x-auto">
                  {brief}
                </pre>
              </div>

              <button
                onClick={handleCopyBrief}
                className="px-4 py-2 bg-cyan text-white rounded font-body text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                {copiedBrief ? "Copied!" : "Copy Brief"}
              </button>
            </div>

            {/* Companion Prompt */}
            <div className="space-y-3">
              <h3 className="text-2xl font-heading font-bold text-white">Companion Prompt</h3>

              <div className="bg-navy rounded-lg p-6 border border-navy-light">
                <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap break-words overflow-x-auto">
                  {companionPrompt}
                </pre>
              </div>

              <button
                onClick={handleCopyPrompt}
                className="px-4 py-2 bg-cyan text-white rounded font-body text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                {copiedPrompt ? "Copied!" : "Copy Prompt"}
              </button>
            </div>
          </motion.section>
        </motion.div>
      )}
    </div>
  );
}
