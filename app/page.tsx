"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PasteInput from "@/components/signal-audit/PasteInput";
import { AuditReport } from "@/components/signal-audit/AuditReport";

export default function SignalAuditPage() {
  const [pasteContent, setPasteContent] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [audit, setAudit] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const handleExtract = async () => {
    setIsExtracting(true);
    setError(null);
    setAudit(null);

    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: pasteContent }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Audit failed. Please try again.");
        return;
      }

      setAudit(data.audit);

      // Scroll to report after a brief delay for animation
      setTimeout(() => {
        reportRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <main className="min-h-screen bg-navy-deep">
      {/* Header */}
      <header className="border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
          <p className="text-white/60 text-xs uppercase tracking-widest font-body">
            The CX Evolutionist
          </p>
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

      {/* Paste Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
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

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-2xl mx-auto mt-6 px-4 sm:px-6"
            >
              <div className="bg-red-400/10 border-l-4 border-red-400 p-4 rounded">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Audit Report */}
      <AnimatePresence>
        {audit && (
          <motion.div
            ref={reportRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="border-t border-cyan/20">
              <div className="max-w-5xl mx-auto">
                <AuditReport audit={audit} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
