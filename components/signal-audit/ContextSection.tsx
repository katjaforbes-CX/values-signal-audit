"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConditionalRule {
  when: string;
  then: string;
}

interface ContextSectionProps {
  absolutes: string[];
  setAbsolutes: (vals: string[]) => void;
  conditionals: ConditionalRule[];
  setConditionals: (vals: ConditionalRule[]) => void;
}

export default function ContextSection({
  absolutes,
  setAbsolutes,
  conditionals,
  setConditionals,
}: ContextSectionProps) {
  const [newAbsolute, setNewAbsolute] = useState("");
  const [newWhen, setNewWhen] = useState("");
  const [newThen, setNewThen] = useState("");

  const handleAddAbsolute = () => {
    if (newAbsolute.trim()) {
      setAbsolutes([...absolutes, newAbsolute.trim()]);
      setNewAbsolute("");
    }
  };

  const handleRemoveAbsolute = (index: number) => {
    setAbsolutes(absolutes.filter((_, i) => i !== index));
  };

  const handleAddConditional = () => {
    if (newWhen.trim() && newThen.trim()) {
      setConditionals([
        ...conditionals,
        { when: newWhen.trim(), then: newThen.trim() },
      ]);
      setNewWhen("");
      setNewThen("");
    }
  };

  const handleRemoveConditional = (index: number) => {
    setConditionals(conditionals.filter((_, i) => i !== index));
  };

  return (
    <section className="section-card space-y-8">
      <div>
        <h2 className="font-heading text-2xl md:text-3xl uppercase tracking-wide text-cyan mb-2">
          04 — CONTEXT RULES
        </h2>
        <p className="text-white/70 text-sm">
          Give agents situational logic, not just static values.
        </p>
      </div>

      {/* Absolutes */}
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-white mb-1">Absolutes</h3>
          <p className="text-xs text-white/60">
            We never compromise on these, regardless of context
          </p>
        </div>

        <AnimatePresence mode="popLayout">
          {absolutes.map((abs, index) => (
            <motion.div
              key={`abs-${index}`}
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3"
            >
              <input
                type="text"
                value={abs}
                onChange={(e) => {
                  const updated = [...absolutes];
                  updated[index] = e.target.value;
                  setAbsolutes(updated);
                }}
                className="flex-1 bg-navy-deep border border-white/10 rounded-lg p-3 text-white placeholder-white/40 focus:border-cyan focus:ring-2 focus:ring-cyan/20 transition-colors text-sm"
              />
              <button
                onClick={() => handleRemoveAbsolute(index)}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/60 hover:text-red-400 text-lg font-bold"
              >
                ✕
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        <div className="flex items-center gap-3">
          <input
            type="text"
            value={newAbsolute}
            onChange={(e) => setNewAbsolute(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddAbsolute()}
            placeholder="Add new constraint..."
            className="flex-1 bg-navy-deep border border-white/10 rounded-lg p-3 text-white placeholder-white/40 focus:border-cyan focus:ring-2 focus:ring-cyan/20 transition-colors text-sm"
          />
          <button
            onClick={handleAddAbsolute}
            className="px-4 py-3 border-2 border-cyan text-cyan rounded-lg hover:bg-cyan/10 transition-colors font-semibold text-sm"
          >
            + Add
          </button>
        </div>
      </div>

      {/* Conditionals */}
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-white mb-1">Conditionals</h3>
          <p className="text-xs text-white/60">
            When X happens, we prioritise Y
          </p>
        </div>

        <AnimatePresence mode="popLayout">
          {conditionals.map((rule, index) => (
            <motion.div
              key={`cond-${index}`}
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col lg:flex-row gap-3 items-start lg:items-center"
            >
              <input
                type="text"
                value={rule.when}
                onChange={(e) => {
                  const updated = [...conditionals];
                  updated[index] = { ...updated[index], when: e.target.value };
                  setConditionals(updated);
                }}
                placeholder="When..."
                className="flex-1 w-full bg-navy-deep border border-white/10 rounded-lg p-3 text-white placeholder-white/40 focus:border-cyan focus:ring-2 focus:ring-cyan/20 transition-colors text-sm"
              />
              <span className="text-white/50 hidden lg:inline">→</span>
              <input
                type="text"
                value={rule.then}
                onChange={(e) => {
                  const updated = [...conditionals];
                  updated[index] = { ...updated[index], then: e.target.value };
                  setConditionals(updated);
                }}
                placeholder="Then we prioritise..."
                className="flex-1 w-full bg-navy-deep border border-white/10 rounded-lg p-3 text-white placeholder-white/40 focus:border-cyan focus:ring-2 focus:ring-cyan/20 transition-colors text-sm"
              />
              <button
                onClick={() => handleRemoveConditional(index)}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/60 hover:text-red-400 text-lg font-bold flex-shrink-0"
              >
                ✕
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
          <input
            type="text"
            value={newWhen}
            onChange={(e) => setNewWhen(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddConditional()}
            placeholder="When..."
            className="flex-1 w-full bg-navy-deep border border-white/10 rounded-lg p-3 text-white placeholder-white/40 focus:border-cyan focus:ring-2 focus:ring-cyan/20 transition-colors text-sm"
          />
          <span className="text-white/50 hidden lg:inline">→</span>
          <input
            type="text"
            value={newThen}
            onChange={(e) => setNewThen(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddConditional()}
            placeholder="Then we prioritise..."
            className="flex-1 w-full bg-navy-deep border border-white/10 rounded-lg p-3 text-white placeholder-white/40 focus:border-cyan focus:ring-2 focus:ring-cyan/20 transition-colors text-sm"
          />
          <button
            onClick={handleAddConditional}
            className="px-4 py-3 border-2 border-cyan text-cyan rounded-lg hover:bg-cyan/10 transition-colors font-semibold text-sm flex-shrink-0"
          >
            + Add
          </button>
        </div>
      </div>
    </section>
  );
}
