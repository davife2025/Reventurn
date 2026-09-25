import type { Config } from "tailwindcss";

// Session 4 design pass. Token rationale is logged in SESSION_REPORT.md's
// style history — graphite/amber replacing the Session 1-3 placeholder
// slate palette, Space Grotesk + JetBrains Mono replacing system-ui.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}"
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        graphite: {
          50: "#f5f4f2",
          100: "#e6e4e0",
          200: "#c9c6bf",
          300: "#a3a099",
          400: "#7c796f",
          500: "#5c594f",
          600: "#454239",
          700: "#332f28",
          800: "#221f1a",
          900: "#15130f",
          950: "#0b0a08"
        },
        amber: {
          400: "#e0a94f",
          500: "#c98f34",
          600: "#a8741f",
          700: "#805717"
        },
        sage: {
          500: "#6b8256",
          600: "#526543"
        },
        rust: {
          500: "#af6449",
          600: "#8c4f39"
        }
      },
      fontFamily: {
        heading: ["var(--font-heading)", "sans-serif"],
        data: ["var(--font-data)", "monospace"]
      }
    }
  },
  plugins: []
};

export default config;

