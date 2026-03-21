'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface PasteInputProps {
  pasteContent: string;
  setPasteContent: (val: string) => void;
  onExtract: () => void;
  isExtracting: boolean;
}

export default function PasteInput({
  pasteContent,
  setPasteContent,
  onExtract,
  isExtracting,
}: PasteInputProps) {
  const wordCount = pasteContent.trim().split(/\s+/).filter(Boolean).length;
  const charCount = pasteContent.length;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Heading */}
      <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-3">
        PASTE YOUR CONTENT
      </h2>

      {/* Subtext */}
      <p className="font-body text-base text-gray-300 mb-6">
        Paste your business values, sustainability reports, ESG documents, or any content you'd like to extract signals from.
      </p>

      {/* Textarea */}
      <textarea
        value={pasteContent}
        onChange={(e) => setPasteContent(e.target.value)}
        placeholder="Paste your content here..."
        disabled={isExtracting}
        className="w-full h-64 sm:h-80 p-4 sm:p-6 bg-navy text-white font-body text-sm sm:text-base rounded-lg border-2 border-navy-light focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
      />

      {/* Character and Word Count */}
      <div className="flex justify-between items-center mt-4 mb-6">
        <div className="flex gap-6 font-body text-xs sm:text-sm text-gray-400">
          <span>{charCount} characters</span>
          <span>{wordCount} words</span>
        </div>
      </div>

      {/* Extract Button */}
      <button
        onClick={onExtract}
        disabled={isExtracting || pasteContent.trim().length === 0}
        className={`w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-4 font-heading text-sm sm:text-base font-bold uppercase rounded-full transition-all duration-200 ${
          isExtracting
            ? 'bg-orange text-white opacity-80 cursor-not-allowed pulse-glow'
            : pasteContent.trim().length === 0
            ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
            : 'bg-orange hover:bg-orange-hover text-white cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-0.5'
        }`}
      >
        {isExtracting ? (
          <motion.span
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="inline-block"
          >
            EXTRACTING SIGNALS...
          </motion.span>
        ) : (
          'EXTRACT MY SIGNALS'
        )}
      </button>

    </div>
  );
}
