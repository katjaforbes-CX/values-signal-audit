"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import URLInput from "@/components/signal-audit/URLInput";
import { AuditReport } from "@/components/signal-audit/AuditReport";

export default function SignalAuditPage() {
  const [url, setUrl] = useState("");
  const [pasteContent, setPasteContent] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionStep, setExtractionStep] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [audit, setAudit] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  // Email gate state
  const [showEmailGate, setShowEmailGate] = useState(false);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [company, setCompany] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  useEffect(() => {
    if (!isExtracting) {
      setExtractionStep("");
      return;
    }
    // If we have a URL, start with "crawling" step; otherwise skip to extracting
    const hasUrl = url.trim().length > 0 && /^https?:\/\/.+\..+/.test(url.trim());
    if (hasUrl) {
      setExtractionStep("crawling");
      const t1 = setTimeout(() => setExtractionStep("extracting"), 5000);
      const t2 = setTimeout(() => setExtractionStep("researching"), 10000);
      const t3 = setTimeout(() => setExtractionStep("auditing"), 18000);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    } else {
      setExtractionStep("extracting");
      const t1 = setTimeout(() => setExtractionStep("researching"), 4000);
      const t2 = setTimeout(() => setExtractionStep("auditing"), 12000);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [isExtracting, url]);

  // Step 1: User clicks "Run my audit" → show email gate
  const handleRequestAudit = () => {
    if (emailSubmitted) {
      runAudit();
    } else {
      setShowEmailGate(true);
    }
  };

  // Step 2: User submits email → send to HubSpot → run audit
  const handleEmailSubmit = async () => {
    if (!email.trim()) return;

    // Submit to HubSpot (fire and forget — don't block audit)
    fetch("/api/hubspot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        company: company.trim(),
      }),
    }).catch(() => {});

    setEmailSubmitted(true);
    setShowEmailGate(false);
    runAudit();
  };

  // Step 3: Actually run the audit
  const runAudit = async () => {
    setIsExtracting(true);
    setError(null);
    setAudit(null);

    try {
      let contentForAudit = pasteContent;

      // If URL provided, scrape it first
      const trimmedUrl = url.trim();
      const hasUrl = trimmedUrl.length > 0 && /^https?:\/\/.+\..+/.test(trimmedUrl);

      if (hasUrl) {
        // Also normalise URL without protocol for user convenience
        let normalizedUrl = trimmedUrl;
        if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
          normalizedUrl = "https://" + normalizedUrl;
        }

        const scrapeRes = await fetch("/api/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: normalizedUrl }),
        });

        const scrapeData = await scrapeRes.json();

        if (!scrapeRes.ok) {
          // If scrape failed but we have paste content, fall back to that
          if (pasteContent.trim().length > 0) {
            contentForAudit = pasteContent;
          } else {
            setError(
              scrapeData.error ||
                "Couldn't read that website. Try pasting your content directly instead."
            );
            return;
          }
        } else {
          // Combine scraped content with any pasted content
          contentForAudit = scrapeData.content;
          if (pasteContent.trim().length > 0) {
            contentForAudit +=
              "\n\n=== ADDITIONAL CONTENT PROVIDED BY USER ===\n" +
              pasteContent;
          }
        }
      }

      if (!contentForAudit || contentForAudit.trim().length === 0) {
        setError("Please enter a URL or paste your content to run the audit.");
        return;
      }

      // Now run the extract/audit pipeline
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: contentForAudit }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Audit failed. Please try again.");
        return;
      }

      setAudit(data.audit);
      setTimeout(() => {
        reportRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsExtracting(false);
    }
  };

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

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

      {/* Input Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <URLInput
            url={url}
            setUrl={setUrl}
            pasteContent={pasteContent}
            setPasteContent={setPasteContent}
            onAudit={handleRequestAudit}
            isExtracting={isExtracting}
            extractionStep={extractionStep}
          />
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-3xl mx-auto mt-6"
            >
              <div className="bg-red-400/10 border-l-4 border-red-400 p-4 rounded">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Email Gate Modal */}
      <AnimatePresence>
        {showEmailGate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowEmailGate(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-navy rounded-2xl p-8 max-w-md w-full border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-heading text-2xl text-white mb-2">
                BEFORE WE AUDIT
              </h3>
              <p className="font-body text-sm text-white/60 mb-6">
                Enter your details to run the audit.
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="bg-navy-deep border border-white/10 rounded-lg p-3 text-white placeholder-white/30 text-sm focus:border-cyan focus:ring-2 focus:ring-cyan/20 transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="bg-navy-deep border border-white/10 rounded-lg p-3 text-white placeholder-white/30 text-sm focus:border-cyan focus:ring-2 focus:ring-cyan/20 transition-colors"
                  />
                </div>

                <input
                  type="email"
                  placeholder="Email *"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-navy-deep border border-white/10 rounded-lg p-3 text-white placeholder-white/30 text-sm focus:border-cyan focus:ring-2 focus:ring-cyan/20 transition-colors"
                />

                <input
                  type="text"
                  placeholder="Company name"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full bg-navy-deep border border-white/10 rounded-lg p-3 text-white placeholder-white/30 text-sm focus:border-cyan focus:ring-2 focus:ring-cyan/20 transition-colors"
                />
              </div>

              <p className="font-body text-xs text-white/40 mt-4 mb-6">
                By running this audit, you agree to receive occasional insights
                from The CX Evolutionist. Unsubscribe anytime.
              </p>

              <button
                onClick={handleEmailSubmit}
                disabled={!isValidEmail}
                className={`w-full py-3 font-heading text-base uppercase rounded-full transition-all duration-200 ${
                  isValidEmail
                    ? "bg-orange hover:bg-orange-hover text-white cursor-pointer"
                    : "bg-gray-600 text-gray-300 cursor-not-allowed"
                }`}
              >
                RUN MY AUDIT
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
