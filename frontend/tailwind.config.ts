import type { Config } from "tailwindcss";

// Design tokens — identità "Adriatico": teal profondo del mare + corallo
// del tramonto sul porto di Ancona. Evita di proposito la coppia
// crema/terracotta ormai da "AI stock design".
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#F4F8F7", // bianco freddo, non crema
        surface: "#FFFFFF",
        ink: {
          DEFAULT: "#0F2A2E", // quasi-nero con dominante teal
          muted: "#5C7A78",
        },
        sea: {
          50: "#EAF4F3",
          100: "#CFE6E4",
          400: "#1E8F86",
          600: "#0F6E6A", // primario
          700: "#0B4F4C",
          900: "#082F2D",
        },
        sunset: {
          400: "#FF8A65",
          500: "#FF6B4A", // accento, uso mirato
          600: "#E5523A",
        },
        sand: {
          400: "#FFB13D", // score medio
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        card: "0 2px 10px -2px rgba(15, 42, 46, 0.08), 0 1px 2px rgba(15, 42, 46, 0.06)",
        chat: "0 1px 2px rgba(15, 42, 46, 0.06)",
      },
      keyframes: {
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
