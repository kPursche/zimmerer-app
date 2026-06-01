import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Warme, einladende Palette passend zu Chor-/Gesangskontext.
        brand: {
          50: "#fdf6ee",
          100: "#f8e7d2",
          200: "#efc89e",
          300: "#e4a566",
          400: "#d9863c",
          500: "#c96d27",
          600: "#a9531f",
          700: "#863e1d",
          800: "#6c331d",
          900: "#592b1b",
        },
      },
    },
  },
  plugins: [],
};

export default config;
