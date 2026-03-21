'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface URLInputProps {
  url: string;
  setUrl: (val: string) => void;
  pasteContent: string;
  setPasteContent: (val: string) => void;
  onAudit: () => void;
  isExtracting: boolean;
  extractionStep: string;
}

export default function URLInput({
  url,
  setUrl,
  pasteContent,
  setPasteContent,
  onAudit,
  isExtracting,
  extractionStep,
}: URLInputProps) {
  const [showPaste, setShowPaste] = useState(false);

  const isValidUrl = /^https?:\/\/.+\..+/.test(url.trim());
  const hasPasteContent = pasteContent.trim().length > 0;
  const canSubmit = isValidUrl || hasPasteContent;

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Card wrapper */}
      <div className="bg-navy rounded-[30px] p-8 sm:p-10 border border-white/5">
        <h2 className="font-heading text-2xl sm:text-3xl text-white uppercase mb-2">
          Enter Your Website
        </h2>

        <p className="font-body text-sm sm:text-base text-white/50 mb-8">
          We&apos;ll crawl your site for value signals, research the web for
          independent evidence, and deliver your audit.
        </p>

        {/* URL Input */}
        <div className="relative">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://yourcompany.com"
            disabled={isExtracting}
            className="w-full p-4 sm:p-5 bg-navy-deep text-white font-body text-base sm:text-lg rounded-2xl border border-white/10 focus:border-cyan focus:ring-2 focus:ring-cyan/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed pr-14"
          />
          {url.trim().length > 0 && (
            <div className="absolute right-5 top-1/2 -translate-y-1/2">
              {isValidUrl ? (
                <div className="w-6 h-6 rounded-full bg-emerald-400 flex items-center justify-center text-navy-deep text-xs font-bold">
                  ✓
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white/40 text-xs font-bold">
                  !
                </div>
              )}
            </div>
          )}
        </div>

        {/* Toggle paste fallback */}
        <div className="mt-4 mb-6">
          <button
            onClick={() => setShowPaste(!showPaste)}
            className="text-white/40 hover:text-cyan text-sm font-body transition-colors underline underline-offset-2 decoration-white/20 hover:decoration-cyan"
            disabled={isExtracting}
          >
            {showPaste ? 'Hide paste option' : 'Or paste content directly'}
          </button>
        </div>

        {/* Collapsible paste area */}
        <AnimatePresence>
          {showPaste && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mb-6">
                <p className="font-body text-sm text-white/40 mb-2">
                  Paste your values statement, sustainability report, or ESG
                  document.
                </p>
                <textarea
                  value={pasteContent}
                  onChange={(e) => setPasteContent(e.target.value)}
                  placeholder="Paste your content here..."
                  disabled={isExtracting}
                  className="w-full h-48 p-4 bg-navy-deep text-white font-body text-sm rounded-2xl border border-white/10 focus:border-cyan focus:ring-2 focus:ring-cyan/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                />
                <div className="flex gap-6 font-body text-xs text-white/30 mt-2">
                  <span>
                    {pasteContent.length.toLocaleString()} characters
                  </span>
                  <span>
                    {pasteContent
                      .trim()
                      .split(/\s+/)
                      .filter(Boolean)
                      .length.toLocaleString()}{' '}
                    words
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit button */}
        <button
          onClick={onAudit}
          disabled={isExtracting || !canSubmit}
          className={`w-full py-4 font-heading text-lg uppercase rounded-full transition-all duration-200 tracking-wide ${
            isExtracting
              ? 'bg-cyan text-navy-deep cursor-not-allowed'
              : !canSubmit
              ? 'bg-white/5 text-white/30 cursor-not-allowed'
              : 'bg-orange hover:bg-orange-hover text-white cursor-pointer shadow-lg shadow-orange/20 hover:shadow-xl hover:shadow-orange/30'
          }`}
        >
          {isExtracting ? 'AUDITING...' : 'RUN MY AUDIT'}
        </button>
      </div>

      {/* Progress Steps — outside the card */}
      {isExtracting && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 space-y-3 px-2"
        >
          <ProgressStep
            label="Crawling your website for value signals"
            status={
              extractionStep === 'crawling'
                ? 'active'
                : extractionStep === 'extracting' ||
                  extractionStep === 'researching' ||
                  extractionStep === 'auditing'
                ? 'done'
                : 'pending'
            }
          />
          <ProgressStep
            label="Extracting value signals from content"
            status={
              extractionStep === 'extracting'
                ? 'active'
                : extractionStep === 'researching' ||
                  extractionStep === 'auditing'
                ? 'done'
                : 'pending'
            }
          />
          <ProgressStep
            label="Researching web for independent evidence"
            status={
              extractionStep === 'researching'
                ? 'active'
                : extractionStep === 'auditing'
                ? 'done'
                : 'pending'
            }
          />
          <ProgressStep
            label="Generating your audit report"
            status={extractionStep === 'auditing' ? 'active' : 'pending'}
          />
        </motion.div>
      )}
    </div>
  );
}

function ProgressStep({
  label,
  status,
}: {
  label: string;
  status: 'pending' | 'active' | 'done';
}) {
  return (
    <div className="flex items-center gap-3">
      {status === 'done' && (
        <div className="w-5 h-5 rounded-full bg-emerald-400 flex items-center justify-center text-navy-deep text-xs font-bold flex-shrink-0">
          ✓
        </div>
      )}
      {status === 'active' && (
        <motion.div
          className="w-5 h-5 rounded-full border-2 border-cyan flex-shrink-0"
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.6, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
      {status === 'pending' && (
        <div className="w-5 h-5 rounded-full border border-white/15 flex-shrink-0" />
      )}
      <span
        className={`font-body text-sm ${
          status === 'active'
            ? 'text-cyan'
            : status === 'done'
            ? 'text-emerald-400'
            : 'text-white/30'
        }`}
      >
        {label}
      </span>
    </div>
  );
}
