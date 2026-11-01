import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "SF Pro Text",
          "Helvetica Neue",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      colors: {
        mint: {
          50: "#f0fdf9",
          100: "#ccfbef",
          200: "#99f6df",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
        },
        apple: {
          canvas: "#fbfbfd",
          sidebar: "#f5f5f7",
          border: "#e5e5ea",
          text: "#1d1d1f",
          secondary: "#86868b",
        },
      },
      boxShadow: {
        apple: "0 2px 8px -1px rgba(0, 0, 0, 0.05), 0 1px 3px -1px rgba(0, 0, 0, 0.03)",
        "apple-lg": "0 12px 32px -4px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.03)",
        mint: "0 4px 14px 0 rgba(16, 185, 129, 0.28)",
      },
      letterSpacing: {
        tightest: "-0.03em",
        tighter: "-0.02em",
        tight: "-0.01em",
      },
    },
  },
  plugins: [],
};
export default config;
