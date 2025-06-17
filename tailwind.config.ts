import { type Config } from "tailwindcss";
import animatePlugin from "tailwindcss-animate";
import scrollbar from "tailwind-scrollbar";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            h1: { fontSize: theme("fontSize.4xl") },
            h2: { fontSize: theme("fontSize.3xl") },
            h3: { fontSize: theme("fontSize.2xl") },
            h4: { fontSize: theme("fontSize.xl") },
          },
        },
      }),
      fontFamily: {
        sans: ["var(--font-geist-sans)"],
      },
      colors: {
        slate: {
          50: "rgb(var(--slate-50) / <alpha-value>)",
          100: "rgb(var(--slate-100) / <alpha-value>)",
          200: "rgb(var(--slate-200) / <alpha-value>)",
          300: "rgb(var(--slate-300) / <alpha-value>)",
          400: "rgb(var(--slate-400) / <alpha-value>)",
          500: "rgb(var(--slate-500) / <alpha-value>)",
          600: "rgb(var(--slate-600) / <alpha-value>)",
          700: "rgb(var(--slate-700) / <alpha-value>)",
          800: "rgb(var(--slate-800) / <alpha-value>)",
          900: "rgb(var(--slate-900) / <alpha-value>)",
          950: "rgb(var(--slate-950) / <alpha-value>)",
        },
      },
      animation: {
        pulse: "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fade-in 200ms ease-in-out",
        "fade-out": "fade-out 200ms ease-in-out",
        "slide-in-from-top": "slide-in-from-top 200ms ease-in-out",
        "slide-out-to-top": "slide-out-to-top 200ms ease-in-out",
        "spin-slow": "spin 2s linear infinite",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        "fade-out": {
          "0%": { opacity: 1 },
          "100%": { opacity: 0 },
        },
        "slide-in-from-top": {
          "0%": { transform: "translateY(-10%)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
        "slide-out-to-top": {
          "0%": { transform: "translateY(0)", opacity: 1 },
          "100%": { transform: "translateY(-10%)", opacity: 0 },
        },
      },
    },
  },
  plugins: [
    animatePlugin,
    require("@tailwindcss/typography"),
    scrollbar({ nocompatible: true }), // ✅ This enables full modern support
  ],
};

export default config;
