"use client";

import React from "react";
import { motion } from "framer-motion";
import { ValueEntry, CORROBORATIONS } from "./types";

interface CorroborationSectionProps {
  values: ValueEntry[];
  corroboration: Record<number, string>;
  setCorroboration: (corrs: Record<number, string>) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function CorroborationSection({
  values,
  corroboration,
  setCorroboration,
}: CorroborationSectionProps) {
  const handleChange = (index: number, val: string) => {
    setCorroboration({ ...corroboration, [index]: val });
  };

  const getIndicator = (val: string | undefined) => {
    if (!val) return { color: "bg-gray-500", label: "Not selected" };
    const entry = CORROBORATIONS.find((c) => c.value === val);
    if (!entry) return { color: "bg-gray-500", label: "Unknown" };
    if (entry.strong) return { color: "bg-emerald-400", label: "Strong independent evidence" };
    if (val === "none" || val === "own-site")
      return { color: "bg-red-400", label: "Gap — action needed" };
    return { color: "bg-orange", label: "Some evidence, not strong" };
  };

  if (values.length === 0) return null;

  return (
    <section className="section-card">
      <h2 className="font-heading text-2xl md:text-3xl uppercase tracking-wide text-cyan mb-2">
        03 — CORROBORATION AUDIT
      </h2>
      <p className="text-white/70 text-sm mb-6">
        For each value — what independent third-party evidence confirms you live
        it?
      </p>

      <div className="mb-8 bg-orange/10 border-l-4 border-orange p-4 rounded">
        <p className="text-white/80 text-sm leading-relaxed">
          <span className="font-semibold text-white">Self-declared only</span>{" "}
          and{" "}
          <span className="font-semibold text-white">
            No independent evidence
          </span>{" "}
          are flagged as gaps. These are the{" "}
          <span className="font-semibold text-orange">
            Stratospheric action items.
          </span>
        </p>
      </div>

      <motion.div
        className="space-y-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {values.map((value, index) => {
          const indicator = getIndicator(corroboration[index]);
          return (
            <motion.div
              key={index}
              className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-navy-deep/60 rounded-lg border border-white/5 hover:border-white/10 transition-colors"
              variants={itemVariants}
            >
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate text-sm">
                  {value.name || `Value ${index + 1}`}
                </p>
              </div>

              <div className="flex items-center gap-3 flex-1 min-w-0">
                <select
                  value={corroboration[index] || ""}
                  onChange={(e) => handleChange(index, e.target.value)}
                  className="w-full bg-navy-deep border border-white/10 text-white rounded-lg p-3 text-sm focus:border-cyan focus:ring-2 focus:ring-cyan/20 transition-colors"
                >
                  <option value="">Select corroboration...</option>
                  {CORROBORATIONS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>

                <div
                  className={`w-3 h-3 rounded-full flex-shrink-0 ${indicator.color}`}
                  title={indicator.label}
                />
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
