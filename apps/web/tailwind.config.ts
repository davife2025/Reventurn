import type { Config } from "tailwindcss";

// Deliberately no custom color/type tokens here yet. Per the ruleset's UI &
// Brand Design Rule, the token system gets designed (and disqualified
// against style history) in the first session that does real design work —
// not invented ad hoc during infra setup.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {}
  },
  plugins: []
};

export default config;
