import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#070D1A",
          900: "#0A1428",
          800: "#0F1E3D",
          700: "#16294F",
          600: "#233A66",
        },
        signal: {
          400: "#2FE8B8",
          500: "#00D9A3",
          600: "#00A878",
          700: "#037A58",
        },
        mist: {
          200: "#F5F7FA",
          400: "#B7C3D6",
          500: "#8B9BB4",
        },
        alert: "#FF6B6B",
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px -12px rgba(0, 217, 163, 0.45)",
      },
    },
  },
  plugins: [],
} satisfies Config;
