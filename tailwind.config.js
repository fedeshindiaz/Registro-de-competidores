/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ufko: {
          blue: "#0f4c81",
          ink: "#111827",
          line: "#d8dee8",
          pale: "#f6f8fb",
          accent: "#1f7a8c"
        }
      },
      boxShadow: {
        soft: "0 16px 40px rgba(15, 76, 129, 0.12)"
      }
    }
  },
  plugins: []
};
