import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        warehouse: {
          dark: "#0369A1",       // Soft Deep Sky Blue
          primary: "#0284C7",    // Soft Light Blue (Sky 600)
          secondary: "#38BDF8",  // Soft Vibrant Sky Blue (Sky 400)
          accent: "#E0F2FE",     // Soft Pastel Light Blue (Sky 100)
          bg: "#F0F7FF",         // Soothing Soft Sky Background
          surface: "#FFFFFF",    // Surface Card
          border: "#E0F2FE",     // Soft Border Light Blue
          text: "#0F172A",       // Slate 900 Primary Text
          muted: "#64748B",      // Slate 500 Secondary Text
          danger: "#EF4444",     // Red 500
          dangerBg: "#FEE2E2",   // Red 100
          warning: "#F59E0B",    // Amber 500
          warningBg: "#FEF3C7",  // Amber 100
          success: "#0284C7",    // Soft Blue Safe
          successBg: "#E0F2FE",  // Soft Blue 100
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        enterprise: "0 1px 3px 0 rgba(2, 132, 199, 0.06), 0 1px 2px -1px rgba(2, 132, 199, 0.04)",
        card: "0 4px 6px -1px rgba(2, 132, 199, 0.05), 0 2px 4px -2px rgba(2, 132, 199, 0.05)",
        modal: "0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.1)",
        soft: "0 10px 25px -5px rgba(2, 132, 199, 0.1), 0 8px 10px -6px rgba(2, 132, 199, 0.06)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInDown: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.6", transform: "scale(1.04)" },
        },
        floatSlow: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-3px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out forwards",
        "fade-in-up": "fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in-down": "fadeInDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "pulse-soft": "pulseSoft 2.5s ease-in-out infinite",
        "float-slow": "floatSlow 4s ease-in-out infinite",
        shimmer: "shimmer 2.5s infinite linear",
      },
    },
  },
  plugins: [],
};
export default config;
