/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B0D0C",
        foreground: "#F5F5F0",
        milk: {
          DEFAULT: "#FAF7F0",
          50: "#FCFAF6",
          100: "#FAF7F0",
          200: "#F5EFE6",
          300: "#E9E3DA",
        },
        hotOrange: {
          DEFAULT: "#FF5A1F",
          hover: "#E44A12",
          light: "rgba(255, 90, 31, 0.1)",
        },
        nearBlack: "#171717",
        mutedText: "#737373",
        subtleBorder: "#E9E3DA",
        accent: {
          DEFAULT: "#FF5A1F",
          hover: "#E44A12",
          dim: "rgba(255, 90, 31, 0.12)",
        },
        surface: {
          DEFAULT: "#121514",
          subtle: "#161A18",
          elevated: "#1C201E",
        },
        border: {
          DEFAULT: "#232825",
          subtle: "#1A1E1C",
          highlight: "rgba(255, 90, 31, 0.25)",
        },
        muted: {
          DEFAULT: "#8E928F",
          foreground: "#A1A7A3",
          dark: "#5A5E5C",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
