/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../p2play-core/src/**/*.{js,ts,jsx,tsx}",
    "../p2play-core/dist/**/*.{js,mjs}",
    "./node_modules/p2play-core/src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/p2play-core/dist/**/*.{js,mjs}",
  ],
  theme: {
    extend: {
      colors: {
        pirate: {
          dark: "#0b132b",
          gold: "#d4af37",
          crimson: "#990000",
          sea: "#1c2541",
          emerald: "#10b981",
        },
      },
      fontFamily: {
        sans: ["Outfit", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["Cinzel", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
