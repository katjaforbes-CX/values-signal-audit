import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          deep: "#141B35",
          DEFAULT: "#2B3149",
          light: "#3A4160",
        },
        cyan: {
          DEFAULT: "#4FB7D9",
          hover: "#3DA8CC",
        },
        orange: {
          DEFAULT: "#F37B34",
          hover: "#E06A23",
        },
      },
      fontFamily: {
        heading: ["Anton", "sans-serif"],
        body: [
          "Helvetica Neue",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
