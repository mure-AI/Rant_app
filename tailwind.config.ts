import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#171717",
        paper: "#fbfaf8",
        clay: "#e94f37",
        tide: "#1d5f73",
        moss: "#526b4f"
      },
      boxShadow: {
        soft: "0 24px 70px rgba(31, 28, 24, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
