import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        maroon: "#6B2D3A",
        terracotta: "#B5654D",
        clay: "#C48A69",
        olive: "#7A8F63",
        cream: "#F8F5F1",
        charcoal: "#2E2A27",
        muted: "#8C8985",
        line: "#E5E2DD",
      },
      boxShadow: {
        soft: "none",
      },
    },
  },
  plugins: [],
};

export default config;