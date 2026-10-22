/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        forest: {
          50: "#EAF3EC",
          100: "#CFE3D3",
          200: "#A3C8AB",
          600: "#1B5E20",
          700: "#144A18",
          800: "#0E3B12",
          900: "#0A2B0D",
        },
        gold: {
          100: "#F7EECB",
          400: "#D9B84A",
          500: "#C9A227",
          600: "#A8861B",
        },
        cream: {
          DEFAULT: "#F7F3E4",
          50: "#FBF9F1",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};
