'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface PasteInputProps {
  pasteContent: string;
  setPasteContent: (val: string) => void;
  onExtract: () => void;
  isExtracting: boolean;
  extractionStep: string;
}

export default function PasteInput({
  pasteContent,
  setPasteContent,
  onExtract,
  isExtracting,
  extractionStep,
}: PasteInputProps) {
  const wordCount = pasteContent.trim().split(/\s+/).filter(Boolean).length;
  const charCount = pasteContent.length;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <h2 className="font-heading text-3xl sm:text-4xl text-white mb-3">
        PASTE YOUR CONTENT
      </h2>

      <p className="font-body text-base text-gray-300 mb-6">
        Paste your values statement, sustainability report, ESG document, or website copy.
        We'll extract your value signals, then research the web for independent evidence.
      </p>

      <textarea
        value={pasteContent}
        onChange={(e) => setPasteContent(e.target.value)}
        placeholder="Paste your content here..."
        disabled={isExtracting}
        className="w-full h-64 sm:h-72 p-4 sm:p-6 bg-navy text-white font-body text-sm sm:text-base rounded-xl border border-white/10 focus:border-cyan focus:ring-2 focus:ring-cyan/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
      />

      <div className="flex justify-between items-center mt-3 mb-6">
        <div className="flex gap-6 font-body text-xs sm:text-sm text-gray-400">
          <span>{charCount.toLocaleString()} characters</span>
          <span>{wordCount.toLocaleString()} words</span>
        </div>
      </div>

      <button
        onClick={onExtract}
        disabled={isExtracting || pasteContent.trim().length === 0}
        className={`w-full sm:w-auto px-10 py-4 font-heading text-base uppercase rounded-full transition-all duration-200 ${
          isExtracting
            ? 'bg-cyan text-navy-deep cursor-not-allowed'
            : pasteContent.trim().length === 0
            ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
            : 'bg-orange hover:bg-orange-hover text-white cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-0.5'
        }`}
      >
        {isExtracting ? 'AUDITING...' : 'RUN MY AUDIT'}
      </button>

      {/* Progress Steps */}
      {isExtracting && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 space-y-3"
        >
          <ProgressStep
            label="Extracting value signals from your content"
            status={
              extractionStep === 'extracting'
                ? 'active'
                : extractionStep === 'researching' || extractionStep === 'auditing'
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
        <div className="w-5 h-5 rounded-full border border-white/20 flex-shrink-0" />
      )}
      <span
        className={`font-body text-sm ${
          status === 'active'
            ? 'text-cyan'
            : status === 'done'
            ? 'text-emerald-400'
            : 'text-white/40'
        }`}
      >
        {label}
      </span>
    </div>
  );
}
