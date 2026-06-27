import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        muted: "#64748b",
        line: "#e5e7eb",
        paper: "#fafbfa",
        clay: "#0f766e",
        tide: "#0f766e",
        moss: "#7bae7f"
      },
      boxShadow: {
        soft: "none"
      }
    }
  },
  plugins: []
};

export default config;
