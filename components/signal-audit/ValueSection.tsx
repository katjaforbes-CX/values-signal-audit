'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ValueEntry, CATEGORIES, STRENGTHS } from './types';

interface ValueSectionProps {
  values: ValueEntry[];
  setValues: (vals: ValueEntry[]) => void;
}

export default function ValueSection({ values, setValues }: ValueSectionProps) {
  const handleValueChange = (index: number, field: keyof ValueEntry, value: string) => {
    const updatedValues = [...values];
    updatedValues[index] = {
      ...updatedValues[index],
      [field]: value,
    };
    setValues(updatedValues);
  };

  const handleRemoveValue = (index: number) => {
    const updatedValues = values.filter((_, i) => i !== index);
    setValues(updatedValues);
  };

  const handleAddValue = () => {
    const newValue: ValueEntry = {
      name: '',
      category: CATEGORIES[0],
      strength: 'moderate',
      locationGuess: '',
      corroborationGuess: '',
    };
    setValues([...values, newValue]);
  };

  return (
    <div className="section-card">
      {/* Section Heading */}
      <h2 className="font-heading text-2xl md:text-3xl font-bold text-cyan uppercase mb-2">
        01 — VALUE DECLARATIONS
      </h2>

      {/* Subtext */}
      <p className="font-body text-sm md:text-base text-gray-300 mb-8">
        What does your business stand for?
      </p>

      {/* Values List with Stagger Animation */}
      <AnimatePresence mode="popLayout">
        {values.map((value, index) => (
          <motion.div
            key={`value-${index}`}
            layout
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mb-6 p-4 md:p-6 bg-navy-deep border border-white/10 rounded-lg"
          >
            <div className="space-y-4">
              {/* Value Name Input */}
              <div>
                <label className="block font-body text-xs md:text-sm text-gray-300 mb-2 uppercase tracking-wide">
                  Value Name
                </label>
                <input
                  type="text"
                  value={value.name}
                  onChange={(e) => handleValueChange(index, 'name', e.target.value)}
                  placeholder="e.g., Environmental Responsibility, Fair Labor..."
                  className="w-full bg-navy-deep border border-white/10 text-white rounded-lg p-3 font-body text-sm md:text-base focus:border-cyan focus:ring-2 focus:ring-cyan/30 transition-all duration-200"
                />
              </div>

              {/* Category and Strength Dropdowns Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category Dropdown */}
                <div>
                  <label className="block font-body text-xs md:text-sm text-gray-300 mb-2 uppercase tracking-wide">
                    Category
                  </label>
                  <select
                    value={value.category}
                    onChange={(e) => handleValueChange(index, 'category', e.target.value)}
                    className="w-full bg-navy-deep border border-white/10 text-white rounded-lg p-3 font-body text-sm md:text-base focus:border-cyan focus:ring-2 focus:ring-cyan/30 transition-all duration-200"
                  >
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Strength Dropdown */}
                <div>
                  <label className="block font-body text-xs md:text-sm text-gray-300 mb-2 uppercase tracking-wide">
                    Strength
                  </label>
                  <select
                    value={value.strength}
                    onChange={(e) =>
                      handleValueChange(index, 'strength', e.target.value as 'hard' | 'strong' | 'moderate')
                    }
                    className="w-full bg-navy-deep border border-white/10 text-white rounded-lg p-3 font-body text-sm md:text-base focus:border-cyan focus:ring-2 focus:ring-cyan/30 transition-all duration-200"
                  >
                    {STRENGTHS.map((strength) => (
                      <option key={strength.value} value={strength.value}>
                        {strength.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Remove Button */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => handleRemoveValue(index)}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors duration-200 font-body font-bold"
                title="Remove value"
              >
                ✕
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Add Value Button */}
      <motion.button
        onClick={handleAddValue}
        className="w-full md:w-auto px-6 py-3 mt-4 border-2 border-cyan text-cyan font-body font-semibold text-sm md:text-base rounded-lg hover:bg-cyan hover:text-navy-deep transition-all duration-200"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        + Add Value
      </motion.button>
    </div>
  );
}
