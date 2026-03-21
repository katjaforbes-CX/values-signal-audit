"use client";

import React from "react";
import { motion } from "framer-motion";
import { ValueEntry, LOCATIONS } from "./types";

interface LocationSectionProps {
  values: ValueEntry[];
  locations: Record<number, string>;
  setLocations: (locs: Record<number, string>) => void;
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

export default function LocationSection({
  values,
  locations,
  setLocations,
}: LocationSectionProps) {
  const handleLocationChange = (index: number, location: string) => {
    setLocations({ ...locations, [index]: location });
  };

  const getIndicator = (loc: string | undefined) => {
    if (!loc) return { color: "bg-gray-500", label: "Not selected" };
    const entry = LOCATIONS.find((l) => l.value === loc);
    if (!entry) return { color: "bg-gray-500", label: "Unknown" };
    return entry.machineReadable
      ? { color: "bg-emerald-400", label: "Machine-readable" }
      : { color: "bg-orange", label: "Human-readable only" };
  };

  if (values.length === 0) return null;

  return (
    <section className="section-card">
      <h2 className="font-heading text-2xl md:text-3xl uppercase tracking-wide text-cyan mb-2">
        02 — SIGNAL LOCATIONS
      </h2>
      <p className="text-white/70 text-sm mb-6">
        For each value declared — where does it currently live?
      </p>

      <div className="mb-8 bg-cyan/10 border-l-4 border-cyan p-4 rounded">
        <p className="text-white/80 text-sm leading-relaxed">
          <span className="font-semibold text-white">Machine-readable</span> =
          schema, API, llms.txt, structured page.{" "}
          <span className="font-semibold text-white">Human-readable only</span>{" "}
          = PDF, deck, prose.{" "}
          <span className="font-semibold text-white">Not documented</span> =
          gap.
        </p>
      </div>

      <motion.div
        className="space-y-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {values.map((value, index) => {
          const indicator = getIndicator(locations[index]);
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
                  value={locations[index] || ""}
                  onChange={(e) => handleLocationChange(index, e.target.value)}
                  className="w-full bg-navy-deep border border-white/10 text-white rounded-lg p-3 text-sm focus:border-cyan focus:ring-2 focus:ring-cyan/20 transition-colors"
                >
                  <option value="">Select location...</option>
                  {LOCATIONS.map((loc) => (
                    <option key={loc.value} value={loc.value}>
                      {loc.label}
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
