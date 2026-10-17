import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#101828",
          blue: "#315EFB",
          "blue-hover": "#2548cc",
          "blue-light": "#EAF0FF",
          "blue-subtle": "#F2F6FF",
          bg: "#F7F8FC",
          card: "#FFFFFF",
          text: "#101828",
          muted: "#667085",
          border: "#E4E7EC",
          success: "#12B76A",
          "success-subtle": "#ECFDF3",
          warning: "#F79009",
          "warning-subtle": "#FFFAEB",
          error: "#F04438",
          "error-subtle": "#FEF3F2",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(16, 24, 40, 0.06), 0 1px 2px -1px rgba(16, 24, 40, 0.04)",
        dropdown: "0 10px 15px -3px rgba(16, 24, 40, 0.08), 0 4px 6px -4px rgba(16, 24, 40, 0.03)",
        modal: "0 20px 25px -5px rgba(16, 24, 40, 0.1), 0 8px 10px -6px rgba(16, 24, 40, 0.05)",
      },
    },
  },
  plugins: [],
};

export default config;
