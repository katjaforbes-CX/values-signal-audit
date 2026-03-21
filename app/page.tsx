"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PasteInput from "@/components/signal-audit/PasteInput";
import ValueSection from "@/components/signal-audit/ValueSection";
import LocationSection from "@/components/signal-audit/LocationSection";
import CorroborationSection from "@/components/signal-audit/CorroborationSection";
import ContextSection from "@/components/signal-audit/ContextSection";
import AuditOutput from "@/components/signal-audit/AuditOutput";
import { ValueEntry, ConditionalRule } from "@/components/signal-audit/types";

export default function SignalAuditPage() {
  // Core state
  const [pasteContent, setPasteContent] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [values, setValues] = useState<ValueEntry[]>([]);
  const [locations, setLocations] = useState<Record<number, string>>({});
  const [corroboration, setCorroboration] = useState<Record<number, string>>(
    {}
  );
  const [absolutes, setAbsolutes] = useState<string[]>([]);
  const [conditionals, setConditionals] = useState<ConditionalRule[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasExtracted, setHasExtracted] = useState(false);

  // Extract handler — calls API route
  const handleExtract = async () => {
    setIsExtracting(true);
    setError(null);
    setShowResults(false);

    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: pasteContent }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Extraction failed. Please try again.");
        return;
      }

      setValues(data.values);

      // Pre-populate locations and corroboration from AI guesses
      const locs: Record<number, string> = {};
      const corrs: Record<number, string> = {};
      data.values.forEach((v: ValueEntry, i: number) => {
        locs[i] = v.locationGuess || "";
        corrs[i] = v.corroborationGuess || "";
      });
      setLocations(locs);
      setCorroboration(corrs);
      setHasExtracted(true);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsExtracting(false);
    }
  };

  // When values change (add/remove), sync locations and corroboration indexes
  const handleSetValues = (newValues: ValueEntry[]) => {
    setValues(newValues);

    // Rebuild location and corroboration maps for new indices
    const newLocs: Record<number, string> = {};
    const newCorrs: Record<number, string> = {};
    newValues.forEach((_, i) => {
      newLocs[i] = locations[i] || "";
      newCorrs[i] = corroboration[i] || "";
    });
    setLocations(newLocs);
    setCorroboration(newCorrs);
    setShowResults(false);
  };

  const handleRunAudit = () => {
    setShowResults(true);
  };

  return (
    <main className="min-h-screen bg-navy-deep">
      {/* Header */}
      <header className="border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
          <div>
            <p className="text-white/60 text-xs uppercase tracking-widest font-body">
              The CX Evolutionist
            </p>
          </div>
          <a
            href="https://www.thecxevolutionist.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan text-sm font-body hover:underline"
          >
            thecxevolutionist.ai
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-12 text-center">
        <motion.h1
          className="font-heading text-4xl sm:text-5xl md:text-6xl text-white uppercase leading-tight mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Stratospheric Signal Audit
        </motion.h1>
        <motion.p
          className="font-body text-lg sm:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          If a machine customer arrived at your front door right now with a set
          of values its human principal has encoded, could it read who you are —
          and find independent evidence that you actually live those values?
        </motion.p>
      </section>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-24 space-y-10">
        {/* Step 1: Paste */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <PasteInput
            pasteContent={pasteContent}
            setPasteContent={setPasteContent}
            onExtract={handleExtract}
            isExtracting={isExtracting}
          />
        </motion.div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-2xl mx-auto px-4 sm:px-6"
            >
              <div className="bg-red-400/10 border-l-4 border-red-400 p-4 rounded">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Extracted Sections */}
        <AnimatePresence>
          {hasExtracted && values.length > 0 && (
            <motion.div
              className="space-y-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, staggerChildren: 0.15 }}
            >
              {/* Section 01: Values */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <ValueSection
                  values={values}
                  setValues={handleSetValues}
                />
              </motion.div>

              {/* Section 02: Locations */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <LocationSection
                  values={values}
                  locations={locations}
                  setLocations={(locs) => {
                    setLocations(locs);
                    setShowResults(false);
                  }}
                />
              </motion.div>

              {/* Section 03: Corroboration */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <CorroborationSection
                  values={values}
                  corroboration={corroboration}
                  setCorroboration={(corrs) => {
                    setCorroboration(corrs);
                    setShowResults(false);
                  }}
                />
              </motion.div>

              {/* Section 04: Context Rules */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <ContextSection
                  absolutes={absolutes}
                  setAbsolutes={setAbsolutes}
                  conditionals={conditionals}
                  setConditionals={setConditionals}
                />
              </motion.div>

              {/* Audit Output */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                <AuditOutput
                  values={values}
                  locations={locations}
                  corroboration={corroboration}
                  absolutes={absolutes}
                  conditionals={conditionals}
                  onRunAudit={handleRunAudit}
                  showResults={showResults}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-white/40 text-xs font-body">
            Part of the Three Altitudes of Agentic Commerce framework.
          </p>
          <p className="text-white/30 text-xs font-body mt-1">
            Katja Forbes / The CX Evolutionist
          </p>
        </div>
      </footer>
    </main>
  );
}
