import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f4f7f4",
          100: "#e3ebe4",
          200: "#c5d6c8",
          300: "#9bb7a0",
          400: "#6f9477",
          500: "#4f7858",
          600: "#3c5f44",
          700: "#314c38",
          800: "#293e2f",
          900: "#223427",
          950: "#121c15",
        },
        clay: {
          400: "#d4a27f",
          500: "#c4875a",
          600: "#b06d3f",
        },
        mist: "#eef3ef",
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      boxShadow: {
        soft: "0 18px 40px -28px rgba(18, 28, 21, 0.45)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseDot: {
          "0%, 80%, 100%": { opacity: "0.35", transform: "scale(0.85)" },
          "40%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.35s ease-out both",
        pulseDot: "pulseDot 1.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
